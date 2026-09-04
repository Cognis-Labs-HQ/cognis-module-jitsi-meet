import { resolveRequesterUsername } from "./reuse/requester.js";
import { verifyMeetingWhiteboard } from "./whiteboard-verification.js";
import { synchronizeMeetingWhiteboardMembers } from "./reuse/whiteboard-membership.js";

function createMeetingStateSerializer() {
    const pendingUpdates = new Map();
    return async (meetingId, update) => {
        const previous = pendingUpdates.get(meetingId) ?? Promise.resolve();
        const current = previous.catch(() => {}).then(update);
        pendingUpdates.set(meetingId, current);
        try {
            return await current;
        } finally {
            if (pendingUpdates.get(meetingId) === current) {
                pendingUpdates.delete(meetingId);
            }
        }
    };
}

async function resolveAuthorizedMeeting({
    req,
    res,
    body,
    store,
    profileStore,
    profileIdentity,
    requireAuth,
    sendError,
    canAccessMeeting,
    resolveShareGuestMeetingAccess,
    resolveShareGuestPresenceUsername,
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
    const shareGuestAccess = await resolveShareGuestMeetingAccess({
        claims,
        meetingId: meeting.id,
        requiredCapability: "meeting:join",
    });
    if (shareGuestAccess.isGuest && !shareGuestAccess.allowed) {
        sendError(res, 403, "forbidden", "Meeting access denied.");
        return null;
    }
    const requesterUsername = shareGuestAccess.isGuest
        ? resolveShareGuestPresenceUsername(claims)
        : await resolveRequesterUsername(
              profileStore,
              profileIdentity,
              claims.sub,
          ).catch((error) => {
              sendError(res, 409, "profile_required", error.message);
              return null;
          });
    if (!requesterUsername) return null;
    const authorized =
        shareGuestAccess.isGuest ||
        (await canAccessMeeting({
            store,
            meeting,
            username: requesterUsername,
            listClassroomParticipantHandles,
            profileStore,
            requesterAccountId: claims.sub,
        }));
    if (!authorized) {
        sendError(res, 403, "forbidden", "Meeting access denied.");
        return null;
    }
    return {
        meeting,
        requesterAccountId: claims.sub,
        requesterUsername,
        shareGuest: shareGuestAccess.isGuest,
    };
}

export function registerMeetingWhiteboardRoutes({
    router,
    ctx,
    store,
    profileStore,
    profileIdentity,
    requireAuth,
    readJson,
    sendJson,
    sendError,
    canAccessMeeting,
    resolveShareGuestMeetingAccess,
    resolveShareGuestPresenceUsername,
    listClassroomParticipantHandles,
    fetchBoardData,
    isWhiteboardProviderAvailable,
    requestWhiteboardOpenApproval,
    resolveWhiteboardMembership,
}) {
    const serializeMeetingStateUpdate = createMeetingStateSerializer();
    router.get(
        "/api/v1/modules/jitsi-meet/whiteboard/availability",
        (req, res) => {
            const claims = requireAuth(req, res, "user");
            if (!claims) return;
            sendJson(res, 200, {
                data: {
                    available: isWhiteboardProviderAvailable?.() === true,
                },
            });
        },
        { access: { minRole: "user" } },
    );

    router.post(
        "/api/v1/modules/jitsi-meet/screen-sharing",
        async (req, res) => {
            const body = await readJson(req);
            const resolved = await resolveAuthorizedMeeting({
                req,
                res,
                body,
                store,
                profileStore,
                profileIdentity,
                requireAuth,
                sendError,
                canAccessMeeting,
                resolveShareGuestMeetingAccess,
                resolveShareGuestPresenceUsername,
                listClassroomParticipantHandles,
            });
            if (!resolved) return;
            if (typeof body.active !== "boolean") {
                sendError(res, 400, "bad_request", "active must be a boolean.");
                return;
            }
            const updates = {
                screenSharingActive: body.active,
                ...(body.active
                    ? {
                          whiteboardActive: false,
                          whiteboardOpenVotes: [],
                      }
                    : {}),
            };
            await store.updateMeetingState(resolved.meeting.id, updates);
            ctx.log?.("info", "Meeting screen-sharing state changed.", {
                component: "jitsi-meet-module",
                operation: "update_meeting_screen_sharing_state",
                meetingId: resolved.meeting.id,
                active: body.active,
                requestedBy: resolved.requesterUsername,
            });
            sendJson(res, 200, { data: updates });
        },
        { access: { minRole: "user" } },
    );

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
                profileIdentity,
                requireAuth,
                sendError,
                canAccessMeeting,
                resolveShareGuestMeetingAccess,
                resolveShareGuestPresenceUsername,
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
            let currentState = await store.getMeetingState(resolved.meeting.id);
            if (active && currentState.screenSharingActive) {
                sendError(
                    res,
                    409,
                    "screen_sharing_active",
                    "Whiteboard cannot open while screen sharing is active.",
                );
                return;
            }
            if (
                resolved.shareGuest &&
                (!currentState.whiteboardId ||
                    whiteboardId !== currentState.whiteboardId ||
                    whiteboardDisposable !== currentState.whiteboardDisposable)
            ) {
                sendError(
                    res,
                    403,
                    "forbidden",
                    "Share guests may only update the mapped whiteboard.",
                );
                return;
            }
            const replacesMapping =
                active &&
                (currentState.whiteboardId !== whiteboardId ||
                    currentState.whiteboardDisposable !== whiteboardDisposable);
            if (!resolved.shareGuest && replacesMapping) {
                let verified = false;
                try {
                    verified = await verifyMeetingWhiteboard({
                        fetchBoardData,
                        meeting: resolved.meeting,
                        whiteboardId,
                        expectedCreator: resolved.requesterUsername,
                    });
                } catch (error) {
                    ctx.log?.(
                        "error",
                        "Whiteboard mapping verification failed.",
                        {
                            component: "jitsi-meet-module",
                            operation: "verify_meeting_whiteboard_mapping",
                            meetingId: resolved.meeting.id,
                            whiteboardId,
                            error:
                                error instanceof Error
                                    ? error.message
                                    : String(error),
                        },
                    );
                    sendError(
                        res,
                        503,
                        "service_unavailable",
                        "Whiteboard verification is unavailable.",
                    );
                    return;
                }
                if (!verified) {
                    sendError(
                        res,
                        403,
                        "forbidden",
                        "Whiteboard does not belong to this meeting.",
                    );
                    return;
                }
            }
            if (active && whiteboardDisposable === false) {
                try {
                    const presentUsernames = store
                        .filterCurrentPresenceEntries(
                            await store.listPresence(resolved.meeting.id),
                        )
                        .map((entry) => entry.username);
                    await synchronizeMeetingWhiteboardMembers({
                        state: {
                            whiteboardId,
                            whiteboardDisposable: false,
                        },
                        usernames: [
                            ...(await store.listParticipants(
                                resolved.meeting.id,
                            )),
                            ...presentUsernames,
                        ],
                        profileStore,
                        resolveWhiteboardMembership,
                        fetchBoardData,
                    });
                } catch (error) {
                    ctx.log?.(
                        "error",
                        "Meeting Whiteboard membership synchronization failed.",
                        {
                            component: "jitsi-meet-module",
                            operation: "synchronize_meeting_whiteboard_members",
                            meetingId: resolved.meeting.id,
                            whiteboardId,
                            error:
                                error instanceof Error
                                    ? error.message
                                    : String(error),
                        },
                    );
                    sendError(
                        res,
                        503,
                        "whiteboard_membership_unavailable",
                        "Whiteboard access could not be synchronized.",
                    );
                    return;
                }
            }
            const meetingParticipantUsernames = new Set(
                await store.listParticipants(resolved.meeting.id),
            );
            for (const entry of store.filterCurrentPresenceEntries(
                await store.listPresence(resolved.meeting.id),
            )) {
                meetingParticipantUsernames.add(entry.username);
            }
            meetingParticipantUsernames.add(resolved.meeting.createdBy);
            const consensusBypassed =
                resolved.meeting.disposable === true ||
                meetingParticipantUsernames.size <= 2;
            let consensusApproved = null;
            let approvalRequested = false;
            if (
                active &&
                !consensusBypassed &&
                !resolved.shareGuest &&
                resolved.requesterUsername !== resolved.meeting.createdBy
            ) {
                const activeUsernames = new Set(
                    store
                        .filterCurrentPresenceEntries(
                            await store.listPresence(resolved.meeting.id),
                        )
                        .map((entry) => entry.username),
                );
                activeUsernames.add(resolved.requesterUsername);
                if (activeUsernames.size > 1) {
                    approvalRequested = true;
                    const approval = await requestWhiteboardOpenApproval?.({
                        meetingId: resolved.meeting.id,
                        meetingName: resolved.meeting.meetingName,
                        requesterAccountId: resolved.requesterAccountId,
                        requesterDisplayName: resolved.requesterUsername,
                    });
                    consensusApproved = approval?.approved === true;
                }
            }
            if (approvalRequested && !consensusApproved) {
                sendError(
                    res,
                    409,
                    "whiteboard_open_declined",
                    "Current meeting participants declined the Whiteboard request.",
                );
                return;
            }
            const result = await serializeMeetingStateUpdate(
                resolved.meeting.id,
                async () => {
                    currentState = await store.getMeetingState(
                        resolved.meeting.id,
                    );
                    if (active && currentState.screenSharingActive) {
                        return { screenSharingActive: true };
                    }
                    let whiteboardOpen = false;
                    let whiteboardOpenVotes = [];
                    let votesRequired = 0;
                    const mappedParticipantCanvas =
                        active &&
                        currentState.whiteboardId === whiteboardId &&
                        currentState.whiteboardDisposable === false &&
                        (currentState.whiteboardOpenVotes ?? []).length === 0 &&
                        (
                            await store.listParticipants(resolved.meeting.id)
                        ).some(
                            (username) =>
                                username !== resolved.meeting.createdBy,
                        );
                    if (
                        active &&
                        resolved.requesterUsername ===
                            resolved.meeting.createdBy
                    ) {
                        whiteboardOpen = true;
                    } else if (active && consensusBypassed) {
                        whiteboardOpen = true;
                    } else if (mappedParticipantCanvas) {
                        whiteboardOpen = true;
                    } else if (active && consensusApproved === true) {
                        whiteboardOpen = true;
                    } else if (active) {
                        const currentParticipants = Array.from(
                            new Set(
                                store
                                    .filterCurrentPresenceEntries(
                                        await store.listPresence(
                                            resolved.meeting.id,
                                        ),
                                    )
                                    .map((entry) => entry.username)
                                    .filter(
                                        (username) =>
                                            username !==
                                            resolved.meeting.createdBy,
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
                        whiteboardOpen =
                            whiteboardOpenVotes.length >= votesRequired;
                    }
                    await store.updateMeetingState(resolved.meeting.id, {
                        ...(whiteboardId ? { whiteboardId } : {}),
                        ...(whiteboardId &&
                        typeof whiteboardDisposable === "boolean"
                            ? { whiteboardDisposable }
                            : {}),
                        whiteboardActive: active && whiteboardOpen,
                        whiteboardOpenVotes:
                            active && !whiteboardOpen
                                ? whiteboardOpenVotes
                                : [],
                    });
                    return {
                        screenSharingActive: false,
                        whiteboardOpen,
                        whiteboardOpenVotes,
                        votesRequired,
                    };
                },
            );
            if (result.screenSharingActive) {
                sendError(
                    res,
                    409,
                    "screen_sharing_active",
                    "Whiteboard cannot open while screen sharing is active.",
                );
                return;
            }
            const { whiteboardOpen, whiteboardOpenVotes, votesRequired } =
                result;
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
                    ...(active && !whiteboardOpen ? { approvalRequested } : {}),
                    voteCount: whiteboardOpenVotes.length,
                    votesRequired,
                },
            });
        },
        { access: { minRole: "user" } },
    );
}
