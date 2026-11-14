import assert from "node:assert/strict";
import { registerApiRoutes } from "../../index.js";
import { profileIdentityFake } from "../profile-identity-fake.js";
const base = "/api/v1/modules/jitsi-meet";

export function createRuntime() {
    const routes = new Map();
    const flows = new Map();
    const guest = Object.freeze({
        sub: "share:grant:guest",
        purpose: "share",
        role: "user",
        providerId: "fixture",
        setupPending: false,
    });
    const state = {
        credential: true,
        grant: true,
        join: true,
        requests: [],
        guestChecks: 0,
        profiles: [],
    };
    const database = {
        async ensureTable() {},
        async executeCommand() {
            return { rows: [] };
        },
        async transaction(callback) {
            return callback(database);
        },
    };
    const capabilities = new Map([
        ["db:executor", database],
        ["reuse:generatePassphrase", () => "synthetic-passphrase"],
        ["social:profile:identity", profileIdentityFake],
        [
            "social:profileStore",
            {
                async searchProfiles() {
                    return [];
                },
                async getProfile(accountId) {
                    state.profiles.push(accountId);
                    return { handle: "owner" };
                },
            },
        ],
        [
            "social:messages:membership",
            { add: async () => {}, remove: async () => {} },
        ],
        [
            "social:messages:resolveRoomMembership",
            async () => ({ authorized: true, memberAccountIds: [] }),
        ],
        ["social:messages:deleteChatroom", async () => {}],
        [
            "social:messages:sourceBinding",
            { bind: async () => {}, release: async () => {} },
        ],
        ["share:requestApproval", async () => ({ approved: true })],
        ["share:resolveGuestId", (claims) => (claims === guest ? "grant" : "")],
        [
            "auth:requireAuth",
            (req, res) => {
                if (
                    req.session?.purpose === "session" &&
                    !req.session.setupPending
                )
                    return req.session;
                res.writeHead(401);
                res.end(JSON.stringify({ error: "unauthorized" }));
                return null;
            },
        ],
        [
            "share:getGuestClaims",
            async (req) => {
                state.guestChecks++;
                const claims =
                    req.guest && state.credential && state.grant ? guest : null;
                if (state.revokeAfterAdmission) state.grant = false;
                return claims;
            },
        ],
        [
            "share:resolveGuestAccess",
            async (input) => {
                state.requests.push(input);
                if (input.claims.purpose !== "share")
                    return { shareGuest: false, authorized: false };
                assert.equal(input.claims, guest);
                return {
                    shareGuest: true,
                    authorized:
                        state.grant &&
                        state.join &&
                        input.resourceId === "meeting-1",
                };
            },
        ],
    ]);
    const ctx = {
        moduleRoot: process.cwd(),
        getCapability: (key) => capabilities.get(key),
        contributePublicCapability() {},
        registerFlow: (flow) => flows.set(flow.id, flow),
        flow: {
            exists: (id) => flows.has(id),
            extend() {},
            async run(id, input, { handlers } = {}) {
                const stageResults = {};
                for (const stage of flows.get(id).stages) {
                    stageResults[stage] = [
                        await handlers[stage]({ input, stageResults }),
                    ];
                }
                return { stageResults };
            },
        },
    };
    const router = Object.fromEntries(
        ["get", "post", "put", "delete"].map((method) => [
            method,
            (path, handler, options) =>
                routes.set(`${method} ${path}`, { handler, options }),
        ]),
    );
    registerApiRoutes(router, ctx);
    async function request(
        method,
        path,
        { guest: isGuest = true, session, meetingId = "meeting-1" } = {},
    ) {
        const route = routes.get(`${method} ${base}${path}`);
        assert.ok(route, path);
        const res = {
            status: 0,
            writeHead(status) {
                this.status = status;
            },
            end(body) {
                this.body = body ? JSON.parse(body) : null;
            },
        };
        const req = {
            guest: isGuest,
            session,
            headers: {},
            url: `${base}${path}?meetingId=${meetingId}`,
            async *[Symbol.asyncIterator]() {
                yield Buffer.from(
                    JSON.stringify({
                        meetingId,
                        sessionId: "presence",
                        active: false,
                    }),
                );
            },
        };
        // The host applies session-only access metadata before invoking a handler.
        if (
            route.options?.access &&
            !capabilities.get("auth:requireAuth")(req, res)
        )
            return res;
        await route.handler(req, res);
        return res;
    }
    return { request, state, routes, capabilities };
}
