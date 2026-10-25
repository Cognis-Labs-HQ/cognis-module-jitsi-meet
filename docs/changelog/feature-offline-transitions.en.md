# Handle connection loss during discovery

**Feature Branch:** feature-offline-transitions

## Handle connection loss during discovery

Meeting discovery stops polling after a network failure and catches timer rejections. Offline and cancelled requests do not open discovery error toasts or clear the last meeting lists. The module uses the optional host offline-state capability and keeps cleanup tied to the page signal. Active-meeting presence and state polling follow the same lifecycle and stop together after a failed background request.

## Commits
- [aa0931e](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/aa0931ebfe17662ccef1c95a507bc065d24f0fdd)
