import { logUi } from "./feedback.js";
import { messagesClient } from "./gateway-clients.js";

export async function updateMeetingChatMembership({
    roomId,
    username,
    action,
    meetingId,
}) {
    const normalizedRoomId = String(roomId ?? "").trim();
    const normalizedUsername = String(username ?? "").trim();
    if (!normalizedRoomId || !normalizedUsername) return false;
    const adding = action === "add";
    try {
        const client = messagesClient();
        const updateMembership = adding
            ? client.addRoomMember
            : client.removeRoomMember;
        if (typeof updateMembership !== "function") {
            throw new Error("Messages membership client is unavailable.");
        }
        await updateMembership.call(
            client,
            normalizedRoomId,
            normalizedUsername,
        );
        return true;
    } catch (error) {
        await logUi("error", "Meeting chat membership update failed.", {
            component: "module:jitsi-meet",
            operation: adding
                ? "add_meeting_chat_member"
                : "remove_meeting_chat_member",
            meetingId,
            roomId: normalizedRoomId,
            username: normalizedUsername,
            error: error instanceof Error ? error.message : String(error),
        });
    }
    return false;
}
