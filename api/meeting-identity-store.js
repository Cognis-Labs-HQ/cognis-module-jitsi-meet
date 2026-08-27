import { normalizeHttpUrl } from "./reuse/url-parts.js";

export async function captureMeetingIdentity({
    db,
    meetingId,
    roomName,
    instanceUrl,
    getMeetingById,
}) {
    const normalizedInstanceUrl = normalizeHttpUrl(instanceUrl);
    const normalizedRoomName = String(roomName ?? "").trim();
    if (!normalizedInstanceUrl || !normalizedRoomName) {
        throw new Error("A Jitsi room name and instance URL are required.");
    }
    await db.executeCommand({
        option: "UPDATE",
        table: "jitsi_meetings",
        set: {
            meeting_url: `${normalizedInstanceUrl}/${normalizedRoomName}`,
            meeting_name: normalizedRoomName,
            room_slug: normalizedRoomName,
            updated_at: new Date().toISOString(),
        },
        where: [{ column: "id", value: meetingId }],
    });
    return getMeetingById(meetingId);
}
