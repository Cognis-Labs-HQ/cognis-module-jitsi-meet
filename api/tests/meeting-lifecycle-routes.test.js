import test from "node:test";
import assert from "node:assert/strict";
import {
    deleteDisposableMeeting,
    registerMeetingLifecycleRoutes,
} from "../meeting-lifecycle-routes.js";

function createRecorder() {
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

test("disposable meeting deletion erases its creator's associated chat", async () => {
    const operations = [];
    const meeting = { id: "meeting-1", chatRoomId: "chat-1" };

    await deleteDisposableMeeting({
        meeting,
        ownerAccountId: "account-1",
        deleteResourceShares: async (input) => {
            operations.push(["delete_shares", input]);
        },
        deleteChatRoom: async (input) => {
            operations.push(["delete_chat", input]);
        },
        store: {
            deleteMeeting: async (meetingId) => {
                operations.push(["delete_meeting", meetingId]);
            },
        },
        log: (level, message, metadata) => {
            operations.push(["log", level, message, metadata]);
        },
    });

    assert.deepEqual(operations, [
        [
            "delete_shares",
            {
                ownerAccountId: "account-1",
                resourceType: "meeting",
                resourceId: "meeting-1",
            },
        ],
        ["delete_chat", { roomId: "chat-1", ownerAccountId: "account-1" }],
        ["delete_meeting", "meeting-1"],
        [
            "log",
            "info",
            "Disposable meeting data deleted.",
            {
                component: "jitsi-meet-module",
                operation: "delete_disposable_meeting",
                meetingId: "meeting-1",
                chatRoomId: "chat-1",
                ownerAccountId: "account-1",
            },
        ],
    ]);
});

test("a chat deletion failure preserves the disposable meeting record", async () => {
    const deletedMeetingIds = [];
    const logs = [];

    await assert.rejects(
        deleteDisposableMeeting({
            meeting: { id: "meeting-1", chatRoomId: "chat-1" },
            ownerAccountId: "account-1",
            deleteChatRoom: async () => {
                throw new Error("messages unavailable");
            },
            store: {
                deleteMeeting: async (meetingId) => {
                    deletedMeetingIds.push(meetingId);
                },
            },
            log: (...entry) => logs.push(entry),
        }),
        /messages unavailable/,
    );

    assert.deepEqual(deletedMeetingIds, []);
    assert.equal(logs[0][0], "error");
    assert.equal(logs[0][2].operation, "delete_disposable_meeting_chat");
    assert.equal(logs[0][2].meetingId, "meeting-1");
    assert.equal(logs[0][2].chatRoomId, "chat-1");
});

test("meeting creation provisions a share-ready participant-free chat", async () => {
    const handlers = new Map();
    const chatRequests = [];
    const meeting = {
        id: "meeting-1",
        meetingName: "Bright-Otters-Meet-Safely",
        roomSlug: "Bright-Otters-Meet-Safely",
        chatRoomId: null,
        classroomId: null,
        createdBy: "alice",
        scheduledAt: "2026-08-28T18:30:00.000Z",
    };
    const store = {
        async ensureSchema() {},
        async getConfig() {
            return { instanceUrl: "https://meet.example.com" };
        },
        normalizeMeetingCreationInput({ creatorUsername }) {
            return {
                participantUsernames: [creatorUsername],
                classroomId: null,
            };
        },
        async createMeeting({ chatRoomId }) {
            if (chatRoomId) meeting.chatRoomId = chatRoomId;
            return meeting;
        },
        async listParticipants() {
            return ["alice"];
        },
        async getMeetingState() {
            return {};
        },
    };
    registerMeetingLifecycleRoutes({
        router: { post: (path, handler) => handlers.set(path, handler) },
        store,
        requireAuth: () => ({ sub: "account-alice", role: "user" }),
        readJson: async (req) => req.body ?? { participants: [] },
        sendJson: (res, status, body) => {
            res.writeHead(status);
            res.end(JSON.stringify(body));
        },
        sendError: () => assert.fail("meeting lifecycle returned an error"),
        profileStore: {},
        resolveRequesterUsername: async () => "alice",
        resolveRequestedParticipants: async () => [],
        resolveMeetingPayload: async () => ({
            meeting,
            requesterUsername: "alice",
        }),
        hasMinRole: () => false,
        resolveGroupChat: async (request) => {
            chatRequests.push(request);
            return { roomId: "chat-1", url: "/messages/chat-1" };
        },
        buildMeetingChatTitle: (name) => name,
        createMeetingPayload: async ({ meeting: createdMeeting, chatUrl }) => ({
            ...createdMeeting,
            chatUrl,
        }),
        dispatchMeetingNotifications: async () => {},
        log: () => {},
    });
    const createResponse = createRecorder();
    await handlers.get("/api/v1/modules/jitsi-meet/meetings/create")(
        { body: { participants: [] } },
        createResponse,
    );
    assert.equal(createResponse.status, 200);
    assert.equal(chatRequests.length, 1);
    assert.deepEqual(chatRequests[0].usernames, ["alice"]);
    assert.equal(chatRequests[0].allowSingleMember, true);
    assert.equal(chatRequests[0].title, "Bright-Otters-Meet-Safely");
    assert.equal(
        createResponse.body.data.meetingName,
        "Bright-Otters-Meet-Safely",
    );
    assert.equal(createResponse.body.data.chatRoomId, "chat-1");
    assert.equal(createResponse.body.data.chatUrl, "/messages/chat-1");
});

test("active non-disposable meetings invite a newly dropped participant", async () => {
    const handlers = new Map();
    const notifications = [];
    const additions = [];
    const meeting = {
        id: "meeting-1",
        meetingName: "Bright-Otters-Meet-Safely",
        chatRoomId: "chat-old",
        createdBy: "alice",
    };
    registerMeetingLifecycleRoutes({
        router: { post: (path, handler) => handlers.set(path, handler) },
        store: {
            async ensureSchema() {},
            async addMeetingParticipant(meetingId, username, options) {
                additions.push({ meetingId, username, options });
                return { ...meeting, chatRoomId: options.chatRoomId };
            },
        },
        requireAuth: () => ({ sub: "account-alice", role: "user" }),
        readJson: async (req) => req.body,
        sendJson: (res, status, body) => {
            res.writeHead(status);
            res.end(JSON.stringify(body));
        },
        sendError: () => assert.fail("active meeting invitation was rejected"),
        profileStore: {},
        resolveMeetingPayload: async () => ({
            meeting,
            requesterUsername: "alice",
            participants: ["alice", "bob"],
            state: {
                firstJoinedAt: "2026-08-29T10:00:00.000Z",
                endedAt: null,
            },
        }),
        resolveRequestedParticipants: async () => ["carol"],
        hasMinRole: () => false,
        resolveGroupChat: async ({ usernames }) => ({
            roomId: "chat-expanded",
            url: "/messages/chat-expanded",
            usernames,
        }),
        buildMeetingChatTitle: (name) => name,
        createMeetingPayload: async (input) => ({
            ...input.meeting,
            participants: input.participants,
            meetingPassword: "",
            chatUrl: input.chatUrl,
        }),
        dispatchMeetingNotifications: async (...args) =>
            notifications.push(args),
        log: () => {},
    });

    const response = createRecorder();
    await handlers.get("/api/v1/modules/jitsi-meet/meetings/participants/add")(
        { body: { meetingId: meeting.id, username: "carol" } },
        response,
    );

    assert.equal(response.status, 200);
    assert.deepEqual(additions, [
        {
            meetingId: "meeting-1",
            username: "carol",
            options: { chatRoomId: "chat-expanded" },
        },
    ]);
    assert.deepEqual(response.body.data.participants, [
        "alice",
        "bob",
        "carol",
    ]);
    assert.equal(response.body.data.meetingPassword, "");
    assert.equal(notifications[0][0][0], "carol");
    assert.equal(notifications[0][1].metadata.event, "meeting_invited");
});
