export async function restoreMeetingChatMembership({
    meeting,
    userAccountId,
    groupChatMembership,
    log,
}) {
    if (!meeting.chatRoomId) return;
    try {
        await groupChatMembership.add({
            roomId: meeting.chatRoomId,
            actorAccountId: userAccountId,
            userAccountId,
        });
    } catch (error) {
        log?.("error", "Meeting chat membership restore failed.", {
            component: "jitsi-meet-module",
            operation: "restore_joining_participant_chat",
            meetingId: meeting.id,
            chatRoomId: meeting.chatRoomId,
            userAccountId,
            error: error instanceof Error ? error.message : String(error),
        });
        throw error;
    }
}
