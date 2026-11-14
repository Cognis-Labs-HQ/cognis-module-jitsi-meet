import assert from "node:assert/strict";
import test from "node:test";
import { createDeprovisionRuntime } from "./reuse/deprovision-runtime.js";

const OUTCOME_ID = "auth:deprovisionOutcome";
const cleanupResult = (result) =>
    result.stageResults["cleanup-dependencies"].at(-1);

function setup() {
    const runtime = createDeprovisionRuntime();
    runtime.seedMeeting("delete", {
        owner: "deleted",
        participants: ["deleted", "alice"],
    });
    runtime.seedMeeting("keep", {
        owner: "deleted",
        participants: ["deleted", "bob", "alice"],
    });
    runtime.seedMeeting("unrelated", {
        owner: "other",
        participants: ["other", "carol"],
    });
    const scope = runtime.enable();
    return { runtime, scope };
}

function assertNoCleanup(runtime) {
    assert.deepEqual(runtime.effects, []);
    assert.equal(runtime.rows("jitsi_meetings").length, 3);
}

test("exported bootstrap resolves the committed deletion through the versioned public contract", async () => {
    const { runtime } = setup();
    const result = await runtime.run();
    assert.deepEqual(cleanupResult(result), {
        cleaned: true,
        accountId: "Deleted-Account",
        updatedMeetingIds: ["keep"],
        deletedMeetingIds: ["delete"],
    });
    assert.deepEqual(runtime.resolutions, [{ id: OUTCOME_ID, version: 1 }]);
    assert.deepEqual(runtime.profiles, ["Deleted-Account"]);
    assert.deepEqual(
        runtime.effects.filter(({ kind }) => kind !== "database"),
        [
            {
                kind: "whiteboard",
                input: {
                    whiteboardId: "board-delete",
                    actorAccountId: "Deleted-Account",
                },
            },
            {
                kind: "chatroom",
                input: {
                    roomId: "room-delete",
                    actorAccountId: "Deleted-Account",
                },
            },
            {
                kind: "shares",
                input: {
                    ownerAccountId: "Deleted-Account",
                    resourceType: "meeting",
                    resourceId: "delete",
                },
            },
        ],
    );
    const firstResource = runtime.effects.findIndex(
        ({ kind }) => kind === "whiteboard",
    );
    assert.deepEqual(
        runtime.effects
            .slice(0, firstResource)
            .map(({ command }) => command.table),
        [
            "jitsi_meeting_presence",
            "jitsi_meeting_participants",
            "jitsi_meeting_original_participants",
        ],
    );
    assert.deepEqual(
        runtime.effects
            .slice(firstResource + 3, -1)
            .map(({ command }) => command.table),
        [
            "jitsi_chat_calls",
            "jitsi_meeting_presence",
            "jitsi_meeting_state",
            "jitsi_meeting_original_participants",
            "jitsi_meeting_participants",
            "jitsi_meetings",
        ],
    );
    const keep = runtime.rows("jitsi_meetings").find(({ id }) => id === "keep");
    assert.equal(keep.created_by, "alice");
    assert.equal(keep.chat_room_id, "room-keep");
    assert.equal(
        runtime.rows("jitsi_meetings").find(({ id }) => id === "unrelated")
            .created_by,
        "other",
    );
    for (const table of [
        "jitsi_meeting_participants",
        "jitsi_meeting_original_participants",
        "jitsi_meeting_presence",
    ]) {
        assert.equal(
            runtime.rows(table).some(({ username }) => username === "deleted"),
            false,
        );
    }
    assert.ok(
        runtime.executions.includes(
            "jitsi-meet:removeDeletedAccountFromMeetings:execute-action:handler",
        ),
    );
});

