import { generate } from "generate-passphrase";

export function generateMeetingName() {
    return generate({
        length: 4,
        numbers: false,
        separator: " ",
        titlecase: true,
    });
}

export function buildMeetingName(roomSlug, storedMeetingName = "") {
    const normalizedStoredName = String(storedMeetingName ?? "").trim();
    return normalizedStoredName || String(roomSlug ?? "").trim();
}

export function buildPendingMeetingUrl(instanceUrl, meetingId) {
    const pendingUrl = new URL(instanceUrl);
    pendingUrl.hash = new URLSearchParams({
        cognisMeeting: String(meetingId),
    }).toString();
    return pendingUrl.toString();
}

export function isModeratorRole(role) {
    const normalized = String(role ?? "")
        .trim()
        .toLowerCase();
    return (
        normalized === "admin" ||
        normalized === "owner" ||
        normalized === "teacher"
    );
}
