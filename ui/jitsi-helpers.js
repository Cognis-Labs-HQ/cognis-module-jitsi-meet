import { logUi } from "./reuse/feedback.js";
import {
    filesClient,
    profileClient,
    shareClient,
} from "./reuse/gateway-clients.js";
import { importReuseModule } from "./reuse/resources.js";
import { buildProfileAvatarMarkup } from "./app/profile-avatars.js";

const [{ apiFetch }, { getShareContext }, { normalizeUsername }] =
    await Promise.all([
        importReuseModule("api-client.js"),
        importReuseModule("auth-session.js"),
        importReuseModule("value-normalizers.js"),
    ]);

const FALLBACK_MESSAGE_UI_RESOURCES = Object.freeze({
    languageBaseUrls: ["/static/modules/jitsi-meet/languages"],
    stylesheetUrls: [],
    reactionHelpersModuleUrl: null,
    chatLoadingModuleUrl: null,
    profileFileNamespace: null,
});

export async function loadMessageUiResources() {
    try {
        const response = await apiFetch(
            "/api/v1/modules/jitsi-meet/ui-resources",
        );
        if (!response.ok) {
            void logUi(
                "warn",
                "[jitsi-meet] message UI resources unavailable; using fallback resources",
                {
                    operation: "load_message_ui_resources",
                    status: response.status,
                },
            );
            return FALLBACK_MESSAGE_UI_RESOURCES;
        }
        const payload = await response.json().catch(() => ({ data: null }));
        const responseData = payload?.data ?? {};
        const languageBaseUrls = Array.isArray(responseData.languageBaseUrls)
            ? responseData.languageBaseUrls.filter(
                  (entry) => typeof entry === "string" && entry.length > 0,
              )
            : FALLBACK_MESSAGE_UI_RESOURCES.languageBaseUrls;
        const stylesheetUrls = Array.isArray(responseData.stylesheetUrls)
            ? responseData.stylesheetUrls.filter(
                  (entry) => typeof entry === "string" && entry.length > 0,
              )
            : [];
        const reactionHelpersModuleUrl =
            typeof responseData.reactionHelpersModuleUrl === "string" &&
            responseData.reactionHelpersModuleUrl.length > 0
                ? responseData.reactionHelpersModuleUrl
                : null;
        const chatLoadingModuleUrl =
            typeof responseData.chatLoadingModuleUrl === "string" &&
            responseData.chatLoadingModuleUrl.length > 0
                ? responseData.chatLoadingModuleUrl
                : null;
        return {
            languageBaseUrls:
                languageBaseUrls.length > 0
                    ? languageBaseUrls
                    : FALLBACK_MESSAGE_UI_RESOURCES.languageBaseUrls,
            stylesheetUrls,
            reactionHelpersModuleUrl,
            chatLoadingModuleUrl,
            profileFileNamespace:
                typeof responseData.profileFileNamespace === "string"
                    ? responseData.profileFileNamespace
                    : null,
        };
    } catch {
        void logUi(
            "warn",
            "[jitsi-meet] failed to load message UI resources; using fallback resources",
            { operation: "load_message_ui_resources" },
        );
        return FALLBACK_MESSAGE_UI_RESOURCES;
    }
}

function buildFileUrl(namespaceId, objectKey) {
    if (!namespaceId || !objectKey) return "";
    return filesClient().resolveNamespacedFileUrl(namespaceId, objectKey);
}

export async function loadMessageReactionsController(
    messageUiResources,
    i18n,
    onReactionUpdated,
) {
    const moduleUrl = messageUiResources?.reactionHelpersModuleUrl;
    if (!moduleUrl) return null;
    try {
        const moduleExports = await import(moduleUrl);
        if (
            typeof moduleExports?.createMessageReactionsController !==
            "function"
        ) {
            return null;
        }
        const reactionsController =
            moduleExports.createMessageReactionsController({
                i18n,
                onReactionUpdated,
            });
        await reactionsController.loadEmojiUsage?.();
        return reactionsController;
    } catch {
        return null;
    }
}

export function normalizeChatRoomId(value) {
    const asString = String(value ?? "").trim();
    if (!asString) return "";
    return asString.replace(/^\/+|\/+$/g, "");
}

export function normalizeMeetingId(value) {
    return String(value ?? "").trim();
}

