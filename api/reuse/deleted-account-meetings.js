import { buildParticipantKey } from "./meeting-participant-key.js";

const PARTICIPANT_TABLES = [
    "jitsi_meeting_participants",
    "jitsi_meeting_original_participants",
];

async function selectParticipants(executor, table, meetingId) {
    const result = await executor.executeCommand({
        option: "SELECT",
        table,
        columns: ["username"],
        where: [{ column: "meeting_id", value: meetingId }],
    });
    return (result.rows ?? []).map((row) => row.username);
}

async function deleteMeetingRows(executor, meetingId) {
    for (const table of [
        "jitsi_meeting_presence",
        "jitsi_meeting_state",
        "jitsi_meeting_original_participants",
        "jitsi_meeting_participants",
        "jitsi_meetings",
    ]) {
        await executor.executeCommand({
            option: "DELETE",
            table,
            where: [
                {
                    column: table === "jitsi_meetings" ? "id" : "meeting_id",
                    value: meetingId,
                },
            ],
        });
    }
}

export async function removeDeletedAccountFromMeetings(store, username) {
    const { db } = store;
    const normalizeHandleKey = (handle) => store.normalizeHandleKey(handle);
    const normalizeHandleKeys = (handles) => store.normalizeHandleKeys(handles);
    const normalizedUsername = normalizeHandleKey(username);
    if (!normalizedUsername) {
        return { updatedMeetingIds: [], deletedMeetingIds: [] };
    }

    return db.transaction(async (executor) => {
        const affectedMeetingIds = new Set();
        for (const table of PARTICIPANT_TABLES) {
            const result = await executor.executeCommand({
                option: "SELECT",
                table,
                columns: ["meeting_id"],
                where: [{ column: "username", value: normalizedUsername }],
            });
            for (const row of result.rows ?? []) {
                const meetingId = String(row.meeting_id ?? "").trim();
                if (meetingId) affectedMeetingIds.add(meetingId);
            }
        }

        for (const table of ["jitsi_meeting_presence", ...PARTICIPANT_TABLES]) {
            await executor.executeCommand({
                option: "DELETE",
                table,
                where: [{ column: "username", value: normalizedUsername }],
            });
        }

        const updatedMeetingIds = [];
        const deletedMeetingIds = [];
        for (const meetingId of affectedMeetingIds) {
            const originalParticipants = normalizeHandleKeys(
                await selectParticipants(
                    executor,
                    "jitsi_meeting_original_participants",
                    meetingId,
                ),
            );
            const currentParticipants = normalizeHandleKeys(
                await selectParticipants(
                    executor,
                    "jitsi_meeting_participants",
                    meetingId,
                ),
            );
            const savedParticipants = originalParticipants.length
                ? originalParticipants
                : currentParticipants;

            if (savedParticipants.length <= 1) {
                await deleteMeetingRows(executor, meetingId);
                deletedMeetingIds.push(meetingId);
                continue;
            }

            const meetingResult = await executor.executeCommand({
                option: "SELECT",
                table: "jitsi_meetings",
                columns: ["classroom_id"],
                where: [{ column: "id", value: meetingId }],
                limit: 1,
            });
            const meeting = meetingResult.rows?.[0];
            if (!meeting) continue;
            await executor.executeCommand({
                option: "UPDATE",
                table: "jitsi_meetings",
                set: {
                    participant_key: buildParticipantKey(
                        normalizeHandleKeys,
                        savedParticipants,
                        meeting.classroom_id ?? null,
                        meetingId,
                    ),
                    updated_at: new Date().toISOString(),
                },
                where: [{ column: "id", value: meetingId }],
            });
            updatedMeetingIds.push(meetingId);
        }

        return { updatedMeetingIds, deletedMeetingIds };
    });
}
