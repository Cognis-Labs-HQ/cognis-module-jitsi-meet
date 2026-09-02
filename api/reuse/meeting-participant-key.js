import { createHash } from "node:crypto";

export function buildParticipantKey(
    normalizeHandleKeys,
    usernames,
    classroomId = null,
    mutableMeetingId = null,
) {
    const payload = JSON.stringify({
        classroomId: classroomId ? String(classroomId) : null,
        ...(mutableMeetingId
            ? { mutableMeetingId: String(mutableMeetingId) }
            : {}),
        participants: normalizeHandleKeys(usernames),
    });
    return createHash("sha256").update(payload).digest("hex");
}
