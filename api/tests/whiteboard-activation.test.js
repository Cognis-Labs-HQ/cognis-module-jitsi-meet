import test from "node:test";
import assert from "node:assert/strict";
import {
    createRoutes,
    createRecorder,
} from "./reuse/whiteboard-route-fixture.js";

const request = {
    body: {
        meetingId: "meeting-1",
        whiteboardId: "board-1",
        disposable: false,
        active: true,
    },
};
const presence = [{ username: "alice" }, { username: "bob" }];

test("declined canvas approval performs no source claim or membership mutation", async () => {
    const calls = [];
    const fixture = createRoutes({
        requesterUsername: "bob",
        participants: ["alice", "bob", "carol"],
        presence,
        whiteboardApproval: { approved: false },
        sourceBinding: {
            bind: async () => calls.push("bind"),
            release: async () => calls.push("release"),
        },
    });
    const response = createRecorder();
    await fixture.handlers.get(
        "POST /api/v1/modules/jitsi-meet/whiteboard/state",
    )(request, response);
    assert.equal(response.status, 409);
    assert.deepEqual(calls, []);
    assert.deepEqual(fixture.membershipAdds, []);
    assert.deepEqual(fixture.stateUpdates, []);
});

for (const stage of ["membership", "state"]) {
    test(`a failed ${stage} update releases its new canvas claim`, async () => {
        const calls = [];
        const failure = () => {
            throw new Error("Unavailable");
        };
        const fixture = createRoutes({
            participants: ["alice", "bob"],
            presence,
            beforeMembershipAdd: stage === "membership" ? failure : () => {},
            beforeStateUpdate: stage === "state" ? failure : () => {},
            sourceBinding: {
                bind: async () => calls.push("bind"),
                release: async () => calls.push("release"),
            },
        });
        const response = createRecorder();
        await fixture.handlers.get(
            "POST /api/v1/modules/jitsi-meet/whiteboard/state",
        )(request, response);
        assert.equal(response.status, 503);
        assert.deepEqual(calls, ["bind", "release"]);
        assert.deepEqual(fixture.stateUpdates, []);
    });
}

test("failed updates of an already-mapped canvas preserve its existing source claim", async () => {
    const calls = [];
    const fixture = createRoutes({
        state: {
            whiteboardId: "board-1",
            whiteboardDisposable: false,
            whiteboardOpenVotes: [],
        },
        beforeStateUpdate: () => {
            throw new Error("Unavailable");
        },
        sourceBinding: {
            bind: async () => calls.push("bind"),
            release: async () => calls.push("release"),
        },
    });
    const response = createRecorder();
    await fixture.handlers.get(
        "POST /api/v1/modules/jitsi-meet/whiteboard/state",
    )(request, response);
    assert.equal(response.status, 503);
    assert.deepEqual(calls, ["bind"]);
});
