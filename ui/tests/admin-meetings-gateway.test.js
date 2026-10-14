import assert from "node:assert/strict";
import test from "node:test";

const requests = [];
const capabilities = new Map();
const flows = new Map();
const hooks = new Map();
const controller = new AbortController();
capabilities.set("ui:scopedActions", (ctx, namespace, actions) => {
    const published = {};
    for (const [action, execute] of Object.entries(actions)) {
        const flowId = `${namespace}:${action}`;
        ctx.registerFlow(flowId, ["execute"]);
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
                return Response.json({ data: [] });
            },
        };
    },
});
globalThis[Symbol.for("cognis.uiCtx")] = {
    capabilities: { get: (id) => capabilities.get(id) },
};
const { mountProvider } = await import("../administration/meetings-gateway.js");
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
        hooks.set(`${id}:${stage}`, execute);
    },
    async runFlow(id, input) {
        controller.signal.throwIfAborted();
        const stage = { input, data: {} };
        for (const name of flows.get(id))
            await hooks.get(`${id}:${name}`)(stage);
        return stage;
    },
};
mountProvider(scope);

test("meeting administration executes scoped flows and sends only the selected action", async () => {
    const actions = capabilities.get("jitsi-meet:administration");
    await actions.listAdminMeetings();
    await actions.listUpcomingAdminMeetings();
    await actions.terminateAdminMeeting({ meetingId: "meeting" });
    await actions.deleteAdminMeeting({ meetingId: "meeting" });
    assert.equal(flows.size, 4);
    assert.equal(requests[0].url, "/api/v1/modules/jitsi-meet/admin/meetings");
    assert.equal(
        requests[1].url,
        "/api/v1/modules/jitsi-meet/admin/meetings/upcoming",
    );
    assert.equal(requests[2].options.method, "POST");
    assert.equal(
        requests[3].url,
        "/api/v1/modules/jitsi-meet/admin/meetings/delete",
    );
    assert.deepEqual(JSON.parse(requests[3].options.body), {
        meetingId: "meeting",
    });
    controller.abort();
    await assert.rejects(actions.listAdminMeetings(), { name: "AbortError" });
    assert.equal(requests.length, 4);
});
