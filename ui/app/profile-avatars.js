import { uiCtx } from "../reuse/resources.js";

function profileAvatarRenderer() {
    const renderer = uiCtx.capabilities.get("ui:profileAvatarRenderer");
    if (!renderer) {
        throw new Error("Profile avatar capability unavailable");
    }
    return renderer;
}

export function buildProfileAvatarMarkup(options) {
    return profileAvatarRenderer().buildMarkup(options);
}

export function getProfileInitials(label) {
    return profileAvatarRenderer().getInitials(label);
}

export function getProfileInitialsColor(seed) {
    return profileAvatarRenderer().getInitialsColor(seed);
}

export function handleProfileAvatarError(event) {
    return profileAvatarRenderer().handleError(event);
}

export async function hydrateProfileAvatars(container) {
    const ensureProvidersLoaded = uiCtx.capabilities.get(
        "ui:ensureProvidersLoaded",
    );
    if (typeof ensureProvidersLoaded === "function") {
        await ensureProvidersLoaded();
    }
    await profileAvatarRenderer().hydrate(container);
    const availabilityRenderer = uiCtx.capabilities.get(
        "ui:availabilityRenderer",
    );
    if (typeof availabilityRenderer?.refresh === "function") {
        await availabilityRenderer.refresh(container);
    }
}
