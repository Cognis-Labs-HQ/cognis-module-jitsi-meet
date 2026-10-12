import { waitForRetry } from "./reuse/abortable-delay.js";
import { uiCtx } from "./reuse/resources.js";

const WHITEBOARD_UI_GATEWAY = "whiteboard:uiGateway";

export async function resolveWhiteboardCapabilities(
    signal,
    { canvasFactory = "createDisposableCanvas" } = {},
) {
    const ensureProvidersLoaded = uiCtx.capabilities.get(
        "ui:ensureProvidersLoaded",
    );
    const readCapabilities = () => {
        const whiteboardGateway = uiCtx.capabilities.get(WHITEBOARD_UI_GATEWAY);
        const makeFloatingWindow = uiCtx.capabilities.get(
            "ui:makeFloatingWindow",
        );
        const requiredMethods = new Map([
            [
                "whiteboard:uiGateway.requestCanvasPage",
                whiteboardGateway?.requestCanvasPage,
            ],
            ["whiteboard:uiGateway.openCanvas", whiteboardGateway?.openCanvas],
            ["ui:makeFloatingWindow", makeFloatingWindow],
        ]);
        if (canvasFactory)
            requiredMethods.set(
                `whiteboard:uiGateway.${canvasFactory}`,
                whiteboardGateway?.[canvasFactory],
            );
        return {
            discardComponentPage: uiCtx.capabilities.get(
                "component-pages:discard",
            ),
            isKeyringUnlocked: uiCtx.capabilities.get("keyring:isUnlocked"),
            makeFloatingWindow,
            requestKeyringUnlock: uiCtx.capabilities.get(
                "keyring:requestUnlock",
            ),
            whiteboardGateway,
            missingCapabilities: [...requiredMethods]
                .filter(([, value]) => typeof value !== "function")
                .map(([name]) => name),
        };
    };
    let capabilities = readCapabilities();
    for (let attempt = 0; attempt < 3 && !signal?.aborted; attempt += 1) {
        if (typeof ensureProvidersLoaded === "function") {
            await ensureProvidersLoaded({ force: attempt > 0 });
        }
        capabilities = readCapabilities();
        if (capabilities.missingCapabilities.length === 0) return capabilities;
        if (attempt < 2) await waitForRetry(signal, 150);
    }
    return capabilities;
}

export async function resolveWhiteboardServerContract(apiFetch, signal) {
    const response = await apiFetch(
        "/api/v1/modules/jitsi-meet/whiteboard/availability",
        { signal },
    );
    const payload = await response.json().catch(() => ({}));
    return {
        available: response.ok && payload?.data?.available === true,
        requiredCapability: String(
            payload?.data?.requiredCapability ?? "whiteboard:fetchBoardData",
        ),
        requiredProvider: String(
            payload?.data?.requiredProvider ?? "nextcloud-whiteboard@2.3.146+",
        ),
        provider:
            payload?.data?.provider && typeof payload.data.provider === "object"
                ? payload.data.provider
                : null,
    };
}

export async function synchronizeWhiteboardOpen(
    apiFetch,
    {
        meetingId,
        whiteboardId,
        disposable,
        automaticOpen,
        shareAccessToken,
        signal,
    },
) {
    if (automaticOpen && shareAccessToken) return null;
    const response = await apiFetch(
        "/api/v1/modules/jitsi-meet/whiteboard/state",
        {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                meetingId,
                whiteboardId,
                disposable,
                active: true,
                followExisting: automaticOpen,
            }),
            accessToken: shareAccessToken || undefined,
            signal,
        },
    );
    if (automaticOpen && response.status === 409) {
        const payload = await response.json();
        if (payload?.error?.code === "whiteboard_state_changed") {
            throw new DOMException(
                "The meeting Whiteboard changed.",
                "AbortError",
            );
        }
    }
    return response;
}
