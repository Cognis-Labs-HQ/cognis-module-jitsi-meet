import test from "node:test";
import assert from "node:assert/strict";
import { JitsiMeetStore } from "../store.js";
import { registerJitsiActionStore } from "../reuse/action-store.js";
import { registerMeetingConfigRoutes } from "../config-routes.js";
import { profileIdentityFake } from "./profile-identity-fake.js";

function createRuntime() {
    const flows = new Map();
    const executions = [];
    const events = [];
    const databaseExecutor = {
        async ensureTable({ name }) {
            events.push(`schema:${name}`);
        },
        async executeCommand(command) {
            events.push(command.option);
            return {
                rows:
                    command.option === "SELECT"
                        ? [
                              {
                                  instance_url: "https://meet.example",
                                  updated_at: "2026-10-12",
                              },
                          ]
                        : [],
            };
        },
        transaction: async (operation) => operation(databaseExecutor),
    };
    const store = new JitsiMeetStore({
        db: databaseExecutor,
        profileIdentity: profileIdentityFake,
    });
    const ctx = {
        registerFlow(flow) {
            assert.ok(flow.id.startsWith("jitsi-meet:"));
            assert.equal(flows.has(flow.id), false);
            flows.set(flow.id, flow);
        },
        flow: {
            exists: (flowId) => flows.has(flowId),
            async run(flowId, input, { handlers }) {
                const flow = flows.get(flowId);
                assert.ok(flow, `Unregistered flow ${flowId}`);
                const stageResults = {};
                for (const stageId of flow.stages) {
                    executions.push(`${flowId}:${stageId}`);
                    assert.equal(typeof handlers[stageId], "function");
                    stageResults[stageId] = [
                        await handlers[stageId]({ input, stageResults }),
                    ];
                }
                return { flowId, stageResults };
            },
        },
    };
    return {
        ctx,
        store,
        flows,
        executions,
        events,
        actions: registerJitsiActionStore(ctx, store),
    };
}

test("every supported asynchronous store action has an executed scoped flow", async () => {
    const { store, actions, flows, executions, events } = createRuntime();
    const methods = Object.getOwnPropertyNames(JitsiMeetStore.prototype).filter(
        (method) =>
            method !== "ensureSchema" &&
            JitsiMeetStore.prototype[method].constructor.name ===
                "AsyncFunction",
    );
    assert.equal(flows.size, methods.length);
    for (const method of methods)
        assert.ok(Object.hasOwn(actions, method), method);
    assert.notEqual(actions.getConfig, store.getConfig);
    const config = await actions.getConfig();
    assert.equal(config.instanceUrl, "https://meet.example");
    assert.deepEqual(executions, [
        "jitsi-meet:get-config:initialize-store",
        "jitsi-meet:get-config:execute-action",
    ]);
    assert.equal(events.at(-1), "SELECT");
    assert.ok(events.some((event) => event === "schema:jitsi_chat_calls"));
});

test("configuration routes execute the same staged operation after authorization", async () => {
    const { actions, executions } = createRuntime();
    const handlers = new Map();
    registerMeetingConfigRoutes({
        router: Object.fromEntries(
            ["get", "put", "delete"].map((method) => [
                method,
                (path, handler) => handlers.set(method, handler),
            ]),
        ),
        store: actions,
        requireAuth: () => ({ sub: "admin", role: "admin" }),
        readJson: async () => ({ instanceUrl: "https://meet.example" }),
        normalizeHttpUrl: (value) => value,
        registerConfiguredJitsiOrigin: () => {},
        sendJson: (response, status, payload) =>
            Object.assign(response, { status, payload }),
        sendError: () => assert.fail("Valid configuration was rejected"),
    });
    const response = {};
    await handlers.get("put")({}, response);
    assert.equal(response.status, 200);
    assert.ok(executions.includes("jitsi-meet:save-config:execute-action"));
    executions.length = 0;
    // Authentication denial must precede any action runner or persistence.
    const unauthorizedHandlers = new Map();
    registerMeetingConfigRoutes({
        router: Object.fromEntries(
            ["get", "put", "delete"].map((method) => [
                method,
                (path, handler) => unauthorizedHandlers.set(method, handler),
            ]),
        ),
        store: actions,
        requireAuth: () => null,
    });
    await unauthorizedHandlers.get("put")({}, {});
    assert.deepEqual(executions, []);
});

test("schema failure prevents the action and disposed flows reject future execution", async () => {
    const { store, actions, flows, events } = createRuntime();
    store.ensureSchema = async () => {
        throw new Error("schema unavailable");
    };
    await assert.rejects(
        actions.saveConfig({ instanceUrl: "https://meet.example" }),
        /schema unavailable/,
    );
    assert.deepEqual(events, []);
    flows.clear();
    await assert.rejects(actions.getConfig(), /Unregistered flow/);
});

test("an incomplete runner cannot silently bypass a Jitsi action", async () => {
    const { actions, ctx } = createRuntime();
    ctx.flow.run = async () => ({ stageResults: {} });
    await assert.rejects(actions.getConfig(), /Jitsi action did not execute/);
});

test("disable during initialization prevents an already-started flow from persisting", async () => {
    const { store, actions, flows, events } = createRuntime();
    let finishInitialization;
    store.ensureSchema = () =>
        new Promise((resolve) => {
            finishInitialization = resolve;
        });
    const saving = actions.saveConfig({ instanceUrl: "https://meet.example" });
    flows.clear();
    finishInitialization();
    await assert.rejects(saving, /Jitsi action is no longer active/);
    assert.deepEqual(events, []);
});
