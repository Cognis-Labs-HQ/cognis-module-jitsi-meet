import assert from "node:assert/strict";
import test from "node:test";
import { createScopedProviderHost } from "./fixtures/scoped-provider-host.js";

let result = Response.json({ data: { id: "meeting-id" } });
const host = createScopedProviderHost(() => result);
globalThis[Symbol.for("cognis.uiCtx")] = host.root;
const { mountProvider } = await import("../creation/provider.js");
mountProvider(host.scope);

test("meeting creation owns its flow, request and destination and rejects invalid or stale work", async () => {
    const create = host.capabilities.get("meetings:createMeeting");
    const input = {
        participants: ["alice", "bob"],
        scheduledAt: "2026-11-03T12:00:00Z",
    };
    assert.deepEqual(await create(input), {
        meetingId: "meeting-id",
        navigationUrl: "/meetings?meetingId=meeting-id",
    });
    assert.equal(host.flows.has("jitsi-meet:creation:create"), true);
    assert.equal(
        host.requests[0].url,
        "/api/v1/modules/jitsi-meet/meetings/create",
    );
    assert.deepEqual(JSON.parse(host.requests[0].options.body), input);
    result = Response.json(
        { error: { message: "private server detail" } },
        { status: 403 },
    );
    await assert.rejects(create(input), /meeting_creation_failed/);
    result = Response.json({ data: {} });
    await assert.rejects(create(input), /meeting_creation_result_invalid/);
    const count = host.requests.length;
    host.scope.extendFlow(
        "jitsi-meet:creation:create",
        "before",
        { id: "test:veto" },
        () => {
            throw new Error("creation_vetoed");
        },
    );
    await assert.rejects(create(input), /creation_vetoed/);
    assert.equal(host.requests.length, count);
    host.controller.abort();
    await assert.rejects(create(input), { name: "AbortError" });
    assert.equal(host.requests.length, count);
});
