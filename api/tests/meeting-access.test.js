import { profileIdentityFake } from "./profile-identity-fake.js";
import test from "node:test";
import assert from "node:assert/strict";
import {
    canAccessMeeting,
    resolveMeetingPayloadOrReject,
} from "../reuse/meeting-access.js";
import { registerMeetingRoutes } from "../meetings-routes.js";
import { JitsiMeetStore } from "../store.js";

function createProfileStoreWithoutHandle() {
    return {
        async getProfile() {
            return null;
        },
        async getProfileByHandle() {
            return null;
        },
    };
}

function createInMemoryJitsiDb() {
    const rows = { jitsi_meetings: [], jitsi_meeting_state: [] };
    return {
        async ensureTable() {},
        async transaction(callback) {
            return callback(this);
        },
        async executeCommand(command) {
            if (command.option === "SELECT") {
                const table = rows[command.table] ?? [];
                if (!command.where) return { rows: table };
                return {
                    rows: table.filter((row) =>
                        command.where.every(
                            (whereEntry) =>
                                row[whereEntry.column] === whereEntry.value,
                        ),
                    ),
                };
            }
            return { rows: [] };
        },
    };
}

test("resolveMeetingPayloadOrReject reports profile_required instead of throwing when the caller has no visible profile handle", async () => {
    const sendErrorCalls = [];
    const sendError = (res, status, code, message) => {
        sendErrorCalls.push({ status, code, message });
    };

    const result = await resolveMeetingPayloadOrReject({
        profileIdentity: profileIdentityFake,
        body: { meetingId: "meeting-1" },
        profileStore: createProfileStoreWithoutHandle(),
        store: new JitsiMeetStore({
            profileIdentity: profileIdentityFake,
            db: createInMemoryJitsiDb(),
        }),
        claims: { sub: "account-without-profile" },
        sendError,
        res: {},
        listClassroomParticipantHandles: async () => [],
    });

    assert.equal(result, null);
    assert.deepEqual(sendErrorCalls, [
        {
            status: 409,
            code: "profile_required",
            message: "A visible profile handle is required to use Meetings.",
        },
    ]);
});

test("jitsi meetings active endpoint uses account identity when the caller has no visible profile handle", async () => {
    class RouterStub {
        routes = [];
        get(routePath, handler) {
            this.routes.push({ method: "GET", path: routePath, handler });
        }
        post(routePath, handler) {
            this.routes.push({ method: "POST", path: routePath, handler });
        }
    }
    const router = new RouterStub();
    const sendErrorCalls = [];
    const sendJsonCalls = [];
    const logCalls = [];
    const accessChecks = [];
    const profileStore = {
        async getProfile() {
            return null;
        },
        async getProfileByHandle(handle) {
            if (handle === "previous-handle") {
                return {
                    accountId: "account-without-profile",
                    handle,
                };
            }
            return null;
        },
        async isBlocked() {
            return false;
        },
        async searchProfiles() {
            return [];
        },
    };
    const sendError = (res, status, code, message) => {
        sendErrorCalls.push({ status, code, message });
    };

    registerMeetingRoutes({
        router,
        store: {
            async ensureSchema() {},
            async listActiveMeetings() {
                return [
                    {
                        id: "meeting-1",
                        activeUsernames: [],
                        activeParticipantCount: 1,
                        activeSessionCount: 1,
                    },
                ];
            },
            async getMeetingById() {
                return {
                    id: "meeting-1",
                    meetingName: "Active Meeting",
                    meetingUrl: "https://meet.example/active-meeting",
                    createdBy: "organizer",
                    classroomId: null,
                };
            },
            async listParticipants() {
                return ["previous-handle"];
            },
            async getMeetingState() {
                return { endedAt: null, authRequired: false };
            },
        },
        profileStore,
        profileIdentity: profileIdentityFake,
        listCalendarsByOwner: async () => [],
        listCalendarEvents: async () => [],
        listClassroomParticipantHandles: async () => [],
        resolveMeetingPayloadOrReject,
        createMeetingPayload: async () => ({}),
        resolveRequesterUsername: (profileStore, profileIdentity, accountId) =>
            import("../reuse/requester.js").then(
                ({ resolveRequesterUsername }) =>
                    resolveRequesterUsername(
                        profileStore,
                        profileIdentity,
                        accountId,
                    ),
            ),
        canAccessMeeting: async (input) => {
            accessChecks.push(input);
            return canAccessMeeting({
                ...input,
                profileIdentity: profileIdentityFake,
            });
        },
        filterUsernamesForGuestVisibility: async (usernames) => usernames,
        requireAuth: () => ({ sub: "account-without-profile", role: "user" }),
        readJson: async () => ({}),
        sendJson: (res, status, payload) => {
            sendJsonCalls.push({ status, payload });
        },
        sendError,
        log: (...args) => logCalls.push(args),
        checkHttpLiveness: async () => true,
        LIVELINESS_TIMEOUT_MS: 5000,
        resolveShareGuestMeetingAccess: async () => ({ isGuest: false }),
    });

    const activeRoute = router.routes.find(
        (routeEntry) =>
            routeEntry.method === "GET" &&
            routeEntry.path === "/api/v1/modules/jitsi-meet/meetings/active",
    );

    await assert.doesNotReject(() => activeRoute.handler({}, {}));
    assert.deepEqual(sendErrorCalls, []);
    assert.equal(sendJsonCalls.length, 1);
    assert.equal(sendJsonCalls[0].status, 200);
    assert.equal(sendJsonCalls[0].payload.data.length, 1);
    assert.equal(sendJsonCalls[0].payload.data[0].id, "meeting-1");
    assert.equal(
        sendJsonCalls[0].payload.data[0].meetingName,
        "Active Meeting",
    );
    assert.equal(accessChecks.length, 1);
    assert.equal(accessChecks[0].username, "");
    assert.equal(accessChecks[0].requesterAccountId, "account-without-profile");
    assert.equal(logCalls.length, 1);
    assert.equal(logCalls[0][0], "error");
    assert.equal(logCalls[0][2].operation, "list_active_meetings");
});

