import { deleteMeetingRows } from "./store-schema.js";
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

export async function removeDeletedAccountFromMeetings(
    store,
    username,
    { beforeDeleteMeeting } = {},
) {
    const { db } = store;
    const normalizeHandleKey = (handle) => store.normalizeHandleKey(handle);
    const normalizeHandleKeys = (handles) => store.normalizeHandleKeys(handles);
    const normalizedUsername = normalizeHandleKey(username);
    if (!normalizedUsername) {
        return { updatedMeetingIds: [], deletedMeetingIds: [] };
    }

    return db.transaction(async (executor) => {
        const affectedMeetingIds = new Set();
        const ownedMeetings = await executor.executeCommand({
            option: "SELECT",
            table: "jitsi_meetings",
            columns: ["id"],
            where: [{ column: "created_by", value: normalizedUsername }],
        });
        for (const row of ownedMeetings.rows ?? [])
            affectedMeetingIds.add(row.id);
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
                const [meetingResult, stateResult] = await Promise.all([
                    executor.executeCommand({
                        option: "SELECT",
                        table: "jitsi_meetings",
                        columns: ["chat_room_id", "created_by"],
                        where: [{ column: "id", value: meetingId }],
                        limit: 1,
                    }),
                    executor.executeCommand({
                        option: "SELECT",
                        table: "jitsi_meeting_state",
                        columns: ["whiteboard_id"],
                        where: [{ column: "meeting_id", value: meetingId }],
                        limit: 1,
                    }),
                ]);
                const meeting = meetingResult.rows?.[0];
                if (meeting && typeof beforeDeleteMeeting === "function") {
                    await beforeDeleteMeeting({
                        id: meetingId,
                        chatRoomId: meeting.chat_room_id
                            ? String(meeting.chat_room_id)
                            : null,
                        createdBy: String(meeting.created_by ?? ""),
                        whiteboardId: stateResult.rows?.[0]?.whiteboard_id
                            ? String(stateResult.rows[0].whiteboard_id)
                            : null,
                    });
                }
                await deleteMeetingRows(executor, meetingId);
                deletedMeetingIds.push(meetingId);
                continue;
            }

            const meetingResult = await executor.executeCommand({
                option: "SELECT",
                table: "jitsi_meetings",
                columns: ["classroom_id", "created_by"],
                where: [{ column: "id", value: meetingId }],
                limit: 1,
            });
            const meeting = meetingResult.rows?.[0];
            if (!meeting) continue;
            await executor.executeCommand({
                option: "UPDATE",
                table: "jitsi_meetings",
                set: {
                    ...(normalizeHandleKey(meeting.created_by) ===
                    normalizedUsername
                        ? { created_by: savedParticipants[0] }
                        : {}),
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
