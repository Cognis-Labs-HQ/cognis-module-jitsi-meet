import { logUi, openErrorPopup, showToast } from "../reuse/feedback.js";
import { messagesClient } from "../reuse/gateway-clients.js";
import { importReuseModule, uiCtx } from "../reuse/resources.js";
import { MEETING_SUBJECT } from "../constants.js";
import { ensureSessionId } from "../session.js";
import { resolveThemeMode } from "../meeting-embed.js";
import { createMeetingPageElements } from "../page-elements.js";
import {
    fetchCurrentProfile,
    fetchParticipants,
    loadMessageReactionsController,
    loadMessageUiResources,
    normalizeMeetingId,
} from "../jitsi-helpers.js";
import { createChatHandlers } from "./chat.js";
import { createMeetingHandlers } from "./meetings-list.js";
import { createPreflightHandlers } from "./participants.js";
import { createInteractiveHandlersBinder } from "./interactive-handlers.js";
import { createEmbedHandlers } from "./meeting-room.js";
import { createMountUtilities } from "./mount-surface.js";
import { bindShareButton, openMeetingSharePopup } from "../share-button.js";
import { handleProfileAvatarError } from "./profile-avatars.js";
import { createMeetingSearchGroups } from "./meeting-search.js";
import { claimRouteRoot } from "./route-root.js";
import {
    bindWhiteboardButton,
    syncMeetingWhiteboardComponent,
} from "../whiteboard-control.js";
const [
    { apiFetch },
    { getShareContext, ensureFullAccountSession },
    { applyDocumentTitle, createI18n },
    { createPageComposer },
    { beginPageLoading, mountWhenDirect },
    { registerSearchIndex, openSearchPopup },
    { normalizeUsername },
] = await Promise.all([
    importReuseModule("api-client.js"),
    importReuseModule("auth-session.js"),
    importReuseModule("i18n.js"),
    importReuseModule("page-composer/index.js"),
    importReuseModule("page-entry.js"),
    importReuseModule("search-util/popup.js"),
    importReuseModule("value-normalizers.js"),
]);
const JITSI_MEET_CHAT_REACTIONS_ENABLED = false;
const NULL_MESSAGE_REACTIONS_CONTROLLER = Object.freeze({
    destroy: () => undefined,
    hideReactionHoverPopup: () => undefined,
    openEmojiPickerPopup: async () => undefined,
    recordEmojiUsage: () => undefined,
    renderReactionRow: () => "",
    repositionReactionHoverPopup: () => undefined,
    showReactionHoverPopup: () => undefined,
    toggleReaction: async () => undefined,
});
/**
 *
 * Guest link shares receive a limited shell, while signed-in user-share
 * recipients retain the full account page structure. Both share modes suppress
 * resharing controls.
 *
 * @param {HTMLElement} root - Page mount root (usually #app).
 * @param {{ signal?: AbortSignal, requestedMeetingId?: string, shareContext?: object, focusState?: object }} [options] - Router and component-page lifecycle options.
 * @returns {Promise<void>}
 */