export function resolveMeetingChatRoomId(meeting) {
    const directRoomId = normalizeChatRoomId(meeting?.chatRoomId);
    if (directRoomId) return directRoomId;
    const rawChatUrl = String(meeting?.chatUrl ?? "").trim();
    if (!rawChatUrl) return "";
    const match = rawChatUrl.match(/\/messages\/([^/?#]+)/);
    return match ? normalizeChatRoomId(decodeURIComponent(match[1])) : "";
}

export async function fetchCurrentProfile() {
    const guestProfile = await fetchShareGuestProfile();
    if (guestProfile) return guestProfile;
    const response = await profileClient().getCurrentProfile();
    if (!response.ok) return null;
    const payload = await response.json().catch(() => ({ data: null }));
    const profile = payload?.data;
    if (!profile) return null;
    const handle = normalizeUsername(profile.handle ?? "");
    const displayName = String(
        profile.displayName ?? profile.handle ?? "",
    ).trim();
    const email = typeof profile.email === "string" ? profile.email.trim() : "";
    const avatarKey =
        typeof profile.avatarKey === "string" ? profile.avatarKey.trim() : "";
    const messageUiResources = await loadMessageUiResources();
    const avatarUrl = buildFileUrl(
        messageUiResources.profileFileNamespace,
        avatarKey,
    );
    return {
        handle,
        displayName: displayName || handle || "Cognis User",
        email,
        avatarKey: avatarKey ?? null,
        avatarUrl,
    };
}

/**
 * Sources the current user's display identity from the Share gateway's
 * temporary guest profile when the current session is viewing as a share
 * guest. Returns null for real (non-guest) sessions or if the Share gateway
 * is unavailable, so callers fall back to the normal profile lookup.
 */
async function fetchShareGuestProfile() {
    if (!getShareContext()?.guestAccessToken) return null;
    const response = await shareClient().getGuestProfile();
    if (!response.ok) return null;
    const payload = await response.json().catch(() => ({ data: null }));
    const profile = payload?.data;
    if (!profile) return null;
    const displayName = String(profile.displayName ?? "Guest").trim();
    const avatarKey =
        typeof profile.avatarKey === "string" ? profile.avatarKey.trim() : "";
    const messageUiResources = await loadMessageUiResources();
    const avatarUrl = buildFileUrl(
        messageUiResources.profileFileNamespace,
        avatarKey,
    );
    return {
        handle: "",
        displayName: displayName || "Guest",
        email: "",
        avatarKey: avatarKey || null,
        avatarUrl,
    };
}

export function createParticipantAvatarEl({
    username,
    displayName,
    avatarKey,
}) {
    const wrapper = document.createElement("div");
    wrapper.className = "jitsi-participant-avatar";
    wrapper.setAttribute("draggable", "true");
    wrapper.setAttribute("data-username", username);
    wrapper.setAttribute("role", "listitem");
    const labelText = displayName || username;
    wrapper.innerHTML = buildProfileAvatarMarkup({
        avatarKey,
        label: labelText,
        colorSeed: username,
        avatarClass: "jitsi-participant-avatar-link",
        imageClass: "jitsi-participant-avatar-img",
        fallbackClass: "jitsi-participant-avatar-bubble",
        profileHandle: username,
    });

    const label = document.createElement("span");
    label.className = "jitsi-participant-avatar-label";
    label.textContent = `@${username}`;

    wrapper.appendChild(label);
    return wrapper;
}

export function createChatParticipantAvatarButton({
    username,
    displayName,
    avatarKey,
    selected,
}) {
    const participantButton = document.createElement("button");
    participantButton.type = "button";
    participantButton.className = "jitsi-chat-participant-item";
    if (selected) {
        participantButton.classList.add("active");
    }
    participantButton.setAttribute("role", "listitem");
    participantButton.dataset.username = username;
    participantButton.setAttribute(
        "aria-label",
        displayName ? `${displayName} (@${username})` : `@${username}`,
    );
    participantButton.title = displayName
        ? `${displayName} (@${username})`
        : `@${username}`;
    participantButton.setAttribute("aria-pressed", selected ? "true" : "false");
    participantButton.innerHTML = buildProfileAvatarMarkup({
        avatarKey,
        label: displayName || username,
        colorSeed: username,
        avatarClass: "jitsi-chat-participant-avatar",
        imageClass: "jitsi-chat-participant-avatar-img",
        fallbackClass: "jitsi-chat-participant-avatar-bubble",
    });
    return participantButton;
}

export async function fetchParticipants(query) {
    const response = await apiFetch(
        `/api/v1/modules/jitsi-meet/participants?q=${encodeURIComponent(query)}`,
    );
    if (!response.ok) return [];
    const payload = await response.json().catch(() => ({ data: [] }));
    return Array.isArray(payload?.data) ? payload.data : [];
}
