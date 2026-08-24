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

function createRoutes(spawnWhiteboard) {
    const handlers = new Map();
    const options = [];
    const router = {
        get(path, handler, routeOptions) {
            handlers.set(`GET ${path}`, handler);
            options.push(routeOptions);
        },
        post(path, handler, routeOptions) {
            handlers.set(`POST ${path}`, handler);
            options.push(routeOptions);
        },
    };
    const spawnRequests = [];
    const stateUpdates = [];
    registerMeetingWhiteboardRoutes({
        router,
        ctx: {
            getCapability(capabilityId) {
                const spawn = async (request) => {
                    spawnRequests.push(request);
                    return {
                        whiteboardId: "board-1",
                        disposable: true,
                    };
                };
                if (
                    capabilityId ===
                    "nextcloud-whiteboard:spawnWhiteboardWindow"
                ) {
                    return spawnWhiteboard === true ? spawn : null;
                }
                if (capabilityId === "system:ctx") {
                    return {
                        getCapability: () =>
                            spawnWhiteboard === "system" ? spawn : null,
                    };
                }
                return null;
            },
            log() {},
        },
        store: {
            async ensureSchema() {},
            async getMeetingById(id) {
                return { id, meetingName: "Planning" };
            },
            async listParticipants() {
                return ["alice", "bob"];
            },
            async updateMeetingState(meetingId, update) {
                stateUpdates.push({ meetingId, update });
            },
        },
        profileStore: {
            async getProfile() {
                return { handle: "alice" };
            },
        },
        requireAuth: () => ({ sub: "account-alice" }),
        readJson: async (req) => req.body,
        sendJson(res, status, body) {
            res.writeHead(status);
            res.end(JSON.stringify(body));
        },
        sendError(res, status, code, message) {
            res.writeHead(status);
            res.end(JSON.stringify({ error: { code, message } }));
        },
        canAccessMeeting: async () => true,
        listClassroomParticipantHandles: async () => [],
    });
    return { handlers, options, spawnRequests, stateUpdates };
}

test("meeting whiteboard routes detect the optional ctx capability", async () => {
    const available = createRoutes(true);
    const availableResponse = createRecorder();
    await available.handlers.get(
        "GET /api/v1/modules/jitsi-meet/whiteboard/availability",
    )({}, availableResponse);
    assert.equal(availableResponse.status, 200);
    assert.equal(availableResponse.body.data.available, true);

    const unavailable = createRoutes(false);
    const unavailableResponse = createRecorder();
    await unavailable.handlers.get(
        "GET /api/v1/modules/jitsi-meet/whiteboard/availability",
    )({}, unavailableResponse);
    assert.equal(unavailableResponse.body.data.available, false);

    const globallyAvailable = createRoutes("system");
    const globalResponse = createRecorder();
    await globallyAvailable.handlers.get(
        "GET /api/v1/modules/jitsi-meet/whiteboard/availability",
    )({}, globalResponse);
    assert.equal(globalResponse.body.data.available, true);
});

test("meeting participants can create a disposable synchronized canvas", async () => {
    const routes = createRoutes(true);
    const response = createRecorder();
    await routes.handlers.get("POST /api/v1/modules/jitsi-meet/whiteboard")(
        { body: { meetingId: "meeting-1" } },
        response,
    );
    assert.equal(response.status, 201);
    assert.deepEqual(response.body.data, {
        whiteboardId: "board-1",
        disposable: true,
    });
    assert.deepEqual(routes.spawnRequests, [
        {
            title: "Planning",
            createdBy: "alice",
            participants: ["alice", "bob"],
            externalPath: "meeting:meeting-1",
            instantCanvas: true,
            disposable: true,
        },
    ]);
    assert.deepEqual(routes.stateUpdates, [
        {
            meetingId: "meeting-1",
            update: {
                whiteboardId: "board-1",
                whiteboardActive: true,
            },
        },
    ]);
    assert.ok(
        routes.options.every(
            (routeOptions) => routeOptions.access.minRole === "user",
        ),
    );
});

test("closing a meeting whiteboard synchronizes the default view", async () => {
    const routes = createRoutes(true);
    const response = createRecorder();
    await routes.handlers.get(
        "POST /api/v1/modules/jitsi-meet/whiteboard/close",
    )({ body: { meetingId: "meeting-1" } }, response);
    assert.equal(response.status, 200);
    assert.deepEqual(routes.stateUpdates, [
        {
            meetingId: "meeting-1",
            update: { whiteboardActive: false },
        },
    ]);
});
