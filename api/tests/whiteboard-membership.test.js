import test from "node:test";
import assert from "node:assert/strict";
import { updateMeetingWhiteboardMembership } from "../reuse/whiteboard-membership.js";

const meeting = { id: "meeting-1", createdBy: "alice" };
const profileStore = {
    async getProfileByHandle(handle) {
        return { accountId: `account-${handle}`, handle };
    },
};

test("meeting Whiteboard membership uses canonical owner and participant accounts", async () => {
    const calls = [];
    const membership = {
        async add(input) {
            calls.push(["add", input]);
        },
        async remove(input) {
            calls.push(["remove", input]);
        },
    };
    const input = {
        meeting,
        state: { whiteboardId: "board-1", whiteboardDisposable: false },
        userAccountId: "account-bob",
        profileStore,
        resolveWhiteboardMembership: () => membership,
    };

    await updateMeetingWhiteboardMembership({ ...input, operation: "add" });
    await updateMeetingWhiteboardMembership({ ...input, operation: "remove" });

    assert.deepEqual(calls, [
        [
            "add",
            {
                whiteboardId: "board-1",
                actorAccountId: "account-alice",
                userAccountId: "account-bob",
            },
        ],
        [
            "remove",
            {
                whiteboardId: "board-1",
                actorAccountId: "account-alice",
                userAccountId: "account-bob",
            },
        ],
    ]);
});

test("meeting Whiteboard membership ignores absent and disposable canvases", async () => {
    let resolutions = 0;
    const input = {
        operation: "add",
        meeting,
        userAccountId: "account-bob",
        profileStore,
        resolveWhiteboardMembership: () => {
            resolutions += 1;
        },
    };

    await updateMeetingWhiteboardMembership({ ...input, state: {} });
    await updateMeetingWhiteboardMembership({
        ...input,
        state: { whiteboardId: "board-1", whiteboardDisposable: true },
    });

    assert.equal(resolutions, 0);
});
