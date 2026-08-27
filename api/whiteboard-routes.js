import { resolveRequesterUsername } from "./reuse/requester.js";

async function resolveAuthorizedMeeting({
    req,
    res,
    body,
    store,
    profileStore,
    requireAuth,
    sendError,
    canAccessMeeting,
    listClassroomParticipantHandles,
}) {
    const claims = requireAuth(req, res, "user");
    if (!claims) return null;
    const meetingId = String(body.meetingId ?? "").trim();
    if (!meetingId) {
        sendError(res, 400, "bad_request", "meetingId is required.");
        return null;
    }
    await store.ensureSchema();
    const meeting = await store.getMeetingById(meetingId);
    if (!meeting) {
        sendError(res, 404, "not_found", "Meeting not found.");
        return null;
    }
    const requesterUsername = await resolveRequesterUsername(
        profileStore,
        claims.sub,
    ).catch((error) => {
        sendError(res, 409, "profile_required", error.message);
        return null;
    });
    if (!requesterUsername) return null;
    const authorized = await canAccessMeeting({
        store,
        meeting,
        username: requesterUsername,
        listClassroomParticipantHandles,
        profileStore,
        requesterAccountId: claims.sub,
    });
    if (!authorized) {
        sendError(res, 403, "forbidden", "Meeting access denied.");
        return null;
    }
    return { meeting, requesterUsername };
}

export function registerMeetingWhiteboardRoutes({
    router,
    ctx,
    store,
    profileStore,
    requireAuth,
    readJson,
    sendJson,
    sendError,
    canAccessMeeting,
    listClassroomParticipantHandles,
}) {
    router.post(
        "/api/v1/modules/jitsi-meet/whiteboard/state",
        async (req, res) => {
            const body = await readJson(req);
            const resolved = await resolveAuthorizedMeeting({
                req,
                res,
                body,
                store,
                profileStore,
                requireAuth,
                sendError,
                canAccessMeeting,
                listClassroomParticipantHandles,
            });
            if (!resolved) return;
            if (typeof body.active !== "boolean") {
                sendError(res, 400, "bad_request", "active must be a boolean.");
                return;
            }
            const active = body.active;
            const whiteboardId = String(body.whiteboardId ?? "").trim();
            const whiteboardDisposable = body.disposable;
            if (active && !whiteboardId) {
                sendError(
                    res,
                    400,
                    "bad_request",
                    "whiteboardId is required when activating a whiteboard.",
                );
                return;
            }
            if (active && typeof whiteboardDisposable !== "boolean") {
                sendError(
                    res,
                    400,
                    "bad_request",
                    "disposable is required when activating a whiteboard.",
                );
                return;
            }
            const currentState = await store.getMeetingState(
                resolved.meeting.id,
            );
            let whiteboardOpen = false;
            let whiteboardOpenVotes = [];
            let votesRequired = 0;
            const mappedParticipantCanvas =
                active &&
                currentState.whiteboardId === whiteboardId &&
                currentState.whiteboardDisposable === false &&
                (currentState.whiteboardOpenVotes ?? []).length === 0 &&
                (await store.listParticipants(resolved.meeting.id)).some(
                    (username) => username !== resolved.meeting.createdBy,
                );
            if (
                active &&
                resolved.requesterUsername === resolved.meeting.createdBy
            ) {
                whiteboardOpen = true;
            } else if (mappedParticipantCanvas) {
                whiteboardOpen = true;
            } else if (active) {
                const currentParticipants = Array.from(
                    new Set(
                        store
                            .filterCurrentPresenceEntries(
                                await store.listPresence(resolved.meeting.id),
                            )
                            .map((entry) => entry.username)
                            .filter(
                                (username) =>
                                    username !== resolved.meeting.createdBy,
                            ),
                    ),
                );
                const eligibleVoters = new Set(currentParticipants);
                eligibleVoters.add(resolved.requesterUsername);
                whiteboardOpenVotes = Array.from(
                    new Set([
                        ...(currentState.whiteboardOpenVotes ?? []),
                        resolved.requesterUsername,
                    ]),
                ).filter((username) => eligibleVoters.has(username));
                votesRequired = Math.floor(eligibleVoters.size / 2) + 1;
                whiteboardOpen = whiteboardOpenVotes.length >= votesRequired;
            }
            await store.updateMeetingState(resolved.meeting.id, {
                ...(whiteboardId ? { whiteboardId } : {}),
                ...(whiteboardId && typeof whiteboardDisposable === "boolean"
                    ? { whiteboardDisposable }
                    : {}),
                whiteboardActive: active && whiteboardOpen,
                whiteboardOpenVotes:
                    active && !whiteboardOpen ? whiteboardOpenVotes : [],
            });
            ctx.log?.("info", "Meeting whiteboard state changed.", {
                component: "jitsi-meet-module",
                operation: "update_meeting_whiteboard_state",
                meetingId: resolved.meeting.id,
                whiteboardId: whiteboardId || undefined,
                active: active && whiteboardOpen,
                requesterUsername: resolved.requesterUsername,
            });
            sendJson(res, 200, {
                data: {
                    whiteboardId: whiteboardId || null,
                    whiteboardDisposable:
                        typeof whiteboardDisposable === "boolean"
                            ? whiteboardDisposable
                            : currentState.whiteboardDisposable,
                    whiteboardOpen: active && whiteboardOpen,
                    pendingConsensus: active && !whiteboardOpen,
                    voteCount: whiteboardOpenVotes.length,
                    votesRequired,
                },
            });
        },
        { access: { minRole: "user" } },
    );
}
