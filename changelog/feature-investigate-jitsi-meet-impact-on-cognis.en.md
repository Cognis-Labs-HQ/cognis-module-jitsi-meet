# Restore Reliable Jitsi Meeting Joins

**Feature Branch:** feature-investigate-jitsi-meet-impact-on-cognis

## Discard expired Jitsi authentication sessions

Meetings now removes a cached Jitsi authentication session identifier before creating an embedded conference while preserving all other Jitsi preferences. This prevents Jicofo restarts or expired sessions from causing repeated `session-invalid` conference requests and a closed bridge channel.

## Keep no-storage browsers joinable

Browser policies and opaque origins can deny access to `localStorage`. Meetings now catches both property-access and storage-operation failures, records the fallback through structured logging, and continues creating the Jitsi iframe without session cleanup.

## Commits

- [04158e4](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/04158e4a2da493d1413d5bbb7f580e0066cac468)
- [e804261](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e8042612c8e55a549db7aa32cbc8ab9e0d1cdd04)
