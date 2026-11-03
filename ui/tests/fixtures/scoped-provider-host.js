import assert from "node:assert/strict";

export function createScopedProviderHost(
    response = () => Response.json({ data: [] }),
) {
    const requests = [];
    const capabilities = new Map();
    const flows = new Map();
    const hooks = new Map();
    const controller = new AbortController();
    capabilities.set("ui:scopedActions", (ctx, namespace, actions) => {
        const published = {};
        for (const [action, execute] of Object.entries(actions)) {
            const flowId = `${namespace}:${action}`;
            ctx.registerFlow(flowId, ["before", "execute", "after"]);
            ctx.extendFlow(flowId, "execute", { id: flowId }, async (stage) => {
                stage.data.result = await execute(stage.input);
            });
            published[action] = async (input) =>
                (await ctx.runFlow(flowId, input)).data.result;
        }
        return published;
    });
    capabilities.set("ui:reuse", {
        importModule(path) {
            assert.equal(path, "api-client.js");
            return {
                apiFetch: async (url, options) => {
                    requests.push({ url, options });
                    return response(url, options);
                },
            };
        },
    });
    const root = { capabilities: { get: (id) => capabilities.get(id) } };
    const scope = {
        signal: controller.signal,
        capabilities: {
            get: (id) => capabilities.get(id),
            contribute: (id, value) => capabilities.set(id, value),
        },
        registerFlow(id, stages) {
            assert.equal(flows.has(id), false);
            flows.set(id, stages);
        },
        extendFlow(id, stage, _hook, execute) {
            const key = `${id}:${stage}`;
            const handlers = hooks.get(key) ?? [];
            handlers.push(execute);
            hooks.set(key, handlers);
        },
        async runFlow(id, input) {
            controller.signal.throwIfAborted();
            input?.signal?.throwIfAborted();
            const stage = { input, data: {} };
            for (const name of flows.get(id))
                for (const execute of hooks.get(`${id}:${name}`) ?? [])
                    await execute(stage);
            controller.signal.throwIfAborted();
            input?.signal?.throwIfAborted();
            return stage;
        },
    };
    return { requests, capabilities, flows, controller, scope, root };
}
