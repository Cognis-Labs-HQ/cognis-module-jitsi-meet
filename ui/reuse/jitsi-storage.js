const JITSI_STORAGE_KEY = "jitsiLocalStorage";

export function clearJitsiAuthenticationSession(storage) {
    let serializedSettings;
    try {
        serializedSettings = storage?.getItem?.(JITSI_STORAGE_KEY);
    } catch {
        return { cleared: false, malformed: false, unavailable: true };
    }
    if (!serializedSettings) {
        return { cleared: false, malformed: false, unavailable: false };
    }
    try {
        const settings = JSON.parse(serializedSettings);
        if (
            !settings ||
            typeof settings !== "object" ||
            !("sessionId" in settings)
        ) {
            return { cleared: false, malformed: false, unavailable: false };
        }
        delete settings.sessionId;
        try {
            storage.setItem(JITSI_STORAGE_KEY, JSON.stringify(settings));
        } catch {
            return { cleared: false, malformed: false, unavailable: true };
        }
        return { cleared: true, malformed: false, unavailable: false };
    } catch {
        return { cleared: false, malformed: true, unavailable: false };
    }
}
