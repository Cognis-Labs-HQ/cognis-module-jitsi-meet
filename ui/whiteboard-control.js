import { logUi, showToast } from "./reuse/feedback.js";
import { uiCtx } from "./reuse/resources.js";
import { resolveWhiteboardCapabilities } from "./whiteboard-provider.js";
import {
    ensureComponentPage,
    ensureWhiteboardKeyringUnlocked,
    meetingCanvasNeedsPreparation,
    meetingHasInvitedParticipants,
    meetingWhiteboardShouldOpen,
    prepareMeetingCanvas,
    spawnComponentWindowWithRetry,
    synchronizeWhiteboardParticipantAccess,
} from "./whiteboard-session.js";
const mountedWhiteboardButtons = new WeakMap();
let componentStageSequence = 0;

function syncButtonStyle(button) {
    if (!button) return;
    const confirmed = button.getAttribute("aria-pressed") === "true";
    button.classList.toggle("active", confirmed);
    button.classList.toggle("btn-cancel", confirmed);
    button.classList.toggle("btn-confirm", !confirmed);
    button.textContent = confirmed
        ? button.dataset.activeLabel || button.textContent
        : button.dataset.inactiveLabel || button.textContent;
}

function setButtonActive(button, active) {
    button?.setAttribute("aria-pressed", String(active));
    syncButtonStyle(button);
}

function setButtonDisabled(button, disabled) {
    if (button instanceof HTMLButtonElement) button.disabled = disabled;
    button?.setAttribute("aria-disabled", String(disabled));
}

function closeComponentWindow(trigger) {
    if (trigger) trigger.windowRequestSequence += 1;
    trigger?.releaseFloatingWindow?.();
    if (typeof trigger?.componentWindow?.discard === "function") {
        void trigger.componentWindow.discard();
    } else if (trigger?.frameWrap?.id) {
        void trigger.discardComponentPage?.(trigger.frameWrap.id);
    }
    if (trigger) {
        trigger.componentWindowPending = false;
        trigger.componentWindow = null;
        trigger.releaseFloatingWindow = null;
        trigger.whiteboardId = "";
        setButtonActive(trigger.button, false);
    }
}

async function handleWhiteboardLoadError(trigger, state, error, operation) {
    closeComponentWindow(trigger);
    trigger.loadRetryAfter = Date.now() + 2_000;
    await logUi("error", "Meeting whiteboard loading failed.", {
        component: "module:jitsi-meet",
        operation,
        meetingId: state.meeting?.id,
        error: error instanceof Error ? error.message : String(error),
    });
    showToast(trigger.i18n.t("module.jitsi_meet.whiteboard.load_failed"), {
        variant: "error",
    });
}

export function syncWhiteboardButtonAvailability({ root, state }) {
    const trigger = mountedWhiteboardButtons.get(root);
    if (trigger?.button) {
        trigger.disposableCanvas = !meetingHasInvitedParticipants(
            state.meeting,
        );
        const meetingId = state.meeting?.id ?? "";
        if (trigger.preparedMeetingId !== meetingId) {
            trigger.preparedMeetingId = meetingId;
            trigger.preparedWhiteboardId = "";
            trigger.preparationFailedMeetingId = "";
        }
        const stateWhiteboardId = String(
            state.meeting?.state?.whiteboardId ?? "",
        ).trim();
        const stateWhiteboardDisposable =
            state.meeting?.state?.whiteboardDisposable;
        if (
            stateWhiteboardId &&
            typeof stateWhiteboardDisposable === "boolean" &&
            (state.shareAccessToken ||
                stateWhiteboardDisposable === trigger.disposableCanvas)
        ) {
            trigger.disposableCanvas = stateWhiteboardDisposable;
            trigger.preparedWhiteboardId = stateWhiteboardId;
        }
        setButtonActive(trigger.button, Boolean(trigger.componentWindow));
        if (meetingCanvasNeedsPreparation(trigger, state)) {
            void prepareMeetingCanvas(trigger, state)
                .catch((error) => {
                    trigger.preparationFailedMeetingId =
                        state.meeting?.id ?? "";
                    return handleWhiteboardLoadError(
                        trigger,
                        state,
                        error,
                        "prepare_meeting_whiteboard",
                    );
                })
                .finally(() =>
                    syncWhiteboardButtonAvailability({ root, state }),
                );
        }
        setButtonDisabled(
            trigger.button,
            trigger.componentWindowPending === true ||
                !state.jitsiConferenceJoined ||
                !trigger.componentPage ||
                !trigger.preparedWhiteboardId,
        );
    }
}

