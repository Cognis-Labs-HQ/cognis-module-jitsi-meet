# Authorize Jitsi account cleanup

**Feature branch:** feature-auth-deprovision-outcome

## Require Auth-owned deletion outcomes

Jitsi 1.6.16 resolves `auth:deprovisionOutcome` protocol v1 through the active stage context and `system:contracts`. Only an owner-confirmed committed deletion authorizes cleanup for the original account. Mutable input and public persistence results cannot grant or redirect that authority. Missing or incompatible contracts fail closed. Existing meeting ownership, resource deletion order, error handling and module lifecycle remain intact.

## Coordinate the host and module release

This companion requires the candidate Auth 2.2.12 outcome contract and Core 0.6.6 immutable flow-stage references. These are coordinated release dependencies, not a claim of already released host support. Install the matching host before enabling this module and update older Jitsi consumers before considering their cleanup protected. Preserve the verified guest admission changes from [PR #33](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/pull/33). No older-host fallback is provided.

## Verify cleanup through registered flows

Synthetic tests exercise exported bootstrap, registered cleanup and store flows, forged results, changed targets, invocation binding, provider lifetime, resource errors, optional Whiteboard behavior, disable/re-enable and uninstall. The server-only change introduces no tutorial controls or progression steps. No live account, meeting or external resource is modified by validation.

## Commits
