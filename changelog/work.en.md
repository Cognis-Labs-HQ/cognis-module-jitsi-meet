# Align Jitsi Meet with the Scoped Module Runtime

**Feature Branch:** work

## Use the Lifecycle-Scoped Context

Jitsi Meet now obtains capabilities and runs or extends host flows directly through its scoped module context. Share management, account cleanup, Whiteboard integration, configuration enablement checks, and provider hooks no longer depend on the private system context, so disable and re-enable cycles remain fully tracked by Cognis.

## Declare the Current Integration Contract

The manifest now identifies the trusted privileged integration required for host-owned meeting capabilities and flows, uses Bootstrap as its sole runtime integration entrypoint, and synchronizes version 1.5.205 and all declared file digests. Structural tests cover the new boundary.

## Commits

- [2da84cf](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2da84cf21e4804a39e2cf2de47f0b3770f13abf5)