test("a rejected request cannot gain cleanup authority from a later forged persistence result", async () => {
    const { runtime } = setup();
    runtime.authority.persist = false;
    runtime.authority.beforeCleanup = ({ input, stageResults }) => {
        input.username = "Deleted-Account";
        input.action = "delete";
        stageResults["persist-state"] = [
            { persisted: true, username: "Deleted-Account", action: "delete" },
        ];
    };
    assert.deepEqual(cleanupResult(await runtime.run()), { cleaned: false });
    assertNoCleanup(runtime);
    assert.deepEqual(runtime.profiles, []);
});

test("mutated input and public results cannot retarget or cancel an Auth-committed deletion", async () => {
    const { runtime } = setup();
    runtime.authority.beforeCleanup = ({ input, stageResults }) => {
        input.username = "Other-Account";
        input.action = "archive";
        stageResults["persist-state"] = [{ persisted: false }];
    };
    const result = cleanupResult(await runtime.run());
    assert.equal(result.accountId, "Deleted-Account");
    assert.deepEqual(runtime.profiles, ["Deleted-Account"]);
    assert.ok(
        runtime.rows("jitsi_meetings").some(({ id }) => id === "unrelated"),
    );
});

for (const action of ["archive", "disable", "unknown"]) {
    test(`a persisted ${action} outcome does not authorize deletion cleanup`, async () => {
        const { runtime } = setup();
        runtime.authority.beforeCleanup = ({ input, stageResults }) => {
            input.action = "delete";
            stageResults["persist-state"] = [{ persisted: true }];
        };
        const result = await runtime.run({
            username: "Deleted-Account",
            action,
        });
        assert.deepEqual(cleanupResult(result), { cleaned: false });
        assertNoCleanup(runtime);
    });
}

for (const username of [undefined, null, false, 42, {}, [], "", "   "]) {
    test(`a malformed deleted-account result fails closed (${JSON.stringify(username)})`, async () => {
        const { runtime } = setup();
        assert.deepEqual(
            cleanupResult(await runtime.run({ username, action: "delete" })),
            { cleaned: false },
        );
        assertNoCleanup(runtime);
        assert.deepEqual(runtime.profiles, []);
    });
}

for (const invalidation of [
    "missing registry",
    "missing provider",
    "wrong version",
    "malformed provider",
    "missing reader",
    "disabled provider",
]) {
    test(`${invalidation} stops the registered cleanup before any effect`, async () => {
        const { runtime } = setup();
        runtime.authority.beforeCleanup = () => {
            if (invalidation === "missing registry")
                runtime.capabilities.delete("system:contracts");
            if (invalidation === "missing provider")
                runtime.capabilities.delete(OUTCOME_ID);
            if (invalidation === "wrong version") runtime.authority.version = 2;
            if (invalidation === "malformed provider")
                runtime.capabilities.set(OUTCOME_ID, { read() {} });
            if (invalidation === "missing reader")
                runtime.capabilities.set(OUTCOME_ID, {
                    deletedAccount: () => "Deleted-Account",
                });
            if (invalidation === "disabled provider")
                runtime.authority.active = false;
        };
        await assert.rejects(
            runtime.run(),
            /capability_(contract_)?(unavailable|mismatch)/,
        );
        assertNoCleanup(runtime);
        assert.deepEqual(runtime.profiles, []);
    });
}

for (const invalidation of [
    "replacement",
    "reactivation",
    "wrong input",
    "wrong invocation",
    "missing receipt",
]) {
    test(`${invalidation} cannot reuse a receipt from another owner or invocation`, async () => {
        const { runtime, scope } = setup();
        runtime.authority.beforeCleanup = async (stage) => {
            let forwarded = stage;
            if (invalidation === "replacement")
                runtime.capabilities.set(OUTCOME_ID, {
                    ...runtime.receiptProvider,
                });
            if (invalidation === "reactivation") runtime.authority.generation++;
            if (invalidation === "wrong input")
                forwarded = { ...stage, input: { ...stage.input } };
            if (invalidation === "wrong invocation")
                forwarded = {
                    ...stage,
                    stageResults: { ...stage.stageResults },
                };
            if (invalidation === "missing receipt")
                forwarded = { ...stage, stageResults: {} };
            assert.deepEqual(await scope.cleanup(forwarded), {
                cleaned: false,
            });
            // The host must not also invoke the ordinary hook with the original identity.
            scope.dispose();
        };
        await runtime.run();
        assertNoCleanup(runtime);
        assert.deepEqual(runtime.profiles, []);
    });
}

