import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { bootstrapModule } from "../../bootstrap.js";

function createScopedRuntime() {
    const capabilities = new Map([["auth:requireAuth", () => null]]);
    const flows = new Set([
        "bootstrap-platform",
        "mint-share-token",
        "resolve-share-token",
    ]);
    const routes = [];
    const uiContributions = [];
    const hooks = [];

    function enable() {
        const scope = {
            capabilities: [],
            flows: [],
            hooks: [],
            routes: [],
            uiContributions: [],
        };
        const registerUiContribution = (type, contribution) => {
            const record = { type, contribution };
            uiContributions.push(record);
            scope.uiContributions.push(record);
        };
        const registerRoute = (method, path, handler) => {
            const record = { method, path, handler };
            routes.push(record);
            scope.routes.push(record);
        };
        const ctx = {
            moduleRoot: "/external-modules/jitsi-meet",
            getCapability: (capabilityId) => capabilities.get(capabilityId),
            contributePublicCapability(capabilityId, value) {
                capabilities.set(capabilityId, value);
                scope.capabilities.push(capabilityId);
            },
            registerFlow(flow) {
                flows.add(flow.id);
                scope.flows.push(flow.id);
            },
            flow: {
                exists: (flowId) => flows.has(flowId),
                extend(flowId, stageId, hook) {
                    const record = { flowId, stageId, hookId: hook.id };
                    hooks.push(record);
                    scope.hooks.push(record);
                    return true;
                },
            },
            router: {
                get: (path, handler) => registerRoute("GET", path, handler),
                put: (path, handler) => registerRoute("PUT", path, handler),
                post: (path, handler) => registerRoute("POST", path, handler),
            },
            registerStaticDir: (prefix, directory) =>
                registerUiContribution("static", { prefix, directory }),
            registerNavbarPlugin: (plugin) =>
                registerUiContribution("navbar", plugin),
            registerSpaRoute: (route) => registerUiContribution("spa", route),
            registerAdminSection: (section) =>
                registerUiContribution("admin", section),
        };

        bootstrapModule(ctx);

        return () => {
            for (const capabilityId of scope.capabilities) {
                capabilities.delete(capabilityId);
            }
            for (const flowId of scope.flows) flows.delete(flowId);
            for (const record of scope.hooks)
                hooks.splice(hooks.indexOf(record), 1);
            for (const record of scope.routes)
                routes.splice(routes.indexOf(record), 1);
            for (const record of scope.uiContributions) {
                uiContributions.splice(uiContributions.indexOf(record), 1);
            }
        };
    }

    return {
        enable,
        snapshot: () => ({
            contributedCapability: capabilities.has(
                "meetings:isProviderAvailable",
            ),
            createdFlows: ["construct-meetings-ui", "create-meeting"].filter(
                (flowId) => flows.has(flowId),
            ),
            hookCount: hooks.length,
            routeCount: routes.length,
            uiContributionCount: uiContributions.length,
            uiContributions: uiContributions.map(({ type, contribution }) => ({
                type,
                contribution,
            })),
        }),
    };
}

test("jitsi bootstrap is removable and repeatable across lifecycle cycles", () => {
    const runtime = createScopedRuntime();
    const initialSnapshot = runtime.snapshot();

    const firstDispose = runtime.enable();
    const firstEnabledSnapshot = runtime.snapshot();
    assert.equal(firstEnabledSnapshot.contributedCapability, true);
    assert.deepEqual(firstEnabledSnapshot.createdFlows, [
        "construct-meetings-ui",
        "create-meeting",
    ]);
    assert.ok(firstEnabledSnapshot.routeCount > 0);
    assert.ok(firstEnabledSnapshot.uiContributionCount > 0);
    assert.deepEqual(
        firstEnabledSnapshot.uiContributions
            .filter(({ type }) => type === "spa")
            .map(({ contribution }) => contribution.base),
        ["/meetings", "/meeting"],
    );
    assert.deepEqual(
        firstEnabledSnapshot.uiContributions.find(
            ({ type }) => type === "navbar",
        ).contribution.access,
        { minRole: "user" },
    );
    assert.ok(firstEnabledSnapshot.hookCount > 0);

    firstDispose();
    assert.deepEqual(runtime.snapshot(), initialSnapshot);

    const secondDispose = runtime.enable();
    assert.deepEqual(runtime.snapshot(), firstEnabledSnapshot);
    secondDispose();
    assert.deepEqual(runtime.snapshot(), initialSnapshot);
});

test("manifest exposes localized configuration metadata for core rendering", async () => {
    const manifest = JSON.parse(
        await readFile(new URL("../../manifest.json", import.meta.url), "utf8"),
    );

    assert.deepEqual(
        manifest.ui.preferences.map(({ key, type }) => ({ key, type })),
        [
            { key: "instanceUrl", type: "string" },
            { key: "meetingPrefix", type: "string" },
        ],
    );
    assert.equal(
        manifest.ui.preferences.find(({ key }) => key === "meetingPrefix")
            .default,
        "",
    );
    assert.equal(manifest.ui.componentConfig, undefined);
    assert.equal(
        manifest.ui.stringsBaseUrl,
        "/static/modules/jitsi-meet/languages",
    );
    for (const preference of manifest.ui.preferences) {
        assert.match(preference.labelKey, /^module\.jitsi_meet\./);
        assert.match(preference.descriptionKey, /^module\.jitsi_meet\./);
    }
});
