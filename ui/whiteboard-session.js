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

function currentUserOwnsMeetingWhiteboard(state) {
    const currentUsername = String(
        state.currentProfile?.handle ?? state.currentProfile?.username ?? "",
    )
        .trim()
        .toLowerCase();
    const organizerUsername = String(state.meeting?.createdBy ?? "")
        .trim()
        .toLowerCase();
    return Boolean(
        currentUsername &&
        organizerUsername &&
        currentUsername === organizerUsername,
    );
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

export async function synchronizeWhiteboardParticipantAccess(trigger, state) {
    const whiteboardId = String(
        state.meeting?.state?.whiteboardId ??
            trigger.preparedWhiteboardId ??
            "",
    ).trim();
    if (!whiteboardId || state.shareAccessToken || trigger.disposableCanvas) {
        return null;
    }
    if (!currentUserOwnsMeetingWhiteboard(state)) return null;
    if (typeof trigger.whiteboardGateway?.expandCanvasAccess !== "function") {
        return false;
    }
    const participantHandles = getParticipantHandles(state.meeting).sort();
    const signature = `${whiteboardId}:${participantHandles.join(",")}`;
    if (trigger.participantAccessSignature === signature) return true;
    if (trigger.participantAccessAttemptSignature === signature) return null;
    if (trigger.participantAccessPromise) {
        await trigger.participantAccessPromise;
        if (trigger.participantAccessSignature === signature) return true;
    }
    trigger.participantAccessAttemptSignature = signature;
    const accessPromise = trigger.whiteboardGateway
        .expandCanvasAccess({
            whiteboardId,
            participantHandles,
        })
        .then((result) => {
            const expandedWhiteboardId = String(
                result?.whiteboardId ?? "",
            ).trim();
            const expandedParticipants = new Set(
                (Array.isArray(result?.participants) ? result.participants : [])
                    .map((participant) =>
                        String(participant ?? "")
                            .trim()
                            .toLowerCase(),
                    )
                    .filter(Boolean),
            );
            if (
                expandedWhiteboardId !== whiteboardId ||
                participantHandles.some(
                    (participant) =>
                        !expandedParticipants.has(participant.toLowerCase()),
                )
            ) {
                throw new Error(
                    "whiteboard_participant_access_invalid_response",
                );
            }
            return result;
        });
    trigger.participantAccessPromise = accessPromise;
    try {
        await accessPromise;
        trigger.participantAccessSignature = signature;
        return true;
    } finally {
        if (trigger.participantAccessPromise === accessPromise) {
            trigger.participantAccessPromise = null;
        }
    }
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
    return (
        meeting?.state?.whiteboardOpen === true &&
        meeting?.state?.screenSharingActive !== true
    );
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
    const waitBeforeRetry =
        trigger.waitForComponentWindowRetry ?? waitForProviderRetry;
    for (let attempt = 0; attempt < 6; attempt += 1) {
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
