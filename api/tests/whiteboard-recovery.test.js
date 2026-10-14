import test from "node:test";
import assert from "node:assert/strict";
import {
    createRecorder,
    createRoutes,
} from "./reuse/whiteboard-route-fixture.js";

test("an approved open mapping can recover its deleted canvas through the same generic reference", async () => {
    const state = {
        whiteboardId: "deleted",
        whiteboardDisposable: false,
        whiteboardActive: true,
        whiteboardOpenVotes: [],
    };
    const routes = createRoutes({
        requesterUsername: "bob",
        claims: { sub: "account-bob" },
        organizerUsername: "alice",
        participants: ["alice", "bob", "carol"],
        state,
        board: (id) =>
            id === "deleted"
                ? null
                : {
                      id: "replacement",
                      title: "Planning",
                      createdBy: "alice",
                      createdByAccountId: "account-alice",
                      resourceReference: {
                          resourceType: "meeting",
                          resourceId: "meeting-1",
                      },
                  },
    });
    const response = createRecorder();
    await routes.handlers.get(
        "POST /api/v1/modules/jitsi-meet/whiteboard/state",
    )(
        {
            body: {
                meetingId: "meeting-1",
                whiteboardId: "replacement",
                disposable: false,
                active: true,
            },
        },
        response,
    );
    assert.equal(response.status, 200);
    assert.equal(response.body.data.whiteboardId, "replacement");
    assert.equal(response.body.data.whiteboardOpen, true);
    assert.equal(routes.approvalRequests.length, 0);
});

test("a replacement cannot claim an unrelated reference when the mapped canvas is missing", async () => {
    const routes = createRoutes({
        requesterUsername: "bob",
        claims: { sub: "account-bob" },
        organizerUsername: "alice",
        state: {
            whiteboardId: "deleted",
            whiteboardDisposable: false,
            whiteboardActive: true,
        },
        board: (id) =>
            id === "deleted"
                ? null
                : {
                      id: "replacement",
                      title: "Planning",
                      createdBy: "alice",
                      createdByAccountId: "account-alice",
                      resourceReference: {
                          resourceType: "meeting",
                          resourceId: "another-meeting",
                      },
                  },
    });
    const response = createRecorder();
    await routes.handlers.get(
        "POST /api/v1/modules/jitsi-meet/whiteboard/state",
    )(
        {
            body: {
                meetingId: "meeting-1",
                whiteboardId: "replacement",
                disposable: false,
                active: true,
            },
        },
        response,
    );
    assert.equal(response.status, 403);
    assert.equal(routes.stateUpdates.length, 0);
});