export async function mount(
    root,
    {
        signal,
        requestedMeetingId = "",
        shareContext: routedShareContext,
        focusState = null,
    } = {},
) {
    if (!claimRouteRoot(root, signal)) return;
    const componentWindow = focusState !== null;
    if (componentWindow) root.dataset.suppressMeetingOverlay = "true";
    signal?.addEventListener(
        "abort",
        () => delete root.dataset.suppressMeetingOverlay,
        { once: true },
    );
    const shareContext = routedShareContext ?? getShareContext();
    const inShareView =
        shareContext !== null && shareContext?.directAccess !== true;
    const limitedShareView =
        inShareView &&
        Boolean(shareContext?.guestAccessToken) &&
        shareContext?.directAccess !== true;
    if (!limitedShareView) await ensureFullAccountSession();
    const resolvedMeetingId =
        requestedMeetingId ||
        String(focusState?.meetingId ?? "") ||
        (inShareView ? String(shareContext?.resourceId ?? "") : "");
    const messageUiResources = await loadMessageUiResources();
    const chatLoadingModule = messageUiResources.chatLoadingModuleUrl
        ? await import(messageUiResources.chatLoadingModuleUrl)
        : null;
    const i18n = await createI18n({
        componentStringBaseUrls: messageUiResources.languageBaseUrls,
    });
    let refreshCognisChat = async () => undefined;
    let messageReactions = NULL_MESSAGE_REACTIONS_CONTROLLER;
    if (JITSI_MEET_CHAT_REACTIONS_ENABLED) {
        messageReactions =
            (await loadMessageReactionsController(
                messageUiResources,
                i18n,
                async () => {
                    await refreshCognisChat();
                },
            )) ?? NULL_MESSAGE_REACTIONS_CONTROLLER;
    }
    if (signal?.aborted) return messageReactions.destroy();
    applyDocumentTitle(i18n, "module.jitsi_meet.page_title");
    signal?.addEventListener(
        "abort",
        () => {
            messageReactions.hideReactionHoverPopup();
            messageReactions.destroy();
        },
        { once: true },
    );
    const state = {
        allParticipants: [],
        availableParticipants: [],
        selectedParticipants: [],
        pendingParticipantUsernames: new Set(),
        meeting: null,
        heartbeatTimer: null,
        stateRefreshTimer: null,
        chatRefreshTimer: null,
        chatRoomId: "",
        chatRoomKey: null,
        chatMode: "meeting",
        privateChatUsername: "",
        lastMeetingChatRoomId: "",
        lastMeetingParticipants: [],
        chatParticipantEntries: [],
        includeMeetingChat: !(
            componentWindow && focusState?.disposableMeeting === true
        ),
        currentProfile: null,
        preflightStatus: "idle",
        preflightPassed: false,
        preflightMessage: "",
        preflightNeedsConfig: false,
        sessionId: ensureSessionId(),
        requestedMeetingId: normalizeMeetingId(
            resolvedMeetingId ||
                new URL(window.location.href).searchParams.get("meetingId"),
        ),
        requestedMeetingStart:
            focusState?.autoStart === true ||
            new URL(window.location.href).searchParams.get("start") === "1",
        voipCall: focusState?.voipCall === true,
        allParticipantsRequired:
            componentWindow && focusState?.allParticipantsRequired === true,
        allowNavigation:
            componentWindow && focusState?.allowNavigation === true,
        meetingSubject: String(
            focusState?.meetingSubject ?? MEETING_SUBJECT,
        ).trim(),
        shareAccessToken: String(shareContext?.guestAccessToken ?? ""),
        activeMeetings: [],
        persistedMeetings: [],
        activeMeetingsRefreshTimer: null,
        dragUsername: null,
        jitsiApi: null,
        jitsiParticipantId: "",
        jitsiConferenceJoined: false,
        jitsiModerator: false,
        jitsiThemeMode: resolveThemeMode(),
        alonePromptMeetingId: "",
        alonePromptDismissedMeetingId: "",
        alonePromptBlockedUntil: 0,
        recoveringMeetingSession: false,
        kickReportedMeetingId: "",
        promptShareOnJoin: false,
    };
    registerSearchIndex(
        "jitsi-meetings",
        createMeetingSearchGroups(state, i18n),
    );
    const {
        clearTimers,
        deferAloneParticipantPrompt,
        isMeetingActive,
        isMeetingEmbedMissing,
        resetParticipantSelection,
        selectedUsernames,
        setPreflightStatus,
        syncShareButtonAvailability,
        updateOverlay,
    } = createMountUtilities({ root, state });
    if (signal) {
        root.addEventListener("error", handleProfileAvatarError, {
            capture: true,
            signal,
        });
    }
    const callbacks = {
        beginPageLoading,
        closeComponentWindow: async () => {
            if (!componentWindow) return false;
            const componentStage = root.closest(
                ".component-page-window",
            )?.parentElement;
            const elementId = String(componentStage?.id ?? "").trim();
            const discardComponentPage = uiCtx.capabilities.get(
                "component-pages:discard",
            );
            if (!elementId || typeof discardComponentPage !== "function") {
                return false;
            }
            try {
                return await discardComponentPage(elementId);
            } catch (error) {
                await logUi(
                    "error",
                    "Meeting component window could not be closed.",
                    {
                        component: "module:jitsi-meet",
                        operation: "close_ended_component_meeting",
                        meetingId: state.meeting?.id ?? null,
                        elementId,
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    },
                );
                return false;
            }
        },
        syncMeetingWhiteboardComponent: () =>
            syncMeetingWhiteboardComponent({ root, state }),
        openMeetingSharePopup: () =>
            openMeetingSharePopup({
                state,
                i18n,
                deferAloneParticipantPrompt,
            }),
    };
    const utils = {
        clearTimers,
        deferAloneParticipantPrompt,
        isMeetingActive,
        isMeetingEmbedMissing,
        resetParticipantSelection,
        selectedUsernames,
        setPreflightStatus,
        syncShareButtonAvailability,
        updateOverlay,
    };
    const chatHandlers = createChatHandlers({
        root,
        state,
        i18n,
        apiFetch,
        messageReactions,
        loadChatRoomKey: chatLoadingModule?.loadChatRoomKey,
    });
    refreshCognisChat = chatHandlers.refreshCognisChat;
    const refreshChatAfterSend = async () => {
        if (typeof chatHandlers.updateCognisChat !== "function") {
            await logUi(
                "error",
                "Cognis Messages chat update operation is unavailable.",
                {
                    component: "module:jitsi-meet",
                    operation: "refresh_chat_after_send",
                    meetingId: state.meeting?.id ?? null,
                    chatRoomId: state.chatRoomId || null,
                },
            );
            return;
        }
        await chatHandlers.updateCognisChat();
    };
    const meetingHandlers = createMeetingHandlers({
        root,
        state,
        i18n,
        apiFetch,
        callbacks,
        utils,
        allowParticipantlessJoin: limitedShareView,
    });
    const preflightHandlers = createPreflightHandlers({
        root,
        state,
        i18n,
        apiFetch,
        callbacks,
        utils,
    });
    const embedHandlers = createEmbedHandlers({
        root,
        state,
        i18n,
        apiFetch,
        callbacks,
        utils,
    });
    Object.assign(
        callbacks,
        chatHandlers,
        meetingHandlers,
        preflightHandlers,
        embedHandlers,
    );
    const {
        activateMeetingChat,
        activatePrivateChatForParticipant,
        cleanupChatHandlers,
        encryptChatMessage,
        getChatRoomKey,
        openEmojiPickerPopup,
        stopCognisChatPolling,
        toggleReaction,
        updateCognisChat,
    } = chatHandlers;
    const {
        closeMeetingEmbed,
        joinMeetingById,
        loadActiveMeetings,
        startActiveMeetingsPolling,
        stopActiveMeetingsPolling,
        resetMeetingState,
    } = meetingHandlers;
    const {
        addParticipant,
        applyDrop,
        ensureMeetingTracking,
        executeJitsiCommandIfSupported,
        recoverMeetingSessionAfterComposerRender,
        renderParticipants,
        runPreflightCheck,
        setActiveParticipantDropzoneVisible,
    } = preflightHandlers;
    const { openMeetingEmbed, prepareMeetingStart } = embedHandlers;
    if (signal) {
        signal.addEventListener(
            "abort",
            () => {
                cleanupChatHandlers();
                stopActiveMeetingsPolling();
                void resetMeetingState();
            },
            { once: true },
        );
    }
    const bindInteractiveHandlers = createInteractiveHandlersBinder({
        root,
        signal,
        state,
        i18n,
        apiFetch,
        openSearchPopup,
        normalizeUsername,
        showToast,
        isMeetingActive,
        recoverMeetingSessionAfterComposerRender,
        addParticipant,
        renderParticipants,
        setActiveParticipantDropzoneVisible,
        applyDrop,
        preflightHandlers,
        joinMeetingById,
        activatePrivateChatForParticipant,
        messageReactions,
        toggleReaction,
        openEmojiPickerPopup,
        refreshChatAfterSend,
        encryptChatMessage,
        getChatRoomKey,
        stopCognisChatPolling,
        activateMeetingChat,
        bindShareButton,
        callbacks,
        runPreflightCheck,
        prepareMeetingStart,
        deferAloneParticipantPrompt,
        executeJitsiCommandIfSupported,
        updateOverlay,
        openMeetingEmbed,
        ensureMeetingTracking,
        loadActiveMeetings,
        resetMeetingState,
    });
    const elements = createMeetingPageElements(i18n, limitedShareView, {
        includeChat: state.includeMeetingChat,
    });
    if (state.voipCall) elements.splice(0, 1);
    const [allParticipants, currentProfile] = await Promise.all([
        limitedShareView ? Promise.resolve([]) : fetchParticipants(""),
        fetchCurrentProfile({
            shareAccessToken: state.shareAccessToken,
        }),
    ]);
    if (signal?.aborted) return;
    state.currentProfile = currentProfile;
    state.allParticipants = allParticipants
        .map((entry) => ({
            username: normalizeUsername(entry?.handle ?? entry?.username ?? ""),
            displayName: String(entry?.displayName ?? entry?.handle ?? ""),
            avatarKey:
                typeof entry?.avatarKey === "string" ? entry.avatarKey : null,
        }))
        .filter((entry) => Boolean(entry.username))
        .sort((left, right) => left.username.localeCompare(right.username));
    state.availableParticipants = state.allParticipants.map((entry) => ({
        ...entry,
    }));
    const composer = createPageComposer(root, {
        allowCustomization: !limitedShareView && !focusState,
        enableDomParking: true,
        elements,
        preferenceKey: "meetings-layout-v4",
        i18n,
        pageContext: {
            title: i18n.t("ui.reuse.meetings"),
            subtitle: i18n.t("module.jitsi_meet.page.subtitle"),
        },
        showTopbar: !focusState,
        showNavbar: !limitedShareView && !focusState,
        showFooter: !focusState,
        showThemeToggle: !focusState,
        requireAccountSession: !limitedShareView,
        persistLayoutPreferences: !limitedShareView && !focusState,
        frameless: Boolean(focusState),
        onRender: (...args) => {
            bindInteractiveHandlers(...args);
            if (!inShareView) {
                bindShareButton({
                    root,
                    signal,
                    state,
                    i18n,
                    deferAloneParticipantPrompt,
                });
            }
            void bindWhiteboardButton({
                root,
                signal,
                state,
                i18n,
                apiFetch,
            });
        },
    });
    await composer.init();
    if (signal?.aborted) return;
    if (state.voipCall) {
        root.classList.add("jitsi-voip-call");
    }
    if (state.requestedMeetingId) {
        await joinMeetingById(state.requestedMeetingId, {
            autoStart: inShareView || state.requestedMeetingStart,
        });
    } else {
        await loadActiveMeetings({ resolveRequested: true });
        startActiveMeetingsPolling();
    }
    await runPreflightCheck();
}
await mountWhenDirect(async (root) => {
    const mountController = new AbortController();
    await mount(root, { signal: mountController.signal });
}).catch((error) => {
    void logUi("error", "Jitsi Meet page mount failed.", {
        component: "module:jitsi-meet",
        operation: "mount_meetings_page",
        fatal: true,
        error: error instanceof Error ? error.message : String(error),
    });
    void openErrorPopup({ error });
});
