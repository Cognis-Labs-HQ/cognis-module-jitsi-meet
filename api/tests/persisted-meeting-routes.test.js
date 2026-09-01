import test from "node:test";
import assert from "node:assert/strict";
import { registerPersistedMeetingRoutes } from "../persisted-meeting-routes.js";
import { profileIdentityFake } from "./profile-identity-fake.js";

function createHarness({
    participants,
    requesterUsername = "alice",
    requesterAccountId = `account-${requesterUsername}`,
    state = {},
    meeting = {},
}) {
    const handlers = new Map();
    const operations = [];
    registerPersistedMeetingRoutes({
        router: { post: (path, handler) => handlers.set(path, handler) },
        store: {
            async ensureSchema() {},
            async listActiveMeetings() {
                return [];
            },
            async removeMeetingParticipant(id, username) {
                operations.push(["store-remove", id, username]);
            },
            async deleteMeeting(id) {
                operations.push(["store-delete", id]);
            },
        },
        profileStore: {
            async getProfileByHandle(handle) {
                return { accountId: `account-${handle}` };
            },
        },
        profileIdentity: profileIdentityFake,
        requireAuth: () => ({ sub: requesterAccountId, role: "user" }),
        readJson: async (request) => request.body,
        sendJson: (response, status, body) =>
            Object.assign(response, { status, body }),
        sendError: (response, status, code) =>
            Object.assign(response, { status, body: { error: { code } } }),
        resolveMeetingPayload: async () => ({
            meeting: {
                id: "meeting-1",
                createdBy: "alice",
                chatRoomId: "room-1",
                ...meeting,
            },
            requesterUsername,
            participants,
            state,
        }),
        groupChatMembership: {
            async remove(input) {
                operations.push(["chat-member-remove", input]);
            },
        },
        resolveWhiteboardMembership: () => ({
            async remove(input) {
                operations.push(["board-member-remove", input]);
            },
        }),
        resolveWhiteboardDeletion: () => async (input) => {
            operations.push(["board-delete", input]);
        },
        fetchBoardData: async () => ({ createdBy: "alice" }),
        deleteChatRoom: async (input) =>
            operations.push(["chat-delete", input]),
        deleteResourceShares: async (input) =>
            operations.push(["shares-delete", input]),
    });
    return {
        handler: handlers.get(
            "/api/v1/modules/jitsi-meet/meetings/persisted/leave",
        ),
        operations,
    };
}

test("leaving a previous meeting removes only the requesting member", async () => {
    const { handler, operations } = createHarness({
        participants: ["alice", "bob"],
        requesterUsername: "bob",
        state: { whiteboardId: "board-1", whiteboardDisposable: false },
    });
    const response = {};
    await handler({ body: { meetingId: "meeting-1" } }, response);

    assert.equal(response.status, 200);
    assert.deepEqual(
        operations.map(([operation]) => operation),
        ["chat-member-remove", "board-member-remove", "store-remove"],
    );
});

test("an owner can leave while retaining resources needed by remaining members", async () => {
    const { handler, operations } = createHarness({
        participants: ["alice", "bob"],
        state: { whiteboardId: "board-1", whiteboardDisposable: false },
    });
    const response = {};
    await handler({ body: { meetingId: "meeting-1" } }, response);

    assert.equal(response.status, 200);
    assert.deepEqual(operations, [["store-remove", "meeting-1", "alice"]]);
});

test("the final departure deletes every persisted meeting resource", async () => {
    const { handler, operations } = createHarness({
        participants: ["alice"],
        state: { whiteboardId: "board-1", whiteboardDisposable: false },
    });
    const response = {};
    await handler({ body: { meetingId: "meeting-1" } }, response);

    assert.equal(response.status, 200);
    assert.deepEqual(
        operations.map(([operation]) => operation),
        ["board-delete", "chat-delete", "shares-delete", "store-delete"],
    );
});
