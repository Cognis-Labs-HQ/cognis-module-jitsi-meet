# Handle connection loss during discovery

**Feature Branch:** feature-offline-transitions

## Keep Current Meeting Polling

Presence and state timer callbacks belong to a tracking generation and meeting identity. Switching meetings or restarting tracking for the same meeting retires the previous generation. Late failures and already queued callbacks from retired generations cannot stop the current heartbeat or state timers or send requests for the new session. A failure from the current generation still stops both timers, and page/offline cleanup invalidates its generation.

## Handle connection loss during discovery

Meeting discovery stops polling after a network failure and catches timer rejections. Offline and cancelled requests do not open discovery error toasts or clear the last meeting lists. The module uses the optional host offline-state capability and keeps cleanup tied to the page signal. Active-meeting presence and state polling follow the same lifecycle and stop together after a failed background request.

## Commits

- [aa0931e](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/aa0931ebfe17662ccef1c95a507bc065d24f0fdd)
