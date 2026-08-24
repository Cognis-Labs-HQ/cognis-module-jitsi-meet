import { logUi, showToast } from "./reuse/feedback.js";
import { uiCtx } from "/static/reuse/ui-ctx.js";

const WHITEBOARD_MODULE_UUID = "5bb6105d-14d2-5d9d-a284-b2969fb4e35d";
const WHITEBOARD_ROUTE_ID = "module.nextcloud.whiteboard.canvas";
const WHITEBOARD_UI_GATEWAY = "whiteboard:uiGateway";
const mountedWhiteboardButtons = new WeakMap();
let componentStageSequence = 0;

function setButtonActive(button, active) {
    button?.classList.toggle("active", active);
    button?.setAttribute("aria-pressed", String(active));
}

async function ensureComponentPage(trigger, meetingId) {
    if (!trigger.componentPage) {
        trigger.componentPage = await trigger.requestComponentPage({
            componentUuid: WHITEBOARD_MODULE_UUID,
            routeId: WHITEBOARD_ROUTE_ID,
            mode: "overlay",
            context: { meetingId },
        });
    }
    if (!trigger.componentPage) {
        throw new Error("whiteboard_component_page_unavailable");
    }
    return trigger.componentPage;
}

function spawnComponentWindow(trigger, { meetingId, whiteboardId }) {
    return trigger.spawnComponentPage({
        componentUuid: WHITEBOARD_MODULE_UUID,
        routeId: WHITEBOARD_ROUTE_ID,
        mode: "overlay",
        elementId: trigger.frameWrap.id,
        context: {
            meetingId,
            whiteboardId,
            instantCanvas: true,
            disposable: true,
            frameless: true,
        },
        signal: trigger.signal,
    });
}

function closeComponentWindow(trigger) {
    if (typeof trigger?.componentWindow?.discard === "function") {
        void trigger.componentWindow.discard();
    } else if (trigger?.frameWrap?.id) {
        void trigger.discardComponentPage?.(trigger.frameWrap.id);
    }
    if (trigger) {
        trigger.componentWindow = null;
        trigger.whiteboardId = "";
        setButtonActive(trigger.button, false);
    }
}

function waitForProviderRetry(signal, delayMs) {
    return new Promise((resolve) => {
        if (signal?.aborted) {
            resolve();
            return;
        }
        const timeoutId = setTimeout(resolve, delayMs);
        signal?.addEventListener(
            "abort",
            () => {
                clearTimeout(timeoutId);
                resolve();
            },
            { once: true },
        );
    });
}

async function resolveWhiteboardCapabilities(signal) {
    const ensureProvidersLoaded = uiCtx.capabilities.get(
        "ui:ensureProvidersLoaded",
    );
    const readCapabilities = () => ({
        discardComponentPage: uiCtx.capabilities.get("component-pages:discard"),
        spawnComponentPage: uiCtx.capabilities.get("component-pages:spawn"),
        whiteboardGateway: uiCtx.capabilities.get(WHITEBOARD_UI_GATEWAY),
    });
    let capabilities = readCapabilities();
    for (let attempt = 0; attempt < 3 && !signal?.aborted; attempt += 1) {
        if (typeof ensureProvidersLoaded === "function") {
            await ensureProvidersLoaded({ force: attempt > 0 });
        }
        capabilities = readCapabilities();
        if (
            typeof capabilities.whiteboardGateway?.createDisposableCanvas ===
                "function" &&
            typeof capabilities.spawnComponentPage === "function"
        ) {
            return capabilities;
        }
        if (attempt < 2) await waitForProviderRetry(signal, 150);
    }
    return capabilities;
}

function prepareMeetingCanvas(trigger, state) {
    if (trigger.preparedWhiteboardId || !state.meeting?.id)
        return Promise.resolve();
    if (trigger.preparationFailedMeetingId === state.meeting.id) {
        return Promise.resolve();
    }
    if (trigger.preparationPromise) return trigger.preparationPromise;
    trigger.preparationPromise = trigger.whiteboardGateway
        .createDisposableCanvas({
            resourceType: "meeting",
            resourceId: state.meeting.id,
            title: state.meeting.meetingName,
            participantHandles: (state.meeting.participants ?? [])
                .map((participant) =>
                    String(
                        participant?.username ??
                            participant?.handle ??
                            participant ??
                            "",
                    ).trim(),
                )
                .filter(Boolean),
        })
        .then((canvas) => {
            trigger.preparedWhiteboardId = String(
                canvas?.whiteboardId ?? canvas?.id ?? "",
            ).trim();
            if (!trigger.preparedWhiteboardId) {
                throw new Error("whiteboard_id_missing");
            }
            trigger.preparationFailedMeetingId = "";
            trigger.preparedMeetingId = state.meeting.id;
        })
        .finally(() => {
            trigger.preparationPromise = null;
        });
    return trigger.preparationPromise;
}

