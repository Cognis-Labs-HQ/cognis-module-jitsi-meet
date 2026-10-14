import { deleteReferencedMeetingResource } from "./resource-deletion.js";

/** Finish provider-owned cleanup before the caller removes the meeting record. */
export async function deleteMeetingResources({
    meeting,
    whiteboardId,
    ownerAccountId,
    chatActorAccountId = ownerAccountId,
    whiteboardActorAccountId = ownerAccountId,
    resolveWhiteboardDeletion,
    deleteChatroom,
    deleteResourceShares,
    log,
}) {
    if (whiteboardId) {
        const deleteWhiteboard = resolveWhiteboardDeletion();
        if (typeof deleteWhiteboard !== "function") {
            throw new Error("Whiteboard deletion capability is unavailable.");
        }
        await deleteReferencedMeetingResource({
            deleteResource: () =>
                deleteWhiteboard({
                    whiteboardId,
                    actorAccountId: whiteboardActorAccountId,
                }),
            resourceType: "whiteboard",
            resourceId: whiteboardId,
            meetingId: meeting.id,
            log,
        });
    }
    if (meeting.chatRoomId) {
        await deleteReferencedMeetingResource({
            deleteResource: () =>
                deleteChatroom({
                    roomId: meeting.chatRoomId,
                    actorAccountId: chatActorAccountId,
                }),
            resourceType: "chatroom",
            resourceId: meeting.chatRoomId,
            meetingId: meeting.id,
            log,
        });
    }
    await deleteResourceShares?.({
        ownerAccountId,
        resourceType: "meeting",
        resourceId: meeting.id,
    });
}
