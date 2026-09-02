import { rollbackMeetingChatMembership } from "./reuse/chat-membership.js";
import { requestParticipantAdditionDecision } from "./reuse/participant-approval.js";

export function registerActiveMeetingParticipantRoute({
    router,
    store,
    requireAuth,
    readJson,
    sendJson,
    sendError,
    profileStore,
    resolveRequestedParticipants,
    hasMinRole,
    resolveMeetingPayload,
    listClassroomParticipantHandles,
    createMeetingPayload,
    resolveGroupChat,
    buildMeetingChatTitle,
    groupChatMembership,
    updateWhiteboardMember,
    dispatchMeetingNotifications,
    requestParticipantAdditionApproval,
    normalizeHandleKey,
    log,
}) {
    router.post(
        "/api/v1/modules/jitsi-meet/meetings/participants/add",
        async (req, res) => {
            await store.ensureSchema();
            const claims = requireAuth(req, res, "user");
            if (!claims) return;
            const body = await readJson(req);
            const resolved = await resolveMeetingPayload({
                body,
                profileStore,
                store,
                claims,
                res,
                listClassroomParticipantHandles,
                requesterAccountId: claims.sub,
            });
            if (!resolved) return;
            if (
                !resolved.state.firstJoinedAt ||
                resolved.state.endedAt ||
                !resolved.participants.some(
                    (username) => username !== resolved.meeting.createdBy,
                )
            ) {
                sendError(
                    res,
                    409,
                    "meeting_not_extendable",
                    "Only active non-disposable meetings can receive participants.",
                );
                return;
            }
            const requestedParticipants = await resolveRequestedParticipants(
                profileStore,
                [body.username],
                { includeHidden: hasMinRole(claims.role, "admin") },
            );
            const username = requestedParticipants[0];
            if (!username) {
                sendError(
                    res,
                    400,
                    "bad_request",
                    "A valid username is required.",
                );
                return;
            }
            const reservedUsernames =
                await store.listReservedParticipantUsernames(
                    resolved.meeting.id,
                );
            if (reservedUsernames.includes(username)) {
                sendError(
                    res,
                    409,
                    "participant_unavailable",
                    "The participant is active in another meeting.",
                );
                return;
            }
            if (resolved.participants.includes(username)) {
                sendJson(res, 200, {
                    data: await createMeetingPayload({
                        store,
                        meeting: resolved.meeting,
                        state: resolved.state,
                        participants: resolved.participants,
                        requesterUsername: resolved.requesterUsername,
                        chatUrl: resolved.meeting.chatRoomId
                            ? `/messages/${encodeURIComponent(resolved.meeting.chatRoomId)}`
                            : null,
                        requiresReclaim: false,
                    }),
                });
                return;
            }
            const approval = await requestParticipantAdditionDecision({
                store,
                meetingId: resolved.meeting.id,
                requestApproval: requestParticipantAdditionApproval,
                approvalInput: {
                    meetingId: resolved.meeting.id,
                    meetingName: resolved.meeting.meetingName,
                    participantUsername: username,
                    requesterAccountId: claims.sub,
                    requesterDisplayName: resolved.requesterUsername,
                },
                normalizeHandleKey,
            });
            if (approval?.approved === false) {
                sendError(
                    res,
                    409,
                    "participant_addition_declined",
                    "Current meeting participants declined the invitation.",
                );
                return;
            }
            const participants = [...resolved.participants, username];
            let chatRoom = resolved.meeting.chatRoomId
                ? {
                      roomId: resolved.meeting.chatRoomId,
                      url: `/messages/${encodeURIComponent(resolved.meeting.chatRoomId)}`,
                  }
                : null;
            if (!chatRoom && typeof resolveGroupChat === "function") {
                chatRoom = await resolveGroupChat({
                    usernames: participants,
                    title: buildMeetingChatTitle(resolved.meeting.meetingName),
                    createdByAccountId: claims.sub,
                    allowSingleMember: true,
                }).catch((error) => {
                    log?.(
                        "error",
                        "Meeting participant chat access update failed.",
                        {
                            component: "jitsi-meet-module",
                            operation: "add_active_meeting_participant_chat",
                            meetingId: resolved.meeting.id,
                            username,
                            error:
                                error instanceof Error
                                    ? error.message
                                    : String(error),
                        },
                    );
                    return null;
                });
            }
            if (!chatRoom?.roomId) {
                sendError(
                    res,
                    503,
                    "chat_unavailable",
                    "Chat access could not be provisioned.",
                );
                return;
            }
            const participantProfile =
                await profileStore.getProfileByHandle(username);
            if (!participantProfile?.accountId) {
                sendError(
                    res,
                    404,
                    "participant_not_found",
                    "The participant profile could not be resolved.",
                );
                return;
            }
            const chatMemberAdded = await groupChatMembership
                .add({
                    roomId: chatRoom.roomId,
                    actorAccountId: claims.sub,
                    userAccountId: participantProfile.accountId,
                })
                .then(() => true)
                .catch((error) => {
                    log?.("error", "Meeting chat membership update failed.", {
                        component: "jitsi-meet-module",
                        operation: "add_active_meeting_participant_chat",
                        meetingId: resolved.meeting.id,
                        chatRoomId: chatRoom.roomId,
                        username,
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    });
                    return false;
                });
            if (!chatMemberAdded) {
                sendError(
                    res,
                    503,
                    "chat_membership_unavailable",
                    "The existing meeting chat membership could not be updated.",
                );
                return;
            }
            if (
                !(await updateWhiteboardMember({
                    operation: "add",
                    meeting: resolved.meeting,
                    state: resolved.state,
                    userAccountId: participantProfile.accountId,
                    response: res,
                    logOperation: "add_active_meeting_participant_whiteboard",
                }))
            ) {
                await rollbackMeetingChatMembership({
                    meeting: resolved.meeting,
                    roomId: chatRoom.roomId,
                    actorAccountId: claims.sub,
                    userAccountId: participantProfile.accountId,
                    username,
                    groupChatMembership,
                    log,
                });
                return;
            }
            let meeting;
            try {
                meeting = await store.addMeetingParticipant(
                    resolved.meeting.id,
                    username,
                    { chatRoomId: chatRoom.roomId },
                );
                if (!meeting) {
                    throw new Error("Meeting no longer exists.");
                }
            } catch (error) {
                await updateWhiteboardMember({
                    operation: "remove",
                    meeting: resolved.meeting,
                    state: resolved.state,
                    userAccountId: participantProfile.accountId,
                    response: null,
                    logOperation:
                        "rollback_active_meeting_participant_whiteboard",
                });
                await rollbackMeetingChatMembership({
                    meeting: resolved.meeting,
                    roomId: chatRoom.roomId,
                    actorAccountId: claims.sub,
                    userAccountId: participantProfile.accountId,
                    username,
                    groupChatMembership,
                    log,
                });
                log?.("error", "Meeting participant persistence failed.", {
                    component: "jitsi-meet-module",
                    operation: "add_active_meeting_participant",
                    meetingId: resolved.meeting.id,
                    username,
                    error:
                        error instanceof Error ? error.message : String(error),
                });
                sendError(
                    res,
                    503,
                    "meeting_update_unavailable",
                    "The meeting participant could not be added.",
                );
                return;
            }
            await dispatchMeetingNotifications([username], {
                subject: "Meeting Invitation",
                body: `${resolved.requesterUsername} invited you to an active meeting.`,
                senderName: resolved.requesterUsername,
                metadata: {
                    event: "meeting_invited",
                    meetingId: meeting.id,
                },
                meetingId: meeting.id,
                organizerUsername: meeting.createdBy,
            });
            log?.("info", "Participant added to active meeting.", {
                component: "jitsi-meet-module",
                operation: "add_active_meeting_participant",
                meetingId: meeting.id,
                username,
                requestedBy: resolved.requesterUsername,
            });
            sendJson(res, 200, {
                data: await createMeetingPayload({
                    store,
                    meeting,
                    state: resolved.state,
                    participants,
                    requesterUsername: resolved.requesterUsername,
                    chatUrl:
                        chatRoom.url ??
                        `/messages/${encodeURIComponent(chatRoom.roomId)}`,
                    requiresReclaim: false,
                }),
            });
        },
        { access: { minRole: "user" } },
    );
}
