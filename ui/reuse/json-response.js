/**
 * Parses JSON responses while recording an intentional fallback.
 *
 * Exports:
 * - `readJsonWithFallback` — parses a response or returns a caller-provided fallback.
 * - `resolveUiFallback` — resolves an operation or returns a logged fallback.
 *
 * Usage:
 * `const payload = await readJsonWithFallback(response, { data: null }, 'load_meeting');`
 *
 * @param {{ json: () => Promise<unknown> }} response
 * @param {unknown} fallbackValue
 * @param {string} operation
 * @returns {Promise<unknown>}
 */
export async function readJsonWithFallback(response, fallbackValue, operation) {
  try {
    return await response.json();
  } catch (error) {
    console.error('[jitsi-meet] failed to parse JSON response', {
      component: 'jitsi-meet-module',
      operation,
      error: error instanceof Error ? error.message : String(error),
    });
    return fallbackValue;
  }
}

/**
 * Resolves an asynchronous UI operation while recording its fallback.
 *
 * @param {Promise<unknown>} operationPromise
 * @param {unknown} fallbackValue
 * @param {string} operation
 * @returns {Promise<unknown>}
 */
export async function resolveUiFallback(
  operationPromise,
  fallbackValue,
  operation,
) {
  try {
    return await operationPromise;
  } catch (error) {
    console.error('[jitsi-meet] asynchronous UI operation failed', {
      component: 'jitsi-meet-module',
      operation,
      error: error instanceof Error ? error.message : String(error),
    });
    return fallbackValue;
  }
}
