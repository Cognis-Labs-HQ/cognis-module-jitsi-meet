/** Reserve one current disposable call per conversation within its meeting transaction. */
export async function reserveChatCallRoom(
    database,
    meeting,
    chatRoomId = meeting.chatRoomId,
) {
    if (!meeting.disposable || !chatRoomId) return;
    await database.executeCommand({
        option: "DELETE",
        table: "jitsi_chat_calls",
        where: [{ column: "meeting_id", value: meeting.id }],
    });
    await database.executeCommand({
        option: "INSERT",
        table: "jitsi_chat_calls",
        values: { chat_room_id: chatRoomId, meeting_id: meeting.id },
    });
}

/** Change the meeting association and its disposable-call reservation atomically. */
export async function assignMeetingChatRoom(database, meeting, chatRoomId) {
    await database.transaction(async (executor) => {
        await reserveChatCallRoom(executor, meeting, chatRoomId);
        await executor.executeCommand({
            option: "UPDATE",
            table: "jitsi_meetings",
            set: {
                chat_room_id: chatRoomId,
                updated_at: new Date().toISOString(),
            },
            where: [{ column: "id", value: meeting.id }],
        });
    });
}
