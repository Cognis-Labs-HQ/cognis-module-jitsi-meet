# Secure meeting state synchronization

**Feature Branch:** work

## Restrict authoritative meeting state updates

Only the meeting organizer can now report Jitsi screen-sharing state, and the independent endpoint is no longer nested under Whiteboard. Screen-sharing state is reset whenever a meeting instance starts or ends so a later instance cannot inherit a stale lock.

## Protect participant presence filtering

Participant search now verifies access before excluding the requested meeting from active-presence filtering, preventing unauthorized meeting identifiers from revealing attendance differences.

## Commits

- [f6d7cdb](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f6d7cdb9645e336a672b7749a7aab616b74b32d9)
