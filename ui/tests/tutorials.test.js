import test, { beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mountProvider } from "../tutorials/provider.js";

let previousDocument;
let lobby;
let frame;
let lobbyRendered;
beforeEach(() => {
    previousDocument = globalThis.document;
    lobby = true;
    frame = false;
    lobbyRendered = true;
    globalThis.document = {
        querySelector: (selector) =>
            selector.includes("#jitsi-overlay")
                ? lobby
                    ? { getClientRects: () => (lobbyRendered ? [{}] : []) }
                    : null
                : frame
                  ? {}
                  : null,
        querySelectorAll: () => [{ id: "visible-target" }],
    };
});
afterEach(() => {
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
});

const manifest = JSON.parse(
    readFileSync(new URL("../../manifest.json", import.meta.url), "utf8"),
);

function fixture({ fail = false } = {}) {
    const controller = new AbortController();
    let disposed = false,
        registered,
        administrative = true,
        authenticated = true,
        offline = false;
    const resolvers = new Map();
    const targets = [],
        routes = [],
        published = new Map();
    const owner = {
        signal: controller.signal,
        dispose: () => {
            disposed = true;
        },
        target: async (id, options) => {
            assert.equal(typeof options.resolve, "function");
            targets.push(id);
            resolvers.set(id, options.resolve);
            return { id: `module.${manifest.id}:${id}` };
        },
        register: async (play) => {
            registered = play;
            if (fail) throw new Error("registration_failed");
            return { id: `module.${manifest.id}:${play.id}` };
        },
    };
    const capabilities = new Map([
        [
            "ui:tutorials",
            {
                version: 1,
                owner: (id, options) => {
                    assert.equal(id, `module.${manifest.id}`);
                    assert.equal(options.signal, controller.signal);
                    assert.deepEqual(options.stringsBaseUrls, [
                        `/static/modules/${manifest.id}/languages`,
                    ]);
                    return owner;
                },
            },
        ],
        [
            "ui:reuse",
            {
                importModule: async (name) => {
                    assert.equal(name, "access-role.js");
                    return { isAdminScope: () => administrative };
                },
            },
        ],
        ["session:isAuthenticated", () => authenticated],
        ["offline:state", { isOffline: () => offline }],
        [
            "ui:moduleTutorialTargets",
            {
                card: async (id, { signal }) => {
                    assert.equal(id, manifest.id);
                    assert.equal(signal, owner.signal);
                    return { id: `ui.modules:${id}` };
                },
            },
        ],
        [
            "study:tutorialTargets",
            {
                navigation: "study:navigation",
                route: async (input) => {
                    routes.push(input);
                    return `/resolved/${input.language}/${input.area}`;
                },
            },
        ],
    ]);
    const ctx = {
        signal: controller.signal,
        capabilities: {
            get: (id) => capabilities.get(id),
            contribute: (id, value) => published.set(id, value),
        },
    };
    return {
        ctx,
        targets,
        resolvers,
        routes,
        published,
        capabilities,
        get play() {
            return registered;
        },
        get disposed() {
            return disposed;
        },
        authenticate(value) {
            authenticated = value;
        },
        admin(value) {
            administrative = value;
        },
        disconnect(value) {
            offline = value;
        },
    };
}

test("the module contributes a localized, permission-aware play through the public host contract", async () => {
    const state = fixture();
    const dispose = await mountProvider(state.ctx);
    assert.equal(typeof dispose, "function");
    assert.ok(state.published.has(`${manifest.id}:tutorials`));
    assert.equal(state.play.version, 1);
    assert.equal(state.play.page, "/meetings");
    assert.ok(state.play.steps.length >= 1);
    assert.equal(
        new Set(state.play.steps.map((step) => step.target)).size,
        state.play.steps.length,
    );
    assert.equal(state.play.available(), true);
    for (const step of state.play.steps) {
        assert.ok(step.effects.arrow && step.effects.spotlight, step.id);
        assert.equal(
            step.highlightNext,
            !Boolean(step.advance || step.waitFor),
            step.id,
        );
        if (step.effects.arrow || step.effects.spotlight)
            assert.ok(step.target);
    }
    const keys = [
        state.play.titleKey,
        ...state.play.steps.flatMap((step) =>
            [step.titleKey, step.bodyKey].filter(Boolean),
        ),
    ];
    for (const locale of ["en", "de", "id", "ja"]) {
        const xml = readFileSync(
            new URL(`../languages/${locale}/strings.xml`, import.meta.url),
            "utf8",
        );
        for (const key of keys) {
            const entry = xml.match(
                new RegExp(
                    'name="' +
                        key.replaceAll(".", "\\.") +
                        '">([^<]+)</string>',
                ),
            );
            assert.ok(entry?.[1].trim(), `${locale}:${key}`);
        }
    }
    state.authenticate(false);
    assert.equal(state.play.available(), false);
    state.authenticate(true);
    if (manifest.id.startsWith("study-language-")) {
        for (const step of state.play.steps) await step.route();
        assert.deepEqual(
            state.routes.map((route) => route.area),
            ["overview", "explore", "flashcards"],
        );
        assert.ok(
            state.routes.every(
                (route) => route.language === manifest.id.slice(-2),
            ),
        );
    } else {
        state.disconnect(true);
        assert.equal(state.play.available(), false);
    }
    dispose();
    assert.equal(state.disposed, true);
});

test("registration failure rolls back the owner before publishing a capability", async () => {
    const state = fixture({ fail: true });
    await assert.rejects(mountProvider(state.ctx), /registration_failed/);
    assert.equal(state.disposed, true);
    assert.equal(state.published.size, 0);
});

test("an unsupported host contract is rejected before allocating an owner", async () => {
    const state = fixture();
    state.capabilities.set("ui:tutorials", { version: 2 });
    await assert.rejects(
        mountProvider(state.ctx),
        /tutorial_contract_unavailable/,
    );
});

test("direct joins exclude preparation and returning to the lobby restores it", async () => {
    lobby = false;
    frame = true;
    const state = fixture();
    const dispose = await mountProvider(state.ctx);
    assert.equal(state.play.available(), false);
    for (const resolve of state.resolvers.values())
        assert.equal(resolve(), null);
    frame = false;
    lobby = true;
    assert.equal(state.play.available(), true);
    for (const resolve of state.resolvers.values())
        assert.equal(resolve().id, "visible-target");
    lobbyRendered = false;
    assert.equal(state.play.available(), false);
    dispose();
});

test("a visible reconnect overlay does not offer lobby guidance during a call", async () => {
    frame = true;
    const state = fixture();
    const dispose = await mountProvider(state.ctx);
    assert.equal(state.play.available(), false);
    assert.equal(state.resolvers.get("meetings")(), null);
    dispose();
});
