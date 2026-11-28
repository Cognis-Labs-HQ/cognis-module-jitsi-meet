const HEARTBEAT_INTERVAL_MILLISECONDS = 10_000;
export { HEARTBEAT_INTERVAL_MILLISECONDS };
const ACTIVE_MEETINGS_REFRESH_INTERVAL_MILLISECONDS = 5_000;
export { ACTIVE_MEETINGS_REFRESH_INTERVAL_MILLISECONDS };
const PROBE_SUCCESS_DISPLAY_MILLISECONDS = 600;
export { PROBE_SUCCESS_DISPLAY_MILLISECONDS };
const STATE_REFRESH_INTERVAL_MILLISECONDS = 5_000;
export { STATE_REFRESH_INTERVAL_MILLISECONDS };
const CHAT_REFRESH_INTERVAL_MILLISECONDS = 2_500;
export { CHAT_REFRESH_INTERVAL_MILLISECONDS };
const ALONE_PROMPT_GRACE_PERIOD_MILLISECONDS = 180_000;
export { ALONE_PROMPT_GRACE_PERIOD_MILLISECONDS };
export const SESSION_ID_STORAGE_KEY = "jitsi-meet:session-id";
export const TEXT_ENCODER = new TextEncoder();
export const MEETING_SUBJECT = "Cognis Classroom";
export const JITSI_PIP_MINIMUM_SIZE = Object.freeze({
    width: 400,
    height: 225,
});
export const MEETING_TERMINATED_TEXT = "meeting terminated";
export const MEETING_DESTROYED_TEXT = "conference.destroyed";
export const JITSI_TOOLBAR_BUTTONS = [
    "microphone",
    "camera",
    "desktop",
    "fullscreen",
    "hangup",
    "tileview",
    "raisehand",
    "fodeviceselection",
];
