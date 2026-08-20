import { uiCtx } from "/static/reuse/ui-ctx.js";

/**
 * Wires the Jitsi Meet "share meeting" button.
 *
 * The button is contributed only when the Share popup capability is active.
 */

export async function openMeetingSharePopup({
    state,
    i18n,
    deferAloneParticipantPrompt,
}) {
    if (!state.meeting?.id || !state.jitsiConferenceJoined) return;
    const openSharePopup = uiCtx.capabilities.get("share:openPopup");
    if (typeof openSharePopup !== "function") return;
    deferAloneParticipantPrompt?.();
    try {
        await openSharePopup({
            resourceType: "meeting",
            resourceId: state.meeting.id,
            contentUrl: `/meetings?meetingId=${encodeURIComponent(state.meeting.id)}&start=1`,
            grantedCapabilities: [
                "meeting:join",
                "participants:read",
                "chat:read",
                "chat:write",
            ],
            allowedMethodIds: ["link"],
            supportsReadOnly: false,
            title: i18n.t("module.jitsi_meet.share.popup_title"),
            labels: {
                empty: i18n.t("module.jitsi_meet.share.empty"),
                untitled: i18n.t("module.jitsi_meet.share.untitled"),
                copyLink: i18n.t("module.jitsi_meet.share.copy_link"),
                revoke: i18n.t("module.jitsi_meet.share.revoke"),
                shareOptions: i18n.t(
                    "module.jitsi_meet.share.share_options_label",
                ),
                mail: i18n.t("ui.reuse.mail"),
                emailRecipients: i18n.t(
                    "module.jitsi_meet.share.email_recipients",
                ),
                label: i18n.t("module.jitsi_meet.share.label"),
                labelPlaceholder: i18n.t(
                    "module.jitsi_meet.share.label_placeholder",
                ),
                expiryLabel: i18n.t("module.jitsi_meet.share.expiry_label"),
                password: i18n.t("module.jitsi_meet.share.password_optional"),
                passwordPopupTitle: i18n.t(
                    "module.jitsi_meet.share.password_title",
                ),
                passwordPopupLabel: i18n.t(
                    "module.jitsi_meet.share.password_instruction",
                ),
                passwordPlaceholder: i18n.t(
                    "module.jitsi_meet.share.password_placeholder",
                ),
                statusActive: i18n.t("module.jitsi_meet.share.status_active"),
                statusExpired: i18n.t("module.jitsi_meet.share.status_expired"),
                expiresAtLabel: i18n.t(
                    "module.jitsi_meet.share.expires_at_label",
                ),
                expiredAtLabel: i18n.t(
                    "module.jitsi_meet.share.expired_at_label",
                ),
                generateLink: i18n.t("module.jitsi_meet.share.generate_link"),
                close: i18n.t("ui.reuse.close"),
                cancel: i18n.t("ui.reuse.cancel"),
                confirm: i18n.t("module.jitsi_meet.share.revoke"),
                deleteConfirmMessage: i18n.t(
                    "module.jitsi_meet.share.delete_prompt",
                ),
                createFailed: i18n.t("module.jitsi_meet.share.create_failed"),
                copySuccess: i18n.t("module.jitsi_meet.share.copy_success"),
                copyFailed: i18n.t("module.jitsi_meet.share.copy_failed"),
                deleteFailed: i18n.t("module.jitsi_meet.share.delete_failed"),
            },
        });
    } finally {
        deferAloneParticipantPrompt?.();
    }
}

export async function bindShareButton({
    root,
    signal,
    state,
    i18n,
    deferAloneParticipantPrompt,
}) {
    const shareButtonSlot = root.querySelector("#jitsi-share-button-slot");
    if (!(shareButtonSlot instanceof HTMLElement)) {
        return;
    }
    const existingButton = shareButtonSlot.querySelector("#share-resource-btn");
    if (existingButton instanceof HTMLButtonElement) {
        // Already mounted from a prior composer render pass — just refresh
        // its disabled state in case the meeting activity status changed.
        existingButton.disabled = !state.jitsiConferenceJoined;
        return;
    }

    const openSharePopup = uiCtx.capabilities.get("share:openPopup");
    if (typeof openSharePopup !== "function") return;

    const shareButton = document.createElement("button");
    shareButton.type = "button";
    shareButton.id = "share-resource-btn";
    shareButton.className = "btn-confirm";
    shareButton.textContent = i18n.t("module.jitsi_meet.share.button");
    shareButton.disabled = !state.jitsiConferenceJoined;
    shareButton.addEventListener(
        "click",
        () =>
            openMeetingSharePopup({
                state,
                i18n,
                deferAloneParticipantPrompt,
            }),
        { signal },
    );
    shareButtonSlot.appendChild(shareButton);
}
