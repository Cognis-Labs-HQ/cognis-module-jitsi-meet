const DEFAULT_MEETING_NAME = "Cognis Classroom";

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
