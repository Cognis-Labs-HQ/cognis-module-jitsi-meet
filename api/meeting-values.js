import { randomBytes } from "node:crypto";

const DEFAULT_MEETING_PREFIX_MAX_LENGTH = 48;
const MEETING_NAME_PREFIXES = [
    "Amber",
    "Azure",
    "Bright",
    "Calm",
    "Clear",
    "Coral",
    "Gentle",
    "Golden",
    "Grand",
    "Green",
    "Happy",
    "Quiet",
    "Silver",
    "Soft",
    "Sunny",
    "Warm",
];
const MEETING_NAME_SUFFIXES = [
    "Brook",
    "Cloud",
    "Field",
    "Forest",
    "Harbor",
    "Hill",
    "Lake",
    "Meadow",
    "Moon",
    "River",
    "Sky",
    "Star",
    "Stone",
    "Summit",
    "Valley",
    "Willow",
];

export function generateMeetingName() {
    const entropy = randomBytes(8);
    return Array.from({ length: 4 }, (_, index) => {
        const prefix = MEETING_NAME_PREFIXES[entropy[index * 2] & 15];
        const suffix = MEETING_NAME_SUFFIXES[entropy[index * 2 + 1] & 15];
        return `${prefix}${suffix.toLowerCase()}`;
    }).join(" ");
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
