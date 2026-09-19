const WHITEBOARD_API_CAPABILITY = "whiteboard:api";

export function resolveWhiteboardProvider(ctx) {
    const provider = ctx.getCapability?.(WHITEBOARD_API_CAPABILITY);
    return provider && typeof provider === "object" ? provider : null;
}

export function resolveWhiteboardFetchBoardData(ctx) {
    const provider = resolveWhiteboardProvider(ctx);
    return typeof provider?.fetchBoardData === "function"
        ? provider.fetchBoardData.bind(provider)
        : null;
}
