import { logUi } from "../../reuse/feedback.js";
import { importReuseModule } from "../../reuse/resources.js";

const { normalizeUsername } = await importReuseModule("value-normalizers.js");

export async function recoverDeletedMeeting({
    apiFetch,
    meetingId,
    records,
    currentUsername,
    signal,
}) {
    const readParticipants = (record) =>
        (record?.participants ?? [])
            .map((entry) =>
                normalizeUsername(
                    typeof entry === "string"
                        ? entry
                        : (entry?.username ?? entry?.handle),
                ),
            )
            .filter(Boolean);
    const record = records.find(
        (entry) =>
            entry?.id === meetingId &&
            readParticipants(entry).includes(
                normalizeUsername(currentUsername),
            ),
    );
    if (!record) return null;
    if (record.disposable && !record.chatRoomId) return null;
    const participants = readParticipants(record);
    signal?.throwIfAborted();
    const response = await apiFetch(
        record.disposable
            ? "/api/v1/modules/jitsi-meet/meetings/voip-call"
            : "/api/v1/modules/jitsi-meet/meetings/create",
        {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(
                record.disposable
                    ? { roomId: record.chatRoomId }
                    : {
                          participants,
                          classroomId: record.classroomId,
                      },
            ),
            signal,
        },
    );
    if (!response.ok) return response;
    await logUi(
        "info",
        "Deleted meeting reference recreated through participant matching.",
        {
            component: "module:jitsi-meet",
            operation: "recover_deleted_meeting",
            previousMeetingId: meetingId,
        },
    );
    return response;
}
