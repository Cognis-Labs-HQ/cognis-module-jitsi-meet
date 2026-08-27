import { generate } from "./vendor/generate-passphrase/index.mjs";

const DEFAULT_MEETING_PREFIX_MAX_LENGTH = 48;
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
