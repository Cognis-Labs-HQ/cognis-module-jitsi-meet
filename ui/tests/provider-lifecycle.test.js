import assert from "node:assert/strict";
import test from "node:test";

const links = new Map();
let requests = 0;
const navbar = {
    contribute(id, link) {
        assert.equal(links.has(id), false);
        links.set(id, link);
        return () => links.delete(id);
    },
    render() {},
};
globalThis.window = new EventTarget();
window.location = { pathname: "/dashboard" };
globalThis[Symbol.for("cognis.uiCtx")] = {
    capabilities: {
        get(name) {
            if (name === "ui:reuse")
                return {
                    importModule(path) {
                        if (path === "i18n.js")
                            return {
                                createI18n: async () => ({ t: (key) => key }),
                            };
                        if (path === "api-client.js")
                            return {
                                apiFetch: async () => {
                                    requests += 1;
                                    return {
                                        ok: true,
                                        json: async () => ({
                                            data: { ready: true },
                                        }),
                                    };
                                },
                            };
                        assert.fail(path);
                    },
                };
            if (name === "ui:log") return () => {};
        },
    },
};
const { mountProvider } = await import("../navbar.js");

test("navbar provider releases its link and cancels listeners before re-enable", async () => {
    const controller = new AbortController();
    const ctx = {
        signal: controller.signal,
        capabilities: { get: () => navbar },
    };
    const release = mountProvider(ctx);
    assert.equal(links.get("jitsi-meet:meetings").href, "/meetings");
    window.location.pathname = "/meetings";
    window.dispatchEvent(new Event("popstate"));
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(requests, 1);
    controller.abort();
    release();
    window.dispatchEvent(new Event("focus"));
    assert.equal(requests, 1);
    const next = new AbortController();
    const nextRelease = mountProvider({ ...ctx, signal: next.signal });
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(requests, 2);
    assert.equal(links.size, 1);
    next.abort();
    nextRelease();
    assert.equal(links.size, 0);
});
