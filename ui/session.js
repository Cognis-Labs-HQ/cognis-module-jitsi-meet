import { SESSION_ID_STORAGE_KEY } from "./constants.js";

export function ensureSessionId() {
    const existing = localStorage.getItem(SESSION_ID_STORAGE_KEY);
    if (existing) return existing;
    const cryptoApi = globalThis.crypto;
    if (!cryptoApi?.getRandomValues) {
        throw new Error("Web Crypto is required to create a meeting session.");
    }
    let generated = cryptoApi.randomUUID?.() ?? "";
    if (!generated) {
        const randomBytes = new Uint8Array(16);
        cryptoApi.getRandomValues(randomBytes);
        const randomHex = Array.from(randomBytes)
            .map((byte) => byte.toString(16).padStart(2, "0"))
            .join("");
        generated = `session-${randomHex}`;
    }
    localStorage.setItem(SESSION_ID_STORAGE_KEY, generated);
    return generated;
}