export function syncMeetingWhiteboardComponent({ root, state }) {
    const trigger = mountedWhiteboardButtons.get(root);
    if (!trigger?.button) return;
    syncWhiteboardButtonAvailability({ root, state });
    void synchronizeWhiteboardParticipantAccess(trigger, state)
        .then((expanded) => {
            if (expanded !== false || trigger.participantAccessWarningLogged)
                return;
            trigger.participantAccessWarningLogged = true;
            return logUi(
                "warn",
                "Whiteboard provider cannot expand participant access.",
                {
                    component: "module:jitsi-meet",
                    operation: "expand_meeting_whiteboard_access_unavailable",
                    meetingId: state.meeting?.id,
                    whiteboardId: state.meeting?.state?.whiteboardId,
                },
            );
        })
        .catch((error) =>
            logUi("error", "Whiteboard participant access expansion failed.", {
                component: "module:jitsi-meet",
                operation: "expand_meeting_whiteboard_access",
                meetingId: state.meeting?.id,
                whiteboardId: state.meeting?.state?.whiteboardId,
                error: error instanceof Error ? error.message : String(error),
            }),
        );
    const shouldOpen = meetingWhiteboardShouldOpen(state.meeting);
    if (!shouldOpen && trigger.componentWindowPending !== true) {
        closeComponentWindow(trigger);
    } else if (
        shouldOpen &&
        Date.now() >= trigger.loadRetryAfter &&
        trigger.button.disabled !== true &&
        !trigger.componentWindow &&
        trigger.componentWindowPending !== true
    ) {
        trigger.sharedOpenRequested = true;
        trigger.button.click();
    }
}

export function closeMeetingWhiteboard(root) {
    closeComponentWindow(mountedWhiteboardButtons.get(root));
}

