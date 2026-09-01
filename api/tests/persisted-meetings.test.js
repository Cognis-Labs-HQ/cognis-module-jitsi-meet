import test from "node:test";
import assert from "node:assert/strict";
import { listPersistedMeetings } from "../reuse/persisted-meetings.js";

test("persisted meeting discovery excludes disposable records", async () => {
    const participantsByMeeting = new Map([
        ["persistent", ["alice", "bob"]],
        ["disposable", ["alice"]],
    ]);
    const meetings = await listPersistedMeetings({
        db: {
            async executeCommand() {
                return {
                    rows: [{ id: "persistent" }, { id: "disposable" }],
                };
            },
        },
        listParticipants: async (id) => participantsByMeeting.get(id),
        getMeetingById: async (id) => ({
            id,
            meetingName: `Meeting ${id}`,
            meetingUrl: `https://meet.example/${id}`,
        }),
    });

    assert.deepEqual(meetings, [
        {
            id: "persistent",
            meetingName: "Meeting persistent",
            meetingUrl: "https://meet.example/persistent",
            participants: ["alice", "bob"],
        },
    ]);
});
