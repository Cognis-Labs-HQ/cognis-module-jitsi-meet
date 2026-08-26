import { uiCtx } from "/static/reuse/ui-ctx.js";

const reuseResources = uiCtx.capabilities.get("ui:reuse");

if (!reuseResources || typeof reuseResources.importModule !== "function") {
    throw new Error("Required UI capability unavailable: ui:reuse");
}

export { uiCtx };

export const importReuseModule = (path) => reuseResources.importModule(path);
export const loadReuseStylesheet = (path) =>
    reuseResources.loadStylesheet(path);
