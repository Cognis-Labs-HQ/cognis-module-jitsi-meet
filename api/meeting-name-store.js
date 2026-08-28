import { extractUrlOrigin } from "./reuse/url-parts.js";
import { generateMeetingName, isGeneratedMeetingName } from "./meeting-name.js";

export async function refreshGeneratedMeetingNames({
    db,
    meetings,
    generatePassphrase,
    log,
}) {
    for (const meeting of meetings) {
        if (isGeneratedMeetingName(meeting.meeting_name)) continue;
        const meetingName = generateMeetingName(generatePassphrase);
        const instanceUrl = extractUrlOrigin(meeting.meeting_url);
        await db.executeCommand({
            option: "UPDATE",
            table: "jitsi_meetings",
            set: {
                meeting_name: meetingName,
                room_slug: meetingName,
                meeting_url: `${instanceUrl}/${meetingName}`,
                updated_at: new Date().toISOString(),
            },
            where: [{ column: "id", value: meeting.id }],
        });
        log?.("info", "Meeting name regenerated.", {
            component: "jitsi-meet-module",
            operation: "regenerate_meeting_name",
            meetingId: meeting.id,
        });
    }
}
