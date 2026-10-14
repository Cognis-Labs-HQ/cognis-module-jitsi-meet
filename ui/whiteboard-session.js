import { waitForRetry } from "./reuse/abortable-delay.js";
const uncommittedMeetingCanvases = new WeakMap();

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

const PIP_BASE_MINIMUM_SIZE = Object.freeze({ width: 400, height: 225 });

export function resolveMeetingPipMinimumSize(meeting) {
    const activeParticipantCount = new Set(
        (meeting?.activeParticipants ?? [])
            .map((participant) =>
                String(participant?.username ?? participant ?? "")
                    .trim()
                    .toLowerCase(),
            )
            .filter(Boolean),
    ).size;
    const scale = activeParticipantCount >= 3 ? 1.25 : 1;
    return {
        width: Math.ceil(PIP_BASE_MINIMUM_SIZE.width * scale),
        height: Math.ceil(PIP_BASE_MINIMUM_SIZE.height * scale),
    };
}

export function meetingWhiteboardShouldOpen(meeting) {
    return (
        meeting?.state?.whiteboardOpen === true &&
        meeting?.state?.screenSharingActive !== true
    );
}

export async function ensureComponentPage(trigger) {
    if (!trigger.componentPage) {
        trigger.componentPage =
            await trigger.whiteboardGateway.requestCanvasPage({
                signal: trigger.signal,
            });
    }
    if (!trigger.componentPage)
        throw new Error("whiteboard_component_page_unavailable");
    return trigger.componentPage;
}

export async function spawnComponentWindowWithRetry(trigger, { whiteboardId }) {
    let lastError;
    const waitBeforeRetry = trigger.waitForComponentWindowRetry ?? waitForRetry;
    for (let attempt = 0; attempt < 6; attempt += 1) {
        trigger.signal?.throwIfAborted();
        try {
            const componentWindow = await trigger.whiteboardGateway.openCanvas({
                whiteboardId,
                elementId: trigger.componentHost.id,
                signal: trigger.signal,
            });
            if (componentWindow) return componentWindow;
            lastError = new Error("whiteboard_component_window_unavailable");
        } catch (error) {
            lastError = error;
        }
        if (trigger.signal?.aborted) throw lastError;
        if (attempt < 5) {
            await waitBeforeRetry(
                trigger.signal,
                Math.min(250 * 2 ** attempt, 2_000),
            );
        }
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

export function meetingCanvasNeedsPreparation(trigger, state) {
    return Boolean(
        !state.shareAccessToken &&
        !trigger.preparedWhiteboardId &&
        state.meeting?.id &&
        trigger.preparationFailedMeetingId !== state.meeting.id,
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
    const mappedWhiteboardId = String(meeting.state?.whiteboardId ?? "").trim();
    if (
        state.shareAccessToken &&
        mappedWhiteboardId &&
        typeof meeting.state?.whiteboardDisposable === "boolean"
    ) {
        trigger.disposableCanvas = meeting.state.whiteboardDisposable;
        trigger.preparedWhiteboardId = mappedWhiteboardId;
        trigger.preparedMeetingId = meetingId;
        trigger.preparationFailedMeetingId = "";
        return Promise.resolve();
    }
    if (state.shareAccessToken) {
        return Promise.resolve();
    }
    const participantHandles = getParticipantHandles(meeting);
    trigger.disposableCanvas = meeting.disposable === true;
    const disposableCanvas = trigger.disposableCanvas;
    const applyPreparedCanvas = (whiteboardId) => {
        if (
            trigger.signal?.aborted ||
            state.meeting?.id !== meetingId ||
            trigger.preparedMeetingId !== meetingId
        )
            return;
        trigger.preparedWhiteboardId = whiteboardId;
        trigger.preparationFailedMeetingId = "";
    };
    let providerCanvases = uncommittedMeetingCanvases.get(
        trigger.whiteboardGateway,
    );
    if (!providerCanvases) {
        providerCanvases = new Map();
        uncommittedMeetingCanvases.set(
            trigger.whiteboardGateway,
            providerCanvases,
        );
    }
    let cachedCanvas = providerCanvases.get(meetingId);
    if (cachedCanvas?.disposable !== disposableCanvas) {
        if (
            !disposableCanvas &&
            typeof trigger.whiteboardGateway.createCanvas !== "function"
        ) {
            throw new Error("whiteboard_persistent_canvas_unavailable");
        }
        cachedCanvas = {
            disposable: disposableCanvas,
        };
        providerCanvases.set(meetingId, cachedCanvas);
        cachedCanvas.promise = Promise.resolve()
            .then(() => {
                trigger.signal?.throwIfAborted();
                const createCanvas = disposableCanvas
                    ? trigger.whiteboardGateway.createDisposableCanvas
                    : trigger.whiteboardGateway.createCanvas;
                return createCanvas.call(trigger.whiteboardGateway, {
                    resourceType: "meeting",
                    resourceId: meetingName,
                    title: meetingName,
                    participantHandles,
                });
            })
            .then((canvas) => {
                const whiteboardId = String(
                    canvas?.whiteboardId ?? canvas?.id ?? "",
                ).trim();
                if (!whiteboardId) throw new Error("whiteboard_id_missing");
                cachedCanvas.whiteboardId = whiteboardId;
                return whiteboardId;
            })
            .catch((error) => {
                if (providerCanvases.get(meetingId) === cachedCanvas)
                    providerCanvases.delete(meetingId);
                throw error;
            });
    }
    const preparationPromise = cachedCanvas.promise
        .then(applyPreparedCanvas)
        .finally(() => {
            if (trigger.preparationPromise === preparationPromise)
                trigger.preparationPromise = null;
        });
    trigger.preparationPromise = preparationPromise;
    return preparationPromise;
}

export function confirmMeetingCanvasMapping(
    meetingId,
    whiteboardId,
    whiteboardGateway,
) {
    const providerCanvases = uncommittedMeetingCanvases.get(whiteboardGateway);
    if (providerCanvases?.get(meetingId)?.whiteboardId === whiteboardId) {
        providerCanvases.delete(meetingId);
    }
}
