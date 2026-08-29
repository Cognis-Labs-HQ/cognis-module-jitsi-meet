import { uiCtx } from "./reuse/resources.js";

const WHITEBOARD_UI_GATEWAY = "whiteboard:uiGateway";

function waitForProviderRetry(signal, delayMs) {
    return new Promise((resolve) => {
        if (signal?.aborted) {
            resolve();
            return;
        }
        const timeoutId = setTimeout(resolve, delayMs);
        signal?.addEventListener(
            "abort",
            () => {
                clearTimeout(timeoutId);
                resolve();
            },
            { once: true },
        );
    });
}

export async function resolveWhiteboardCapabilities(signal) {
    const readCapabilities = () => ({
        discardComponentPage: uiCtx.capabilities.get("component-pages:discard"),
        isKeyringUnlocked: uiCtx.capabilities.get("keyring:isUnlocked"),
        makeFloatingWindow: uiCtx.capabilities.get("ui:makeFloatingWindow"),
        requestKeyringUnlock: uiCtx.capabilities.get("keyring:requestUnlock"),
        spawnComponentPage: uiCtx.capabilities.get("component-pages:spawn"),
        whiteboardGateway: uiCtx.capabilities.get(WHITEBOARD_UI_GATEWAY),
    });
    let capabilities = readCapabilities();
    for (let attempt = 0; attempt < 12 && !signal?.aborted; attempt += 1) {
        const ensureProvidersLoaded = uiCtx.capabilities.get(
            "ui:ensureProvidersLoaded",
        );
        if (typeof ensureProvidersLoaded === "function") {
            await ensureProvidersLoaded({ force: attempt > 0 });
        }
        capabilities = readCapabilities();
        if (
            typeof capabilities.whiteboardGateway?.createDisposableCanvas ===
                "function" &&
            typeof capabilities.spawnComponentPage === "function" &&
            typeof capabilities.makeFloatingWindow === "function"
        ) {
            return capabilities;
        }
        if (attempt < 11) await waitForProviderRetry(signal, 250);
    }
    return capabilities;
}
