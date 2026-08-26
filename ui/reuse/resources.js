import { uiCtx } from "/static/reuse/ui-ctx.js";

const reuseResources = uiCtx.capabilities.get("ui:reuse");

if (
    !reuseResources ||
    typeof reuseResources.importModule !== "function" ||
    typeof reuseResources.loadCommonStyles !== "function"
) {
    throw new Error("Required UI capability unavailable: ui:reuse");
}

export { uiCtx };

export const importReuseModule = (path) => reuseResources.importModule(path);
export const loadCommonStyles = () => reuseResources.loadCommonStyles();
export const loadReuseStylesheet = loadCommonStyles;
