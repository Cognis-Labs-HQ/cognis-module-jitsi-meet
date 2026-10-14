export async function findMeetingByChatRoomReference({
    db,
    chatRoomId,
    getMeetingById,
}) {
    if (!chatRoomId) return null;
    const call = await db.executeCommand({
        option: "SELECT",
        table: "jitsi_chat_calls",
        where: [{ column: "chat_room_id", value: chatRoomId }],
        limit: 1,
    });
    if (call.rows?.[0]?.meeting_id)
        return getMeetingById(call.rows[0].meeting_id);
    const result = await db.executeCommand({
        option: "SELECT",
        table: "jitsi_meetings",
        where: [{ column: "chat_room_id", value: chatRoomId }],
        orderBy: [
            { column: "updated_at", direction: "DESC" },
            { column: "id", direction: "DESC" },
        ],
        limit: 1,
    });
    const id = String(result.rows?.[0]?.id ?? "").trim();
    return id ? getMeetingById(id) : null;
}
