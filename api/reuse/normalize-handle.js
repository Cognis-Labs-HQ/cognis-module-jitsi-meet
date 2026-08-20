export function normalizeHandleKey(handle) {
    return String(handle ?? '').trim().replace(/^@+/, '').toLowerCase();
}

export function normalizeHandleKeys(values) {
    return Array.from(new Set((Array.isArray(values) ? values : [])
        .map((value) => normalizeHandleKey(String(value ?? '')))
        .filter(Boolean))).sort();
}
