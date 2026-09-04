export async function deleteDisposableMeeting({
    meeting,
    ownerAccountId,
    store,
    deleteResourceShares,
    log,
}) {
    await deleteResourceShares?.({
        ownerAccountId,
        resourceType: "meeting",
        resourceId: meeting.id,
    });
    await store.deleteMeeting(meeting.id);
    log?.("info", "Disposable meeting data deleted.", {
        component: "jitsi-meet-module",
        operation: "delete_disposable_meeting",
        meetingId: meeting.id,
        chatRoomId: meeting.chatRoomId,
        ownerAccountId,
    });
}
