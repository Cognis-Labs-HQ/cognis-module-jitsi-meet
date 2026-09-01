# Align meeting chat membership controls

**Feature Branch:** work

## Use the canonical Messages membership capability

Active meeting invitations and participant removals now use the unified `social:messages:membership` capability with canonical actor and user account IDs, matching the current Cognis Messages integration contract.

## Restore chat access when rejoining

Every authenticated meeting join now re-applies the idempotent Messages membership operation before loading chat. A participant who previously left or archived the meeting chat can therefore see it again after rejoining the meeting.

## Commits

- [d6f689a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d6f689a8d46f17897c4d1abf65f93673e99b4b30)

- [8665186](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/86651863fcf6af7736904af8c01f7cc89d5a45de)
