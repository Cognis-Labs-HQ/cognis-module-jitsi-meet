import test from "node:test";
import assert from "node:assert/strict";
import {
    deleteDisposableMeeting,
    registerMeetingLifecycleRoutes,
} from "../meeting-lifecycle-routes.js";
import { profileIdentityFake } from "./profile-identity-fake.js";

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

test("disposable meeting deletion removes its owned chatroom", async () => {
    const operations = [];
    const meeting = { id: "meeting-1", chatRoomId: "chat-1" };

    await deleteDisposableMeeting({
        meeting,
        ownerAccountId: "account-1",
        deleteResourceShares: async (input) => {
            operations.push(["delete_shares", input]);
        },
        deleteChatroom: async (input) => {
            operations.push(["delete_chatroom", input]);
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
        ["delete_chatroom", { roomId: "chat-1", actorAccountId: "account-1" }],
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
                chatRoomPreserved: false,
                ownerAccountId: "account-1",
            },
        ],
    ]);
});

test("VoIP-style disposable meeting deletion preserves its source chatroom", async () => {
    const operations = [];

    await deleteDisposableMeeting({
        meeting: { id: "meeting-1", chatRoomId: "pm-room-1" },
        ownerAccountId: "account-1",
        preserveChatroom: true,
        deleteResourceShares: async (input) => {
            operations.push(["delete_shares", input]);
        },
        deleteChatroom: async () => {
            assert.fail("the source chatroom must not be deleted");
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
        ["delete_meeting", "meeting-1"],
        [
            "log",
            "info",
            "Disposable meeting data deleted.",
            {
                component: "jitsi-meet-module",
                operation: "delete_disposable_meeting",
                meetingId: "meeting-1",
                chatRoomId: "pm-room-1",
                chatRoomPreserved: true,
                ownerAccountId: "account-1",
            },
        ],
    ]);
});

test("VoIP call creation derives participants from authorized room membership", async () => {
    const handlers = new Map();
    const createdMeetings = [];
    const requestedMemberships = [];
    const payloadRequests = [];
    registerMeetingLifecycleRoutes({
        router: { post: (path, handler) => handlers.set(path, handler) },
        store: {
            async ensureSchema() {},
            async getMeetingByChatRoomId() {
                return null;
            },
            async getConfig() {
                return { instanceUrl: "https://meet.example.com" };
            },
            async createMeeting(input) {
                createdMeetings.push(input);
                return { id: "meeting-1", disposable: true };
            },
            async getMeetingState() {
                return {};
            },
            async listParticipants() {
                return ["alice", "bob"];
            },
        },
        requireAuth: () => ({ sub: "account-alice", role: "user" }),
        readJson: async (req) => req.body,
        sendJson: (res, status, body) => {
            res.writeHead(status);
            res.end(JSON.stringify(body));
        },
        sendError: () => assert.fail("authorized VoIP call was rejected"),
        profileStore: {
            async getProfile(accountId) {
                return { handle: accountId.replace("account-", "") };
            },
        },
        resolveRoomMembership: async (input) => {
            requestedMemberships.push(input);
            return {
                authorized: true,
                memberAccountIds: ["account-alice", "account-bob"],
            };
        },
        resolveRequesterUsername: async () => "alice",
        normalizeHandleKey: (handle) => handle,
        createMeetingPayload: async (input) => {
            payloadRequests.push(input);
            return input.meeting;
        },
        log: () => {},
    });

    const response = createRecorder();
    await handlers.get("/api/v1/modules/jitsi-meet/meetings/voip-call")(
        {
            body: {
                roomId: "room-1",
                memberAccountIds: ["account-alice", "account-mallory"],
            },
        },
        response,
    );

    assert.equal(response.status, 200);
    assert.deepEqual(requestedMemberships, [
        { roomId: "room-1", requesterAccountId: "account-alice" },
    ]);
    assert.deepEqual(createdMeetings[0].usernames, ["alice", "bob"]);
    assert.equal(createdMeetings[0].chatRoomId, "room-1");
    assert.equal(payloadRequests[0].includeChatRoom, false);
});

test("meeting creation provisions a share-ready participant-free chat", async () => {
    const handlers = new Map();
    const chatRequests = [];
    const meetingCreationRequests = [];
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
        async createMeeting(request) {
            meetingCreationRequests.push(request);
            return meeting;
        },
        async setMeetingChatRoomId(meetingId, chatRoomId) {
            assert.equal(meetingId, meeting.id);
            meeting.chatRoomId = chatRoomId;
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
        { body: { participants: [], forceNew: true } },
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
    assert.equal(meetingCreationRequests[0].forceNew, true);

    meeting.chatRoomId = "missing-chat";
    const recreateResponse = createRecorder();
    await handlers.get("/api/v1/modules/jitsi-meet/meetings/create")(
        { body: { participants: [], forceNew: false } },
        recreateResponse,
    );
    assert.equal(recreateResponse.status, 200);
    assert.equal(chatRequests.length, 2);
    assert.equal(recreateResponse.body.data.chatRoomId, "chat-1");
});

test("active non-disposable meetings invite a newly dropped participant", async () => {
    const handlers = new Map();
    const notifications = [];
    const additions = [];
    const chatResolutions = [];
    const chatMemberAdditions = [];
    const chatMemberRemovals = [];
    const whiteboardMembershipAdditions = [];
    const whiteboardMembershipRemovals = [];
    const approvals = [];
    let approvalApproved = true;
    let whiteboardMembershipFails = false;
    let participantPersistenceFails = false;
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
                if (participantPersistenceFails) {
                    throw new Error("Database unavailable");
                }
                return { ...meeting, chatRoomId: options.chatRoomId };
            },
            async listReservedParticipantUsernames() {
                return [];
            },
            async listPresence() {
                return [{ username: "alice" }, { username: "bob" }];
            },
            filterCurrentPresenceEntries(presence) {
                return presence;
            },
        },
        requireAuth: () => ({ sub: "account-alice", role: "user" }),
        readJson: async (req) => req.body,
        sendJson: (res, status, body) => {
            res.writeHead(status);
            res.end(JSON.stringify(body));
        },
        sendError: (res, status, code, message) => {
            res.writeHead(status);
            res.end(JSON.stringify({ error: { code, message } }));
        },
        profileStore: {
            async getProfileByHandle(handle) {
                return { accountId: `account-${handle}`, handle };
            },
        },
        resolveMeetingPayload: async () => ({
            meeting,
            requesterUsername: "alice",
            participants: ["alice", "bob"],
            state: {
                firstJoinedAt: "2026-08-29T10:00:00.000Z",
                endedAt: null,
                whiteboardId: "board-1",
                whiteboardDisposable: false,
            },
        }),
        resolveRequestedParticipants: async () => ["carol"],
        hasMinRole: () => false,
        resolveGroupChat: async (request) => {
            chatResolutions.push(request);
            return {
                roomId: request.roomId,
                url: `/messages/${request.roomId}`,
                usernames: request.usernames,
            };
        },
        groupChatMembership: {
            add: async (request) => chatMemberAdditions.push(request),
            remove: async (request) => chatMemberRemovals.push(request),
        },
        resolveWhiteboardMembership: () => ({
            add: async (request) => {
                if (whiteboardMembershipFails) {
                    throw new Error("Whiteboard unavailable");
                }
                whiteboardMembershipAdditions.push(request);
            },
            remove: async (request) => {
                whiteboardMembershipRemovals.push(request);
            },
        }),
        fetchBoardData: async () => ({
            id: "board-1",
            createdBy: "canvas-owner",
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
        requestParticipantAdditionApproval: async (input) => {
            approvals.push(input);
            return { approved: approvalApproved };
        },
        normalizeHandleKey: (handle) =>
            profileIdentityFake.normalizeHandleKey(handle),
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
            options: { chatRoomId: "chat-old" },
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
    assert.deepEqual(chatResolutions, []);
    assert.deepEqual(chatMemberAdditions, [
        {
            roomId: "chat-old",
            actorAccountId: "account-alice",
            userAccountId: "account-carol",
        },
    ]);
    assert.deepEqual(whiteboardMembershipAdditions, [
        {
            whiteboardId: "board-1",
            actorAccountId: "account-canvas-owner",
            userAccountId: "account-carol",
        },
    ]);
    assert.deepEqual(approvals, [
        {
            meetingId: "meeting-1",
            meetingName: "Bright-Otters-Meet-Safely",
            participantUsername: "carol",
            requesterAccountId: "account-alice",
            requesterDisplayName: "alice",
        },
    ]);

    approvalApproved = false;
    const declinedResponse = createRecorder();
    await handlers.get("/api/v1/modules/jitsi-meet/meetings/participants/add")(
        { body: { meetingId: meeting.id, username: "dave" } },
        declinedResponse,
    );
    assert.equal(declinedResponse.status, 409);
    assert.equal(
        declinedResponse.body.error.code,
        "participant_addition_declined",
    );
    assert.equal(additions.length, 1);

    approvalApproved = true;
    whiteboardMembershipFails = true;
    const failedWhiteboardResponse = createRecorder();
    await handlers.get("/api/v1/modules/jitsi-meet/meetings/participants/add")(
        { body: { meetingId: meeting.id, username: "erin" } },
        failedWhiteboardResponse,
    );
    assert.equal(failedWhiteboardResponse.status, 503);
    assert.equal(additions.length, 1);
    assert.deepEqual(chatMemberRemovals, [
        {
            roomId: "chat-old",
            actorAccountId: "account-alice",
            userAccountId: "account-carol",
        },
    ]);

    whiteboardMembershipFails = false;
    participantPersistenceFails = true;
    const failedPersistenceResponse = createRecorder();
    await handlers.get("/api/v1/modules/jitsi-meet/meetings/participants/add")(
        { body: { meetingId: meeting.id, username: "frank" } },
        failedPersistenceResponse,
    );
    assert.equal(failedPersistenceResponse.status, 503);
    assert.equal(
        failedPersistenceResponse.body.error.code,
        "meeting_update_unavailable",
    );
    assert.deepEqual(whiteboardMembershipRemovals, [
        {
            whiteboardId: "board-1",
            actorAccountId: "account-canvas-owner",
            userAccountId: "account-carol",
        },
    ]);
    assert.equal(chatMemberRemovals.length, 2);
});

test("a kicked account participant leaves only module-owned meeting resources", async () => {
    const handlers = new Map();
    const operations = [];
    let meetingDisposable = false;
    registerMeetingLifecycleRoutes({
        router: { post: (path, handler) => handlers.set(path, handler) },
        store: {
            async ensureSchema() {},
            async removeMeetingParticipant(meetingId, username) {
                operations.push(["remove", meetingId, username]);
            },
            async setUserSessionsInactive(meetingId, username) {
                operations.push(["inactive", meetingId, username]);
            },
        },
        requireAuth: () => ({ sub: "account-bob", role: "user" }),
        readJson: async (req) => req.body,
        sendJson: (res, status, body) => {
            res.writeHead(status);
            res.end(JSON.stringify(body));
        },
        sendError: () => assert.fail("kick report was rejected"),
        resolveShareGuestMeetingAccess: async () => ({ isGuest: false }),
        resolveMeetingPayload: async () => ({
            meeting: {
                id: "meeting-1",
                meetingName: "Bright-Otters-Meet-Safely",
                chatRoomId: "chat-1",
                createdBy: "alice",
                disposable: meetingDisposable,
            },
            requesterUsername: "bob",
            participants: ["alice", "bob"],
            state: {
                whiteboardId: "board-1",
                whiteboardDisposable: false,
            },
        }),
        profileStore: {
            async getProfileByHandle(handle) {
                return { accountId: `account-${handle}`, handle };
            },
        },
        resolveGroupChat: async (request) => {
            operations.push(["chat", request.roomId, request.usernames]);
            return { roomId: request.roomId };
        },
        groupChatMembership: {
            add: async () => {},
            remove: async (request) =>
                operations.push([
                    "chat",
                    request.roomId,
                    request.userAccountId,
                ]),
        },
        resolveWhiteboardMembership: () => ({
            remove: async (request) =>
                operations.push([
                    "whiteboard",
                    request.whiteboardId,
                    request.actorAccountId,
                    request.userAccountId,
                ]),
        }),
        fetchBoardData: async () => ({
            id: "board-1",
            createdBy: "alice",
        }),
        buildMeetingChatTitle: (name) => name,
        log: () => {},
    });
    const response = createRecorder();
    await handlers.get(
        "/api/v1/modules/jitsi-meet/meetings/participants/kicked",
    )({ body: { meetingId: "meeting-1" } }, response);
    assert.equal(response.status, 200);
    assert.deepEqual(operations, [
        ["chat", "chat-1", "account-bob"],
        ["whiteboard", "board-1", "account-alice", "account-bob"],
        ["remove", "meeting-1", "bob"],
        ["inactive", "meeting-1", "bob"],
    ]);

    operations.length = 0;
    meetingDisposable = true;
    const disposableResponse = createRecorder();
    await handlers.get(
        "/api/v1/modules/jitsi-meet/meetings/participants/kicked",
    )({ body: { meetingId: "meeting-1" } }, disposableResponse);
    assert.equal(disposableResponse.status, 200);
    assert.deepEqual(operations, [
        ["whiteboard", "board-1", "account-alice", "account-bob"],
        ["remove", "meeting-1", "bob"],
        ["inactive", "meeting-1", "bob"],
    ]);
});

test("a kicked guest invalidates the share link used to join", async () => {
    const handlers = new Map();
    const revocations = [];
    registerMeetingLifecycleRoutes({
        router: { post: (path, handler) => handlers.set(path, handler) },
        store: {
            async ensureSchema() {},
            async setUserSessionsInactive(meetingId, username) {
                revocations.push({ inactive: [meetingId, username] });
            },
        },
        requireAuth: () => ({ sub: "share:link-1:guest-1", role: "user" }),
        readJson: async (req) => req.body,
        sendJson: (res, status, body) => {
            res.writeHead(status);
            res.end(JSON.stringify(body));
        },
        sendError: () => assert.fail("guest kick report was rejected"),
        resolveShareGuestMeetingAccess: async () => ({
            isGuest: true,
            allowed: true,
        }),
        resolveShareGuestPresenceUsername: () => "guest:guest-1",
        revokeKickedGuestShare: async (input) => {
            revocations.push(input);
            return true;
        },
        log: () => {},
    });
    const response = createRecorder();
    await handlers.get(
        "/api/v1/modules/jitsi-meet/meetings/participants/kicked",
    )({ body: { meetingId: "meeting-1" } }, response);
    assert.equal(response.status, 200);
    assert.deepEqual(revocations, [
        {
            claims: { sub: "share:link-1:guest-1", role: "user" },
            meetingId: "meeting-1",
        },
        { inactive: ["meeting-1", "guest:guest-1"] },
    ]);
});
