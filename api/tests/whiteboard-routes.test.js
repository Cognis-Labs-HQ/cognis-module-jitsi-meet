import test from "node:test";
import assert from "node:assert/strict";
import { registerMeetingWhiteboardRoutes } from "../whiteboard-routes.js";

function createRecorder() {
    return {
        status: 0,
        body: null,
        writeHead(status) {
            this.status = status;
        },
        end(body) {
            this.body = JSON.parse(body);
        },
    };
}

function createRoutes({
    authorized = true,
    requesterUsername = "alice",
    organizerUsername = "alice",
    participants = ["alice"],
    presence = [],
    state = { whiteboardOpenVotes: [] },
    claims = { sub: "account-alice" },
    guestAllowed = false,
} = {}) {
    const handlers = new Map();
    const stateUpdates = [];
    registerMeetingWhiteboardRoutes({
        router: {
            post(path, handler) {
                handlers.set(`POST ${path}`, handler);
            },
        },
        ctx: { log() {} },
        store: {
            async ensureSchema() {},
            async getMeetingById(id) {
                return {
                    id,
                    meetingName: "Planning",
                    createdBy: organizerUsername,
                };
            },
            async getMeetingState() {
                return state;
            },
            async listPresence() {
                return presence;
            },
            async listParticipants() {
                return participants;
            },
            filterCurrentPresenceEntries(entries) {
                return entries;
            },
            async updateMeetingState(meetingId, update) {
                stateUpdates.push({ meetingId, update });
            },
        },
        profileStore: {
            async getProfile() {
                return { handle: requesterUsername };
            },
        },
        requireAuth: () => claims,
        readJson: async (req) => req.body,
        sendJson(res, status, body) {
            res.writeHead(status);
            res.end(JSON.stringify(body));
        },
        sendError(res, status, code, message) {
            res.writeHead(status);
            res.end(JSON.stringify({ error: { code, message } }));
        },
        canAccessMeeting: async () => authorized,
        resolveShareGuestMeetingAccess: async () => ({
            isGuest: String(claims.sub).startsWith("share:"),
            allowed: guestAllowed,
        }),
        resolveShareGuestPresenceUsername: () =>
            String(claims.sub).startsWith("share:")
                ? `guest:${String(claims.sub).split(":")[1]}`
                : "",
        listClassroomParticipantHandles: async () => [],
    });
    return { handlers, stateUpdates };
}

test("meeting share guests synchronize the mapped state with their stable presence identity", async () => {
    const state = {
        whiteboardId: "board-1",
        whiteboardDisposable: false,
        whiteboardOpenVotes: [],
    };
    const routes = createRoutes({
        claims: { sub: "share:share-17:guest-session-4" },
        guestAllowed: true,
        organizerUsername: "alice",
        presence: [
            { username: "guest:share-17" },
            { username: "guest:another-share" },
        ],
        state,
    });
    const response = createRecorder();

    await routes.handlers.get(
        "POST /api/v1/modules/jitsi-meet/whiteboard/state",
    )(
        {
            body: {
                meetingId: "meeting-1",
                whiteboardId: "board-1",
                disposable: false,
                active: true,
            },
        },
        response,
    );

    assert.equal(response.status, 200);
    assert.equal(response.body.data.pendingConsensus, true);
    assert.deepEqual(routes.stateUpdates[0].update.whiteboardOpenVotes, [
        "guest:share-17",
    ]);
});

test("meeting share guests cannot create or replace a whiteboard mapping", async () => {
    for (const state of [
        { whiteboardOpenVotes: [] },
        {
            whiteboardId: "board-1",
            whiteboardDisposable: false,
            whiteboardOpenVotes: [],
        },
    ]) {
        const routes = createRoutes({
            claims: { sub: "share:share-17:guest-session-4" },
            guestAllowed: true,
            state,
        });
        const response = createRecorder();

        await routes.handlers.get(
            "POST /api/v1/modules/jitsi-meet/whiteboard/state",
        )(
            {
                body: {
                    meetingId: "meeting-1",
                    whiteboardId: "board-2",
                    disposable: false,
                    active: true,
                },
            },
            response,
        );

        assert.equal(response.status, 403);
        assert.equal(response.body.error.code, "forbidden");
        assert.equal(routes.stateUpdates.length, 0);
    }
});

test("meeting share guest tokens cannot update another meeting", async () => {
    const routes = createRoutes({
        claims: { sub: "share:share-17:guest-session-4" },
        guestAllowed: false,
    });
    const response = createRecorder();

    await routes.handlers.get(
        "POST /api/v1/modules/jitsi-meet/whiteboard/state",
    )(
        {
            body: {
                meetingId: "meeting-1",
                whiteboardId: "board-1",
                disposable: false,
                active: true,
            },
        },
        response,
    );

    assert.equal(response.status, 403);
    assert.equal(response.body.error.code, "forbidden");
    assert.equal(routes.stateUpdates.length, 0);
});

test("meeting participants can synchronize a provider-created whiteboard", async () => {
    const routes = createRoutes();
    const response = createRecorder();
    await routes.handlers.get(
        "POST /api/v1/modules/jitsi-meet/whiteboard/state",
    )(
        {
            body: {
                meetingId: "meeting-1",
                whiteboardId: "board-1",
                disposable: false,
                active: true,
            },
        },
        response,
    );
    assert.equal(response.status, 200);
    assert.deepEqual(response.body.data, {
        whiteboardId: "board-1",
        whiteboardDisposable: false,
        whiteboardOpen: true,
        pendingConsensus: false,
        voteCount: 0,
        votesRequired: 0,
    });
    assert.deepEqual(routes.stateUpdates, [
        {
            meetingId: "meeting-1",
            update: {
                whiteboardId: "board-1",
                whiteboardDisposable: false,
                whiteboardActive: true,
                whiteboardOpenVotes: [],
            },
        },
    ]);
});

