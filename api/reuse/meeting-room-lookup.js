export async function findMeetingByChatRoomReference({
    db,
    chatRoomId,
    getMeetingById,
}) {
    if (!chatRoomId) return null;
    const result = await db.executeCommand({
        option: "SELECT",
        table: "jitsi_meetings",
        where: [{ column: "chat_room_id", value: chatRoomId }],
        limit: 1,
    });
    const id = String(result.rows?.[0]?.id ?? "").trim();
    return id ? getMeetingById(id) : null;
}
