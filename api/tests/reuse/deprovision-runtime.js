import assert from "node:assert/strict";
import { bootstrapModule, uninstallModule } from "../../../bootstrap.js";
import { profileIdentityFake } from "../profile-identity-fake.js";
import { createDeprovisionDatabase } from "./deprovision-database.js";

const OUTCOME_ID = "auth:deprovisionOutcome";
const FLOW_ID = "deprovision-user";
const CLEANUP_ID = "jitsi-meet:delete-user-activity";

/** Bootstrap the shipped module against executable scoped flows and public host fakes. */
export function createDeprovisionRuntime() {
    const effects = [];
    const database = createDeprovisionDatabase(effects);
    const logs = [];
    const resolutions = [];
    const profiles = [];
    const executions = [];
    const flows = new Map([
        [
            FLOW_ID,
            {
                id: FLOW_ID,
                stages: [
                    "authorize-request",
                    "persist-state",
                    "cleanup-dependencies",
                ],
            },
        ],
    ]);
    const hooks = [];
    const routes = [];
    const contributions = [];
    const capabilities = new Map();
    const authority = {
        active: true,
        generation: 0,
        version: 1,
        persist: true,
        beforeCleanup: undefined,
    };
    const receipts = new WeakMap();
    const latest = new WeakMap();
    let lastInvocation;

    const receiptProvider = Object.freeze({
        read(input, stageResults) {
            const receipt = receipts.get(stageResults);
            if (
                !authority.active ||
                capabilities.get(OUTCOME_ID) !== receiptProvider ||
                !receipt ||
                receipt.generation !== authority.generation ||
                receipt.input !== input ||
                latest.get(input) !== stageResults
            )
                return undefined;
            return receipt.outcome;
        },
        deletedAccount(input, stageResults) {
            const outcome = receiptProvider.read(input, stageResults);
            return outcome?.persisted === true && outcome.action === "delete"
                ? outcome.username
                : undefined;
        },
    });
    const contracts = {
        resolve(id, version) {
            resolutions.push({ id, version });
            assert.equal(id, OUTCOME_ID);
            const provider = capabilities.get(id);
            if (
                !authority.active ||
                version !== authority.version ||
                !provider
            ) {
                throw new Error("capability_contract_unavailable");
            }
            if (
                typeof provider !== "object" ||
                typeof provider.read !== "function" ||
                typeof provider.deletedAccount !== "function"
            ) {
                throw new Error("capability_contract_mismatch");
            }
            const generation = authority.generation;
            return Object.fromEntries(
                ["read", "deletedAccount"].map((method) => [
                    method,
                    (...args) => {
                        if (
                            !authority.active ||
                            generation !== authority.generation ||
                            capabilities.get(id) !== provider
                        )
                            throw new Error("capability_contract_unavailable");
                        return provider[method](...args);
                    },
                ]),
            );
        },
    };
    const stageRoot = {
        requireCapability(id) {
            assert.equal(id, "system:contracts");
            const value = capabilities.get(id);
            if (!value) throw new Error("capability_unavailable");
            return value;
        },
    };

    const log = (level, message, metadata) =>
        logs.push({ level, message, metadata });
    for (const [id, value] of [
        ["system:contracts", contracts],
        [OUTCOME_ID, receiptProvider],
        ["db:executor", database.database],
        ["logging:log", log],
        ["auth:requireAuth", () => null],
        ["reuse:generatePassphrase", () => "synthetic-passphrase"],
        ["share:requestApproval", async () => ({ approved: true })],
        [
            "social:profile:identity",
            {
                ...profileIdentityFake,
                async resolveAccountHandle(accountId) {
                    profiles.push(accountId);
                    return accountId.trim() === "Deleted-Account"
                        ? "deleted"
                        : "other";
                },
            },
        ],
        [
            "social:profileStore",
            {
                async getProfileByHandle(handle) {
                    profiles.push(handle);
                    return { accountId: `${handle}-account` };
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
        [
            "social:messages:sourceBinding",
            { bind: async () => {}, release: async () => {} },
        ],
        [
            "whiteboard:deleteCanvas",
            async (input) => effects.push({ kind: "whiteboard", input }),
        ],
        [
            "social:messages:deleteChatroom",
            async (input) => effects.push({ kind: "chatroom", input }),
        ],
        [
            "share:deleteResourceShares",
            async (input) => effects.push({ kind: "shares", input }),
        ],
    ])
        capabilities.set(id, value);

    async function runFlow(flowId, input, { handlers = {} } = {}) {
        const definition = flows.get(flowId);
        assert.ok(definition, `Flow is no longer active: ${flowId}`);
        const stageResults = {};
        const data = {};
        const meta = Object.freeze({});
        if (flowId === FLOW_ID)
            lastInvocation = { input, stageResults, ctx: stageRoot };
        for (const stageId of definition.stages) {
            const stage = Object.freeze({
                ctx: stageRoot,
                flowId,
                stageId,
                input,
                meta,
                data,
                stageResults,
            });
            const values = [];
            const stageHooks = hooks.filter(
                (entry) => entry.flowId === flowId && entry.stageId === stageId,
            );
            assert.ok(
                handlers[stageId] || stageHooks.length,
                `No handler registered for ${flowId}:${stageId}`,
            );
            if (handlers[stageId]) {
                executions.push(`${flowId}:${stageId}:handler`);
                values.push(await handlers[stageId](stage));
            }
            for (const hook of stageHooks) {
                if (!hooks.includes(hook)) continue;
                executions.push(`${flowId}:${stageId}:${hook.id}`);
                values.push(await hook.handler(stage));
            }
            stageResults[stageId] = values;
        }
        return { flowId, stageResults };
    }

    function enable() {
        const scope = {
            active: true,
            flows: [],
            hooks: [],
            routes: [],
            contributions: [],
            capabilities: [],
            disposers: [],
        };
        const register = (collection, record, owned) => {
            collection.push(record);
            owned.push(record);
        };
        const ctx = {
            moduleRoot: process.cwd(),
            log,
            getCapability: (id) => capabilities.get(id),
            contributePublicCapability(id, value) {
                capabilities.set(id, value);
                scope.capabilities.push(id);
            },
            registerDisposer: (dispose) => scope.disposers.push(dispose),
            registerFlow(definition) {
                assert.equal(flows.has(definition.id), false);
                flows.set(definition.id, definition);
                scope.flows.push(definition.id);
            },
            flow: {
                exists: (id) => scope.active && flows.has(id),
                async run(...args) {
                    assert.ok(scope.active, "Module scope is no longer active");
                    return runFlow(...args);
                },
                extend(flowId, stageId, definition, handler) {
                    assert.ok(flows.get(flowId)?.stages.includes(stageId));
                    assert.equal(typeof handler, "function");
                    assert.equal(
                        hooks.some((hook) => hook.id === definition.id),
                        false,
                    );
                    register(
                        hooks,
                        { flowId, stageId, id: definition.id, handler },
                        scope.hooks,
                    );
                    return true;
                },
            },
        };
        ctx.router = Object.fromEntries(
            ["get", "post", "put", "delete"].map((method) => [
                method,
                (path, handler, options) =>
                    register(
                        routes,
                        { method, path, handler, options },
                        scope.routes,
                    ),
            ]),
        );
        for (const method of [
            "registerStaticDir",
            "registerNavbarPlugin",
            "registerCapabilityProvider",
            "registerSpaRoute",
            "registerAdminSection",
        ]) {
            ctx[method] = (...args) =>
                register(contributions, { method, args }, scope.contributions);
        }
        bootstrapModule(ctx);
        const dispose = () => {
            scope.active = false;
            for (const callback of scope.disposers.toReversed()) callback();
            for (const id of scope.capabilities) capabilities.delete(id);
            for (const id of scope.flows) flows.delete(id);
            for (const [collection, owned] of [
                [hooks, scope.hooks],
                [routes, scope.routes],
                [contributions, scope.contributions],
            ]) {
                for (const record of owned) {
                    const index = collection.indexOf(record);
                    if (index >= 0) collection.splice(index, 1);
                }
            }
        };
        return {
            ctx,
            dispose,
            cleanup: scope.hooks.find((hook) => hook.id === CLEANUP_ID).handler,
        };
    }

    async function run(
        input = { username: " Deleted-Account ", action: "delete" },
    ) {
        return runFlow(FLOW_ID, input, {
            handlers: {
                "authorize-request": ({ input: original, stageResults }) => {
                    receipts.set(stageResults, {
                        input: original,
                        username: original.username,
                        action: original.action,
                        generation: authority.generation,
                    });
                    latest.set(original, stageResults);
                    return { authorized: authority.persist };
                },
                "persist-state": ({ stageResults }) => {
                    const receipt = receipts.get(stageResults);
                    receipt.outcome = Object.freeze(
                        authority.persist
                            ? {
                                  persisted: true,
                                  username: receipt.username,
                                  action: receipt.action,
                              }
                            : {
                                  persisted: false,
                                  status: 403,
                                  reason: "protected_founder_account",
                              },
                    );
                    return { persisted: authority.persist };
                },
                "cleanup-dependencies": (stage) =>
                    authority.beforeCleanup?.(stage),
            },
        });
    }

    return {
        ...database,
        effects,
        logs,
        resolutions,
        profiles,
        executions,
        flows,
        hooks,
        routes,
        contributions,
        capabilities,
        authority,
        receiptProvider,
        stageRoot,
        enable,
        run,
        lastInvocation: () => lastInvocation,
        uninstall: (ctx, deleteContent) =>
            uninstallModule(ctx, { deleteContent }),
    };
}
