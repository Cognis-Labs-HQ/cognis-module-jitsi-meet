const WHITEBOARD_AVAILABILITY_URL =
    "/api/v1/modules/jitsi-meet/whiteboard/availability";

function waitForAvailabilityRetry(signal, delayMs) {
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

export async function resolveWhiteboardServerAvailability({
    apiFetch,
    signal,
    accessToken,
    attempts = 6,
    waitForRetry = waitForAvailabilityRetry,
}) {
    let lastError = null;
    for (
        let attempt = 0;
        attempt < attempts && !signal?.aborted;
        attempt += 1
    ) {
        try {
            const response = await apiFetch(WHITEBOARD_AVAILABILITY_URL, {
                accessToken: accessToken || undefined,
                suppressAccessDeniedEvent: true,
            });
            const payload = await response
                .json()
                .catch(() => ({ data: { available: false } }));
            lastError = null;
            if (response.ok && payload?.data?.available === true) return true;
        } catch (error) {
            lastError = error;
        }
        if (attempt < attempts - 1) {
            await waitForRetry(signal, Math.min(250 * 2 ** attempt, 2_000));
        }
    }
    if (lastError) throw lastError;
    return false;
}
