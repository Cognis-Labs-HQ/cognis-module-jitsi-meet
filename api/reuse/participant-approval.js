export async function requestParticipantAdditionDecision({
    store,
    meetingId,
    requestApproval,
    approvalInput,
    normalizeHandleKey,
}) {
    const presence = await store.listPresence(meetingId);
    const activeUsernames = new Set(
        store
            .filterCurrentPresenceEntries(presence)
            .map((entry) => normalizeHandleKey(entry.username))
            .filter(Boolean),
    );
    if (activeUsernames.size <= 1) {
        return { approved: true, consensusSkipped: true };
    }
    return requestApproval?.(approvalInput);
}
