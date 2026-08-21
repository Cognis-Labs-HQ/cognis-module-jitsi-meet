import { uiCtx } from "/static/reuse/ui-ctx.js";

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

export function hydrateProfileAvatars(container) {
    return profileAvatarRenderer().hydrate(container);
}
