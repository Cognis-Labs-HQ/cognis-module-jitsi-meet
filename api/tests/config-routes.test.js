import test from "node:test";
import assert from "node:assert/strict";
import { registerMeetingConfigRoutes } from "../config-routes.js";

function createResponse() {
    return {
        writeHead(status) {
            this.status = status;
        },
        end(body) {
            this.payload = body ? JSON.parse(body) : null;
        },
    };
}

test("config endpoint polls and persists the module-owned configuration", async () => {
    const handlers = {};
    const operations = [];
    let config = {
        instanceUrl: "https://meet.example.test",
    };
    registerMeetingConfigRoutes({
        router: {
            get(path, handler) {
                handlers[`GET ${path}`] = handler;
            },
            put(path, handler) {
                handlers[`PUT ${path}`] = handler;
            },
            delete(path, handler) {
                handlers[`DELETE ${path}`] = handler;
            },
        },
        store: {
            ensureSchema: async () => operations.push("ensure_schema"),
            getConfig: async () => config,
            saveConfig: async (values) => {
                config = values;
                return config;
            },
            deleteConfig: async () => {
                operations.push("delete_config");
                config = { instanceUrl: "" };
            },
        },
        requireAuth: (_request, _response, role) => {
            operations.push(`authorize_${role}`);
            return { sub: "admin", role };
        },
        readJson: async () => ({
            instanceUrl: "https://broken.example.test",
        }),
        sendJson: (response, status, payload) => {
            response.writeHead(status);
            response.end(JSON.stringify(payload));
        },
        sendError: () => assert.fail("valid config must not be rejected"),
        normalizeHttpUrl: (value) => value,
        registerConfiguredJitsiOrigin: () => {},
    });

    const getResponse = createResponse();
    await handlers["GET /api/v1/modules/jitsi-meet/config"]({}, getResponse);
    assert.deepEqual(getResponse.payload.data, config);

    const putResponse = createResponse();
    await handlers["PUT /api/v1/modules/jitsi-meet/config"]({}, putResponse);
    assert.deepEqual(putResponse.payload.data, {
        instanceUrl: "https://broken.example.test",
    });
    assert.deepEqual(operations.slice(-2), [
        "authorize_admin",
        "ensure_schema",
    ]);

    const deleteResponse = createResponse();
    await handlers["DELETE /api/v1/modules/jitsi-meet/config"](
        {},
        deleteResponse,
    );
    assert.equal(deleteResponse.status, 204);
    assert.deepEqual(operations.slice(-3), [
        "authorize_admin",
        "ensure_schema",
        "delete_config",
    ]);
});
