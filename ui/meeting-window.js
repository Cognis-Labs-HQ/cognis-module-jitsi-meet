export function floatMeetingWindow(
    frame,
    overlay,
    makeFloatingWindow,
    options,
) {
    const hadRouteScope = frame.classList.contains("jitsi-route-root");
    const release = makeFloatingWindow(frame, options);
    frame.classList.add("jitsi-route-root");
    frame.append(overlay);
    return () => {
        release?.();
        if (!hadRouteScope) frame.classList.remove("jitsi-route-root");
    };
}
