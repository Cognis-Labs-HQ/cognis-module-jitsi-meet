# Secure active-meeting participant invitations

**Feature Branch:** work

## Reject approval-service failures

Participant invitations now fail closed when the Share approval service errors, preventing access from being granted without the required consensus.

## Resolve requester identity correctly

Participant search now supplies the Profile identity contract when resolving the requester, so authorized meetings can be excluded from presence filtering without hiding eligible invitees.

## Restore localized release-note parity

The Indonesian and Japanese release notes now include translated counterparts for every change point present in the German and English variants.

## Commits

- [c1a84cf](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/c1a84cff8f03a7474dc65223a8c0e0a934daa207)
