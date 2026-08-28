const DEFAULT_MEETING_NAME = "Cognis Classroom";

export function createMeetingName(scheduledAt, roomSlug) {
    const scheduledDate = new Date(scheduledAt);
    const timestamp = Number.isFinite(scheduledDate.getTime())
        ? scheduledDate.toISOString().slice(0, 16).replace("T", " ")
        : new Date().toISOString().slice(0, 16).replace("T", " ");
    const identifier = String(roomSlug ?? "")
        .slice(-6)
        .toUpperCase();
    return `${timestamp} UTC · ${identifier}`;
}

export function buildMeetingName(roomSlug, storedMeetingName = "") {
    const normalizedStoredName = String(storedMeetingName ?? "").trim();
    return (
        normalizedStoredName ||
        String(roomSlug ?? "").trim() ||
        DEFAULT_MEETING_NAME
    );
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
