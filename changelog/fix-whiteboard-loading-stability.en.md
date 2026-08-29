# Stabilize Whiteboard loading

- **Feature branch:** `fix-whiteboard-loading-stability`
- **Commits:**
    - `7141534` — Stabilize Whiteboard loading and session synchronization
    - `12ad748` — Consolidate whiteboard release notes

## Changes

Whiteboard component pages are requested once per meeting mount and component-window retries remain bounded. While the keyring prompt or component mount is pending, the control stays disabled with its normal label and changes to “Close Whiteboard” only after mounting succeeds. Stale cancelled mounts no longer display failure toasts, persistent canvases open only from the current session's explicit state, and ending or restarting a meeting clears that state.
