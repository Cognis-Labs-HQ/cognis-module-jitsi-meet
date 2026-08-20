export function extractUrlOrigin(value) {
    const candidate = String(value ?? "");
    if (!URL.canParse(candidate)) return null;
    const parsed = new URL(candidate);
    return `${parsed.protocol}//${parsed.host}`;
}

export function extractUrlPathSlug(value) {
    const candidate = String(value ?? "");
    if (!URL.canParse(candidate)) return null;
    const parsed = new URL(candidate);
    const cleanPath = parsed.pathname.replace(/^\/+/, "");
    return cleanPath || null;
}

export function normalizeHttpUrl(rawUrl) {
    const candidate = String(rawUrl ?? "").trim();
    if (!candidate) return "";
    if (!URL.canParse(candidate)) return "";
    const parsed = new URL(candidate);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        return "";
    }
    parsed.pathname = parsed.pathname.replace(/\/+$/, "");
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString().replace(/\/+$/, "");
}

export function resolveExternalBaseUrl(env = process.env) {
    return String(env.EXTERNAL_HOST ?? (env.HOST ? `http://${env.HOST}` : ""))
        .trim()
        .replace(/\/+$/g, "");
}
