import assert from "node:assert/strict";
import test from "node:test";
import { createRuntime } from "./reuse/guest-admission-fixture.js";
const base = "/api/v1/modules/jitsi-meet";

test("registered ctx guest routes reach their resource checks without an outer session guard", async () => {
    const { request, state, routes } = createRuntime();
    for (const path of [
        "/meetings/get",
        "/meetings/state",
        "/meetings/join",
        "/meetings/presence",
        "/meetings/participants/kicked",
        "/screen-sharing",
        "/whiteboard/state",
    ]) {
        assert.equal(
            routes.get(`post ${base}${path}`).options?.access,
            undefined,
        );
        const result = await request("post", path, { meetingId: "unrelated" });
        // Whiteboard routes first resolve the meeting, which this empty store lacks.
        assert.equal(
            result.status,
            path === "/screen-sharing" || path === "/whiteboard/state"
                ? 404
                : 403,
            path,
        );
    }
    assert.equal((await request("get", "/participants")).status, 200);
    assert.equal((await request("post", "/meetings/presence")).status, 200);
    assert.ok(state.requests.length >= 7);
    assert.deepEqual(state.profiles, []);
});

test("guest credentials and grants expire or revoke without account fallback", async () => {
    const { request, state, capabilities } = createRuntime();
    state.join = false;
    assert.equal((await request("post", "/meetings/presence")).status, 403);
    state.join = true;
    for (const field of ["credential", "grant"]) {
        state[field] = false;
        assert.equal((await request("post", "/meetings/presence")).status, 401);
        state[field] = true;
    }
    capabilities.delete("share:resolveGuestAccess");
    assert.equal((await request("get", "/participants")).status, 403);
    assert.deepEqual(state.profiles, []);
});

test("account identities including share-prefixed subjects stay sessions", async () => {
    const { request, state } = createRuntime();
    for (const sub of ["ordinary-account", "share:ordinary-account"]) {
        const session = {
            sub,
            purpose: "session",
            role: "user",
            setupPending: false,
        };
        assert.equal(
            (await request("get", "/participants", { guest: false, session }))
                .status,
            200,
        );
        assert.equal(
            (
                await request("get", "/participants", {
                    guest: false,
                    session: { ...session, setupPending: true },
                })
            ).status,
            401,
        );
    }
    assert.equal(
        state.requests.filter((input) => input.claims.purpose === "session")
            .length,
        2,
    );
});

test("guest credentials never enter management and account routes", async () => {
    const { request, state } = createRuntime();
    for (const [method, path] of [
        ["post", "/meetings/create"],
        ["post", "/meetings/reclaim"],
        ["post", "/meetings/auth-start"],
        ["get", "/meetings/active"],
        ["put", "/config"],
    ]) {
        assert.equal((await request(method, path)).status, 401, path);
    }
    assert.equal(state.guestChecks, 0);
});

test("a grant revoked after admission is denied by the resource check", async () => {
    const { request, state } = createRuntime();
    state.revokeAfterAdmission = true;
    assert.equal((await request("post", "/meetings/presence")).status, 403);
    assert.deepEqual(state.profiles, []);
});

for (const invalidation of [
    "expired credential",
    "revoked credential",
    "expired grant",
    "revoked grant",
]) {
    test(`${invalidation} cannot reach a mixed resource handler's data`, async () => {
        const { request, state } = createRuntime();
        state[invalidation.endsWith("credential") ? "credential" : "grant"] =
            false;
        assert.equal((await request("get", "/participants")).status, 401);
        assert.deepEqual(state.requests, []);
        assert.deepEqual(state.profiles, []);
    });
}
