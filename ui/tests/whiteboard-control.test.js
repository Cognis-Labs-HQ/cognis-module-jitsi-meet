import test from "node:test";
import assert from "node:assert/strict";

class Element extends EventTarget {
    children = [];
    dataset = {};
    attributes = new Map();
    classList = { contains: () => false, toggle() {} };
    get firstElementChild() {
        return this.children[0] ?? null;
    }
    getAttribute(name) {
        return this.attributes.get(name) ?? null;
    }
    append(child) {
        this.children.push(child);
        child.parentElement = this;
    }
    setAttribute(name, value) {
        this.attributes.set(name, value);
    }
    replaceChildren(...children) {
        this.children = children;
        for (const child of children) child.parentElement = this;
    }
    remove() {
        if (this.parentElement)
            this.parentElement.children = this.parentElement.children.filter(
                (child) => child !== this,
            );
    }
}
class Button extends Element {}
globalThis.HTMLElement = Element;
globalThis.HTMLButtonElement = Button;
globalThis.document = { createElement: () => new Button() };
const capabilities = new Map();
const logs = [];
capabilities.set("ui:reuse", {
    importModule: () => assert.fail("No host imports expected"),
});
capabilities.set("ui:log", (...args) => logs.push(args));
globalThis[Symbol.for("cognis.uiCtx")] = {
    capabilities: { get: (name) => capabilities.get(name) },
};
const { bindWhiteboardButton, syncWhiteboardButtonAvailability } =
    await import("../whiteboard-control.js");

function createMount() {
    const slot = new Element();
    const frame = new Element();
    const frameWrap = new Element();
    const shell = new Element();
    const host = new Element();
    const overlay = new Element();
    const targets = new Map([
        [".jitsi-stage-frame", frame],
        [".jitsi-whiteboard-component-shell", shell],
        [".jitsi-whiteboard-component-host", host],
        ["#jitsi-overlay", overlay],
    ]);
    frameWrap.querySelector = (selector) => targets.get(selector) ?? null;
    const root = {
        querySelector: (selector) =>
            selector === "#jitsi-whiteboard-button-slot"
                ? slot
                : selector === ".jitsi-stage-frame-wrap"
                  ? frameWrap
                  : null,
    };
    return {
        root,
        slot,
        host,
        i18n: { t: (key) => key },
        state: {
            meeting: {
                id: "meeting-1",
                participants: ["alice", "bob"],
                state: {},
            },
            jitsiConferenceJoined: true,
        },
    };
}

for (const ending of ["abort", "replacement"]) {
    test(`provider discovery cannot finish a ${ending} mount`, async () => {
        let finishDiscovery;
        capabilities.set(
            "ui:ensureProvidersLoaded",
            () =>
                new Promise((resolve) => {
                    finishDiscovery = resolve;
                }),
        );
        capabilities.set("component-pages:spawn", () =>
            assert.fail("Cancelled control cannot spawn"),
        );
        capabilities.set("ui:makeFloatingWindow", () =>
            assert.fail("Cancelled control cannot float"),
        );
        const mount = createMount();
        const controller = new AbortController();
        const binding = bindWhiteboardButton({
            ...mount,
            signal: controller.signal,
        });
        const replacement = new Button();
        if (ending === "abort") controller.abort();
        else mount.slot.replaceChildren(replacement);
        finishDiscovery();
        // Let the discovery loop terminate without waiting for another provider pass.
        capabilities.set("whiteboard:uiGateway", {
            createCanvas() {},
            requestCanvasPage() {},
            openCanvas() {},
        });
        await binding;
        assert.deepEqual(
            mount.slot.children,
            ending === "abort" ? [] : [replacement],
        );
        assert.deepEqual(logs, []);
        capabilities.delete("whiteboard:uiGateway");
    });
}

function publishGateway(gateway) {
    capabilities.set("ui:ensureProvidersLoaded", async () => {});
    capabilities.set("ui:makeFloatingWindow", () => () => {});
    capabilities.set("whiteboard:uiGateway", gateway);
}

test("an enabled provider with an incomplete presentation contract keeps an explained disabled control", async () => {
    publishGateway({ createCanvas() {} });
    const mount = createMount();
    const controller = new AbortController();
    await bindWhiteboardButton({ ...mount, signal: controller.signal });
    assert.equal(mount.slot.children.length, 1);
    const button = mount.slot.firstElementChild;
    assert.equal(button.disabled, true);
    assert.equal(
        button.title,
        "module.jitsi_meet.whiteboard.provider_contract_unavailable",
    );
    assert.equal(mount.slot.title, button.title);
    assert.deepEqual(logs.at(-1)[2].missingCapabilities, [
        "whiteboard:uiGateway.requestCanvasPage",
        "whiteboard:uiGateway.openCanvas",
    ]);
    controller.abort();
    assert.deepEqual(mount.slot.children, []);
});

test("the complete provider enables the meeting control without profile availability requests", async () => {
    const pages = [];
    publishGateway({
        createCanvas() {},
        requestCanvasPage(options) {
            pages.push(options);
            return { ready: true };
        },
        openCanvas() {},
    });
    const mount = createMount();
    const controller = new AbortController();
    await bindWhiteboardButton({
        ...mount,
        signal: controller.signal,
        apiFetch: () =>
            assert.fail("Binding a ready control cannot query another feature"),
    });
    assert.equal(mount.slot.children.length, 1);
    const button = mount.slot.firstElementChild;
    assert.equal(button.disabled, false);
    assert.equal(pages.length, 1);
    mount.state.meeting.state.screenSharingActive = true;
    syncWhiteboardButtonAvailability(mount);
    assert.equal(button.disabled, true);
    controller.abort();
    assert.deepEqual(mount.slot.children, []);
});

test("failed provider discovery leaves a disabled control and releases it on departure", async () => {
    capabilities.set("ui:ensureProvidersLoaded", async () => {
        throw new Error("discovery unavailable");
    });
    const mount = createMount();
    const controller = new AbortController();
    await bindWhiteboardButton({ ...mount, signal: controller.signal });
    assert.equal(mount.slot.firstElementChild.disabled, true);
    assert.equal(
        mount.slot.title,
        "module.jitsi_meet.whiteboard.provider_contract_unavailable",
    );
    assert.equal(logs.at(-1)[2].operation, "load_whiteboard_ui_providers");
    controller.abort();
    assert.deepEqual(mount.slot.children, []);
});

test("rebinding a recovered provider clears its previous failure explanation", async () => {
    const mount = createMount();
    const controller = new AbortController();
    publishGateway({ createCanvas() {} });
    await bindWhiteboardButton({ ...mount, signal: controller.signal });
    publishGateway({
        createCanvas() {},
        requestCanvasPage: async () => ({ ready: true }),
        openCanvas() {},
    });
    await bindWhiteboardButton({ ...mount, signal: controller.signal });
    assert.equal(mount.slot.children.length, 1);
    assert.equal(mount.slot.firstElementChild.disabled, false);
    assert.equal(mount.slot.title, "");
    controller.abort();
    assert.deepEqual(mount.slot.children, []);
});
