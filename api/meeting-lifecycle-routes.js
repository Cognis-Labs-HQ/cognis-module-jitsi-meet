import { randomUUID } from "node:crypto";
import { registerMeetingChatSummaryRoute } from "./meeting-chat-summary-route.js";
import {
    restoreMeetingChatMembership,
    rollbackMeetingChatMembership,
} from "./reuse/chat-membership.js";
import { requestParticipantAdditionDecision } from "./reuse/participant-approval.js";
import { readForceNewMeeting } from "./reuse/meeting-creation.js";
import { createMeetingWhiteboardMembershipUpdater } from "./reuse/whiteboard-membership.js";
export { deleteDisposableMeeting } from "./disposable-meeting.js";
import { deleteDisposableMeeting } from "./disposable-meeting.js";
export function registerMeetingLifecycleRoutes({
    router,
    store,
    requireAuth,
    readJson,
    sendJson,
    sendError,
    profileStore,
    resolveRequesterUsername,
    resolveRequestedParticipants,
    hasMinRole,
    createMeetingPayload,
    resolveMeetingPayload,
    resolveShareGuestMeetingAccess,
    resolveShareGuestPresenceUsername,
    listClassroomParticipantHandles,
    canAccessMeeting,
    resolveGroupChat,
    groupChatMembership,
    resolveWhiteboardMembership,
    fetchBoardData,
    buildMeetingChatTitle,
    dispatchMeetingNotifications,
    resolveModeratorUsernames,
    deleteResourceShares,
    deleteChatroom,
    revokeKickedGuestShare,
    requestParticipantAdditionApproval,
    normalizeHandleKey,
    log,
}) {
    const updateWhiteboardMember = createMeetingWhiteboardMembershipUpdater({
        profileStore,
        resolveWhiteboardMembership,
        fetchBoardData,
        sendError,
        log,
    });
    router.post(
        "/api/v1/modules/jitsi-meet/meetings/create",
        async (req, res) => {
            await store.ensureSchema();
            const claims = requireAuth(req, res, "user");
            if (!claims) return;
            const body = await readJson(req);
            const forceNew = readForceNewMeeting(body, res, sendError);
            if (forceNew === null) return;
            const requesterUsername = await resolveRequesterUsername(
                profileStore,
                claims.sub,
            ).catch((error) => {
                sendError(res, 409, "profile_required", error.message);
                return null;
            });
            if (!requesterUsername) return;
            const requestedParticipants = await resolveRequestedParticipants(
                profileStore,
                body.participants,
                { includeHidden: hasMinRole(claims.role, "admin") },
            );
            const normalizedInput = store.normalizeMeetingCreationInput({
                participants: requestedParticipants,
                classroomId: body.classroomId,
                creatorUsername: requesterUsername,
            });
            if (normalizedInput.participantUsernames.length < 1) {
                sendError(
                    res,
                    400,
                    "bad_request",
                    "At least one valid meeting participant is required.",
                );
                return;
            }
            const config = await store.getConfig();
            if (!config.instanceUrl) {
                sendError(
                    res,
                    409,
                    "config_required",
                    "The Jitsi instance URL must be configured before meetings can be created.",
                );
                return;
            }
            let meeting = await store.createMeeting({
                instanceUrl: config.instanceUrl,
                usernames: normalizedInput.participantUsernames,
                classroomId: normalizedInput.classroomId,
                createdBy: requesterUsername,
                chatRoomId: null,
                scheduledAt: body.scheduledAt,
                forceNew,
            });
            const participants = await store.listParticipants(meeting.id);
            let chatRoom = null;
            if (!meeting.chatRoomId && typeof resolveGroupChat === "function") {
                chatRoom = await resolveGroupChat({
                    usernames: participants,
                    title: buildMeetingChatTitle(meeting.meetingName),
                    createdByAccountId: claims.sub,
                    allowSingleMember: true,
                }).catch((error) => {
                    log?.("error", "Jitsi meeting chat creation failed.", {
                        component: "jitsi-meet-module",
                        operation: "create_meeting_chat",
                        meetingId: meeting.id,
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    });
                    return null;
                });
                if (chatRoom?.roomId) {
                    meeting = await store.setMeetingChatRoomId(
                        meeting.id,
                        chatRoom.roomId,
                    );
                }
            }
            const state = await store.getMeetingState(meeting.id);
            const payload = await createMeetingPayload({
                store,
                meeting,
                state,
                participants,
                requesterUsername,
                chatUrl:
                    chatRoom?.url ??
                    (meeting.chatRoomId
                        ? `/messages/${encodeURIComponent(meeting.chatRoomId)}`
                        : null),
                requiresReclaim: false,
            });
            const addedParticipantUsernames = participants.filter(
                (username) => username !== requesterUsername,
            );
            await dispatchMeetingNotifications(addedParticipantUsernames, {
                subject: "Added to Meeting",
                body: `${requesterUsername} added you to a meeting.`,
                senderName: requesterUsername,
                metadata: {
                    event: "meeting_added",
                    meetingId: meeting.id,
                },
                meetingId: meeting.id,
                organizerUsername: meeting.createdBy,
            });
            sendJson(res, 200, {
                data: {
                    ...payload,
                    reused: Boolean(meeting.reused),
                },
            });
        },
        { access: { minRole: "user" } },
    );
    router.post(
        "/api/v1/modules/jitsi-meet/meetings/password/acknowledge",
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
            await store.acknowledgeMeetingPassword(
                resolved.meeting.id,
                resolved.requesterUsername,
            );
            sendJson(res, 204, {});
        },
        { access: { minRole: "user" } },
    );
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
            const meeting = await store.addMeetingParticipant(
                resolved.meeting.id,
                username,
                { chatRoomId: chatRoom.roomId },
            );
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
    router.post(
        "/api/v1/modules/jitsi-meet/meetings/participants/kicked",
        async (req, res) => {
            await store.ensureSchema();
            const claims = requireAuth(req, res, "user");
            if (!claims) return;
            const body = await readJson(req);
            const meetingId = String(body.meetingId ?? "").trim();
            if (!meetingId) {
                sendError(res, 400, "bad_request", "meetingId is required.");
                return;
            }
            const shareGuestAccess = await resolveShareGuestMeetingAccess({
                claims,
                meetingId,
                requiredCapability: "meeting:join",
            });
            if (shareGuestAccess.isGuest) {
                if (!shareGuestAccess.allowed) {
                    sendError(
                        res,
                        403,
                        "forbidden",
                        "Guest access is not valid.",
                    );
                    return;
                }
                const revoked = await revokeKickedGuestShare?.({
                    claims,
                    meetingId,
                });
                if (!revoked) {
                    sendError(
                        res,
                        503,
                        "share_unavailable",
                        "Guest link invalidation failed.",
                    );
                    return;
                }
                const guestPresenceUsername =
                    resolveShareGuestPresenceUsername(claims);
                if (guestPresenceUsername) {
                    await store.setUserSessionsInactive(
                        meetingId,
                        guestPresenceUsername,
                    );
                }
                log?.("info", "Kicked meeting guest link invalidated.", {
                    component: "jitsi-meet-module",
                    operation: "invalidate_kicked_guest_link",
                    meetingId,
                });
                sendJson(res, 200, { data: { removed: true } });
                return;
            }
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
            if (resolved.meeting.chatRoomId) {
                const chatMemberRemoved = await groupChatMembership
                    .remove({
                        roomId: resolved.meeting.chatRoomId,
                        actorAccountId: claims.sub,
                        userAccountId: claims.sub,
                    })
                    .then(() => true)
                    .catch((error) => {
                        log?.(
                            "error",
                            "Meeting chat membership removal failed.",
                            {
                                component: "jitsi-meet-module",
                                operation:
                                    "remove_kicked_meeting_participant_chat",
                                meetingId: resolved.meeting.id,
                                chatRoomId: resolved.meeting.chatRoomId,
                                username: resolved.requesterUsername,
                                error:
                                    error instanceof Error
                                        ? error.message
                                        : String(error),
                            },
                        );
                        return false;
                    });
                if (!chatMemberRemoved) {
                    sendError(
                        res,
                        503,
                        "chat_membership_unavailable",
                        "The existing meeting chat membership could not be updated.",
                    );
                    return;
                }
            }
            if (
                !(await updateWhiteboardMember({
                    operation: "remove",
                    meeting: resolved.meeting,
                    state: resolved.state,
                    userAccountId: claims.sub,
                    response: res,
                    logOperation:
                        "remove_kicked_meeting_participant_whiteboard",
                }))
            )
                return;
            await store.removeMeetingParticipant(
                resolved.meeting.id,
                resolved.requesterUsername,
            );
            await store.setUserSessionsInactive(
                resolved.meeting.id,
                resolved.requesterUsername,
            );
            log?.("info", "Kicked user removed from meeting participants.", {
                component: "jitsi-meet-module",
                operation: "remove_kicked_meeting_participant",
                meetingId: resolved.meeting.id,
                username: resolved.requesterUsername,
            });
            sendJson(res, 200, { data: { removed: true } });
        },
        { access: { minRole: "user" } },
    );
    router.post(
        "/api/v1/modules/jitsi-meet/meetings/join",
        async (req, res) => {
            await store.ensureSchema();
            const claims = requireAuth(req, res, "user");
            if (!claims) return;
            const body = await readJson(req);
            const meetingId = String(body.meetingId ?? "").trim();
            const shareGuestAccess = await resolveShareGuestMeetingAccess({
                claims,
                meetingId,
                requiredCapability: "meeting:join",
            });
            if (shareGuestAccess.isGuest) {
                if (!meetingId) {
                    sendError(
                        res,
                        400,
                        "bad_request",
                        "meetingId is required.",
                    );
                    return;
                }
                if (!shareGuestAccess.allowed) {
                    sendError(
                        res,
                        403,
                        "forbidden",
                        "Share guest access is not allowed for this meeting.",
                    );
                    return;
                }
                const meeting = await store.getMeetingById(meetingId);
                if (!meeting) {
                    sendError(res, 404, "not_found", "Meeting not found.");
                    return;
                }
                const [participants, state] = await Promise.all([
                    store.listParticipants(meeting.id),
                    store.getMeetingState(meeting.id),
                ]);
                const payload = await createMeetingPayload({
                    store,
                    meeting,
                    state,
                    participants,
                    requesterUsername: meeting.createdBy,
                    chatUrl: meeting.chatRoomId
                        ? `/messages/${encodeURIComponent(meeting.chatRoomId)}`
                        : null,
                    requiresReclaim: false,
                    meetingPassword: meeting.meetingPassword,
                });
                sendJson(res, 200, {
                    data: {
                        ...payload,
                        readOnly: true,
                    },
                });
                return;
            }
            const resolved = await resolveMeetingPayload({
                body,
                profileStore,
                store,
                claims,
                res,
                listClassroomParticipantHandles,
                profileStore,
                requesterAccountId: claims.sub,
            });
            if (!resolved) return;
            const sessionId = String(body.sessionId ?? "").trim();
            if (!sessionId) {
                sendError(res, 400, "bad_request", "sessionId is required.");
                return;
            }
            try {
                await restoreMeetingChatMembership({
                    meeting: resolved.meeting,
                    userAccountId: claims.sub,
                    groupChatMembership,
                    log,
                });
            } catch {
                sendError(
                    res,
                    503,
                    "chat_membership_unavailable",
                    "Meeting chat access could not be restored.",
                );
                return;
            }
            const conflictingSessions = await store.getActiveSessionsForUser(
                resolved.meeting.id,
                resolved.requesterUsername,
                sessionId,
            );
            const requiresReclaim =
                !resolved.state.endedAt && conflictingSessions.length > 0;
            await store.upsertPresence(
                resolved.meeting.id,
                resolved.requesterUsername,
                sessionId,
                !requiresReclaim,
            );
            let state = resolved.state;
            let meetingStarted = false;
            if (!state.firstJoinedBy || state.endedAt) {
                state = await store.updateMeetingState(resolved.meeting.id, {
                    instanceId: randomUUID(),
                    firstJoinedBy: resolved.requesterUsername,
                    firstJoinedAt: new Date().toISOString(),
                    authRequired: false,
                    authStartedBy: null,
                    authStartedAt: null,
                    authCompletedAt: null,
                    endedBy: null,
                    endedAt: null,
                    whiteboardActive: false,
                    screenSharingActive: false,
                    whiteboardOpenVotes: [],
                });
                meetingStarted = true;
            }
            const payload = await createMeetingPayload({
                store,
                meeting: resolved.meeting,
                state,
                participants: resolved.participants,
                requesterUsername: resolved.requesterUsername,
                chatUrl: resolved.meeting.chatRoomId
                    ? `/messages/${encodeURIComponent(resolved.meeting.chatRoomId)}`
                    : null,
                requiresReclaim,
                meetingPassword:
                    (await store.claimMeetingPassword(
                        resolved.meeting.id,
                        resolved.requesterUsername,
                    )) ?? "",
            });
            if (meetingStarted) {
                await dispatchMeetingNotifications(resolved.participants, {
                    subject: "Meeting Started",
                    body: `${resolved.requesterUsername} started the meeting.`,
                    senderName: resolved.requesterUsername,
                    metadata: {
                        event: "meeting_started",
                        meetingId: resolved.meeting.id,
                    },
                    meetingId: resolved.meeting.id,
                    organizerUsername: resolved.meeting.createdBy,
                });
            }
            const moderatorUsernames = await resolveModeratorUsernames(
                resolved.meeting,
                resolved.participants,
            );
            await dispatchMeetingNotifications(
                moderatorUsernames.filter(
                    (username) => username !== resolved.requesterUsername,
                ),
                {
                    subject: "Participant Joined",
                    body: `${resolved.requesterUsername} joined the meeting.`,
                    senderName:
                        state.firstJoinedBy ?? resolved.requesterUsername,
                    metadata: {
                        event: "participant_joined",
                        meetingId: resolved.meeting.id,
                        participant: resolved.requesterUsername,
                    },
                    meetingId: resolved.meeting.id,
                    organizerUsername: resolved.meeting.createdBy,
                    excludeUsernames: [resolved.requesterUsername],
                },
            );
            sendJson(res, 200, {
                data: payload,
            });
        },
        { access: { minRole: "user" } },
    );
    registerMeetingChatSummaryRoute({
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
    });
    router.post(
        "/api/v1/modules/jitsi-meet/meetings/presence",
        async (req, res) => {
            await store.ensureSchema();
            const claims = requireAuth(req, res, "user");
            if (!claims) return;
            const body = await readJson(req);
            const shareGuestAccess = await resolveShareGuestMeetingAccess({
                claims,
                meetingId: String(body.meetingId ?? "").trim(),
                requiredCapability: "meeting:join",
            });
            if (shareGuestAccess.isGuest) {
                if (!shareGuestAccess.allowed) {
                    sendError(
                        res,
                        403,
                        "forbidden",
                        "Share guest access is not allowed for this meeting.",
                    );
                    return;
                }
                const guestMeetingId = String(body.meetingId ?? "").trim();
                const guestSessionId = String(body.sessionId ?? "").trim();
                const guestPresenceUsername =
                    resolveShareGuestPresenceUsername(claims);
                if (guestMeetingId && guestSessionId && guestPresenceUsername) {
                    await store.upsertPresence(
                        guestMeetingId,
                        guestPresenceUsername,
                        guestSessionId,
                        body.active !== false,
                    );
                }
                sendJson(res, 200, {
                    data: {
                        ok: true,
                        meetingClosed: false,
                    },
                });
                return;
            }
            const resolved = await resolveMeetingPayload({
                body,
                profileStore,
                store,
                claims,
                res,
                listClassroomParticipantHandles,
                profileStore,
                requesterAccountId: claims.sub,
            });
            if (!resolved) return;
            const sessionId = String(body.sessionId ?? "").trim();
            if (!sessionId) {
                sendError(res, 400, "bad_request", "sessionId is required.");
                return;
            }
            const previousPresenceEntries = await store.listPresence(
                resolved.meeting.id,
            );
            const previousSessionPresence = previousPresenceEntries.find(
                (entry) =>
                    entry.username === resolved.requesterUsername &&
                    entry.sessionId === sessionId,
            );
            const nextPresenceActive = body.active !== false;
            const meetingTerminated = body.terminated === true;
            let disposableMeetingDeleted = false;
            await store.upsertPresence(
                resolved.meeting.id,
                resolved.requesterUsername,
                sessionId,
                nextPresenceActive,
            );
            if (previousSessionPresence?.active && !nextPresenceActive) {
                await store.setUserSessionsInactive(
                    resolved.meeting.id,
                    resolved.requesterUsername,
                );
                const moderatorUsernames = await resolveModeratorUsernames(
                    resolved.meeting,
                    resolved.participants,
                );
                await dispatchMeetingNotifications(moderatorUsernames, {
                    subject: "Participant Left",
                    body: `${resolved.requesterUsername} left the meeting.`,
                    senderName:
                        resolved.state.firstJoinedBy ??
                        resolved.meeting.createdBy ??
                        resolved.requesterUsername,
                    metadata: {
                        event: "participant_left",
                        meetingId: resolved.meeting.id,
                        participant: resolved.requesterUsername,
                    },
                    meetingId: resolved.meeting.id,
                    organizerUsername: resolved.meeting.createdBy,
                    excludeUsernames: [resolved.requesterUsername],
                });
                const updatedPresenceEntries = await store.listPresence(
                    resolved.meeting.id,
                );
                const activeParticipantUsernames = new Set(
                    store
                        .filterCurrentPresenceEntries(updatedPresenceEntries)
                        .map((entry) => entry.username),
                );
                const shouldCloseMeeting =
                    meetingTerminated || activeParticipantUsernames.size === 0;
                if (shouldCloseMeeting && !resolved.state.endedAt) {
                    await store.updateMeetingState(resolved.meeting.id, {
                        authRequired: false,
                        authStartedBy: null,
                        authStartedAt: null,
                        authCompletedAt: null,
                        firstJoinedBy: null,
                        firstJoinedAt: null,
                        endedBy: resolved.requesterUsername,
                        endedAt: new Date().toISOString(),
                        whiteboardActive: false,
                        screenSharingActive: false,
                        whiteboardOpenVotes: [],
                    });
                    await dispatchMeetingNotifications(resolved.participants, {
                        subject: "Meeting Ended",
                        body: meetingTerminated
                            ? "The Jitsi conference was terminated."
                            : `${resolved.requesterUsername} ended the meeting.`,
                        senderName:
                            resolved.state.firstJoinedBy ??
                            resolved.meeting.createdBy ??
                            resolved.requesterUsername,
                        metadata: {
                            event: "meeting_ended",
                            meetingId: resolved.meeting.id,
                        },
                        meetingId: resolved.meeting.id,
                        organizerUsername: resolved.meeting.createdBy,
                    });
                    const participantlessMeeting = resolved.participants.every(
                        (username) => username === resolved.meeting.createdBy,
                    );
                    if (participantlessMeeting) {
                        await deleteDisposableMeeting({
                            meeting: resolved.meeting,
                            ownerAccountId: claims.sub,
                            store,
                            deleteResourceShares,
                            deleteChatroom,
                            log,
                        });
                        disposableMeetingDeleted = true;
                    }
                }
            }
            sendJson(res, 200, {
                data: {
                    ok: true,
                    meetingClosed:
                        disposableMeetingDeleted ||
                        (previousSessionPresence?.active && !nextPresenceActive
                            ? (await store.getMeetingState(resolved.meeting.id))
                                  .endedAt !== null
                            : false),
                },
            });
        },
        { access: { minRole: "user" } },
    );
}
