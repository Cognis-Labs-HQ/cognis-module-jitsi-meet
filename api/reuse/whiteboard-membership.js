export async function updateMeetingWhiteboardMembership({
    operation,
    meeting,
    state,
    userAccountId,
    profileStore,
    resolveWhiteboardMembership,
}) {
    const whiteboardId = String(state?.whiteboardId ?? "").trim();
    if (!whiteboardId || state?.whiteboardDisposable === true) return;
    const ownerProfile = await profileStore.getProfileByHandle(
        meeting.createdBy,
    );
    if (!ownerProfile?.accountId) {
        throw new Error("The meeting organizer profile could not be resolved.");
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
        sendError(
            response,
            503,
            "whiteboard_membership_unavailable",
            "Whiteboard access could not be updated.",
        );
        return false;
    }
}
