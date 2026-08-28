export function buildMeetingName(storedMeetingName = "") {
    return String(storedMeetingName ?? "").trim();
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
