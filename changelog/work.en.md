# Align Jitsi Meet with the Scoped Module Runtime

**Feature Branch:** work

## Use the Lifecycle-Scoped Context

Jitsi Meet now obtains capabilities and runs or extends host flows directly through its scoped module context. Share management, account cleanup, Whiteboard integration, configuration enablement checks, and provider hooks no longer depend on the private system context, so disable and re-enable cycles remain fully tracked by Cognis.

## Declare the Current Integration Contract

The manifest now identifies the trusted privileged integration required for host-owned meeting capabilities and flows, uses Bootstrap as its sole runtime integration entrypoint, and synchronizes version 1.5.206 and all declared file digests. Structural tests cover the new boundary.

## Keep Inactive Overlay Controls Hidden

The meeting lobby now enforces HTML hidden-state behavior inside the module surface, preventing host button display rules from exposing authentication, reclaim, leave, or remain controls before their matching meeting state. The release version and integrity digests are synchronized at 1.5.206.

## Commits

- [2da84cf](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2da84cf21e4804a39e2cf2de47f0b3770f13abf5)
- [f968ac5](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f968ac54673f1c34d5a745db94496095e36b1ba7)
