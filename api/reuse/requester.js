export async function resolveRequesterUsername(
    profileStore,
    profileIdentity,
    accountId,
) {
    const profile = await profileStore.getProfile(accountId);
    const normalized = profileIdentity.normalizeHandleKey(
        profile?.handle ?? "",
    );
    if (!normalized) {
        throw new Error(
            "A visible profile handle is required to use Meetings.",
        );
    }
    return normalized;
}
