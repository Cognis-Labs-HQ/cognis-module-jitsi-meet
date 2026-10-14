import assert from "node:assert/strict";
import { createFlowRuntime } from "../flow-runtime-fake.js";
import { profileIdentityFake } from "../profile-identity-fake.js";
import { registerMeetingWhiteboardRoutes } from "../../routes/whiteboard/index.js";

export function createRecorder() {
    return {
        status: 0,
        body: null,
        headers: {},
        setHeader(name, value) {
            this.headers[name] = value;
        },
        writeHead(status) {
            this.status = status;
        },
        end(body) {
            this.body = JSON.parse(body);
        },
    };
}

export function createRoutes({
    authorized = true,
    requesterUsername = "alice",
    organizerUsername = "alice",
    meetingDisposable = false,
    participants = ["alice"],
    presence = [],
    state = { whiteboardOpenVotes: [] },
    claims = { sub: "account-alice" },
    guestAllowed = false,
    board = {
        id: "board-1",
        title: "Planning",
        createdBy: requesterUsername,
        createdByAccountId: claims.sub,
    },
    whiteboardAvailable = true,
    beforeStateRead = () => {},
    beforeMembershipAdd = () => {},
    providerVersion = "2.3.151",
    whiteboardApproval = { approved: true },
    sourceBinding = { bind: async () => {} },
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
        ctx: {
            ...createFlowRuntime(),
            getCapability: (id) =>
                id === "whiteboard:sourceBinding" ? sourceBinding : undefined,
            async getModuleAssurance(moduleId) {
                assert.equal(moduleId, "nextcloud-whiteboard");
                return {
                    version: providerVersion,
                    integrity: "verified",
                    requested: true,
                    trustedSource: true,
                };
            },
            log() {},
        },
        store: {
            async ensureSchema() {},
            async getMeetingById(id) {
                return {
                    id,
                    meetingName: "Planning",
                    createdBy: organizerUsername,
                    disposable: meetingDisposable,
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
        fetchBoardData: async (id) =>
            typeof board === "function" ? board(id) : board,
        isWhiteboardProviderAvailable: () => whiteboardAvailable,
        requestWhiteboardOpenApproval: async (request) => {
            approvalRequests.push(request);
            return whiteboardApproval;
        },
        resolveWhiteboardMembership: () => ({
            async add(request) {
                await beforeMembershipAdd();
                membershipAdds.push(request);
            },
        }),
    });
    return { approvalRequests, handlers, membershipAdds, stateUpdates };
}