test("reusing an input invalidates its earlier invocation instead of lending a later receipt", async () => {
    const { runtime, scope } = setup();
    const input = { username: "Deleted-Account", action: "delete" };
    runtime.authority.beforeCleanup = () => scope.dispose();
    await runtime.run(input);
    const earlier = runtime.lastInvocation();
    const second = runtime.enable();
    runtime.authority.persist = false;
    runtime.authority.beforeCleanup = undefined;
    await runtime.run(input);
    assert.deepEqual(await second.cleanup(earlier), { cleaned: false });
    assertNoCleanup(runtime);
});

test("the live stage context supplies the resolver rather than an unversioned account capability", async () => {
    const { runtime } = setup();
    const requests = [];
    runtime.authority.beforeCleanup = () => {
        runtime.stageRoot.requireCapability = (id) => {
            requests.push(id);
            return {
                resolve: (...args) => {
                    requests.push(args);
                    return { deletedAccount: () => undefined };
                },
            };
        };
    };
    assert.deepEqual(cleanupResult(await runtime.run()), { cleaned: false });
    assert.deepEqual(requests, ["system:contracts", [OUTCOME_ID, 1]]);
    assertNoCleanup(runtime);
});

for (const failure of [
    "whiteboard unavailable",
    "chat denied",
    "already absent",
]) {
    test(`authorized cleanup preserves cascade behavior when ${failure}`, async () => {
        const runtime = createDeprovisionRuntime();
        runtime.seedMeeting("delete", {
            owner: "deleted",
            participants: ["deleted", "alice"],
        });
        if (failure === "whiteboard unavailable")
            runtime.capabilities.delete("whiteboard:deleteCanvas");
        if (failure === "chat denied")
            runtime.capabilities.set(
                "social:messages:deleteChatroom",
                async () => {
                    throw new Error("synthetic_denied");
                },
            );
        if (failure === "already absent")
            runtime.capabilities.set("whiteboard:deleteCanvas", async () => {
                throw Object.assign(new Error("synthetic_missing"), {
                    status: 404,
                });
            });
        runtime.enable();
        if (failure === "already absent") {
            assert.deepEqual(
                cleanupResult(await runtime.run()).deletedMeetingIds,
                ["delete"],
            );
            assert.ok(
                runtime.logs.some(
                    ({ metadata }) =>
                        metadata.operation ===
                        "delete_missing_meeting_resource",
                ),
            );
        } else {
            await assert.rejects(runtime.run(), /unavailable|synthetic_denied/);
            assert.equal(runtime.rows("jitsi_meetings").length, 1);
            assert.equal(
                runtime.effects.some(({ kind }) => kind === "shares"),
                false,
            );
            assert.ok(
                runtime.logs.some(
                    ({ metadata }) =>
                        metadata.operation === "delete_user_meeting_resources",
                ),
            );
        }
    });
}

test("another organizer remains the authority for unusable shared meeting resources", async () => {
    const runtime = createDeprovisionRuntime();
    runtime.seedMeeting("delete", {
        owner: "alice",
        participants: ["deleted", "alice"],
    });
    runtime.enable();
    await runtime.run();
    assert.deepEqual(runtime.profiles, ["Deleted-Account", "alice"]);
    assert.ok(
        runtime.effects
            .filter(({ kind }) => kind !== "database")
            .every(
                ({ input }) =>
                    (input.actorAccountId ?? input.ownerAccountId) ===
                    "alice-account",
            ),
    );
});

