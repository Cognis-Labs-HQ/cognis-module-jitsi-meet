export async function findMeetingByChatRoomReference({
    db,
    chatRoomId,
    getMeetingById,
}) {
    if (!chatRoomId) return null;
    for (const column of ["chat_room_id", "source_chat_room_id"]) {
        const result = await db.executeCommand({
            option: "SELECT",
            table: "jitsi_meetings",
            where: [{ column, value: chatRoomId }],
            orderBy: [{ column: "created_at", direction: "DESC" }],
            limit: 1,
        });
        const id = String(result.rows?.[0]?.id ?? "").trim();
        if (id) return getMeetingById(id);
    }
    return null;
}