export async function bindWhiteboardButton({
    root,
    signal,
    state,
    i18n,
    apiFetch,
}) {
    const slot = root.querySelector("#jitsi-whiteboard-button-slot");
    const frameWrap = root.querySelector(".jitsi-stage-frame-wrap");
    const pipHandle = root.querySelector(".jitsi-stage-header");
    if (
        !(slot instanceof HTMLElement) ||
        !(frameWrap instanceof HTMLElement) ||
        !(pipHandle instanceof HTMLElement)
    )
        return;
    const mounted = mountedWhiteboardButtons.get(root);
    if (mounted?.slot === slot) {
        syncWhiteboardButtonAvailability({ root, state });
        return;
    }
    mounted?.destroy();
    mountedWhiteboardButtons.delete(root);
    if (signal?.aborted) return;
    componentStageSequence += 1;
    const uniqueStageId = globalThis.crypto?.randomUUID?.();
    frameWrap.id = uniqueStageId
        ? `jitsi-whiteboard-stage-${uniqueStageId}`
        : `jitsi-whiteboard-stage-${Date.now()}-${componentStageSequence}`;
    let capabilities;
    try {
        capabilities = await resolveWhiteboardCapabilities(signal, {
            requireCanvasFactory: !state.shareAccessToken,
        });
    } catch (error) {
        await logUi("error", "Whiteboard UI providers could not load.", {
            component: "module:jitsi-meet",
            operation: "load_whiteboard_ui_providers",
            error: error instanceof Error ? error.message : String(error),
        });
        return;
    }
    if (signal?.aborted) return;
    const {
        discardComponentPage,
        isKeyringUnlocked,
        makeFloatingWindow,
        requestKeyringUnlock,
        spawnComponentPage,
        whiteboardGateway,
    } = capabilities;
    if (
        (!state.shareAccessToken &&
            typeof whiteboardGateway?.createDisposableCanvas !== "function") ||
        typeof spawnComponentPage !== "function" ||
        typeof makeFloatingWindow !== "function"
    )
        return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn-confirm btn-animated";
    button.setAttribute("aria-pressed", "false");
    button.dataset.inactiveLabel = i18n.t("module.jitsi_meet.whiteboard.open");
    button.dataset.activeLabel = i18n.t("module.jitsi_meet.whiteboard.close");
    button.textContent = button.dataset.inactiveLabel;
    if (state.shareAccessToken) {
        button.hidden = true;
        button.tabIndex = -1;
        button.setAttribute("aria-hidden", "true");
    }
    setButtonDisabled(button, true);
    slot.replaceChildren(button);
    const trigger = {
        apiFetch,
        button,
        componentPage: null,
        componentWindow: null,
        componentWindowPending: false,
        discardComponentPage,
        disposableCanvas: !meetingHasInvitedParticipants(state.meeting),
        frameWrap,
        i18n,
        isKeyringUnlocked,
        loadRetryAfter: 0,
        makeFloatingWindow,
        pipHandle,
        preparedWhiteboardId:
            state.meeting?.state?.whiteboardDisposable ===
            !meetingHasInvitedParticipants(state.meeting)
                ? String(state.meeting?.state?.whiteboardId ?? "").trim()
                : "",
        preparedMeetingId: state.meeting?.id ?? "",
        preparationPromise: null,
        preparationFailedMeetingId: "",
        participantAccessPromise: null,
        participantAccessSignature: "",
        participantAccessWarningLogged: false,
        releaseFloatingWindow: null,
        sharedOpenRequested: false,
        signal,
        spawnComponentPage,
        whiteboardGateway,
        requestComponentPage: async (request) => {
            const requestPage = uiCtx.capabilities.get(
                "component-pages:request",
            );
            if (typeof requestPage !== "function") return null;
            return requestPage(request).catch((error) => {
                void logUi(
                    "error",
                    "Whiteboard component page request failed.",
                    {
                        component: "module:jitsi-meet",
                        operation: "request_whiteboard_component_page",
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    },
                );
                return null;
            });
        },
        requestKeyringUnlock,
        slot,
        whiteboardId: "",
        windowRequestSequence: 0,
        destroy() {
            closeComponentWindow(trigger);
            button.remove();
        },
    };
    mountedWhiteboardButtons.set(root, trigger);

    button.addEventListener(
        "click",
        (event) => {
            if (button.disabled) return;
            if (!state.meeting?.id || !state.jitsiConferenceJoined) return;
            if (trigger.componentWindow) {
                const whiteboardId = trigger.whiteboardId;
                closeComponentWindow(trigger);
                state.meeting.state.whiteboardOpen = false;
                void (async () => {
                    try {
                        const response = await apiFetch(
                            "/api/v1/modules/jitsi-meet/whiteboard/state",
                            {
                                method: "POST",
                                headers: { "content-type": "application/json" },
                                body: JSON.stringify({
                                    meetingId: state.meeting.id,
                                    whiteboardId,
                                    disposable: trigger.disposableCanvas,
                                    active: false,
                                }),
                                accessToken:
                                    state.shareAccessToken || undefined,
                            },
                        );
                        if (!response.ok)
                            throw new Error("whiteboard_state_sync_failed");
                    } catch (error) {
                        await logUi(
                            "error",
                            "Meeting whiteboard close failed.",
                            {
                                component: "module:jitsi-meet",
                                operation: "close_meeting_whiteboard",
                                meetingId: state.meeting?.id,
                                error:
                                    error instanceof Error
                                        ? error.message
                                        : String(error),
                            },
                        );
                        showToast(
                            i18n.t("module.jitsi_meet.whiteboard.close_failed"),
                            { variant: "error" },
                        );
                    } finally {
                        syncWhiteboardButtonAvailability({ root, state });
                    }
                })();
                return;
            }
            const whiteboardId = trigger.preparedWhiteboardId;
            if (!whiteboardId || !trigger.componentPage) return;
            const synchronizeOpen = trigger.sharedOpenRequested !== true;
            trigger.sharedOpenRequested = false;
            setButtonDisabled(button, true);
            trigger.componentWindowPending = true;
            const meetingId = state.meeting.id;
            const windowRequestSequence = ++trigger.windowRequestSequence;
            const requestIsCurrent = () =>
                trigger.windowRequestSequence === windowRequestSequence &&
                state.meeting?.id === meetingId &&
                !signal?.aborted;
            let openStateConfirmed = false;
            void (async () => {
                try {
                    const keyringUnlocked =
                        await ensureWhiteboardKeyringUnlocked(trigger, state);
                    if (!requestIsCurrent()) return;
                    if (!keyringUnlocked) {
                        closeComponentWindow(trigger);
                        await logUi(
                            "info",
                            "Meeting whiteboard keyring access cancelled.",
                            {
                                component: "module:jitsi-meet",
                                operation: "unlock_meeting_whiteboard_keyring",
                                meetingId: state.meeting?.id,
                            },
                        );
                        return;
                    }
                    const response = synchronizeOpen
                        ? await apiFetch(
                              "/api/v1/modules/jitsi-meet/whiteboard/state",
                              {
                                  method: "POST",
                                  headers: {
                                      "content-type": "application/json",
                                  },
                                  body: JSON.stringify({
                                      meetingId: state.meeting.id,
                                      whiteboardId,
                                      disposable: trigger.disposableCanvas,
                                      active: true,
                                  }),
                                  accessToken:
                                      state.shareAccessToken || undefined,
                              },
                          )
                        : null;
                    if (response && !response.ok)
                        throw new Error("whiteboard_state_sync_failed");
                    const responseData = response
                        ? (await response.json())?.data
                        : { whiteboardOpen: true };
                    if (responseData?.whiteboardOpen !== true) {
                        closeComponentWindow(trigger);
                        state.meeting.state.whiteboardOpen = false;
                        showToast(
                            i18n.t(
                                "module.jitsi_meet.whiteboard.consensus_pending",
                            ),
                        );
                        return;
                    }
                    openStateConfirmed = true;
                    state.meeting.state.whiteboardId = whiteboardId;
                    state.meeting.state.whiteboardDisposable =
                        trigger.disposableCanvas;
                    state.meeting.state.whiteboardOpen = true;
                    const meetingFrame =
                        frameWrap.querySelector(".jitsi-stage-frame");
                    if (meetingFrame instanceof HTMLElement) {
                        trigger.releaseFloatingWindow = makeFloatingWindow(
                            meetingFrame,
                            {
                                handle: pipHandle,
                                signal,
                            },
                        );
                    }
                    const componentWindow = await spawnComponentWindowWithRetry(
                        trigger,
                        {
                            meetingId: state.meeting.id,
                            meetingName: state.meeting.meetingName,
                            whiteboardId,
                        },
                    );
                    if (
                        !requestIsCurrent() ||
                        state.meeting?.state?.whiteboardOpen !== true
                    ) {
                        await componentWindow?.discard?.();
                        return;
                    }
                    trigger.componentWindow = componentWindow;
                    trigger.whiteboardId = whiteboardId;
                } catch (error) {
                    if (
                        !requestIsCurrent() ||
                        (openStateConfirmed &&
                            state.meeting?.state?.whiteboardOpen !== true)
                    )
                        return;
                    await handleWhiteboardLoadError(
                        trigger,
                        state,
                        error,
                        "load_meeting_whiteboard",
                    );
                } finally {
                    trigger.componentWindowPending = false;
                    syncWhiteboardButtonAvailability({ root, state });
                }
            })();
        },
        { signal },
    );
    signal?.addEventListener(
        "abort",
        () => {
            if (mountedWhiteboardButtons.get(root) !== trigger) return;
            trigger.destroy();
            mountedWhiteboardButtons.delete(root);
        },
        { once: true },
    );
    try {
        await ensureComponentPage(trigger, state.meeting?.id);
        await prepareMeetingCanvas(trigger, state);
    } catch (error) {
        trigger.preparationFailedMeetingId = state.meeting?.id ?? "";
        await handleWhiteboardLoadError(
            trigger,
            state,
            error,
            "prepare_meeting_whiteboard",
        );
    }
    syncMeetingWhiteboardComponent({ root, state });
}
