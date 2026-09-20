const uiCtx = globalThis[Symbol.for("cognis.uiCtx")];

if (!uiCtx || typeof uiCtx.capabilities?.get !== "function") {
    throw new TypeError("Cognis UI context is unavailable.");
}

const reuseResources = uiCtx.capabilities.get("ui:reuse");

if (!reuseResources || typeof reuseResources.importModule !== "function") {
    throw new Error("Required UI capability unavailable: ui:reuse");
}

export { uiCtx };

export const importReuseModule = (path) => reuseResources.importModule(path);
