const DEFAULT_MEETING_PREFIX_MAX_LENGTH = 48;
const DEFAULT_MEETING_TITLE = "Cognis Classroom";

export function buildMeetingName(roomSlug, storedMeetingName = "") {
    const normalizedRoomSlug = String(roomSlug ?? "").trim();
    const normalizedStoredName = String(storedMeetingName ?? "").trim();
    const baseName = normalizedStoredName || DEFAULT_MEETING_TITLE;
    if (!normalizedRoomSlug || baseName.endsWith(`— ${normalizedRoomSlug}`)) {
        return baseName;
    }
    return `${baseName} — ${normalizedRoomSlug}`;
}

export function normalizeMeetingPrefix(rawPrefix) {
    return String(rawPrefix ?? "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, DEFAULT_MEETING_PREFIX_MAX_LENGTH);
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
