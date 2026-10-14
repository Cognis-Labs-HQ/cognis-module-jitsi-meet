const owners = new WeakMap();

export function claimRouteRoot(root, signal) {
    if (signal?.aborted) return false;
    owners.set(root, signal);
    root.classList.add("jitsi-route-root");
    signal?.addEventListener(
        "abort",
        () => {
            if (owners.get(root) !== signal) return;
            owners.delete(root);
            root.classList.remove("jitsi-route-root");
        },
        { once: true },
    );
    return true;
}
