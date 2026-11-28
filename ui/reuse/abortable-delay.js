export function waitForRetry(signal, delayMs) {
    return new Promise((resolve) => {
        if (signal?.aborted) return resolve();
        const finish = () => {
            clearTimeout(timeoutId);
            signal?.removeEventListener("abort", finish);
            resolve();
        };
        const timeoutId = setTimeout(finish, delayMs);
        signal?.addEventListener("abort", finish, { once: true });
    });
}
