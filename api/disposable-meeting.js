import { deleteReferencedMeetingResource } from "./reuse/resource-deletion.js";

export async function deleteDisposableMeeting({
    meeting,
    ownerAccountId,
    store,
    deleteResourceShares,
    deleteChatroom,
    preserveChatroom = false,
    log,
}) {
    await deleteResourceShares?.({
        ownerAccountId,
        resourceType: "meeting",
        resourceId: meeting.id,
    });
    if (meeting.chatRoomId && !preserveChatroom) {
        try {
            if (typeof deleteChatroom !== "function") {
                throw new Error(
                    "The Messages chat deletion capability is unavailable.",
                );
            }
            await deleteReferencedMeetingResource({
                deleteResource: () =>
                    deleteChatroom({
                        roomId: meeting.chatRoomId,
                        actorAccountId: ownerAccountId,
                    }),
                resourceType: "chatroom",
                resourceId: meeting.chatRoomId,
                meetingId: meeting.id,
                log,
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
        chatRoomPreserved: Boolean(meeting.chatRoomId && preserveChatroom),
        ownerAccountId,
    });
}
