export function registerMeetingChatSummaryRoute({
    router,
    store,
    requireAuth,
    readJson,
    sendJson,
    sendError,
    profileStore,
    resolveRequesterUsername,
    canAccessMeeting,
    listClassroomParticipantHandles,
}) {
    router.post(
        "/api/v1/modules/jitsi-meet/meetings/chat-room-summary",
        async (req, res) => {
            await store.ensureSchema();
            const claims = requireAuth(req, res, "user");
            if (!claims) return;
            const body = await readJson(req);
            const chatRoomId = String(body.chatRoomId ?? "").trim();
            if (!chatRoomId) {
                sendError(res, 400, "bad_request", "chatRoomId is required.");
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
            const meeting = await store.getMeetingByChatRoomId(chatRoomId);
            if (!meeting) {
                sendError(res, 404, "not_found", "Meeting not found.");
                return;
            }
            const authorized = await canAccessMeeting({
                store,
                meeting,
                username: requesterUsername,
                listClassroomParticipantHandles,
                profileStore,
                requesterAccountId: claims.sub,
            });
            if (!authorized) {
                sendError(
                    res,
                    403,
                    "forbidden",
                    "You are not listed as an allowed meeting participant.",
                );
                return;
            }
            const [participants, presence] = await Promise.all([
                store.listParticipants(meeting.id),
                store.listPresence(meeting.id),
            ]);
            const activeUsernames = Array.from(
                new Set(
                    store
                        .filterCurrentPresenceEntries(presence)
                        .map((entry) => entry.username),
                ),
            ).sort();
            const activeParticipants = await Promise.all(
                activeUsernames.map(async (username) => {
                    const profile =
                        await profileStore.getProfileByHandle(username);
                    return {
                        username,
                        handle: profile?.handle ?? username,
                        displayName:
                            profile?.displayName ?? profile?.handle ?? username,
                        avatarKey: profile?.avatarKey ?? null,
                    };
                }),
            );
            sendJson(res, 200, {
                data: {
                    meetingId: meeting.id,
                    meetingName: meeting.meetingName,
                    chatRoomId,
                    createdAt: meeting.createdAt,
                    participantCount: participants.length,
                    presentCount: activeParticipants.length,
                    activeParticipants,
                },
            });
        },
        { access: { minRole: "user" } },
    );
}
