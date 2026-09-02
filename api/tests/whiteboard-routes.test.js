import test from "node:test";
import assert from "node:assert/strict";
import { registerMeetingWhiteboardRoutes } from "../whiteboard-routes.js";
import { profileIdentityFake } from "./profile-identity-fake.js";

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
    board = {
        id: "board-1",
        title: "Planning",
        createdBy: requesterUsername,
    },
    whiteboardAvailable = true,
    beforeStateRead = () => {},
    whiteboardApproval = { approved: true },
} = {}) {
    const handlers = new Map();
    const stateUpdates = [];
    const approvalRequests = [];
    const membershipAdds = [];
    registerMeetingWhiteboardRoutes({
        router: {
            get(path, handler) {
                handlers.set(`GET ${path}`, handler);
            },
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
                beforeStateRead();
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
                Object.assign(state, update);
            },
        },
        profileStore: {
            async getProfileByHandle(handle) {
                return { accountId: `account-${handle}` };
            },
            async getProfile(accountId) {
                return {
                    handle:
                        accountId === claims.sub
                            ? requesterUsername
                            : String(accountId).replace(/^account-/, ""),
                };
            },
        },
        profileIdentity: profileIdentityFake,
        requireAuth: (req) => req.claims ?? claims,
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
        fetchBoardData: async () => board,
        isWhiteboardProviderAvailable: () => whiteboardAvailable,
        requestWhiteboardOpenApproval: async (request) => {
            approvalRequests.push(request);
            return whiteboardApproval;
        },
        resolveWhiteboardMembership: () => ({
            async add(request) {
                membershipAdds.push(request);
            },
        }),
    });
    return { approvalRequests, handlers, membershipAdds, stateUpdates };
}

test("backend publishes consistent Whiteboard availability", async () => {
    for (const available of [true, false]) {
        const routes = createRoutes({ whiteboardAvailable: available });
        const response = createRecorder();
        await routes.handlers.get(
            "GET /api/v1/modules/jitsi-meet/whiteboard/availability",
        )({}, response);
        assert.equal(response.status, 200);
        assert.equal(response.body.data.available, available);
    }
});

test("screen sharing closes and blocks meeting Whiteboards", async () => {
    const routes = createRoutes({
        state: {
            screenSharingActive: false,
            whiteboardActive: true,
            whiteboardOpenVotes: ["alice"],
        },
    });
    const response = createRecorder();
    await routes.handlers.get("POST /api/v1/modules/jitsi-meet/screen-sharing")(
        { body: { meetingId: "meeting-1", active: true } },
        response,
    );

    assert.equal(response.status, 200);
    assert.deepEqual(routes.stateUpdates[0].update, {
        screenSharingActive: true,
        whiteboardActive: false,
        whiteboardOpenVotes: [],
    });

    const blockedRoutes = createRoutes({
        state: {
            screenSharingActive: true,
            whiteboardOpenVotes: [],
        },
    });
    const blockedResponse = createRecorder();
    await blockedRoutes.handlers.get(
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
        blockedResponse,
    );
    assert.equal(blockedResponse.status, 409);
    assert.equal(blockedResponse.body.error.code, "screen_sharing_active");
});

test("every authorized attendee can synchronize observed screen sharing", async () => {
    for (const options of [
        { requesterUsername: "bob", organizerUsername: "alice" },
        {
            claims: { sub: "share:share-17:guest-session-4" },
            guestAllowed: true,
        },
    ]) {
        const routes = createRoutes(options);
        const response = createRecorder();
        await routes.handlers.get(
            "POST /api/v1/modules/jitsi-meet/screen-sharing",
        )({ body: { meetingId: "meeting-1", active: true } }, response);

        assert.equal(response.status, 200);
        assert.deepEqual(routes.stateUpdates[0].update, {
            screenSharingActive: true,
            whiteboardActive: false,
            whiteboardOpenVotes: [],
        });
    }
});

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
    assert.equal(response.body.data.approvalRequested, false);
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

test("concurrent approved Whiteboard requests remain serialized", async () => {
    const state = {
        whiteboardId: "board-1",
        whiteboardDisposable: true,
        screenSharingActive: false,
        whiteboardOpenVotes: [],
    };
    const routes = createRoutes({
        organizerUsername: "alice",
        requesterUsername: "bob",
        presence: [{ username: "bob" }, { username: "carol" }],
        state,
    });
    const bobResponse = createRecorder();
    const carolResponse = createRecorder();
    const body = {
        meetingId: "meeting-1",
        whiteboardId: "board-1",
        disposable: true,
        active: true,
    };

    await Promise.all([
        routes.handlers.get("POST /api/v1/modules/jitsi-meet/whiteboard/state")(
            { body, claims: { sub: "account-bob" } },
            bobResponse,
        ),
        routes.handlers.get("POST /api/v1/modules/jitsi-meet/whiteboard/state")(
            { body, claims: { sub: "account-carol" } },
            carolResponse,
        ),
    ]);

    assert.equal(bobResponse.status, 200);
    assert.equal(carolResponse.status, 200);
    assert.equal(state.whiteboardActive, true);
    assert.deepEqual(routes.stateUpdates[0].update.whiteboardOpenVotes, []);
    assert.deepEqual(routes.stateUpdates[1].update.whiteboardOpenVotes, []);
});

test("Whiteboard activation rechecks screen sharing after verification", async () => {
    const state = {
        screenSharingActive: false,
        whiteboardOpenVotes: [],
    };
    let stateReads = 0;
    const routes = createRoutes({
        state,
        beforeStateRead() {
            stateReads += 1;
            if (stateReads === 2) state.screenSharingActive = true;
        },
    });
    const response = createRecorder();
    const handler = routes.handlers.get(
        "POST /api/v1/modules/jitsi-meet/whiteboard/state",
    );
    await handler(
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

    assert.equal(response.status, 409);
    assert.equal(response.body.error.code, "screen_sharing_active");
    assert.equal(routes.stateUpdates.length, 0);
});

test("meeting participants cannot map an unrelated provider whiteboard", async () => {
    for (const board of [
        { id: "board-1", title: "Other meeting", createdBy: "alice" },
        { id: "board-1", title: "Planning", createdBy: "mallory" },
        null,
    ]) {
        const routes = createRoutes({ board });
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
        assert.equal(routes.stateUpdates.length, 0);
    }
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

test("meeting participants request consensus before opening a whiteboard", async () => {
    const state = { whiteboardOpenVotes: [] };
    const presence = [{ username: "bob" }, { username: "carol" }];
    const firstVote = createRoutes({
        claims: { sub: "account-bob" },
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
    assert.equal(firstResponse.body.data.whiteboardOpen, true);
    assert.equal(firstResponse.body.data.pendingConsensus, false);
    assert.deepEqual(
        firstVote.membershipAdds.map((request) => request.userAccountId).sort(),
        ["account-alice", "account-bob", "account-carol"],
    );
    assert.deepEqual(firstVote.approvalRequests, [
        {
            meetingId: "meeting-1",
            meetingName: "Planning",
            requesterAccountId: "account-bob",
            requesterDisplayName: "bob",
        },
    ]);
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
        whiteboardApproval: { approved: false },
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
    assert.equal(response.body.data.approvalRequested, true);
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
