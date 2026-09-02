export async function updateMeetingWhiteboardMembership({
    operation,
    state,
    userAccountId,
    profileStore,
    resolveWhiteboardMembership,
    fetchBoardData,
}) {
    const whiteboardId = String(state?.whiteboardId ?? "").trim();
    if (!whiteboardId || state?.whiteboardDisposable === true) return;
    if (typeof fetchBoardData !== "function") {
        throw new Error("Whiteboard owner resolution is unavailable.");
    }
    const whiteboard = await fetchBoardData(whiteboardId);
    if (String(whiteboard?.id ?? "").trim() !== whiteboardId) {
        throw new Error("The Whiteboard mapping could not be verified.");
    }
    const ownerHandle = String(whiteboard?.createdBy ?? "").trim();
    if (!ownerHandle) {
        throw new Error("The Whiteboard owner could not be resolved.");
    }
    const ownerProfile = await profileStore.getProfileByHandle(ownerHandle);
    if (!ownerProfile?.accountId) {
        throw new Error("The Whiteboard owner profile could not be resolved.");
    }
    const membership = resolveWhiteboardMembership?.();
    if (typeof membership?.[operation] !== "function") {
        throw new Error("Whiteboard membership capability is unavailable.");
    }
    await membership[operation]({
        whiteboardId,
        actorAccountId: ownerProfile.accountId,
        userAccountId,
    });
}

export async function requireMeetingWhiteboardMembershipUpdate({
    response,
    sendError,
    log,
    logOperation,
    ...input
}) {
    try {
        await updateMeetingWhiteboardMembership(input);
        return true;
    } catch (error) {
        log?.("error", "Meeting Whiteboard membership update failed.", {
            component: "jitsi-meet-module",
            operation: logOperation,
            meetingId: input.meeting.id,
            whiteboardId: input.state?.whiteboardId,
            userAccountId: input.userAccountId,
            error: error instanceof Error ? error.message : String(error),
        });
        if (response) {
            sendError(
                response,
                503,
                "whiteboard_membership_unavailable",
                "Whiteboard access could not be updated.",
            );
        }
        return false;
    }
}

export function createMeetingWhiteboardMembershipUpdater(dependencies) {
    return (input) =>
        requireMeetingWhiteboardMembershipUpdate({
            ...input,
            ...dependencies,
        });
}

export async function synchronizeMeetingWhiteboardMembers({
    state,
    usernames,
    profileStore,
    resolveWhiteboardMembership,
    fetchBoardData,
}) {
    for (const username of new Set(usernames)) {
        const profile = await profileStore.getProfileByHandle(username);
        if (!profile?.accountId) continue;
        await updateMeetingWhiteboardMembership({
            operation: "add",
            state,
            userAccountId: profile.accountId,
            profileStore,
            resolveWhiteboardMembership,
            fetchBoardData,
        });
    }
}
