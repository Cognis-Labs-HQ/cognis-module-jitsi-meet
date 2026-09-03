export const HEARTBEAT_INTERVAL_MS = 10_000;
export const ACTIVE_MEETINGS_REFRESH_INTERVAL_MS = 5_000;
export const PROBE_SUCCESS_DISPLAY_MS = 600;
export const STATE_REFRESH_INTERVAL_MS = 5_000;
export const CHAT_REFRESH_INTERVAL_MS = 2_500;
export const ALONE_PROMPT_GRACE_PERIOD_MS = 180_000;
export const SESSION_ID_STORAGE_KEY = "jitsi-meet:session-id";
export const TEXT_ENCODER = new TextEncoder();
export const MEETING_SUBJECT = "Cognis Classroom";
export const VOIP_MEETING_SUBJECT = "Cognis VoIP Call";
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
