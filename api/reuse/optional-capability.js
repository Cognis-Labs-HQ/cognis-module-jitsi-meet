const DEFAULT_RETRY_DELAYS_MS = Object.freeze([0, 100, 250, 500, 1_000]);

function wait(delayMs) {
    return new Promise((resolve) => setTimeout(resolve, delayMs));
}

export async function resolveOptionalCapability(
    ctx,
    capabilityId,
    { retryDelaysMs = DEFAULT_RETRY_DELAYS_MS } = {},
) {
    for (const delayMs of retryDelaysMs) {
        if (delayMs > 0) await wait(delayMs);
        const capability = ctx.getCapability(capabilityId);
        if (capability !== undefined) return capability;
    }
    return undefined;
}
