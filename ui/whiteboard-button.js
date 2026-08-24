import { logUi, showToast } from "./reuse/feedback.js";
import { uiCtx } from "/static/reuse/ui-ctx.js";

const WHITEBOARD_MODULE_UUID = "5bb6105d-14d2-5d9d-a284-b2969fb4e35d";
const WHITEBOARD_ROUTE_ID = "module.nextcloud.whiteboard.canvas";
const mountedWhiteboardButtons = new WeakMap();

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

async function openComponentWindow(trigger, { meetingId, whiteboardId }) {
    if (
        trigger.whiteboardId === whiteboardId &&
        trigger.componentWindow?.isConnected
    ) {
        return;
    }
    closeComponentWindow(trigger);
    await ensureComponentPage(trigger, meetingId);
    const componentController = new AbortController();
    trigger.componentController = componentController;
    const componentWindow = document.createElement("section");
    componentWindow.className = "jitsi-component-window";
    componentWindow.setAttribute("role", "region");
    componentWindow.setAttribute(
        "aria-label",
        trigger.i18n.t("module.jitsi_meet.whiteboard.open"),
    );
    const target = document.createElement("div");
    target.className = "jitsi-component-window-target";
    componentWindow.append(target);
    trigger.frameWrap.append(componentWindow);
    trigger.frameWrap.classList.add("jitsi-component-window-active");
    trigger.componentWindow = componentWindow;
    trigger.whiteboardId = whiteboardId;
    setButtonActive(trigger.button, true);
    try {
        const pageModule = await trigger.componentPage.load({
            signal: componentController.signal,
        });
        await pageModule?.mount?.(target, {
            signal: componentController.signal,
            focusState: {
                meetingId,
                whiteboardId,
                instantCanvas: true,
                disposable: true,
            },
        });
    } catch (error) {
        closeComponentWindow(trigger);
        throw error;
    }
}

function closeComponentWindow(trigger) {
    trigger?.componentController?.abort();
    trigger?.componentWindow?.remove();
    trigger?.frameWrap?.classList.remove("jitsi-component-window-active");
    if (trigger) {
        trigger.componentController = null;
        trigger.componentWindow = null;
        trigger.whiteboardId = "";
        setButtonActive(trigger.button, false);
    }
}

export function syncWhiteboardButtonAvailability({ root, state }) {
    const trigger = mountedWhiteboardButtons.get(root);
    if (trigger?.button) {
        trigger.button.disabled = !state.jitsiConferenceJoined;
    }
}

export async function syncMeetingWhiteboardComponent({ root, state }) {
    const trigger = mountedWhiteboardButtons.get(root);
    if (!trigger?.button) return;
    const whiteboardId = String(
        state.meeting?.state?.whiteboardId ?? "",
    ).trim();
    if (
        state.meeting?.state?.whiteboardActive === true &&
        whiteboardId &&
        state.jitsiConferenceJoined
    ) {
        try {
            await openComponentWindow(trigger, {
                meetingId: state.meeting.id,
                whiteboardId,
            });
        } catch (error) {
            await logUi("error", "Meeting whiteboard could not mount.", {
                component: "module:jitsi-meet",
                operation: "mount_meeting_whiteboard",
                meetingId: state.meeting?.id,
                whiteboardId,
                error: error instanceof Error ? error.message : String(error),
            });
            showToast(
                trigger.i18n.t("module.jitsi_meet.whiteboard.open_failed"),
                { variant: "error" },
            );
        }
        return;
    }
    closeComponentWindow(trigger);
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
    const pending = { slot, button: null, destroy() {} };
    mountedWhiteboardButtons.set(root, pending);
    const clearPending = () => {
        if (mountedWhiteboardButtons.get(root) === pending) {
            mountedWhiteboardButtons.delete(root);
        }
    };
    let availabilityResponse;
    try {
        availabilityResponse = await apiFetch(
            "/api/v1/modules/jitsi-meet/whiteboard/availability",
            { signal },
        );
    } catch (error) {
        if (!signal?.aborted) {
            await logUi("error", "Whiteboard availability check failed.", {
                component: "module:jitsi-meet",
                operation: "check_whiteboard_availability",
                error: error instanceof Error ? error.message : String(error),
            });
        }
        clearPending();
        return;
    }
    if (!availabilityResponse.ok || signal?.aborted) {
        clearPending();
        return;
    }
    const availability = await availabilityResponse.json().catch((error) => {
        void logUi("error", "Whiteboard availability response failed.", {
            component: "module:jitsi-meet",
            operation: "parse_whiteboard_availability",
            error: error instanceof Error ? error.message : String(error),
        });
        return null;
    });
    if (availability?.data?.available !== true) {
        clearPending();
        return;
    }
    if (mountedWhiteboardButtons.get(root) !== pending || signal?.aborted) {
        return;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "jitsi-whiteboard-button btn-neutral";
    button.setAttribute("aria-pressed", "false");
    button.textContent = i18n.t("module.jitsi_meet.whiteboard.open");
    button.disabled = !state.jitsiConferenceJoined;
    slot.replaceChildren(button);
    const trigger = {
        apiFetch,
        button,
        componentController: null,
        componentPage: null,
        componentWindow: null,
        frameWrap,
        i18n,
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
        async () => {
            if (!state.meeting?.id || !state.jitsiConferenceJoined) return;
            button.disabled = true;
            try {
                if (trigger.componentWindow) {
                    const response = await apiFetch(
                        "/api/v1/modules/jitsi-meet/whiteboard/close",
                        {
                            method: "POST",
                            headers: { "content-type": "application/json" },
                            body: JSON.stringify({
                                meetingId: state.meeting.id,
                            }),
                        },
                    );
                    if (!response.ok)
                        throw new Error("whiteboard_close_failed");
                    state.meeting.state.whiteboardActive = false;
                    closeComponentWindow(trigger);
                    return;
                }
                await ensureComponentPage(trigger, state.meeting.id);
                const response = await apiFetch(
                    "/api/v1/modules/jitsi-meet/whiteboard",
                    {
                        method: "POST",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({ meetingId: state.meeting.id }),
                    },
                );
                if (!response.ok) throw new Error("whiteboard_create_failed");
                const payload = await response.json();
                const whiteboardId = String(
                    payload?.data?.whiteboardId ?? "",
                ).trim();
                if (!whiteboardId) throw new Error("whiteboard_id_missing");
                state.meeting.state.whiteboardId = whiteboardId;
                state.meeting.state.whiteboardActive = true;
                await openComponentWindow(trigger, {
                    meetingId: state.meeting.id,
                    whiteboardId,
                });
            } catch (error) {
                await logUi("error", "Meeting whiteboard action failed.", {
                    component: "module:jitsi-meet",
                    operation: "toggle_meeting_whiteboard",
                    meetingId: state.meeting?.id,
                    error:
                        error instanceof Error ? error.message : String(error),
                });
                showToast(i18n.t("module.jitsi_meet.whiteboard.open_failed"), {
                    variant: "error",
                });
            } finally {
                button.disabled = !state.jitsiConferenceJoined;
            }
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
    await syncMeetingWhiteboardComponent({ root, state });
}
