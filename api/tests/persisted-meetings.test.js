import test from "node:test";
import assert from "node:assert/strict";
import {
    listPersistedMeetings,
    selectDistinctParticipantMeetings,
} from "../reuse/persisted-meetings.js";
import { profileIdentityFake } from "./profile-identity-fake.js";

test("persisted meeting discovery retains the final member's meeting", async () => {
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
        listOriginalParticipants: async (id) =>
            id === "persistent" ? ["alice", "carol"] : [],
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
            participants: ["alice", "carol"],
        },
        {
            id: "disposable",
            meetingName: "Meeting disposable",
            meetingUrl: "https://meet.example/disposable",
            participants: ["alice"],
        },
    ]);
});

test("persisted meeting discovery shows one card for each participant set", () => {
    const meetings = [
        { id: "older", participants: ["Alice", "bob"] },
        { id: "newer", participants: ["bob", "alice"] },
        { id: "different", participants: ["alice", "carol"] },
    ];
    assert.deepEqual(
        selectDistinctParticipantMeetings(meetings, {
            activeMeetingIds: new Set(["older"]),
            normalizeHandleKeys: (handles) =>
                profileIdentityFake.normalizeHandleKeys(handles),
        }).map((meeting) => meeting.id),
        ["older", "different"],
    );
});
