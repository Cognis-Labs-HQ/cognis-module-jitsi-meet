export function waitForRetry(signal, delayMilliseconds) {
    return new Promise((resolve) => {
        if (signal?.aborted) return resolve();
        const finish = () => {
            clearTimeout(timeoutId);
            signal?.removeEventListener("abort", finish);
            resolve();
        };
        const timeoutId = setTimeout(finish, delayMilliseconds);
        signal?.addEventListener("abort", finish, { once: true });
    });
}
