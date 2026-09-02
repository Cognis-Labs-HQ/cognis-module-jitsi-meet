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