test("a lifecycle change after the first committed external effect does not retarget the remaining cascade", async () => {
    const runtime = createDeprovisionRuntime();
    runtime.seedMeeting("delete", {
        owner: "deleted",
        participants: ["deleted", "alice"],
    });
    runtime.capabilities.set("whiteboard:deleteCanvas", async (input) => {
        runtime.effects.push({ kind: "whiteboard", input });
        runtime.authority.active = false;
        runtime.authority.generation++;
    });
    runtime.enable();
    assert.deepEqual(cleanupResult(await runtime.run()).deletedMeetingIds, [
        "delete",
    ]);
    assert.deepEqual(
        runtime.effects
            .filter(({ kind }) => kind !== "database")
            .map(({ kind }) => kind),
        ["whiteboard", "chatroom", "shares"],
    );
    assert.deepEqual(runtime.resolutions, [{ id: OUTCOME_ID, version: 1 }]);
});

test("scoped disable, re-enable and uninstall do not leave an executable cleanup hook", async () => {
    const { runtime, scope } = setup();
    const enabled = {
        routes: runtime.routes.length,
        contributions: runtime.contributions.length,
        flows: runtime.flows.size,
    };
    runtime.authority.beforeCleanup = () => scope.dispose();
    await runtime.run();
    assertNoCleanup(runtime);
    assert.equal(runtime.hooks.length, 0);
    assert.equal(runtime.routes.length, 0);
    assert.equal(runtime.contributions.length, 0);
    assert.equal(runtime.flows.size, 1);
    await assert.rejects(
        scope.cleanup(runtime.lastInvocation()),
        /no longer active/,
    );
    assertNoCleanup(runtime);
    const second = runtime.enable();
    assert.deepEqual(
        {
            routes: runtime.routes.length,
            contributions: runtime.contributions.length,
            flows: runtime.flows.size,
        },
        enabled,
    );
    await assert.rejects(
        scope.cleanup(runtime.lastInvocation()),
        /no longer active/,
    );
    assertNoCleanup(runtime);
    runtime.authority.beforeCleanup = undefined;
    assert.equal(cleanupResult(await runtime.run()).cleaned, true);
    second.dispose();
    await runtime.uninstall(second.ctx, false);
    assert.equal(runtime.rows("jitsi_meetings").length, 2);
    assert.equal(runtime.hooks.length, 0);
    await runtime.uninstall(second.ctx, true);
    assert.equal(runtime.rows("jitsi_meetings").length, 0);
    assert.equal(runtime.hooks.length, 0);
    assert.equal(runtime.routes.length, 0);
    assert.equal(runtime.flows.size, 1);
});

test("disable during profile resolution prevents the scoped store mutation", async () => {
    const runtime = createDeprovisionRuntime();
    runtime.seedMeeting("delete", {
        owner: "deleted",
        participants: ["deleted", "alice"],
    });
    const identity = runtime.capabilities.get("social:profile:identity");
    let scope;
    identity.resolveAccountHandle = async () => {
        scope.dispose();
        return "deleted";
    };
    scope = runtime.enable();
    await assert.rejects(runtime.run(), /no longer active/);
    assert.deepEqual(runtime.effects, []);
    assert.equal(runtime.rows("jitsi_meetings").length, 1);
    assert.equal(runtime.hooks.length, 0);
});

test("an unlinked meeting can still be cleaned without the optional Whiteboard provider", async () => {
    const runtime = createDeprovisionRuntime();
    runtime.seedMeeting("delete", {
        owner: "deleted",
        participants: ["deleted", "alice"],
        whiteboard: false,
    });
    runtime.capabilities.delete("whiteboard:deleteCanvas");
    runtime.enable();
    assert.deepEqual(cleanupResult(await runtime.run()).deletedMeetingIds, [
        "delete",
    ]);
    assert.deepEqual(
        runtime.effects
            .filter(({ kind }) => kind !== "database")
            .map(({ kind }) => kind),
        ["chatroom", "shares"],
    );
});
