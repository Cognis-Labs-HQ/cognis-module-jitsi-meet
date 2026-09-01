export async function requestParticipantAdditionDecision({
    store,
    meetingId,
    requestApproval,
    approvalInput,
}) {
    const presence = await store.listPresence(meetingId);
    const activeUsernames = new Set(
        store
            .filterCurrentPresenceEntries(presence)
            .map((entry) =>
                String(entry.username ?? "")
                    .trim()
                    .toLowerCase(),
            )
            .filter(Boolean),
    );
    if (activeUsernames.size <= 1) {
        return { approved: true, consensusSkipped: true };
    }
    return requestApproval?.(approvalInput);
}
