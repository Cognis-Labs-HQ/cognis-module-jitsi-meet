import assert from "node:assert/strict";

export function createFlowRuntime() {
    const flows = new Map();
    const executions = [];
    return {
        flows,
        executions,
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
}
