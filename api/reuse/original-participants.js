export async function listMeetingOriginalParticipants(db, meetingId) {
    const result = await db.executeCommand({
        option: "SELECT",
        table: "jitsi_meeting_original_participants",
        where: [{ column: "meeting_id", value: meetingId }],
        orderBy: [{ column: "username", direction: "ASC" }],
    });
    return (result.rows ?? []).map((row) => String(row.username));
}

export async function meetingMatchesParticipantSet({
    meetingId,
    expectedUsernames,
    listParticipants,
    listOriginalParticipants,
    normalizeHandleKeys,
}) {
    const participantSets = await Promise.all([
        listParticipants(meetingId),
        listOriginalParticipants(meetingId),
    ]);
    return participantSets.some((participantSet) => {
        const candidateUsernames = normalizeHandleKeys(participantSet);
        return (
            candidateUsernames.length === expectedUsernames.length &&
            candidateUsernames.every(
                (username, index) => username === expectedUsernames[index],
            )
        );
    });
}

export async function ensureMeetingOriginalParticipants({
    db,
    meetingId,
    listParticipants,
}) {
    const existing = await listMeetingOriginalParticipants(db, meetingId);
    if (existing.length) return existing;
    const participants = await listParticipants(meetingId);
    const recordedAt = new Date().toISOString();
    for (const username of participants) {
        await db.executeCommand({
            option: "INSERT",
            table: "jitsi_meeting_original_participants",
            values: {
                meeting_id: meetingId,
                username,
                recorded_at: recordedAt,
            },
            conflict: { action: "ignore" },
        });
    }
    return participants;
}
