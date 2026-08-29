const WHITEBOARD_MODULE_UUID = "5bb6105d-14d2-5d9d-a284-b2969fb4e35d";
const WHITEBOARD_ROUTE_ID = "module.nextcloud.whiteboard.canvas";

function getParticipantHandles(meeting) {
    return (meeting?.participants ?? [])
        .map((participant) =>
            String(
                participant?.username ??
                    participant?.handle ??
                    participant ??
                    "",
            ).trim(),
        )
        .filter(Boolean);
}

export function meetingHasInvitedParticipants(meeting) {
    if (typeof meeting?.hasInvitedParticipants === "boolean") {
        return meeting.hasInvitedParticipants;
    }
    const organizerHandle = String(meeting?.createdBy ?? "").trim();
    return getParticipantHandles(meeting).some(
        (handle) => !organizerHandle || handle !== organizerHandle,
    );
}

export function meetingWhiteboardShouldOpen(meeting) {
    return meeting?.state?.whiteboardOpen === true;
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

export async function ensureComponentPage(trigger, meetingId) {
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

function spawnComponentWindow(
    trigger,
    { meetingId, meetingName, whiteboardId },
) {
    return trigger.spawnComponentPage({
        componentUuid: WHITEBOARD_MODULE_UUID,
        routeId: WHITEBOARD_ROUTE_ID,
        mode: "overlay",
        elementId: trigger.frameWrap.id,
        context: {
            meetingId,
            title: meetingName,
            whiteboardId,
            instantCanvas: trigger.disposableCanvas,
            disposable: trigger.disposableCanvas,
            frameless: true,
            borderless: true,
            contentScrolling: false,
            layout: {
                borderless: true,
                fillParent: true,
                scrollOwner: "document",
            },
        },
        signal: trigger.signal,
    });
}

export async function spawnComponentWindowWithRetry(
    trigger,
    { meetingId, meetingName, whiteboardId },
) {
    let lastError;
    for (let attempt = 0; attempt < 4; attempt += 1) {
        try {
            const componentWindow = await spawnComponentWindow(trigger, {
                meetingId,
                meetingName,
                whiteboardId,
            });
            if (componentWindow) return componentWindow;
            lastError = new Error("whiteboard_component_window_unavailable");
        } catch (error) {
            lastError = error;
        }
        if (trigger.signal?.aborted) throw lastError;
        if (
            String(lastError?.message ?? lastError).includes(
                "Failed to fetch dynamically imported module",
            )
        ) {
            break;
        }
        if (attempt < 3) await waitForProviderRetry(trigger.signal, 250);
    }
    throw lastError;
}

export async function ensureWhiteboardKeyringUnlocked(trigger, state) {
    if (trigger.isKeyringUnlocked?.() === true) return true;
    if (typeof trigger.requestKeyringUnlock !== "function") return true;
    const meetingName = state.meeting?.meetingName || state.meeting?.id || "";
    return Boolean(
        await trigger.requestKeyringUnlock({
            request: {
                component: trigger.i18n.t(
                    "module.jitsi_meet.whiteboard.keyring_component",
                ),
                action: trigger.i18n.t(
                    "module.jitsi_meet.whiteboard.keyring_action",
                ),
                process: trigger.i18n
                    .t("module.jitsi_meet.whiteboard.keyring_process")
                    .replace("{{meeting}}", meetingName),
            },
        }),
    );
}

export function prepareMeetingCanvas(trigger, state) {
    if (
        trigger.preparedWhiteboardId ||
        !state.meeting?.id ||
        !state.meeting?.roomSlug
    ) {
        return Promise.resolve();
    }
    if (trigger.preparationFailedMeetingId === state.meeting.id) {
        return Promise.resolve();
    }
    if (trigger.preparationPromise) return trigger.preparationPromise;
    const meeting = state.meeting;
    const meetingId = meeting.id;
    const meetingName = meeting.meetingName;
    const participantHandles = getParticipantHandles(meeting);
    trigger.disposableCanvas = !meetingHasInvitedParticipants(meeting);
    const disposableCanvas = trigger.disposableCanvas;
    if (
        !disposableCanvas &&
        typeof trigger.whiteboardGateway.createCanvas !== "function"
    ) {
        throw new Error("whiteboard_persistent_canvas_unavailable");
    }
    const preparationPromise = (
        disposableCanvas
            ? trigger.whiteboardGateway.createDisposableCanvas({
                  resourceType: "meeting",
                  resourceId: meetingName,
                  title: meetingName,
                  participantHandles,
              })
            : trigger.whiteboardGateway.createCanvas({
                  resourceType: "meeting",
                  resourceId: meetingName,
                  title: meetingName,
                  participantHandles,
              })
    )
        .then((canvas) => {
            if (
                state.meeting?.id !== meetingId ||
                trigger.preparedMeetingId !== meetingId
            ) {
                return;
            }
            trigger.preparedWhiteboardId = String(
                canvas?.whiteboardId ?? canvas?.id ?? "",
            ).trim();
            if (!trigger.preparedWhiteboardId) {
                throw new Error("whiteboard_id_missing");
            }
            trigger.preparationFailedMeetingId = "";
            trigger.preparedMeetingId = meetingId;
        })
        .finally(() => {
            if (trigger.preparationPromise === preparationPromise) {
                trigger.preparationPromise = null;
            }
        });
    trigger.preparationPromise = preparationPromise;
    return preparationPromise;
}
