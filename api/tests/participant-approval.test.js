import test from "node:test";
import assert from "node:assert/strict";
import { requestParticipantAdditionDecision } from "../reuse/participant-approval.js";
import { profileIdentityFake } from "./profile-identity-fake.js";

function createStore(usernames) {
    return {
        async listPresence() {
            return usernames.map((username) => ({ username }));
        },
        filterCurrentPresenceEntries(presence) {
            return presence;
        },
    };
}

test("participant addition automatically succeeds with one active attendee", async () => {
    let approvalRequests = 0;
    const result = await requestParticipantAdditionDecision({
        store: createStore(["alice"]),
        meetingId: "meeting-1",
        requestApproval: async () => {
            approvalRequests += 1;
            return { approved: false };
        },
        approvalInput: { participantUsername: "carol" },
        normalizeHandleKey: (handle) =>
            profileIdentityFake.normalizeHandleKey(handle),
    });

    assert.deepEqual(result, { approved: true, consensusSkipped: true });
    assert.equal(approvalRequests, 0);
});

test("participant addition requests consensus from multiple active attendees", async () => {
    const approvalInput = { participantUsername: "carol" };
    const requests = [];
    const result = await requestParticipantAdditionDecision({
        store: createStore(["alice", "bob", "bob"]),
        meetingId: "meeting-1",
        requestApproval: async (input) => {
            requests.push(input);
            return { approved: false };
        },
        approvalInput,
        normalizeHandleKey: (handle) =>
            profileIdentityFake.normalizeHandleKey(handle),
    });

    assert.deepEqual(result, { approved: false });
    assert.deepEqual(requests, [approvalInput]);
});