test("LDAP participants retain meeting access when their profile handle changes", async () => {
    const allowed = await canAccessMeeting({
        profileIdentity: profileIdentityFake,
        store: {
            async listParticipants() {
                return ["alice", "ldap:students:student-42"];
            },
        },
        meeting: {
            id: "meeting-1",
            createdBy: "alice",
            classroomId: null,
        },
        username: "ldap-student-after-rename",
        requesterAccountId: "ldap:Students:student-42",
        profileStore: {
            async getProfileByHandle() {
                return null;
            },
            async isBlocked() {
                return false;
            },
        },
        listClassroomParticipantHandles: async () => [],
    });

    assert.equal(allowed, true);
});

test("active user shares grant meeting access until the share is removed", async () => {
    let shareAuthorized = true;
    const input = {
        store: {
            async listParticipants() {
                return ["alice"];
            },
        },
        meeting: {
            id: "meeting-1",
            createdBy: "alice",
            classroomId: null,
        },
        username: "bob",
        requesterAccountId: "account-bob",
        profileIdentity: profileIdentityFake,
        profileStore: {
            async getProfileByHandle() {
                return null;
            },
            async isBlocked() {
                return false;
            },
        },
        listClassroomParticipantHandles: async () => [],
        resolveShareUserAccess: async (request) => {
            assert.equal(request.requiredCapability, "meeting:join");
            return { authorized: shareAuthorized };
        },
    };

    assert.equal(await canAccessMeeting(input), true);
    shareAuthorized = false;
    assert.equal(await canAccessMeeting(input), false);
});

test("jitsi meetings active endpoint passes account identity to access checks", async () => {
    class RouterStub {
        routes = [];
        get(routePath, handler) {
            this.routes.push({ method: "GET", path: routePath, handler });
        }
        post() {}
    }
    const router = new RouterStub();
    const accessChecks = [];
    const store = {
        async ensureSchema() {},
        async listActiveMeetings() {
            return [{ id: "meeting-1", activeUsernames: [] }];
        },
        async getMeetingById() {
            return {
                id: "meeting-1",
                createdBy: "alice",
                classroomId: null,
            };
        },
        async listParticipants() {
            return ["ldap:students:student-42"];
        },
        async getMeetingState() {
            return { endedAt: null, authRequired: false };
        },
    };
    const profileStore = {
        async getProfile(accountId) {
            return { accountId, handle: "renamed-student" };
        },
        async getProfileByHandle() {
            return null;
        },
    };

    registerMeetingRoutes({
        router,
        store,
        profileStore,
        listCalendarsByOwner: async () => [],
        listCalendarEvents: async () => [],
        listClassroomParticipantHandles: async () => [],
        resolveMeetingPayloadOrReject,
        createMeetingPayload: async () => ({}),
        resolveRequesterUsername: async () => "renamed-student",
        canAccessMeeting: async (input) => {
            accessChecks.push(input);
            return false;
        },
        filterUsernamesForGuestVisibility: async (usernames) => usernames,
        requireAuth: () => ({
            sub: "ldap:Students:student-42",
            role: "user",
        }),
        readJson: async () => ({}),
        sendJson: () => {},
        sendError: () => {},
        checkHttpLiveness: async () => true,
        LIVELINESS_TIMEOUT_MS: 5000,
        resolveShareGuestMeetingAccess: async () => ({ isGuest: false }),
    });

    const activeRoute = router.routes.find(
        (routeEntry) =>
            routeEntry.path === "/api/v1/modules/jitsi-meet/meetings/active",
    );
    await activeRoute.handler({}, {});

    assert.equal(accessChecks.length, 1);
    assert.equal(
        accessChecks[0].requesterAccountId,
        "ldap:Students:student-42",
    );
    assert.equal(accessChecks[0].profileStore, profileStore);
});
