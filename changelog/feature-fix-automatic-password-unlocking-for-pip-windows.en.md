# Restore automatic meeting unlock after reconnects

**Feature Branch:** feature-fix-automatic-password-unlocking-for-pip-windows

## Reuse the stored password after a confirmed join

Jitsi reconnects now automatically resubmit the resolved meeting password after the conference had already joined, including reconnects caused by moving a meeting into picture-in-picture on macOS. A repeated request before the initial join still opens the keyring correction flow for a rejected password.

## Preserve the embedded meeting while moving it

The PiP request now tells the host to preserve the Jitsi iframe browsing context while moving its frame. This addresses Safari recreating the embedded context during a DOM reparent while retaining automatic password recovery as a fallback.

## Commits

- [ec5ae21](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/ec5ae213f8288e7b6fc1325493e972fb2624010b)
- [e47e3d0](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e47e3d0be4d37fe1ddb119a442ccd10adf512e86)
