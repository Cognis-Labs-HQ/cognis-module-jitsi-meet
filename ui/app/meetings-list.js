import { logUi, showToast } from "../reuse/feedback.js";
import { importReuseModule } from "../reuse/resources.js";
import { closeMeetingWhiteboard } from "../whiteboard-control.js";
import { ACTIVE_MEETINGS_REFRESH_INTERVAL_MS } from "../constants.js";
import { normalizeMeetingId } from "../jitsi-helpers.js";
import {
    buildProfileAvatarMarkup,
    getProfileInitials as getInitialsText,
    getProfileInitialsColor as pickInitialsColor,
    hydrateProfileAvatars,
} from "./profile-avatars.js";

const [{ escapeHtml }, { openPopup }, { normalizeUsername }] =
    await Promise.all([
        importReuseModule("escape-html.js"),
        importReuseModule("popup.js"),
        importReuseModule("value-normalizers.js"),
    ]);

export function createMeetingHandlers({
    root,
    state,
    i18n,
    apiFetch,
    callbacks,
    utils,
    allowParticipantlessJoin = false,
}) {
    let meetingExitPromise = null;
    let persistedMeetingHoldTimer = null;
    let suppressPersistedMeetingClick = false;

    function selectPersistedMeeting(meeting) {
        state.requestedMeetingId = normalizeMeetingId(meeting.id);
        const currentUsername = normalizeUsername(
            state.currentProfile?.handle ?? state.currentProfile?.username,
        );
        state.selectedParticipants = meeting.participants
            .map((participant) => {
                const username = normalizeUsername(participant.username);
                if (!username || username === currentUsername) return null;
                return (
                    state.allParticipants.find(
                        (candidate) => candidate.username === username,
                    ) ?? {
                        username,
                        displayName: participant.displayName ?? username,
                        avatarKey: participant.avatarKey ?? null,
                    }
                );
            })
            .filter(Boolean);
        state.availableParticipants = state.allParticipants.filter(
            (candidate) =>
                !state.selectedParticipants.some(
                    (participant) =>
                        participant.username === candidate.username,
                ),
        );
        state.persistedMeetingSelectionUsernames = state.selectedParticipants
            .map((participant) => participant.username)
            .sort();
        callbacks.renderParticipants();
        renderPersistedMeetings();
        renderActiveMeetings();
        root.querySelector(".jitsi-meeting-stage")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }

    async function confirmPersistedMeetingRemoval(meeting, card) {
        card.classList.add("jitsi-persisted-meeting-card-held");
        const action = await openPopup({
            title: i18n.t(
                "module.jitsi_meet.participants.previous_remove_title",
            ),
            body: `<p>${escapeHtml(i18n.t("module.jitsi_meet.participants.previous_remove_body"))}</p>`,
            actions: [
                {
                    id: "remove",
                    label: i18n.t(
                        "module.jitsi_meet.participants.previous_remove_confirm",
                    ),
                    variant: "cancel",
                },
                {
                    id: "cancel",
                    label: i18n.t("ui.reuse.cancel"),
                    variant: "neutral",
                },
            ],
        });
        card.classList.remove("jitsi-persisted-meeting-card-held");
        if (action !== "remove") return;
        const response = await apiFetch(
            "/api/v1/modules/jitsi-meet/meetings/persisted/leave",
            {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ meetingId: meeting.id }),
            },
        );
        showToast(
            i18n.t(
                response.ok
                    ? "module.jitsi_meet.participants.previous_remove_success"
                    : "module.jitsi_meet.participants.previous_remove_failed",
            ),
            { variant: response.ok ? "info" : "error" },
        );
        if (response.ok) {
            await loadActiveMeetings({ resolveRequested: false });
        }
    }

    function renderPersistedMeetings() {
        const persistedMeetingsEl = root.querySelector(
            "#jitsi-persisted-meetings",
        );
        if (!(persistedMeetingsEl instanceof HTMLElement)) return;
        const persistedMeetingsLocked = utils.isMeetingActive();
        persistedMeetingsEl.classList.toggle(
            "jitsi-persisted-meetings-disabled",
            persistedMeetingsLocked,
        );
        persistedMeetingsEl.setAttribute(
            "aria-disabled",
            String(persistedMeetingsLocked),
        );
        persistedMeetingsEl.inert = persistedMeetingsLocked;
        if (!state.persistedMeetings.length) {
            persistedMeetingsEl.innerHTML = `<p class="jitsi-active-meetings-empty">${escapeHtml(i18n.t("module.jitsi_meet.participants.persisted_none"))}</p>`;
            return;
        }
        persistedMeetingsEl.replaceChildren(
            ...state.persistedMeetings.map((meeting) => {
                const card = document.createElement("article");
                card.className = "jitsi-persisted-meeting-card";
                if (meeting.active) {
                    card.classList.add("jitsi-persisted-meeting-card-active");
                }
                if (
                    (state.meeting?.id || state.requestedMeetingId) ===
                    normalizeMeetingId(meeting.id)
                ) {
                    card.classList.add("jitsi-persisted-meeting-card-selected");
                }
                card.setAttribute("role", "listitem");
                card.tabIndex = persistedMeetingsLocked ? -1 : 0;
                card.setAttribute(
                    "aria-disabled",
                    String(persistedMeetingsLocked),
                );
                card.setAttribute(
                    "aria-label",
                    `${meeting.meetingName}. ${i18n.t("module.jitsi_meet.participants.previous_select")}`,
                );
                const title = document.createElement("h4");
                title.className = "jitsi-persisted-meeting-title";
                title.textContent = meeting.meetingName;
                const avatars = document.createElement("div");
                avatars.className = "jitsi-persisted-meeting-avatars";
                avatars.replaceChildren(
                    ...meeting.participants.slice(0, 10).map((participant) => {
                        const avatar = document.createElement("span");
                        avatar.className = "jitsi-persisted-meeting-avatar";
                        avatar.dataset.username = participant.username;
                        avatar.innerHTML = buildProfileAvatarMarkup({
                            avatarKey: participant.avatarKey,
                            label:
                                participant.displayName ?? participant.username,
                            colorSeed: participant.username,
                            avatarClass: "jitsi-persisted-meeting-avatar-link",
                            imageClass: "jitsi-persisted-meeting-avatar-image",
                            fallbackClass:
                                "jitsi-persisted-meeting-avatar-fallback",
                            profileHandle: participant.username,
                        });
                        return avatar;
                    }),
                );
                card.append(title, avatars);
                const cancelHold = () => {
                    if (persistedMeetingHoldTimer !== null) {
                        clearTimeout(persistedMeetingHoldTimer);
                        persistedMeetingHoldTimer = null;
                    }
                    card.classList.remove(
                        "jitsi-persisted-meeting-card-holding",
                    );
                };
                card.addEventListener("pointerdown", (event) => {
                    if (persistedMeetingsLocked) return;
                    if (event.target.closest("a")) return;
                    if (event.button !== 0) return;
                    suppressPersistedMeetingClick = false;
                    cancelHold();
                    card.classList.add("jitsi-persisted-meeting-card-holding");
                    persistedMeetingHoldTimer = setTimeout(() => {
                        persistedMeetingHoldTimer = null;
                        suppressPersistedMeetingClick = true;
                        card.classList.remove(
                            "jitsi-persisted-meeting-card-holding",
                        );
                        void confirmPersistedMeetingRemoval(meeting, card);
                    }, 3000);
                });
                card.addEventListener("pointerup", cancelHold);
                card.addEventListener("pointercancel", cancelHold);
                card.addEventListener("pointerleave", cancelHold);
                card.addEventListener("click", (event) => {
                    if (persistedMeetingsLocked) return;
                    if (event.target.closest("a")) return;
                    if (suppressPersistedMeetingClick) {
                        suppressPersistedMeetingClick = false;
                        return;
                    }
                    selectPersistedMeeting(meeting);
                });
                card.addEventListener("keydown", (event) => {
                    if (persistedMeetingsLocked) return;
                    if (event.key !== "Enter" && event.key !== " ") return;
                    event.preventDefault();
                    selectPersistedMeeting(meeting);
                });
                return card;
            }),
        );
        if (persistedMeetingsLocked) return;
        void hydrateProfileAvatars(persistedMeetingsEl).catch((error) =>
            logUi("error", "Persisted meeting avatar hydration failed.", {
                component: "module:jitsi-meet",
                operation: "hydrate_persisted_meeting_avatars",
                error: error instanceof Error ? error.message : String(error),
            }),
        );
    }

    function renderActiveMeetings({ loading = false } = {}) {
        const activeMeetingsEl = root.querySelector("#jitsi-active-meetings");
        if (!(activeMeetingsEl instanceof HTMLElement)) {
            return;
        }
        const activeMeetingsLocked = Boolean(
            state.meeting?.id || utils.isMeetingActive(),
        );
        const activeMeetingsSection = activeMeetingsEl.closest(
            ".jitsi-overlay-active-meetings",
        );
        if (activeMeetingsSection instanceof HTMLElement) {
            activeMeetingsSection.hidden = activeMeetingsLocked;
        }
        activeMeetingsEl.classList.toggle(
            "jitsi-active-meetings-disabled",
            activeMeetingsLocked,
        );
        activeMeetingsEl.setAttribute(
            "aria-disabled",
            String(activeMeetingsLocked),
        );
        if (
            !Array.isArray(state.activeMeetings) ||
            state.activeMeetings.length === 0
        ) {
            const emptyMessage = loading
                ? i18n.t("module.jitsi_meet.participants.active_loading")
                : i18n.t("module.jitsi_meet.participants.active_none");
            activeMeetingsEl.innerHTML = `<p class="jitsi-active-meetings-empty">${escapeHtml(emptyMessage)}</p>`;
            return;
        }
        activeMeetingsEl.replaceChildren(
            ...state.activeMeetings.map((meeting) => {
                const meetingId = normalizeMeetingId(meeting?.id);
                const startedByDisplayName = String(
                    meeting?.startedBy?.displayName ??
                        meeting?.startedBy?.username ??
                        "",
                ).trim();
                const fallbackLabel = String(
                    meeting?.meetingName ?? i18n.t("ui.reuse.meeting"),
                ).trim();
                const badgeLabel = startedByDisplayName || fallbackLabel;
                const badgeColor = pickInitialsColor(meetingId || badgeLabel);
                const badgeInitials = getInitialsText(badgeLabel);
                const button = document.createElement("button");
                button.type = "button";
                button.disabled = activeMeetingsLocked;
                button.className = "jitsi-active-meeting-item";
                if (
                    (state.meeting?.id || state.requestedMeetingId) ===
                    meetingId
                ) {
                    button.classList.add("jitsi-active-meeting-item-selected");
                }
                button.dataset.meetingId = meetingId;
                button.dataset.searchCategory = "Meetings";
                button.dataset.searchLabel = fallbackLabel;
                button.dataset.searchDescription = [
                    meeting?.scheduledAt ?? meeting?.createdAt,
                    startedByDisplayName,
                ]
                    .filter(Boolean)
                    .join(" · ");
                button.dataset.searchText = [
                    fallbackLabel,
                    startedByDisplayName,
                    meeting?.scheduledAt ?? meeting?.createdAt,
                    meeting?.meetingUrl,
                ]
                    .filter(Boolean)
                    .join(" ");
                button.setAttribute("role", "gridcell");
                button.innerHTML = `
          <span class="jitsi-active-meeting-avatar" style="--initials-bg: ${escapeHtml(badgeColor)}">${escapeHtml(badgeInitials)}</span>
          <span class="jitsi-active-meeting-meta">
            <span class="jitsi-active-meeting-title">${escapeHtml(fallbackLabel)}</span>
            <span class="jitsi-active-meeting-owner">${escapeHtml(startedByDisplayName || i18n.t("ui.reuse.system"))}</span>
          </span>
        `;
                return button;
            }),
        );
    }

    async function switchAwayFromActiveMeeting() {
        if (!utils.isMeetingActive()) return;
        await callbacks.keepPresenceAlive(false).catch(() => undefined);
        utils.clearTimers();
        const whiteboardCleanup = closeMeetingWhiteboard(root);
        state.meeting = null;
        closeMeetingEmbed();
        state.alonePromptMeetingId = "";
        state.alonePromptDismissedMeetingId = "";
        state.alonePromptBlockedUntil = 0;
        state.pendingParticipantUsernames.clear();
        state.kickReportedMeetingId = "";
        callbacks.deactivateMeetingChat();
        await callbacks.updateCognisChat();
        void whiteboardCleanup?.then(() => {
            if (state.overlayPresentation) {
                utils.updateOverlay(state.overlayPresentation);
            }
        });
    }

    function clearRequestedMeetingParameters() {
        const url = new URL(window.location.href);
        url.searchParams.delete("meetingId");
        url.searchParams.delete("start");
        window.history.replaceState(null, "", url);
    }

    async function joinMeetingById(meetingId, { autoStart = true } = {}) {
        const normalizedMeetingId = normalizeMeetingId(meetingId);
        if (!normalizedMeetingId) return;
        state.requestedMeetingId = "";
        state.requestedMeetingStart = false;
        clearRequestedMeetingParameters();
        if (
            utils.isMeetingActive() &&
            state.meeting?.id === normalizedMeetingId
        ) {
            return;
        }
        utils.updateOverlay({
            message: i18n.t("module.jitsi_meet.overlay.joining"),
            loading: false,
            canStart: false,
            showAuth: false,
            showReclaim: false,
            visible: true,
        });
        const getResponse = await apiFetch(
            "/api/v1/modules/jitsi-meet/meetings/get",
            {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    meetingId: normalizedMeetingId,
                    includeChat: state.includeMeetingChat,
                }),
                accessToken: state.shareAccessToken || undefined,
                suppressAccessDeniedEvent: true,
            },
        );
        if (!getResponse.ok) {
            state.meeting = null;
            const errorPayload = await getResponse
                .json()
                .catch(() => ({ error: null }));
            utils.updateOverlay({
                message: i18n.t(
                    getResponse.status === 404 ||
                        errorPayload?.error?.code === "meeting_closed"
                        ? "module.jitsi_meet.overlay.meeting_closed"
                        : "module.jitsi_meet.overlay.join_failed",
                ),
                canStart: false,
                showAuth: false,
                showReclaim: false,
                visible: true,
            });
            if (
                getResponse.status === 404 ||
                errorPayload?.error?.code === "not_found"
            ) {
                clearRequestedMeetingParameters();
                showToast(i18n.t("module.jitsi_meet.meeting_not_found"), {
                    variant: "warning",
                });
            }
            return;
        }
        const meetingPayload = await getResponse
            .json()
            .catch(() => ({ data: null }));
        if (
            !meetingPayload?.data?.id ||
            (autoStart && meetingPayload?.data?.state?.endedAt)
        ) {
            state.meeting = null;
            utils.updateOverlay({
                message: i18n.t("module.jitsi_meet.overlay.meeting_closed"),
                canStart: false,
                showAuth: false,
                showReclaim: false,
                visible: true,
            });
            return;
        }
        if (
            utils.isMeetingActive() &&
            state.meeting?.id !== normalizedMeetingId
        ) {
            await switchAwayFromActiveMeeting();
        }
        if (state.meeting?.id !== meetingPayload.data.id) {
            state.alonePromptMeetingId = "";
            state.alonePromptDismissedMeetingId = "";
            state.alonePromptBlockedUntil = 0;
        }
        state.meeting = meetingPayload.data;
        const currentUsername = normalizeUsername(
            state.currentProfile?.handle ?? state.currentProfile?.username,
        );
        const meetingParticipantNames = Array.isArray(
            meetingPayload.data.participants,
        )
            ? meetingPayload.data.participants
            : [];
        state.selectedParticipants = meetingParticipantNames
            .map((participant) => {
                const username = normalizeUsername(
                    typeof participant === "string"
                        ? participant
                        : (participant?.username ?? participant?.handle),
                );
                if (!username || username === currentUsername) return null;
                return (
                    state.allParticipants.find(
                        (candidate) => candidate.username === username,
                    ) ?? {
                        username,
                        displayName: String(
                            participant?.displayName ?? username,
                        ),
                        avatarKey: participant?.avatarKey ?? null,
                    }
                );
            })
            .filter(Boolean);
        state.availableParticipants = state.allParticipants.filter(
            (candidate) =>
                !state.selectedParticipants.some(
                    (participant) =>
                        participant.username === candidate.username,
                ),
        );
        state.persistedMeetingSelectionUsernames = state.selectedParticipants
            .map((participant) => participant.username)
            .sort();
        if (!autoStart) {
            state.meeting = null;
            callbacks.renderParticipants();
            return;
        }
        callbacks.renderParticipants();
        const meetingHasActiveSession = state.activeMeetings.some(
            (activeMeeting) =>
                normalizeMeetingId(activeMeeting?.id) === normalizedMeetingId,
        );
        if (
            !allowParticipantlessJoin &&
            state.selectedParticipants.length === 0 &&
            !meetingHasActiveSession
        ) {
            return;
        }
        state.chatMode = "meeting";
        state.privateChatUsername = "";
        await callbacks.updateCognisChat();
        const joinState = await callbacks.joinMeeting();
        if (joinState?.trackingAllowed) {
            callbacks.ensureMeetingTracking();
        }
    }

    async function loadActiveMeetings({ resolveRequested = true } = {}) {
        renderActiveMeetings({ loading: true });
        const [response, persistedResponse] = await Promise.all([
            apiFetch("/api/v1/modules/jitsi-meet/meetings/active"),
            apiFetch("/api/v1/modules/jitsi-meet/meetings/persisted"),
            callbacks.refreshAvailableParticipants?.(),
        ]);
        if (!response.ok) {
            state.activeMeetings = [];
            renderActiveMeetings();
            return;
        }
        const payload = await response.json().catch(() => ({ data: [] }));
        state.activeMeetings = Array.isArray(payload?.data) ? payload.data : [];
        const persistedPayload = persistedResponse.ok
            ? await persistedResponse.json().catch(() => ({ data: [] }))
            : { data: [] };
        state.persistedMeetings = Array.isArray(persistedPayload.data)
            ? persistedPayload.data
            : [];
        renderActiveMeetings();
        renderPersistedMeetings();
        const requestedMeetingId = resolveRequested
            ? normalizeMeetingId(state.requestedMeetingId)
            : "";
        if (!requestedMeetingId) return;
        state.requestedMeetingId = "";
        const requestedMeeting = state.activeMeetings.find(
            (meeting) => normalizeMeetingId(meeting?.id) === requestedMeetingId,
        );
        if (!requestedMeeting) {
            utils.updateOverlay({
                message: i18n.t("module.jitsi_meet.overlay.meeting_closed"),
                canStart: false,
                showAuth: false,
                showReclaim: false,
                visible: true,
            });
            return;
        }
        await joinMeetingById(requestedMeeting.id);
    }

    function stopActiveMeetingsPolling() {
        if (state.activeMeetingsRefreshTimer === null) return;
        clearInterval(state.activeMeetingsRefreshTimer);
        state.activeMeetingsRefreshTimer = null;
    }

    function startActiveMeetingsPolling() {
        if (state.activeMeetingsRefreshTimer !== null) return;
        state.activeMeetingsRefreshTimer = setInterval(() => {
            void loadActiveMeetings({ resolveRequested: false });
        }, ACTIVE_MEETINGS_REFRESH_INTERVAL_MS);
    }

    function closeMeetingEmbed() {
        if (state.jitsiApi) {
            const activeApi = state.jitsiApi;
            state.jitsiApi = null;
            state.jitsiParticipantId = "";
            state.jitsiConferenceJoined = false;
            state.jitsiModerator = false;
            activeApi.dispose();
        }
        utils.syncShareButtonAvailability();
        const frame = root.querySelector("#jitsi-meeting-frame");
        if (!(frame instanceof HTMLElement)) return;
        frame.hidden = true;
        frame.replaceChildren();
    }

    function isDisposableLinkShareMeeting() {
        if (!state.shareAccessToken || !state.meeting?.id) return false;
        if (state.meeting.disposable) return true;
        const participants = Array.isArray(state.meeting.participants)
            ? state.meeting.participants
            : [];
        return (
            participants.length > 0 &&
            participants.every(
                (username) => username === state.meeting.createdBy,
            )
        );
    }

    async function resetMeetingState({
        overlayMessageKey = null,
        toastMessageKey = null,
        toastVariant = "info",
        skipPresenceUpdate = false,
        retainMeetingOverlay = isDisposableLinkShareMeeting(),
    } = {}) {
        if (!skipPresenceUpdate) {
            await callbacks.keepPresenceAlive(false).catch(() => undefined);
        }
        utils.clearTimers();
        const whiteboardCleanup = closeMeetingWhiteboard(root);
        state.meeting = null;
        closeMeetingEmbed();
        state.alonePromptMeetingId = "";
        state.alonePromptDismissedMeetingId = "";
        state.alonePromptBlockedUntil = 0;
        state.pendingParticipantUsernames.clear();
        state.kickReportedMeetingId = "";
        callbacks.deactivateMeetingChat();
        utils.resetParticipantSelection();
        callbacks.renderParticipants();
        if (overlayMessageKey) {
            utils.updateOverlay({
                message: i18n.t(overlayMessageKey),
                canStart: state.preflightPassed,
                showAuth: false,
                showReclaim: false,
                visible: true,
            });
        }
        await callbacks.updateCognisChat();
        if (!retainMeetingOverlay) {
            await loadActiveMeetings({ resolveRequested: false });
        }
        void whiteboardCleanup?.then(() => {
            if (state.overlayPresentation) {
                utils.updateOverlay(state.overlayPresentation);
            }
        });
        if (toastMessageKey) {
            showToast(i18n.t(toastMessageKey), {
                variant: toastVariant,
            });
        }
    }

    async function handleMeetingExit({
        fallbackOverlayMessageKey,
        forceClosedOverlay = false,
        honorMeetingClosed = true,
        reportTerminated = false,
    }) {
        if (meetingExitPromise) return meetingExitPromise;
        const exitPromise = performMeetingExit({
            fallbackOverlayMessageKey,
            forceClosedOverlay,
            honorMeetingClosed,
            reportTerminated,
        });
        meetingExitPromise = exitPromise;
        try {
            return await exitPromise;
        } finally {
            if (meetingExitPromise === exitPromise) {
                meetingExitPromise = null;
            }
        }
    }

    async function performMeetingExit({
        fallbackOverlayMessageKey,
        forceClosedOverlay,
        honorMeetingClosed,
        reportTerminated,
    }) {
        const leaveStatePromise = callbacks
            .keepPresenceAlive(false, {
                terminated: reportTerminated,
            })
            .catch(() => null);
        const initialOverlayMessageKey = forceClosedOverlay
            ? "module.jitsi_meet.overlay.meeting_closed"
            : fallbackOverlayMessageKey;
        await resetMeetingState({
            overlayMessageKey: initialOverlayMessageKey,
            skipPresenceUpdate: true,
        });
        const leaveState = await leaveStatePromise;
        if (
            !forceClosedOverlay &&
            honorMeetingClosed &&
            leaveState?.meetingClosed
        ) {
            utils.updateOverlay({
                message: i18n.t("module.jitsi_meet.overlay.meeting_closed"),
                canStart: state.preflightPassed,
                showAuth: false,
                showReclaim: false,
                visible: true,
            });
        }
    }

    function shouldPromptLocalUserAlone(activeParticipants) {
        if (
            !utils.isMeetingActive() ||
            !state.meeting?.id ||
            state.alonePromptDismissedMeetingId === state.meeting.id ||
            Date.now() < state.alonePromptBlockedUntil
        ) {
            return false;
        }
        const localUsername = normalizeUsername(
            state.currentProfile?.handle ?? "",
        );
        if (!localUsername) return false;
        const uniqueActiveParticipants = Array.from(
            new Set(
                (Array.isArray(activeParticipants) ? activeParticipants : [])
                    .map((entry) => normalizeUsername(entry))
                    .filter(Boolean),
            ),
        );
        const invitedParticipants = Array.isArray(state.meeting?.participants)
            ? state.meeting.participants
                  .map((entry) => normalizeUsername(entry))
                  .filter(Boolean)
            : [];
        return (
            invitedParticipants.length > 1 &&
            uniqueActiveParticipants.length === 1 &&
            uniqueActiveParticipants[0] === localUsername
        );
    }

    function updateAloneParticipantPrompt(activeParticipants) {
        if (!state.meeting?.id) return false;
        if (!shouldPromptLocalUserAlone(activeParticipants)) {
            if (state.alonePromptMeetingId === state.meeting.id) {
                state.alonePromptMeetingId = "";
                utils.updateOverlay({
                    message: i18n.t("module.jitsi_meet.overlay.in_meeting"),
                    canStart: false,
                    showAuth: false,
                    showReclaim: false,
                    showAlonePrompt: false,
                    visible: false,
                });
            }
            const uniqueActiveParticipants = new Set(
                (Array.isArray(activeParticipants) ? activeParticipants : [])
                    .map((entry) => normalizeUsername(entry))
                    .filter(Boolean),
            );
            if (uniqueActiveParticipants.size > 1) {
                state.alonePromptDismissedMeetingId = "";
            }
            return false;
        }
        state.alonePromptMeetingId = state.meeting.id;
        utils.updateOverlay({
            message: i18n.t("module.jitsi_meet.overlay.alone_prompt"),
            canStart: false,
            showAuth: false,
            showReclaim: false,
            showAlonePrompt: true,
            visible: true,
        });
        return true;
    }

    function lobbyMessageKey(participantCount) {
        if (state.preflightStatus === "running") {
            return "module.jitsi_meet.overlay.preflight_running";
        }
        if (state.preflightStatus === "failed") {
            if (state.preflightNeedsConfig) {
                return "module.jitsi_meet.overlay.config_required";
            }
            return "module.jitsi_meet.overlay.preflight_required";
        }
        if (state.preflightPassed && participantCount === 0) {
            return "module.jitsi_meet.overlay.ready_without_participants";
        }
        if (state.preflightPassed || participantCount > 0) {
            return "module.jitsi_meet.overlay.ready_to_start";
        }
        return "module.jitsi_meet.overlay.select_participants";
    }

    return {
        closeMeetingEmbed,
        handleMeetingExit,
        joinMeetingById,
        loadActiveMeetings,
        lobbyMessageKey,
        renderActiveMeetings,
        resetMeetingState,
        shouldPromptLocalUserAlone,
        startActiveMeetingsPolling,
        stopActiveMeetingsPolling,
        switchAwayFromActiveMeeting,
        updateAloneParticipantPrompt,
    };
}
