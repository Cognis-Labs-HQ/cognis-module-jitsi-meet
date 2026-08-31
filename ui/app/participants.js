import { logUi } from "../reuse/feedback.js";
import { showToast } from "../reuse/feedback.js";
import { importReuseModule } from "../reuse/resources.js";
import {
    HEARTBEAT_INTERVAL_MS,
    MEETING_DESTROYED_TEXT,
    MEETING_TERMINATED_TEXT,
    STATE_REFRESH_INTERVAL_MS,
} from "../constants.js";
import { createParticipantAvatarEl } from "../jitsi-helpers.js";
import { placeMeetingOverlayForActiveWindow } from "../whiteboard-control.js";
import { hydrateProfileAvatars } from "./profile-avatars.js";

export function bindDragCleanup({ signal, cancel }) {
    document.addEventListener("dragend", cancel, { capture: true, signal });
    document.addEventListener("drop", cancel, { capture: true, signal });
    window.addEventListener("blur", cancel, { signal });
    document.addEventListener(
        "keydown",
        (event) => {
            if (event.key === "Escape") cancel();
        },
        { signal },
    );
}

const { normalizeUsername } = await importReuseModule("value-normalizers.js");

export function createPreflightHandlers({
    root,
    state,
    i18n,
    apiFetch,
    callbacks,
    utils,
}) {
    if (!(state.pendingParticipantUsernames instanceof Set)) {
        state.pendingParticipantUsernames = new Set();
    }

    async function runPreflightCheck({ showErrors = false } = {}) {
        if (state.preflightStatus === "running") {
            return false;
        }
        utils.setPreflightStatus(
            "running",
            i18n.t("module.jitsi_meet.overlay.loading"),
        );
        const response = await apiFetch(
            "/api/v1/modules/jitsi-meet/meetings/preflight",
            {
                method: "POST",
            },
        );
        if (!response.ok) {
            state.preflightNeedsConfig = response.status === 409;
            const message =
                response.status === 409
                    ? i18n.t("module.jitsi_meet.overlay.config_required")
                    : i18n.t("module.jitsi_meet.overlay.probe_failed");
            utils.setPreflightStatus("failed", message);
            renderParticipants();
            if (showErrors) {
                showToast(message, { variant: "error" });
            }
            return false;
        }
        const payload = await response.json().catch(() => ({ data: null }));
        state.preflightNeedsConfig = false;
        const isAlive = payload?.data?.alive === true;
        if (!isAlive) {
            const message = i18n.t("module.jitsi_meet.overlay.probe_failed");
            utils.setPreflightStatus("failed", message);
            renderParticipants();
            if (showErrors) {
                showToast(message, { variant: "error" });
            }
            return false;
        }
        utils.setPreflightStatus(
            "passed",
            i18n.t("module.jitsi_meet.overlay.probe_done"),
        );
        renderParticipants();
        return true;
    }

    function renderParticipants({ updateStage = true } = {}) {
        const availablePool = root.querySelector(
            "#jitsi-available-participants",
        );
        const stagedArea = root.querySelector("#jitsi-staged-participants");
        const participantsPane = root.querySelector(".jitsi-participants-pane");
        const findButton = root.querySelector("#jitsi-find-participants-btn");
        if (
            !(availablePool instanceof HTMLElement) ||
            !(stagedArea instanceof HTMLElement)
        ) {
            return;
        }

        if (state.availableParticipants.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.className =
                "jitsi-active-meetings-empty jitsi-participants-empty";
            emptyMessage.textContent = i18n.t(
                "module.jitsi_meet.participants.available_none",
            );
            availablePool.replaceChildren(emptyMessage);
        } else {
            availablePool.replaceChildren(
                ...state.availableParticipants.map((entry) =>
                    createParticipantAvatarEl(entry),
                ),
            );
        }
        void hydrateProfileAvatars(availablePool).catch((error) =>
            logUi(
                "error",
                "[jitsi-meet] participant availability hydration failed:",
                error,
            ),
        );

        const stagedEntries = utils.isMeetingActive()
            ? []
            : state.selectedParticipants;
        if (updateStage) {
            stagedArea.replaceChildren(
                ...stagedEntries.map((entry) =>
                    createParticipantAvatarEl(entry),
                ),
            );
            void hydrateProfileAvatars(stagedArea).catch((error) =>
                logUi(
                    "error",
                    "[jitsi-meet] staged participant hydration failed:",
                    error,
                ),
            );
        }

        const participantSelectionLocked =
            utils.isMeetingActive() && !state.meeting?.hasInvitedParticipants;
        if (participantsPane instanceof HTMLElement) {
            participantsPane.classList.toggle(
                "jitsi-participants-disabled",
                participantSelectionLocked,
            );
        }
        if (findButton instanceof HTMLButtonElement) {
            findButton.disabled = utils.isMeetingActive();
        }

        const participantCount = state.selectedParticipants.length;
        if (updateStage && !utils.isMeetingActive() && !state.meeting?.id) {
            utils.updateOverlay({
                message: i18n.t(callbacks.lobbyMessageKey(participantCount)),
                canStart: state.preflightPassed && !state.meeting?.id,
            });
        }
        callbacks.renderActiveMeetings();
    }

    async function refreshAvailableParticipants() {
        if (state.shareAccessToken) return;
        const meetingId = String(state.meeting?.id ?? "").trim();
        const query = meetingId
            ? `?meetingId=${encodeURIComponent(meetingId)}`
            : "";
        const response = await apiFetch(
            `/api/v1/modules/jitsi-meet/participants${query}`,
        );
        if (!response.ok) return;
        const payload = await response.json().catch(() => ({ data: [] }));
        const selectedByUsername = new Map(
            state.selectedParticipants.map((entry) => [entry.username, entry]),
        );
        state.allParticipants = (
            Array.isArray(payload?.data) ? payload.data : []
        )
            .map((entry) => ({
                username: normalizeUsername(entry?.handle ?? entry?.username),
                displayName: String(entry?.displayName ?? entry?.handle ?? ""),
                avatarKey:
                    typeof entry?.avatarKey === "string"
                        ? entry.avatarKey
                        : null,
            }))
            .filter((entry) => entry.username)
            .sort((left, right) => left.username.localeCompare(right.username));
        state.selectedParticipants = state.selectedParticipants.map(
            (entry) =>
                state.allParticipants.find(
                    (candidate) => candidate.username === entry.username,
                ) ?? selectedByUsername.get(entry.username),
        );
        const selectedUsernames = new Set(
            state.selectedParticipants.map((entry) => entry.username),
        );
        for (const username of state.pendingParticipantUsernames) {
            selectedUsernames.add(username);
        }
        for (const username of state.meeting?.participants ?? []) {
            selectedUsernames.add(normalizeUsername(username));
        }
        state.availableParticipants = state.allParticipants.filter(
            (entry) => !selectedUsernames.has(entry.username),
        );
        renderParticipants({ updateStage: false });
    }

    function removeParticipant(username) {
        state.selectedParticipants = state.selectedParticipants.filter(
            (entry) => entry.username !== username,
        );
    }

    function addParticipant(entry) {
        if (
            state.selectedParticipants.some(
                (item) => item.username === entry.username,
            )
        ) {
            return;
        }
        state.selectedParticipants.push(entry);
        state.selectedParticipants.sort((left, right) =>
            left.username.localeCompare(right.username),
        );
    }

    function setActiveParticipantDropzoneVisible(visible) {
        if (
            visible &&
            (!utils.isMeetingActive() || !state.meeting?.hasInvitedParticipants)
        ) {
            return;
        }
        const overlay =
            placeMeetingOverlayForActiveWindow(root) ??
            root.querySelector("#jitsi-overlay");
        if (!(overlay instanceof HTMLElement)) return;
        overlay.classList.toggle("jitsi-drop-active", visible);
        overlay.hidden = !visible;
        const message = overlay.querySelector("#jitsi-overlay-message");
        if (visible) {
            overlay.dataset.dropLabel = i18n.t(
                "module.jitsi_meet.participants.drop_to_invite",
            );
            if (message instanceof HTMLElement) {
                overlay.dataset.dropPreviousMessage = message.textContent ?? "";
                message.textContent = overlay.dataset.dropLabel;
            }
            overlay.setAttribute("aria-label", overlay.dataset.dropLabel);
            return;
        }
        if (
            message instanceof HTMLElement &&
            typeof overlay.dataset.dropPreviousMessage === "string"
        ) {
            message.textContent = overlay.dataset.dropPreviousMessage;
        }
        delete overlay.dataset.dropPreviousMessage;
        delete overlay.dataset.dropLabel;
        overlay.removeAttribute("aria-label");
    }

    async function applyDrop(username, targetZone) {
        if (!username) return;
        const normalized = normalizeUsername(username);
        if (!normalized) return;

        const fromAvailable = state.availableParticipants.find(
            (entry) => entry.username === normalized,
        );
        const fromSelected = state.selectedParticipants.find(
            (entry) => entry.username === normalized,
        );

        if (targetZone === "stage" && fromAvailable) {
            if (utils.isMeetingActive()) {
                if (!state.meeting?.hasInvitedParticipants) return;
                state.availableParticipants =
                    state.availableParticipants.filter(
                        (entry) => entry.username !== normalized,
                    );
                state.pendingParticipantUsernames.add(normalized);
                addParticipant(fromAvailable);
                renderParticipants();
                let response = null;
                try {
                    response = await apiFetch(
                        "/api/v1/modules/jitsi-meet/meetings/participants/add",
                        {
                            method: "POST",
                            headers: { "content-type": "application/json" },
                            body: JSON.stringify({
                                meetingId: state.meeting.id,
                                username: normalized,
                            }),
                        },
                    );
                } catch (error) {
                    await logUi("error", "Active meeting invitation failed.", {
                        component: "module:jitsi-meet",
                        operation: "invite_active_meeting_participant",
                        meetingId: state.meeting.id,
                        username: normalized,
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    });
                }
                if (!response?.ok) {
                    const errorPayload = response
                        ? await response.json().catch(() => ({ error: null }))
                        : { error: null };
                    removeParticipant(normalized);
                    state.pendingParticipantUsernames.delete(normalized);
                    if (
                        !state.availableParticipants.some(
                            (entry) => entry.username === normalized,
                        )
                    ) {
                        state.availableParticipants.push(fromAvailable);
                        state.availableParticipants.sort((left, right) =>
                            left.username.localeCompare(right.username),
                        );
                    }
                    renderParticipants();
                    showToast(
                        i18n.t(
                            errorPayload?.error?.code ===
                                "participant_addition_declined"
                                ? "module.jitsi_meet.participants.invite_rejected"
                                : "module.jitsi_meet.overlay.invite_failed",
                        ),
                        {
                            variant:
                                errorPayload?.error?.code ===
                                "participant_addition_declined"
                                    ? "warning"
                                    : "error",
                        },
                    );
                    return;
                }
                const payload = await response
                    .json()
                    .catch(() => ({ data: null }));
                if (payload?.data) {
                    state.meeting = payload.data;
                    await callbacks.updateNativeChat();
                    await callbacks.syncMeetingWhiteboardComponent?.();
                }
                showToast(
                    i18n
                        .t("module.jitsi_meet.participants.invite_success")
                        .replace(
                            "{{participant}}",
                            fromAvailable.displayName || normalized,
                        ),
                    { variant: "success" },
                );
                return;
            }
            state.availableParticipants = state.availableParticipants.filter(
                (entry) => entry.username !== normalized,
            );
            addParticipant(fromAvailable);
        }

        if (
            !utils.isMeetingActive() &&
            targetZone === "available" &&
            fromSelected
        ) {
            removeParticipant(normalized);
            if (
                !state.availableParticipants.some(
                    (entry) => entry.username === normalized,
                )
            ) {
                state.availableParticipants.push(fromSelected);
            }
            state.availableParticipants.sort((left, right) =>
                left.username.localeCompare(right.username),
            );
        }

        renderParticipants();
    }

    async function loadMeetingState() {
        const meetingId = state.meeting?.id;
        if (!meetingId) return;
        const response = await apiFetch(
            "/api/v1/modules/jitsi-meet/meetings/state",
            {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    meetingId,
                    sessionId: state.sessionId,
                }),
                accessToken: state.shareAccessToken || undefined,
                suppressAccessDeniedEvent: true,
            },
        );
        if (!response.ok) return;
        const payload = await response.json().catch(() => ({ data: null }));
        const latestState = payload?.data?.state;
        if (!latestState) return;
        if (latestState.endedAt) {
            await callbacks.resetMeetingState({
                overlayMessageKey: "module.jitsi_meet.overlay.meeting_closed",
            });
            return;
        }
        if (payload?.data?.sessionActive === false) {
            await callbacks.resetMeetingState({
                overlayMessageKey:
                    "module.jitsi_meet.overlay.reclaimed_elsewhere",
                toastMessageKey:
                    "module.jitsi_meet.overlay.reclaimed_elsewhere",
                toastVariant: "warning",
            });
            return;
        }
        if (state.meeting?.id !== meetingId) return;
        state.meeting.state = latestState;
        if (Array.isArray(payload?.data?.activeParticipants)) {
            state.meeting.activeParticipants = payload.data.activeParticipants;
        }
        if (Array.isArray(payload?.data?.participants)) {
            const currentUsername = normalizeUsername(
                state.currentProfile?.handle ?? state.currentProfile?.username,
            );
            const participantUsernames = new Set(
                payload.data.participants
                    .map((participant) => normalizeUsername(participant))
                    .filter(
                        (username) => username && username !== currentUsername,
                    ),
            );
            for (const username of participantUsernames) {
                state.pendingParticipantUsernames.delete(username);
            }
            for (const username of state.pendingParticipantUsernames) {
                participantUsernames.add(username);
            }
            state.selectedParticipants = state.allParticipants.filter((entry) =>
                participantUsernames.has(entry.username),
            );
            state.availableParticipants = state.allParticipants.filter(
                (entry) => !participantUsernames.has(entry.username),
            );
            state.meeting.participants = payload.data.participants;
            if (typeof payload.data.chatRoomId === "string") {
                state.meeting.chatRoomId = payload.data.chatRoomId;
            }
            renderParticipants();
            await callbacks.updateNativeChat();
        }
        await callbacks.syncMeetingWhiteboardComponent?.();
        if (latestState.authRequired && !latestState.authCompletedAt) {
            utils.updateOverlay({
                message: i18n.t("module.jitsi_meet.overlay.auth_waiting"),
                showAuth: true,
                visible: true,
            });
            return;
        }
        if (latestState.authCompletedAt) {
            utils.updateOverlay({
                message: i18n.t("module.jitsi_meet.overlay.auth_completed"),
                canStart: false,
                showAuth: false,
                visible: true,
            });
        }
        if (
            callbacks.updateAloneParticipantPrompt(
                payload?.data?.activeParticipants,
            )
        ) {
            return;
        }
    }

    async function keepPresenceAlive(
        active = true,
        { terminated = false } = {},
    ) {
        if (!state.meeting?.id) return null;
        const response = await apiFetch(
            "/api/v1/modules/jitsi-meet/meetings/presence",
            {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    meetingId: state.meeting.id,
                    sessionId: state.sessionId,
                    active,
                    terminated,
                }),
                accessToken: state.shareAccessToken || undefined,
                suppressAccessDeniedEvent: true,
            },
        );
        if (!response.ok) return null;
        const payload = await response.json().catch(() => ({ data: null }));
        return payload?.data ?? null;
    }

    function shouldTrackMeetingPresence() {
        if (!state.meeting?.id) return false;
        if (state.meeting.waitingForAuthentication) return false;
        return (
            state.meeting.state?.authCompletedAt ||
            state.meeting.state?.authRequired !== true
        );
    }

    function ensureMeetingTracking() {
        if (!shouldTrackMeetingPresence()) return;
        if (state.heartbeatTimer === null) {
            state.heartbeatTimer = setInterval(() => {
                void keepPresenceAlive(true);
            }, HEARTBEAT_INTERVAL_MS);
        }
        if (state.stateRefreshTimer === null) {
            state.stateRefreshTimer = setInterval(() => {
                void loadMeetingState();
            }, STATE_REFRESH_INTERVAL_MS);
        }
    }

    function getParticipantId(candidate) {
        return String(candidate?.id ?? candidate?.participantId ?? "").trim();
    }

    function getParticipantRole(candidate) {
        return String(candidate?.role ?? "")
            .trim()
            .toLowerCase();
    }

    function getLocalParticipantInfo(apiInstance) {
        if (
            !apiInstance ||
            typeof apiInstance.getParticipantsInfo !== "function"
        ) {
            return null;
        }
        const participants = apiInstance.getParticipantsInfo();
        if (!Array.isArray(participants)) return null;
        return (
            participants.find((participant) => participant?.local === true) ??
            participants.find(
                (participant) =>
                    state.jitsiParticipantId &&
                    getParticipantId(participant) === state.jitsiParticipantId,
            ) ??
            null
        );
    }

    function executeJitsiCommandIfSupported(apiInstance, command, ...args) {
        if (!apiInstance || typeof apiInstance.executeCommand !== "function") {
            return;
        }
        if (typeof apiInstance.getSupportedCommands === "function") {
            const supportedCommands = apiInstance.getSupportedCommands();
            if (
                Array.isArray(supportedCommands) &&
                !supportedCommands.includes(command)
            ) {
                return;
            }
        }
        apiInstance.executeCommand(command, ...args);
    }

    function isMeetingTerminatedNotice(event) {
        const message = [
            event?.title,
            event?.description,
            event?.message,
            event?.name,
            event?.notification?.title,
            event?.notification?.description,
            event?.details?.message,
            event?.error?.name,
            event?.error?.message,
        ]
            .map((value) => String(value ?? "").toLowerCase())
            .join(" ");
        return (
            message.includes(MEETING_TERMINATED_TEXT) ||
            message.includes(MEETING_DESTROYED_TEXT)
        );
    }

    function currentUserIsJitsiModerator(apiInstance) {
        if (state.jitsiModerator) return true;
        if (
            apiInstance &&
            typeof apiInstance.isParticipantModerator === "function"
        ) {
            try {
                return apiInstance.isParticipantModerator() === true;
            } catch (error) {
                void logUi(
                    "warn",
                    "[jitsi-meet] failed to check Jitsi moderator status:",
                    error,
                );
                return false;
            }
        }
        return (
            getParticipantRole(getLocalParticipantInfo(apiInstance)) ===
            "moderator"
        );
    }

    function recoverMeetingSessionAfterComposerRender() {
        if (state.recoveringMeetingSession || !utils.isMeetingEmbedMissing())
            return;
        const staleApi = state.jitsiApi;
        state.jitsiApi = null;
        state.jitsiParticipantId = "";
        state.jitsiConferenceJoined = false;
        state.jitsiModerator = false;
        utils.syncShareButtonAvailability();
        try {
            staleApi?.dispose?.();
        } catch (error) {
            void logUi(
                "warn",
                "[jitsi-meet] failed to dispose stale meeting session during recovery:",
                error,
            );
        }
        state.recoveringMeetingSession = true;
        void callbacks
            .joinMeeting()
            .catch(() => {
                showToast(i18n.t("module.jitsi_meet.overlay.join_failed"), {
                    variant: "error",
                });
            })
            .finally(() => {
                state.recoveringMeetingSession = false;
                renderParticipants();
            });
    }

    return {
        addParticipant,
        applyDrop,
        currentUserIsJitsiModerator,
        ensureMeetingTracking,
        executeJitsiCommandIfSupported,
        getLocalParticipantInfo,
        getParticipantId,
        getParticipantRole,
        isMeetingTerminatedNotice,
        keepPresenceAlive,
        loadMeetingState,
        recoverMeetingSessionAfterComposerRender,
        removeParticipant,
        renderParticipants,
        refreshAvailableParticipants,
        runPreflightCheck,
        setActiveParticipantDropzoneVisible,
    };
}