export function syncWhiteboardButtonAvailability({ root, state }) {
    const trigger = mountedWhiteboardButtons.get(root);
    if (trigger?.button) {
        const meetingId = state.meeting?.id ?? "";
        if (trigger.preparedMeetingId !== meetingId) {
            trigger.preparedMeetingId = meetingId;
            trigger.preparedWhiteboardId = "";
            trigger.preparationFailedMeetingId = "";
        }
        const stateWhiteboardId = String(
            state.meeting?.state?.whiteboardId ?? "",
        ).trim();
        if (stateWhiteboardId) trigger.preparedWhiteboardId = stateWhiteboardId;
        if (
            !trigger.preparedWhiteboardId &&
            state.meeting?.id &&
            trigger.preparationFailedMeetingId !== state.meeting.id
        ) {
            void prepareMeetingCanvas(trigger, state)
                .catch((error) => {
                    trigger.preparationFailedMeetingId =
                        state.meeting?.id ?? "";
                    return logUi(
                        "error",
                        "Meeting whiteboard preparation failed.",
                        {
                            component: "module:jitsi-meet",
                            operation: "prepare_meeting_whiteboard",
                            meetingId: state.meeting?.id,
                            error:
                                error instanceof Error
                                    ? error.message
                                    : String(error),
                        },
                    );
                })
                .finally(() =>
                    syncWhiteboardButtonAvailability({ root, state }),
                );
        }
        trigger.button.disabled =
            !state.jitsiConferenceJoined ||
            !trigger.componentPage ||
            !trigger.preparedWhiteboardId;
    }
}

export function syncMeetingWhiteboardComponent({ root, state }) {
    const trigger = mountedWhiteboardButtons.get(root);
    if (!trigger?.button) return;
    if (state.meeting?.state?.whiteboardActive !== true) {
        closeComponentWindow(trigger);
    }
    syncWhiteboardButtonAvailability({ root, state });
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
    if (!(slot instanceof HTMLElement) || !(frameWrap instanceof HTMLElement))
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
        capabilities = await resolveWhiteboardCapabilities(signal);
    } catch (error) {
        await logUi("error", "Whiteboard UI providers could not load.", {
            component: "module:jitsi-meet",
            operation: "load_whiteboard_ui_providers",
            error: error instanceof Error ? error.message : String(error),
        });
        return;
    }
    if (signal?.aborted) return;
    const { discardComponentPage, spawnComponentPage, whiteboardGateway } =
        capabilities;
    if (
        typeof whiteboardGateway?.createDisposableCanvas !== "function" ||
        typeof spawnComponentPage !== "function"
    )
        return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "jitsi-whiteboard-button btn-neutral";
    button.setAttribute("aria-pressed", "false");
    button.textContent = i18n.t("module.jitsi_meet.whiteboard.open");
    button.disabled = true;
    slot.replaceChildren(button);
    const trigger = {
        apiFetch,
        button,
        componentPage: null,
        componentWindow: null,
        discardComponentPage,
        frameWrap,
        i18n,
        preparedWhiteboardId: String(
            state.meeting?.state?.whiteboardId ?? "",
        ).trim(),
        preparedMeetingId: state.meeting?.id ?? "",
        preparationPromise: null,
        preparationFailedMeetingId: "",
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
        slot,
        whiteboardId: "",
        destroy() {
            closeComponentWindow(trigger);
            button.remove();
        },
    };
    mountedWhiteboardButtons.set(root, trigger);

    button.addEventListener(
        "click",
        () => {
            if (!state.meeting?.id || !state.jitsiConferenceJoined) return;
            if (trigger.componentWindow) return;
            const whiteboardId = trigger.preparedWhiteboardId;
            if (!whiteboardId || !trigger.componentPage) return;
            button.disabled = true;
            const authorizedSpawnPromise = spawnComponentWindow(trigger, {
                meetingId: state.meeting.id,
                whiteboardId,
            });
            void (async () => {
                try {
                    const componentWindow = await authorizedSpawnPromise;
                    if (!componentWindow)
                        throw new Error(
                            "whiteboard_component_window_unavailable",
                        );
                    trigger.componentWindow = componentWindow;
                    trigger.whiteboardId = whiteboardId;
                    setButtonActive(button, true);
                    const response = await apiFetch(
                        "/api/v1/modules/jitsi-meet/whiteboard/state",
                        {
                            method: "POST",
                            headers: { "content-type": "application/json" },
                            body: JSON.stringify({
                                meetingId: state.meeting.id,
                                whiteboardId,
                                active: true,
                            }),
                        },
                    );
                    if (!response.ok)
                        throw new Error("whiteboard_state_sync_failed");
                    state.meeting.state.whiteboardId = whiteboardId;
                    state.meeting.state.whiteboardActive = true;
                } catch (error) {
                    closeComponentWindow(trigger);
                    await logUi("error", "Meeting whiteboard action failed.", {
                        component: "module:jitsi-meet",
                        operation: "toggle_meeting_whiteboard",
                        meetingId: state.meeting?.id,
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    });
                    showToast(
                        i18n.t("module.jitsi_meet.whiteboard.open_failed"),
                        {
                            variant: "error",
                        },
                    );
                } finally {
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
        await logUi("error", "Meeting whiteboard preparation failed.", {
            component: "module:jitsi-meet",
            operation: "prepare_meeting_whiteboard",
            meetingId: state.meeting?.id,
            error: error instanceof Error ? error.message : String(error),
        });
    }
    syncMeetingWhiteboardComponent({ root, state });
}
