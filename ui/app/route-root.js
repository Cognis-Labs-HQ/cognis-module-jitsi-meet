export function createDirectMountController(target = window) {
    const controller = new AbortController();
    for (const event of ["cognis:route-will-change", "pagehide"]) {
        target.addEventListener(event, () => controller.abort(), {
            signal: controller.signal,
        });
    }
    return controller;
}

export function claimRouteRoot(root, signal) {
    if (signal?.aborted) return false;
    root.classList.add("jitsi-route-root");
    signal?.addEventListener(
        "abort",
        () => root.classList.remove("jitsi-route-root"),
        { once: true },
    );
    return true;
}
