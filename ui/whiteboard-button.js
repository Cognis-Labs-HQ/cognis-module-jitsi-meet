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
            mode: "fullscreen",
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
        mode: "fullscreen",
        elementId: trigger.frameWrap.id,
        context: {
            meetingId,
            whiteboardId,
            instantCanvas: true,
            disposable: true,
        },
        signal: trigger.signal,
    });
}

function closeComponentWindow(trigger) {
    void trigger?.componentWindow?.discard?.();
    if (trigger) {
        trigger.componentWindow = null;
        trigger.whiteboardId = "";
        setButtonActive(trigger.button, false);
    }
}

export function syncWhiteboardButtonAvailability({ root, state }) {
    const trigger = mountedWhiteboardButtons.get(root);
    if (trigger?.button) {
        const stateWhiteboardId = String(
            state.meeting?.state?.whiteboardId ?? "",
        ).trim();
        if (stateWhiteboardId) trigger.preparedWhiteboardId = stateWhiteboardId;
        trigger.button.disabled =
            !state.jitsiConferenceJoined ||
            !trigger.componentPage ||
            !trigger.preparedWhiteboardId;
    }
}

export function syncMeetingWhiteboardComponent({ root, state }) {
    const trigger = mountedWhiteboardButtons.get(root);
    if (!trigger?.button) return;
    const whiteboardId = String(
        state.meeting?.state?.whiteboardId ?? "",
    ).trim();
    if (whiteboardId) trigger.preparedWhiteboardId = whiteboardId;
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
    if (!frameWrap.id) {
        componentStageSequence += 1;
        frameWrap.id = `jitsi-whiteboard-stage-${componentStageSequence}`;
    }
    const mounted = mountedWhiteboardButtons.get(root);
    if (mounted?.slot === slot) {
        syncWhiteboardButtonAvailability({ root, state });
        return;
    }
    mounted?.destroy();
    mountedWhiteboardButtons.delete(root);
    if (signal?.aborted) return;
    const whiteboardGateway = uiCtx.capabilities.get(WHITEBOARD_UI_GATEWAY);
    const spawnComponentPage = uiCtx.capabilities.get("component-pages:spawn");
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
        frameWrap,
        i18n,
        preparedWhiteboardId: String(
            state.meeting?.state?.whiteboardId ?? "",
        ).trim(),
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
            const whiteboardId = trigger.preparedWhiteboardId;
            if (!whiteboardId || !trigger.componentPage) return;
            button.disabled = true;
            const openingComponentWindow = !trigger.componentWindow;
            const authorizedSpawnPromise = openingComponentWindow
                ? spawnComponentWindow(trigger, {
                      meetingId: state.meeting.id,
                      whiteboardId,
                  })
                : null;
            void (async () => {
                try {
                    if (trigger.componentWindow) {
                        const response = await apiFetch(
                            "/api/v1/modules/jitsi-meet/whiteboard/state",
                            {
                                method: "POST",
                                headers: { "content-type": "application/json" },
                                body: JSON.stringify({
                                    meetingId: state.meeting.id,
                                    active: false,
                                }),
                            },
                        );
                        if (!response.ok)
                            throw new Error("whiteboard_close_failed");
                        state.meeting.state.whiteboardActive = false;
                        closeComponentWindow(trigger);
                        return;
                    }
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
                    if (openingComponentWindow) closeComponentWindow(trigger);
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
        if (!trigger.preparedWhiteboardId && state.meeting?.id) {
            const canvas =
                await trigger.whiteboardGateway.createDisposableCanvas({
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
                });
            trigger.preparedWhiteboardId = String(
                canvas?.whiteboardId ?? canvas?.id ?? "",
            ).trim();
        }
    } catch (error) {
        await logUi("error", "Meeting whiteboard preparation failed.", {
            component: "module:jitsi-meet",
            operation: "prepare_meeting_whiteboard",
            meetingId: state.meeting?.id,
            error: error instanceof Error ? error.message : String(error),
        });
    }
    syncMeetingWhiteboardComponent({ root, state });
}
