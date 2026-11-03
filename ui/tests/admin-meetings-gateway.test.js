import assert from "node:assert/strict";
import test from "node:test";

import { createScopedProviderHost } from "./fixtures/scoped-provider-host.js";

const { requests, capabilities, flows, controller, scope, root } =
    createScopedProviderHost();
globalThis[Symbol.for("cognis.uiCtx")] = root;
const { mountProvider } = await import("../administration/meetings-gateway.js");
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
