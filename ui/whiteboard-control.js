import { floatMeetingWindow } from "./meeting-window.js";
import { logUi, showToast } from "./reuse/feedback.js";
import { uiCtx } from "./reuse/resources.js";
import {
    resolveWhiteboardCapabilities,
    resolveWhiteboardServerContract,
    synchronizeWhiteboardOpen,
} from "./whiteboard-provider.js";
import {
    confirmMeetingCanvasMapping,
    ensureComponentPage,
    ensureWhiteboardKeyringUnlocked,
    meetingWhiteboardShouldOpen,
    prepareMeetingCanvas,
    resolveMeetingPipMinimumSize,
    spawnComponentWindowWithRetry,
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

function explainUnavailableWhiteboard(button, slot, i18n, signal) {
    const message = i18n.t(
        "module.jitsi_meet.whiteboard.provider_contract_unavailable",
    );
    setButtonDisabled(button, true);
    button.title = message;
    slot.title = message;
    signal?.addEventListener("abort", () => button.remove(), { once: true });
}

function placeMeetingOverlay(trigger, { floating = false } = {}) {
    const overlay = trigger?.overlay;
    const parent = floating ? trigger?.meetingFrame : trigger?.frameWrap;
    if (
        overlay instanceof HTMLElement &&
        parent instanceof HTMLElement &&
        overlay.parentElement !== parent
    ) {
        parent.append(overlay);
    }
    return overlay instanceof HTMLElement ? overlay : null;
}

async function discardComponentWindow(trigger) {
    try {
        if (typeof trigger?.componentWindow?.discard === "function") {
            await trigger.componentWindow.discard();
        } else if (trigger?.componentHost?.id) {
            await trigger.discardComponentPage?.(trigger.componentHost.id);
        }
    } catch (error) {
        await logUi("error", "Meeting Whiteboard window cleanup failed.", {
            component: "module:jitsi-meet",
            operation: "close_meeting_whiteboard_window",
            whiteboardId: trigger?.whiteboardId,
            error: error instanceof Error ? error.message : String(error),
        });
    }
}

function closeComponentWindow(trigger) {
    if (trigger) trigger.windowRequestSequence += 1;
    trigger?.automaticActivationCleanup?.();
    trigger?.releaseFloatingWindow?.();
    placeMeetingOverlay(trigger);
    if (trigger?.componentShell instanceof HTMLElement) {
        trigger.componentShell.hidden = true;
    }
    const discardPromise = discardComponentWindow(trigger);
    if (trigger) {
        trigger.componentWindowPending = false;
        trigger.componentWindow = null;
        trigger.releaseFloatingWindow = null;
        trigger.automaticActivationCleanup = null;
        trigger.whiteboardId = "";
        setButtonActive(trigger.button, false);
    }
    return discardPromise;
}

async function handleWhiteboardLoadError(
    trigger,
    state,
    error,
    operation,
    stageKey,
) {
    closeComponentWindow(trigger);
    trigger.loadRetryAfter = Date.now() + 2_000;
    const metadata = {
        component: "module:jitsi-meet",
        operation,
        stage: stageKey,
        meetingId: state.meeting?.id,
        whiteboardId: state.meeting?.state?.whiteboardId,
        error: error instanceof Error ? error.message : String(error),
    };
    globalThis.console?.error?.(
        "[jitsi-meet] Meeting Whiteboard loading failed.",
        metadata,
        error,
    );
    await logUi("error", "Meeting whiteboard loading failed.", metadata);
    showToast(
        trigger.i18n
            .t("module.jitsi_meet.whiteboard.load_failed_detailed")
            .replace(
                "{{stage}}",
                trigger.i18n.t(
                    `module.jitsi_meet.whiteboard.stage.${stageKey}`,
                ),
            ),
        { variant: "error" },
    );
}

export function syncWhiteboardButtonAvailability({ root, state }) {
    const trigger = mountedWhiteboardButtons.get(root);
    if (trigger?.button) {
        trigger.disposableCanvas = state.meeting?.disposable === true;
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
        const screenSharingActive =
            state.meeting?.state?.screenSharingActive === true;
        const screenSharingTooltip = screenSharingActive
            ? trigger.i18n.t(
                  "module.jitsi_meet.whiteboard.screen_sharing_locked_tooltip",
              )
            : "";
        trigger.button.title = screenSharingTooltip;
        trigger.slot.title = screenSharingTooltip;
        setButtonDisabled(
            trigger.button,
            screenSharingActive ||
                trigger.componentWindowPending === true ||
                !state.jitsiConferenceJoined ||
                !trigger.componentPage,
        );
    }
}

export function syncMeetingWhiteboardComponent({ root, state }) {
    const trigger = mountedWhiteboardButtons.get(root);
    if (!trigger?.button) return;
    syncWhiteboardButtonAvailability({ root, state });
    trigger.releaseFloatingWindow?.updateMinimumSize?.(
        resolveMeetingPipMinimumSize(state.meeting),
    );
    const shouldOpen = meetingWhiteboardShouldOpen(state.meeting);
    if (!shouldOpen && trigger.componentWindowPending !== true) {
        trigger.automaticOpenFailureWhiteboardId = "";
        closeComponentWindow(trigger);
    } else if (
        shouldOpen &&
        Date.now() >= trigger.loadRetryAfter &&
        trigger.button.disabled !== true &&
        !trigger.componentWindow &&
        trigger.componentWindowPending !== true &&
        trigger.automaticOpenFailureWhiteboardId !==
            trigger.preparedWhiteboardId
    ) {
        if (
            !state.shareAccessToken &&
            globalThis.navigator?.userActivation?.isActive !== true
        ) {
            if (!trigger.automaticActivationCleanup) {
                const activationController = new AbortController();
                const activate = () => {
                    activationController.abort();
                    trigger.automaticActivationCleanup = null;
                    if (!meetingWhiteboardShouldOpen(state.meeting)) return;
                    trigger.sharedOpenRequested = true;
                    trigger.button.click();
                };
                document.addEventListener("pointerdown", activate, {
                    capture: true,
                    once: true,
                    signal: activationController.signal,
                });
                document.addEventListener("keydown", activate, {
                    capture: true,
                    once: true,
                    signal: activationController.signal,
                });
                trigger.signal?.addEventListener(
                    "abort",
                    () => activationController.abort(),
                    { once: true },
                );
                trigger.automaticActivationCleanup = () =>
                    activationController.abort();
                void logUi(
                    "info",
                    "Whiteboard mounting deferred until the next browser activation.",
                    {
                        component: "module:jitsi-meet",
                        operation: "defer_automatic_whiteboard_mount",
                        meetingId: state.meeting?.id,
                        whiteboardId: trigger.preparedWhiteboardId,
                    },
                );
            }
            return;
        }
        trigger.sharedOpenRequested = true;
        trigger.button.click();
    }
}

export function closeMeetingWhiteboard(root) {
    return closeComponentWindow(mountedWhiteboardButtons.get(root));
}

export function placeMeetingOverlayForActiveWindow(root) {
    const trigger = mountedWhiteboardButtons.get(root);
    const floating =
        Boolean(trigger?.releaseFloatingWindow) ||
        trigger?.meetingFrame?.classList.contains("floating-window");
    const overlay = floating
        ? trigger.overlay
        : (root.querySelector("#jitsi-overlay") ?? trigger?.overlay ?? null);
    const meetingFrame = floating
        ? trigger.meetingFrame
        : (root.querySelector(".jitsi-stage-frame") ??
          trigger?.meetingFrame ??
          null);
    const frameWrap =
        root.querySelector(".jitsi-stage-frame-wrap") ??
        trigger?.frameWrap ??
        null;
    if (!(overlay instanceof HTMLElement)) return null;
    const meetingFrameIsFloating =
        meetingFrame instanceof HTMLElement &&
        meetingFrame.classList.contains("floating-window");
    return placeMeetingOverlay(
        { frameWrap, meetingFrame, overlay },
        {
            floating:
                Boolean(trigger?.releaseFloatingWindow) ||
                meetingFrameIsFloating,
        },
    );
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
    const meetingFrame = frameWrap?.querySelector(".jitsi-stage-frame");
    const componentShell = frameWrap?.querySelector(
        ".jitsi-whiteboard-component-shell",
    );
    const componentHost = frameWrap?.querySelector(
        ".jitsi-whiteboard-component-host",
    );
    const overlay = frameWrap?.querySelector("#jitsi-overlay");
    if (
        !(slot instanceof HTMLElement) ||
        !(frameWrap instanceof HTMLElement) ||
        !(meetingFrame instanceof HTMLElement) ||
        !(componentShell instanceof HTMLElement) ||
        !(componentHost instanceof HTMLElement) ||
        !(overlay instanceof HTMLElement)
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
    componentHost.id = uniqueStageId
        ? `jitsi-whiteboard-stage-${uniqueStageId}`
        : `jitsi-whiteboard-stage-${Date.now()}-${componentStageSequence}`;
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
    slot.title = "";
    slot.replaceChildren(button);
    let capabilities;
    try {
        const canvasFactory = state.shareAccessToken
            ? null
            : state.meeting?.disposable === true
              ? "createDisposableCanvas"
              : "createCanvas";
        capabilities = await resolveWhiteboardCapabilities(signal, {
            canvasFactory,
        });
    } catch (error) {
        if (signal?.aborted || slot.firstElementChild !== button) {
            button.remove();
            return;
        }
        explainUnavailableWhiteboard(button, slot, i18n, signal);
        await logUi("error", "Whiteboard UI providers could not load.", {
            component: "module:jitsi-meet",
            operation: "load_whiteboard_ui_providers",
            error: error instanceof Error ? error.message : String(error),
        });
        return;
    }
    if (signal?.aborted || slot.firstElementChild !== button) {
        button.remove();
        return;
    }
    const {
        discardComponentPage,
        isKeyringUnlocked,
        makeFloatingWindow,
        requestKeyringUnlock,
        whiteboardGateway,
    } = capabilities;
    if (!whiteboardGateway) {
        button.remove();
        return;
    }
    if (capabilities.missingCapabilities.length > 0) {
        explainUnavailableWhiteboard(button, slot, i18n, signal);
        await logUi("error", "Whiteboard UI contract is incomplete.", {
            component: "module:jitsi-meet",
            operation: "resolve_whiteboard_ui_contract",
            missingCapabilities: capabilities.missingCapabilities,
        });
        return;
    }

    const trigger = {
        apiFetch,
        button,
        componentPage: null,
        componentHost,
        componentShell,
        componentWindow: null,
        componentWindowPending: false,
        discardComponentPage,
        disposableCanvas: state.meeting?.disposable === true,
        frameWrap,
        i18n,
        isKeyringUnlocked,
        loadRetryAfter: 0,
        makeFloatingWindow,
        meetingFrame,
        preparedWhiteboardId:
            state.meeting?.state?.whiteboardDisposable ===
            (state.meeting?.disposable === true)
                ? String(state.meeting?.state?.whiteboardId ?? "").trim()
                : "",
        preparedMeetingId: state.meeting?.id ?? "",
        preparationPromise: null,
        preparationFailedMeetingId: "",
        automaticOpenFailureWhiteboardId: "",
        automaticActivationCleanup: null,
        releaseFloatingWindow: null,
        sharedOpenRequested: false,
        signal,
        whiteboardGateway,
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
            if (!trigger.componentPage) return;
            const synchronizeOpen = trigger.sharedOpenRequested !== true;
            let automaticOpen = !synchronizeOpen;
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
            let loadStage = "prepare";
            let whiteboardId = trigger.preparedWhiteboardId;
            void (async () => {
                try {
                    const serverContract =
                        await resolveWhiteboardServerContract(apiFetch, signal);
                    if (!requestIsCurrent()) return;
                    if (!serverContract.available) {
                        await logUi(
                            "error",
                            "Meeting Whiteboard server contract is unavailable.",
                            {
                                component: "module:jitsi-meet",
                                operation:
                                    "resolve_meeting_whiteboard_server_contract",
                                meetingId,
                                requiredCapability:
                                    serverContract.requiredCapability,
                                testedProvider: serverContract.testedProvider,
                                installedProviderVersion:
                                    serverContract.provider?.version,
                                providerIntegrity:
                                    serverContract.provider?.integrity,
                                providerPrivileged:
                                    serverContract.provider?.privileged,
                                providerTrustedSource:
                                    serverContract.provider?.trustedSource,
                            },
                        );
                        showToast(
                            i18n.t(
                                "module.jitsi_meet.whiteboard.provider_unavailable",
                            ),
                            { variant: "error" },
                        );
                        return;
                    }
                    await prepareMeetingCanvas(trigger, state, {
                        refreshReference: true,
                    });
                    if (!requestIsCurrent()) return;
                    whiteboardId = trigger.preparedWhiteboardId;
                    if (whiteboardId !== state.meeting.state?.whiteboardId)
                        automaticOpen = false;
                    if (!whiteboardId) {
                        throw new Error("whiteboard_id_missing");
                    }
                    loadStage = "unlock";
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
                    loadStage = "synchronize";
                    const response = await synchronizeWhiteboardOpen(apiFetch, {
                        meetingId,
                        whiteboardId,
                        disposable: trigger.disposableCanvas,
                        automaticOpen,
                        shareAccessToken: state.shareAccessToken,
                        signal,
                    });
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
                                responseData?.approvalRequested === true
                                    ? "module.jitsi_meet.whiteboard.request_sent"
                                    : "module.jitsi_meet.whiteboard.consensus_pending",
                            ),
                            { variant: "info" },
                        );
                        return;
                    }
                    openStateConfirmed = true;
                    confirmMeetingCanvasMapping(
                        meetingId,
                        whiteboardId,
                        trigger.whiteboardGateway,
                    );
                    state.meeting.state.whiteboardId = whiteboardId;
                    state.meeting.state.whiteboardDisposable =
                        trigger.disposableCanvas;
                    state.meeting.state.whiteboardOpen = true;
                    componentShell.hidden = false;
                    loadStage = "float";
                    const minimumSize = resolveMeetingPipMinimumSize(
                        state.meeting,
                    );
                    trigger.releaseFloatingWindow = floatMeetingWindow(
                        meetingFrame,
                        overlay,
                        makeFloatingWindow,
                        {
                            minWidth: minimumSize.width,
                            minHeight: minimumSize.height,
                            preserveBrowsingContext: true,
                            signal,
                            closeButton: {
                                className: "btn-cancel",
                                label: i18n.t(
                                    "module.jitsi_meet.whiteboard.close",
                                ),
                                onClose: () => button.click(),
                            },
                        },
                    );
                    loadStage = "mount";
                    const componentWindow = await spawnComponentWindowWithRetry(
                        trigger,
                        {
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
                    trigger.automaticOpenFailureWhiteboardId = "";
                } catch (error) {
                    if (
                        !requestIsCurrent() ||
                        (openStateConfirmed &&
                            state.meeting?.state?.whiteboardOpen !== true)
                    )
                        return;
                    if (automaticOpen && error.name === "AbortError") {
                        trigger.automaticOpenFailureWhiteboardId = whiteboardId;
                        closeComponentWindow(trigger);
                        return;
                    }
                    if (automaticOpen) {
                        trigger.automaticOpenFailureWhiteboardId = whiteboardId;
                    }
                    await handleWhiteboardLoadError(
                        trigger,
                        state,
                        error,
                        "load_meeting_whiteboard",
                        loadStage,
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
    } catch (error) {
        if (signal?.aborted || mountedWhiteboardButtons.get(root) !== trigger)
            return;
        trigger.preparationFailedMeetingId = state.meeting?.id ?? "";
        await handleWhiteboardLoadError(
            trigger,
            state,
            error,
            "prepare_meeting_whiteboard",
            "prepare",
        );
    }
    syncMeetingWhiteboardComponent({ root, state });
}
