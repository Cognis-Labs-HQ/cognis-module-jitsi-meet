export async function deleteDisposableMeeting({
    meeting,
    ownerAccountId,
    store,
    deleteResourceShares,
    deleteChatRoom,
    log,
}) {
    await deleteResourceShares?.({
        ownerAccountId,
        resourceType: "meeting",
        resourceId: meeting.id,
    });
    if (meeting.chatRoomId) {
        try {
            if (typeof deleteChatRoom !== "function") {
                throw new Error(
                    "The Messages chat deletion capability is unavailable.",
                );
            }
            await deleteChatRoom({
                roomId: meeting.chatRoomId,
                ownerAccountId,
            });
        } catch (error) {
            log?.("error", "Failed to delete disposable meeting chat.", {
                component: "jitsi-meet-module",
                operation: "delete_disposable_meeting_chat",
                meetingId: meeting.id,
                chatRoomId: meeting.chatRoomId,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }
    await store.deleteMeeting(meeting.id);
    log?.("info", "Disposable meeting data deleted.", {
        component: "jitsi-meet-module",
        operation: "delete_disposable_meeting",
        meetingId: meeting.id,
        chatRoomId: meeting.chatRoomId,
        ownerAccountId,
    });
}
