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
const { bindWhiteboardButton } = await import("../whiteboard-control.js");

function createMount() {
    const slot = new Element();
    const frame = new Element();
    const frameWrap = new Element();
    frameWrap.querySelector = () => frame;
    const root = {
        querySelector: (selector) =>
            selector === "#jitsi-whiteboard-button-slot" ? slot : frameWrap,
    };
    return {
        root,
        slot,
        i18n: { t: (key) => key },
        state: { meeting: { id: "meeting-1", participants: ["alice", "bob"] } },
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
        capabilities.set("whiteboard:uiGateway", { createCanvas() {} });
        await binding;
        assert.deepEqual(
            mount.slot.children,
            ending === "abort" ? [] : [replacement],
        );
        assert.deepEqual(logs, []);
        capabilities.delete("whiteboard:uiGateway");
    });
}
