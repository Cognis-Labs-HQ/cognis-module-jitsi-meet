export function registerPersistedMeetingRoutes({
    router,
    store,
    profileStore,
    profileIdentity,
    requireAuth,
    readJson,
    sendJson,
    sendError,
    resolveMeetingPayload,
    groupChatMembership,
    resolveWhiteboardMembership,
    resolveWhiteboardDeletion,
    fetchBoardData,
    deleteChatroom,
    deleteResourceShares,
    log,
}) {
    router.post(
        "/api/v1/modules/jitsi-meet/meetings/persisted/leave",
        async (req, res) => {
            await store.ensureSchema();
            const claims = requireAuth(req, res, "user");
            if (!claims) return;
            const resolved = await resolveMeetingPayload({
                body: await readJson(req),
                profileStore,
                store,
                claims,
                res,
            });
            if (!resolved) return;
            const activeMeetingIds = new Set(
                (await store.listActiveMeetings()).map((meeting) => meeting.id),
            );
            if (activeMeetingIds.has(resolved.meeting.id)) {
                sendError(
                    res,
                    409,
                    "meeting_active",
                    "An active meeting cannot be removed.",
                );
                return;
            }
            const ownerProfile = await profileStore.getProfileByHandle(
                resolved.meeting.createdBy,
            );
            if (!ownerProfile?.accountId) {
                sendError(
                    res,
                    503,
                    "profile_unavailable",
                    "Meeting owner unavailable.",
                );
                return;
            }
            const requesterKey = profileIdentity.normalizeHandleKey(
                resolved.requesterUsername,
            );
            const remainingParticipants = resolved.participants.filter(
                (username) =>
                    profileIdentity.normalizeHandleKey(username) !==
                    requesterKey,
            );
            try {
                if (remainingParticipants.length === 0) {
                    const whiteboardId = String(
                        resolved.state?.whiteboardId ?? "",
                    ).trim();
                    if (whiteboardId) {
                        const deletion = resolveWhiteboardDeletion?.();
                        if (typeof deletion !== "function") {
                            throw new Error(
                                "Whiteboard deletion capability is unavailable.",
                            );
                        }
                        await deletion({
                            whiteboardId,
                            actorAccountId: ownerProfile.accountId,
                        });
                    }
                    if (resolved.meeting.chatRoomId) {
                        await deleteChatroom({
                            roomId: resolved.meeting.chatRoomId,
                            actorAccountId: ownerProfile.accountId,
                        });
                    }
                    await deleteResourceShares?.({
                        ownerAccountId: ownerProfile.accountId,
                        resourceType: "meeting",
                        resourceId: resolved.meeting.id,
                    });
                    await store.deleteMeeting(resolved.meeting.id);
                } else {
                    const requesterOwnsResources =
                        claims.sub === ownerProfile.accountId;
                    if (
                        resolved.meeting.chatRoomId &&
                        !requesterOwnsResources
                    ) {
                        await groupChatMembership.remove({
                            roomId: resolved.meeting.chatRoomId,
                            actorAccountId: ownerProfile.accountId,
                            userAccountId: claims.sub,
                        });
                    }
                    const whiteboardId = String(
                        resolved.state?.whiteboardId ?? "",
                    ).trim();
                    if (
                        whiteboardId &&
                        resolved.state.whiteboardDisposable !== true &&
                        !requesterOwnsResources
                    ) {
                        const whiteboard = await fetchBoardData(whiteboardId);
                        const boardOwner =
                            await profileStore.getProfileByHandle(
                                whiteboard.createdBy,
                            );
                        if (!boardOwner?.accountId) {
                            throw new Error(
                                "Whiteboard owner profile is unavailable.",
                            );
                        }
                        await resolveWhiteboardMembership().remove({
                            whiteboardId,
                            actorAccountId: boardOwner.accountId,
                            userAccountId: claims.sub,
                        });
                    }
                    await store.removeMeetingParticipant(
                        resolved.meeting.id,
                        resolved.requesterUsername,
                    );
                }
            } catch (error) {
                log?.("error", "Persisted meeting departure failed.", {
                    component: "jitsi-meet-module",
                    operation: "leave_persisted_meeting",
                    meetingId: resolved.meeting.id,
                    accountId: claims.sub,
                    error:
                        error instanceof Error ? error.message : String(error),
                });
                sendError(
                    res,
                    503,
                    "meeting_removal_unavailable",
                    "The meeting could not be removed.",
                );
                return;
            }
            log?.("info", "User left a persisted meeting.", {
                component: "jitsi-meet-module",
                operation: "leave_persisted_meeting",
                meetingId: resolved.meeting.id,
                accountId: claims.sub,
                deleted: remainingParticipants.length === 0,
            });
            sendJson(res, 200, { data: { removed: true } });
        },
        { access: { minRole: "user" } },
    );
}
