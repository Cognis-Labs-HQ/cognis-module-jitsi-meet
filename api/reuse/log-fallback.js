/**
 * Records an intentional API fallback and returns its fallback value.
 *
 * @param {unknown} error
 * @param {string} operation
 * @param {unknown} fallbackValue
 * @returns {unknown}
 */
export function logApiFallback(error, operation, fallbackValue) {
  console.error('[jitsi-meet-module] API operation failed; using fallback', {
    component: 'jitsi-meet-module',
    operation,
    error: error instanceof Error ? error.message : String(error),
  });
  return fallbackValue;
}
