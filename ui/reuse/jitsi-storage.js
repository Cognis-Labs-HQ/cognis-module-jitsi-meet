const JITSI_STORAGE_KEY = "jitsiLocalStorage";

export function clearJitsiAuthenticationSession(storage) {
    const serializedSettings = storage?.getItem?.(JITSI_STORAGE_KEY);
    if (!serializedSettings) return { cleared: false, malformed: false };

    try {
        const settings = JSON.parse(serializedSettings);
        if (
            !settings ||
            typeof settings !== "object" ||
            !("sessionId" in settings)
        ) {
            return { cleared: false, malformed: false };
        }
        delete settings.sessionId;
        storage.setItem(JITSI_STORAGE_KEY, JSON.stringify(settings));
        return { cleared: true, malformed: false };
    } catch {
        return { cleared: false, malformed: true };
    }
}
