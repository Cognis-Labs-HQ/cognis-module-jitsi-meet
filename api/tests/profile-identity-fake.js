export const profileIdentityFake = {
    normalizeHandleKey(handle) {
        return String(handle ?? "")
            .trim()
            .replace(/^@+/, "")
            .toLowerCase();
    },
    normalizeHandleKeys(values) {
        return Array.from(
            new Set(
                (Array.isArray(values) ? values : [])
                    .map((value) => this.normalizeHandleKey(value))
                    .filter(Boolean),
            ),
        ).sort();
    },
    async resolveAccountHandle(accountId) {
        return this.normalizeHandleKey(accountId);
    },
};
