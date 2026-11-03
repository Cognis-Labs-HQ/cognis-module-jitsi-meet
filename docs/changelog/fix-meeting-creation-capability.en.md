# Meeting Creation

**Feature Branch:** fix-meeting-creation-capability

## Provider-owned Meeting Creation

The browser capability `meetings:createMeeting({ participants, scheduledAt, signal })` returns `{ meetingId, navigationUrl }`. Its provider owns the HTTP request and destination, and executes `jitsi-meet:creation:create` through the host `ui:scopedActions` contract. Consumers discover this optional capability instead of constructing module endpoints. Authentication and validation remain at the existing API boundary. Aborted or removed providers cannot perform further actions.

## Commits

- [aca37ed](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/aca37edcbfad8b47d2ad5df47a5d4e878c8c0111)
