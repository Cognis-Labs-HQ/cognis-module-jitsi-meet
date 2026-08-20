import { normalizeMeetingPrefix } from './meeting-values.js';
import { normalizeHttpUrl } from './reuse/url-parts.js';

const MODULE_PREFERENCE_KEY = 'module:jitsi-meet';

export function createModuleConfigResolver(preferenceStore, log) {
  if (!preferenceStore || typeof preferenceStore.get !== 'function') {
    throw new Error('Jitsi Meet requires the preferences:store capability.');
  }

  return async function resolveModuleConfig(accountId) {
    const serialized = await preferenceStore.get(
      String(accountId),
      MODULE_PREFERENCE_KEY,
    );
    let preferences = {};
    if (serialized) {
      try {
        const parsed = JSON.parse(serialized);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          preferences = parsed;
        }
      } catch (error) {
        log?.('error', 'Failed to parse Jitsi Meet module preferences.', {
          component: 'jitsi-meet-module',
          operation: 'parse_module_preferences',
          accountId: String(accountId),
          error: error instanceof Error ? error.message : String(error),
        });
        preferences = {};
      }
    }
    return {
      instanceUrl: normalizeHttpUrl(preferences.instanceUrl) ?? '',
      meetingPrefix: normalizeMeetingPrefix(preferences.meetingPrefix ?? ''),
    };
  };
}
