/**
 * Records an intentional API fallback and returns its fallback value.
 *
 * @param {unknown} error
 * @param {string} operation
 * @param {unknown} fallbackValue
 * @returns {unknown}
 */
let moduleLog = null;

export function configureApiLogger(log) {
    if (typeof log !== "function") {
        throw new Error("Jitsi Meet requires the module logging capability.");
    }
    moduleLog = log;
}

export function logApiFallback(error, operation, fallbackValue) {
    if (!moduleLog) {
        throw new Error("Jitsi Meet API logger is not configured.");
    }
    moduleLog("error", "API operation failed; using fallback.", {
        operation,
        error: error instanceof Error ? error.message : String(error),
    });
    return fallbackValue;
}