test("meeting whiteboard state rejects malformed and unauthorized requests", async () => {
    const malformed = createRoutes();
    const malformedResponse = createRecorder();
    await malformed.handlers.get(
        "POST /api/v1/modules/jitsi-meet/whiteboard/state",
    )({ body: { meetingId: "meeting-1", active: true } }, malformedResponse);
    assert.equal(malformedResponse.status, 400);
    assert.equal(malformed.stateUpdates.length, 0);

    for (const active of [undefined, "true", 1, null]) {
        const invalidActive = createRoutes();
        const invalidActiveResponse = createRecorder();
        await invalidActive.handlers.get(
            "POST /api/v1/modules/jitsi-meet/whiteboard/state",
        )(
            {
                body: {
                    meetingId: "meeting-1",
                    whiteboardId: "board-1",
                    disposable: false,
                    active,
                },
            },
            invalidActiveResponse,
        );
        assert.equal(invalidActiveResponse.status, 400);
        assert.equal(invalidActive.stateUpdates.length, 0);
    }

    const forbidden = createRoutes({ authorized: false });
    const forbiddenResponse = createRecorder();
    await forbidden.handlers.get(
        "POST /api/v1/modules/jitsi-meet/whiteboard/state",
    )(
        {
            body: {
                meetingId: "meeting-1",
                whiteboardId: "board-1",
                disposable: false,
                active: true,
            },
        },
        forbiddenResponse,
    );
    assert.equal(forbiddenResponse.status, 403);
    assert.equal(forbidden.stateUpdates.length, 0);
});

test("closing a meeting whiteboard synchronizes the default view", async () => {
    const routes = createRoutes();
    const response = createRecorder();
    await routes.handlers.get(
        "POST /api/v1/modules/jitsi-meet/whiteboard/state",
    )({ body: { meetingId: "meeting-1", active: false } }, response);
    assert.equal(response.status, 200);
    assert.deepEqual(routes.stateUpdates, [
        {
            meetingId: "meeting-1",
            update: { whiteboardActive: false, whiteboardOpenVotes: [] },
        },
    ]);
});

test("meeting participants reach consensus before opening a whiteboard", async () => {
    const state = { whiteboardOpenVotes: [] };
    const presence = [{ username: "bob" }, { username: "carol" }];
    const firstVote = createRoutes({
        requesterUsername: "bob",
        organizerUsername: "alice",
        presence,
        state,
    });
    const firstResponse = createRecorder();
    await firstVote.handlers.get(
        "POST /api/v1/modules/jitsi-meet/whiteboard/state",
    )(
        {
            body: {
                meetingId: "meeting-1",
                whiteboardId: "board-1",
                disposable: false,
                active: true,
            },
        },
        firstResponse,
    );
    assert.equal(firstResponse.body.data.pendingConsensus, true);
    assert.equal(firstResponse.body.data.votesRequired, 2);
    state.whiteboardOpenVotes = ["bob"];

    const secondVote = createRoutes({
        requesterUsername: "carol",
        organizerUsername: "alice",
        presence,
        state,
    });
    const secondResponse = createRecorder();
    await secondVote.handlers.get(
        "POST /api/v1/modules/jitsi-meet/whiteboard/state",
    )(
        {
            body: {
                meetingId: "meeting-1",
                whiteboardId: "board-1",
                disposable: false,
                active: true,
            },
        },
        secondResponse,
    );
    assert.equal(secondResponse.body.data.whiteboardOpen, true);
    assert.equal(secondResponse.body.data.voteCount, 2);
});

test("a proposed canvas cannot bypass pending consensus", async () => {
    const state = {
        whiteboardId: "board-1",
        whiteboardDisposable: false,
        whiteboardOpenVotes: ["bob"],
    };
    const routes = createRoutes({
        requesterUsername: "bob",
        organizerUsername: "alice",
        participants: ["alice", "bob", "carol"],
        presence: [{ username: "bob" }, { username: "carol" }],
        state,
    });
    const response = createRecorder();

    await routes.handlers.get(
        "POST /api/v1/modules/jitsi-meet/whiteboard/state",
    )(
        {
            body: {
                meetingId: "meeting-1",
                whiteboardId: "board-1",
                disposable: false,
                active: true,
            },
        },
        response,
    );

    assert.equal(response.body.data.whiteboardOpen, false);
    assert.equal(response.body.data.pendingConsensus, true);
    assert.equal(response.body.data.voteCount, 1);
    assert.equal(response.body.data.votesRequired, 2);
});

test("a mapped participant canvas reopens without another consensus vote", async () => {
    const routes = createRoutes({
        requesterUsername: "bob",
        organizerUsername: "alice",
        participants: ["alice", "bob"],
        state: {
            whiteboardId: "board-1",
            whiteboardDisposable: false,
            whiteboardOpenVotes: [],
        },
    });
    const response = createRecorder();

    await routes.handlers.get(
        "POST /api/v1/modules/jitsi-meet/whiteboard/state",
    )(
        {
            body: {
                meetingId: "meeting-1",
                whiteboardId: "board-1",
                disposable: false,
                active: true,
            },
        },
        response,
    );

    assert.equal(response.body.data.whiteboardOpen, true);
    assert.equal(response.body.data.pendingConsensus, false);
    assert.equal(response.body.data.voteCount, 0);
});
