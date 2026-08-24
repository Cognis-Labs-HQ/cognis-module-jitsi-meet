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
            const active = body.active === true;
            const whiteboardId = String(body.whiteboardId ?? "").trim();
            if (active && !whiteboardId) {
                sendError(
                    res,
                    400,
                    "bad_request",
                    "whiteboardId is required when activating a whiteboard.",
                );
                return;
            }
            await store.updateMeetingState(resolved.meeting.id, {
                ...(whiteboardId ? { whiteboardId } : {}),
                whiteboardActive: active,
            });
            ctx.log?.("info", "Meeting whiteboard state changed.", {
                component: "jitsi-meet-module",
                operation: "update_meeting_whiteboard_state",
                meetingId: resolved.meeting.id,
                whiteboardId: whiteboardId || undefined,
                active,
                requesterUsername: resolved.requesterUsername,
            });
            sendJson(res, 200, {
                data: {
                    whiteboardId: whiteboardId || null,
                    active,
                },
            });
        },
        { access: { minRole: "user" } },
    );
}
