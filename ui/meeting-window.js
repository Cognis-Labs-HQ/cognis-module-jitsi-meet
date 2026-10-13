export function floatMeetingWindow(
    frame,
    overlay,
    makeFloatingWindow,
    options,
) {
    const release = makeFloatingWindow(frame, {
        ...options,
        portal: false,
        topLayer: true,
    });
    frame.append(overlay);
    return release;
}
