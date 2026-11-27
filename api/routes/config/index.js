export function registerMeetingConfigRoutes({
    router,
    store,
    requireAuth,
    readJson,
    sendJson,
    sendError,
    normalizeHttpUrl,
    registerConfiguredJitsiOrigin,
    registerScriptOrigins,
    log,
}) {
    router.get(
        "/api/v1/modules/jitsi-meet/config",
        async (request, response) => {
            const claims = requireAuth(request, response, "user");
            if (!claims) return;
            await store.ensureConfigurationSchema();
            const config = await store.getConfig();
            sendJson(response, 200, { data: config });
        },
        { access: { minRole: "user" }, allowWhenDisabled: true },
    );

    router.put(
        "/api/v1/modules/jitsi-meet/config",
        async (request, response) => {
            const claims = requireAuth(request, response, "admin");
            if (!claims) return;
            await store.ensureConfigurationSchema();
            const body = await readJson(request);
            const instanceUrl = normalizeHttpUrl(body.instanceUrl);
            if (!instanceUrl) {
                sendError(
                    response,
                    400,
                    "bad_request",
                    "A valid http(s) Jitsi instance URL is required.",
                    { fieldId: "jitsi-instance-url" },
                );
                return;
            }
            const saved = await store.saveConfig({
                instanceUrl,
            });
            registerConfiguredJitsiOrigin(registerScriptOrigins, saved);
            log?.("info", "Jitsi Meet configuration updated.", {
                component: "jitsi-meet-module",
                operation: "save_config",
                hasInstanceUrl: Boolean(saved.instanceUrl),
            });
            sendJson(response, 200, {
                data: saved,
            });
        },
        { access: { minRole: "admin" }, allowWhenDisabled: true },
    );

    router.delete(
        "/api/v1/modules/jitsi-meet/config",
        async (request, response) => {
            const claims = requireAuth(request, response, "admin");
            if (!claims) return;
            await store.ensureConfigurationSchema();
            await store.deleteConfig();
            registerConfiguredJitsiOrigin(registerScriptOrigins, {});
            log?.("info", "Jitsi Meet configuration deleted.", {
                component: "jitsi-meet-module",
                operation: "delete_config",
                deletedBy: claims.sub,
            });
            response.writeHead(204);
            response.end();
        },
        { access: { minRole: "admin" }, allowWhenDisabled: true },
    );
}

export function registerMeetingPingRoute({ router, store, sendJson }) {
    router.get(
        "/api/v1/modules/jitsi-meet/ping",
        async (_request, response) => {
            await store.ensureConfigurationSchema();
            const config = await store.getConfig();
            sendJson(response, 200, {
                data: {
                    ready: true,
                    configComplete: Boolean(config.instanceUrl),
                },
            });
        },
        { access: { minRole: "user" } },
    );
}
