import { resolveRequesterUsername } from "./reuse/requester.js";

export function createGetMeetingChatCapability({
    store,
    profileStore,
    profileIdentity,
    canAccessMeeting,
    listClassroomParticipantHandles,
    log,
}) {
    return async function getMeetingChat({ claims, meetingId } = {}) {
        const requesterAccountId = String(claims?.sub ?? "").trim();
        const normalizedMeetingId = String(meetingId ?? "").trim();
        if (!requesterAccountId || !normalizedMeetingId) return null;

        await store.ensureSchema();
        const meeting = await store.getMeetingById(normalizedMeetingId);
        if (!meeting) return null;
        let requesterUsername;
        try {
            requesterUsername = await resolveRequesterUsername(
                profileStore,
                profileIdentity,
                requesterAccountId,
            );
        } catch (error) {
            log?.("error", "Meeting chat requester resolution failed.", {
                component: "jitsi-meet-module",
                operation: "get_meeting_chat",
                meetingId: normalizedMeetingId,
                requesterAccountId,
                error: error instanceof Error ? error.message : String(error),
            });
            return null;
        }
        if (!requesterUsername) return null;
        const authorized = await canAccessMeeting({
            store,
            meeting,
            username: requesterUsername,
            listClassroomParticipantHandles,
            profileStore,
            requesterAccountId,
        });
        return authorized ? (meeting.chatRoomId ?? null) : null;
    };
}
