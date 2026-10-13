import test from "node:test";
import assert from "node:assert/strict";
import { registerMeetingLifecycleRoutes } from "../routes/meeting-lifecycle/index.js";

function createResponse() {
    return {
        status: 0,
        body: null,
        writeHead(status) {
            this.status = status;
        },
        end(body) {
            this.body = body ? JSON.parse(body) : null;
        },
    };
}

function registerJoinHandler({
    addMembership,
    operations,
    logs = [],
    activeMeetings = [],
    whiteboardState = {},
    addWhiteboardMembership = async () => {},
}) {
    const handlers = new Map();
    const meeting = {
        id: "meeting-1",
        chatRoomId: "room-1",
        createdBy: "alice",
    };
    registerMeetingLifecycleRoutes({
        router: { post: (path, handler) => handlers.set(path, handler) },
        store: {
            async ensureSchema() {},
            async listActiveMeetings() {
                return activeMeetings;
            },
            async setUserSessionsInactive(meetingId, username) {
                operations.push(`inactive:${meetingId}:${username}`);
            },
            async getActiveSessionsForUser() {
                return [];
            },
            async upsertPresence() {
                operations.push("presence");
            },
            async claimMeetingPassword() {
                return "meeting-password";
            },
        },
        requireAuth: () => ({ sub: "account-bob", role: "user" }),
        readJson: async (request) => request.body,
        sendJson: (response, status, body) => {
            response.writeHead(status);
            response.end(JSON.stringify(body));
        },
        sendError: (response, status, code, message) => {
            response.writeHead(status);
            response.end(JSON.stringify({ error: { code, message } }));
        },
        profileStore: {
            getProfileByHandle: async (handle) => ({
                accountId: `account-${handle}`,
            }),
        },
        fetchBoardData: async () => ({ id: "board-1", createdBy: "alice" }),
        resolveWhiteboardMembership: () => ({ add: addWhiteboardMembership }),
        resolveShareGuestMeetingAccess: async () => ({ isGuest: false }),
        resolveMeetingPayload: async () => ({
            meeting,
            requesterUsername: "bob",
            participants: ["alice", "bob"],
            state: {
                firstJoinedBy: "alice",
                firstJoinedAt: "2026-09-01T10:00:00.000Z",
                endedAt: null,
                ...whiteboardState,
            },
        }),
        listClassroomParticipantHandles: async () => [],
        groupChatMembership: {
            add: addMembership,
            remove: async () => {},
        },
        createMeetingPayload: async (input) => {
            operations.push("payload");
            return input;
        },
        resolveModeratorUsernames: async () => [],
        dispatchMeetingNotifications: async () => {},
        log: (...entry) => logs.push(entry),
    });
    return handlers.get("/api/v1/modules/jitsi-meet/meetings/join");
}

test("joining a meeting restores an archived chat membership before chat loading", async () => {
    const operations = [];
    const membershipRequests = [];
    const handler = registerJoinHandler({
        operations,
        addMembership: async (input) => {
            membershipRequests.push(input);
            operations.push("membership");
        },
    });
    const response = createResponse();

    await handler(
        { body: { meetingId: "meeting-1", sessionId: "session-1" } },
        response,
    );

    assert.equal(response.status, 200);
    assert.deepEqual(membershipRequests, [
        {
            roomId: "room-1",
            actorAccountId: "account-bob",
            userAccountId: "account-bob",
        },
    ]);
    assert.deepEqual(operations, ["membership", "presence", "payload"]);
});

test("joining deactivates the account's presence in another meeting", async () => {
    const operations = [];
    const handler = registerJoinHandler({
        operations,
        activeMeetings: [
            {
                id: "older-meeting",
                activeUsernames: ["bob"],
            },
        ],
        addMembership: async () => {
            operations.push("membership");
        },
    });
    const response = createResponse();

    await handler(
        { body: { meetingId: "meeting-1", sessionId: "session-1" } },
        response,
    );

    assert.equal(response.status, 200);
    assert.deepEqual(operations, [
        "membership",
        "inactive:older-meeting:bob",
        "presence",
        "payload",
    ]);
});

test("joining fails safely when chat membership cannot be restored", async () => {
    const operations = [];
    const logs = [];
    const handler = registerJoinHandler({
        operations,
        logs,
        addMembership: async () => {
            throw new Error("messages unavailable");
        },
    });
    const response = createResponse();

    await handler(
        { body: { meetingId: "meeting-1", sessionId: "session-1" } },
        response,
    );

    assert.equal(response.status, 503);
    assert.equal(response.body.error.code, "chat_membership_unavailable");
    assert.deepEqual(operations, []);
    assert.equal(logs[0][0], "error");
    assert.equal(logs[0][2].operation, "restore_joining_participant_chat");
});

test("join grants canonical Whiteboard membership before publishing open state, even without chat", async () => {
    const operations = [];
    const memberships = [];
    const handler = registerJoinHandler({
        operations,
        addMembership: () => assert.fail("Chat is disabled for this join"),
        whiteboardState: {
            whiteboardActive: true,
            whiteboardId: "board-1",
            whiteboardDisposable: false,
        },
        addWhiteboardMembership: async (input) => {
            memberships.push(input);
            operations.push("whiteboard");
        },
    });
    const response = createResponse();
    await handler(
        {
            body: {
                meetingId: "meeting-1",
                sessionId: "session-1",
                includeChat: false,
            },
        },
        response,
    );
    assert.equal(response.status, 200);
    assert.deepEqual(memberships, [
        {
            whiteboardId: "board-1",
            actorAccountId: "account-alice",
            userAccountId: "account-bob",
        },
    ]);
    assert.deepEqual(operations, ["whiteboard", "presence", "payload"]);
});

test("membership failure stops an open Whiteboard join before presence and payload", async () => {
    const operations = [];
    const logs = [];
    const handler = registerJoinHandler({
        operations,
        logs,
        whiteboardState: {
            whiteboardActive: true,
            whiteboardId: "board-1",
            whiteboardDisposable: false,
        },
        addWhiteboardMembership: async () => {
            throw new Error("provider unavailable");
        },
    });
    const response = createResponse();
    await handler(
        {
            body: {
                meetingId: "meeting-1",
                sessionId: "session-1",
                includeChat: false,
            },
        },
        response,
    );
    assert.equal(response.status, 503);
    assert.equal(response.body.error.code, "whiteboard_membership_unavailable");
    assert.deepEqual(operations, []);
    assert.equal(
        logs[0][2].operation,
        "restore_joining_participant_whiteboard",
    );
});

test("a stored but closed Whiteboard does not make an optional provider a join dependency", async () => {
    const operations = [];
    const handler = registerJoinHandler({
        operations,
        whiteboardState: {
            whiteboardActive: false,
            whiteboardId: "board-1",
            whiteboardDisposable: false,
        },
        addWhiteboardMembership: () =>
            assert.fail("Closed board access should not gate joining"),
    });
    const response = createResponse();
    await handler(
        {
            body: {
                meetingId: "meeting-1",
                sessionId: "session-1",
                includeChat: false,
            },
        },
        response,
    );
    assert.equal(response.status, 200);
    assert.deepEqual(operations, ["presence", "payload"]);
});
