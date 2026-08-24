import { resolveRequesterUsername } from "./reuse/requester.js";

const WHITEBOARD_CAPABILITY = "nextcloud-whiteboard:spawnWhiteboardWindow";

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
    router.get(
        "/api/v1/modules/jitsi-meet/whiteboard/availability",
        (req, res) => {
            const claims = requireAuth(req, res, "user");
            if (!claims) return;
            sendJson(res, 200, {
                data: {
                    available:
                        typeof ctx.getCapability(WHITEBOARD_CAPABILITY) ===
                        "function",
                },
            });
        },
        { access: { minRole: "user" } },
    );

    router.post(
        "/api/v1/modules/jitsi-meet/whiteboard",
        async (req, res) => {
            const claims = requireAuth(req, res, "user");
            if (!claims) return;
            const spawnWhiteboard = ctx.getCapability(WHITEBOARD_CAPABILITY);
            if (typeof spawnWhiteboard !== "function") {
                sendError(
                    res,
                    404,
                    "whiteboard_unavailable",
                    "The whiteboard component is unavailable.",
                );
                return;
            }
            const body = await readJson(req);
            const meetingId = String(body.meetingId ?? "").trim();
            if (!meetingId) {
                sendError(res, 400, "bad_request", "meetingId is required.");
                return;
            }
            await store.ensureSchema();
            const meeting = await store.getMeetingById(meetingId);
            if (!meeting) {
                sendError(res, 404, "not_found", "Meeting not found.");
                return;
            }
            const requesterUsername = await resolveRequesterUsername(
                profileStore,
                claims.sub,
            ).catch((error) => {
                sendError(res, 409, "profile_required", error.message);
                return null;
            });
            if (!requesterUsername) return;
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
                return;
            }
            const participants = await store.listParticipants(meeting.id);
            try {
                const whiteboard = await spawnWhiteboard({
                    title: meeting.meetingName,
                    createdBy: requesterUsername,
                    participants,
                    externalPath: `meeting:${meeting.id}`,
                    instantCanvas: true,
                    disposable: true,
                });
                const whiteboardId = String(
                    whiteboard?.whiteboardId ?? "",
                ).trim();
                if (!whiteboardId) {
                    throw new Error("whiteboard_id_missing");
                }
                await store.updateMeetingState(meeting.id, {
                    whiteboardId,
                    whiteboardActive: true,
                });
                ctx.log?.("info", "Disposable meeting whiteboard created.", {
                    component: "jitsi-meet-module",
                    operation: "create_disposable_whiteboard",
                    meetingId: meeting.id,
                    whiteboardId: whiteboard?.whiteboardId,
                });
                sendJson(res, 201, {
                    data: {
                        whiteboardId,
                        disposable: whiteboard?.disposable === true,
                    },
                });
            } catch (error) {
                ctx.log?.("error", "Meeting whiteboard creation failed.", {
                    component: "jitsi-meet-module",
                    operation: "create_disposable_whiteboard",
                    meetingId: meeting.id,
                    error:
                        error instanceof Error ? error.message : String(error),
                });
                sendError(
                    res,
                    502,
                    "whiteboard_creation_failed",
                    "The meeting whiteboard could not be created.",
                );
            }
        },
        { access: { minRole: "user" } },
    );

    router.post(
        "/api/v1/modules/jitsi-meet/whiteboard/close",
        async (req, res) => {
            const claims = requireAuth(req, res, "user");
            if (!claims) return;
            const body = await readJson(req);
            const meetingId = String(body.meetingId ?? "").trim();
            const meeting = await store.getMeetingById(meetingId);
            if (!meeting) {
                sendError(res, 404, "not_found", "Meeting not found.");
                return;
            }
            const requesterUsername = await resolveRequesterUsername(
                profileStore,
                claims.sub,
            ).catch((error) => {
                sendError(res, 409, "profile_required", error.message);
                return null;
            });
            if (!requesterUsername) return;
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
                return;
            }
            await store.updateMeetingState(meeting.id, {
                whiteboardActive: false,
            });
            ctx.log?.("info", "Meeting whiteboard component closed.", {
                component: "jitsi-meet-module",
                operation: "close_meeting_whiteboard",
                meetingId: meeting.id,
            });
            sendJson(res, 200, { data: { closed: true } });
        },
        { access: { minRole: "user" } },
    );
}
