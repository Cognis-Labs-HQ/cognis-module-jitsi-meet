export async function listPersistedMeetings({
    db,
    getMeetingById,
    listParticipants,
}) {
    const result = await db.executeCommand({
        option: "SELECT",
        table: "jitsi_meetings",
        orderBy: [{ column: "updated_at", direction: "DESC" }],
        limit: 200,
    });
    const meetings = [];
    for (const row of result.rows ?? []) {
        const id = String(row.id ?? "").trim();
        if (!id) continue;
        const participants = await listParticipants(id);
        const meeting = await getMeetingById(id);
        if (meeting?.meetingUrl && meeting.meetingName) {
            meetings.push({ ...meeting, participants });
        }
    }
    return meetings;
}

export function selectDistinctParticipantMeetings(
    meetings,
    { activeMeetingIds, normalizeHandleKeys },
) {
    const selectedByParticipants = new Map();
    for (const meeting of meetings) {
        const participantSignature = normalizeHandleKeys(
            meeting.participants,
        ).join("\u0000");
        const selected = selectedByParticipants.get(participantSignature);
        if (
            !selected ||
            (!activeMeetingIds.has(selected.id) &&
                activeMeetingIds.has(meeting.id))
        ) {
            selectedByParticipants.set(participantSignature, meeting);
        }
    }
    return Array.from(selectedByParticipants.values());
}
