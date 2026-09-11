# Align Jitsi Meet with the tightened module lifecycle

**Feature Branch:** feature-fix-module-lifecycle-alignment

## Restore safe module enablement

Jitsi Meet now obtains the host browser context from the deliberately exposed global capability bus instead of importing a Cognis-internal module, allowing the tightened external-module boundary validation to pass.

## Support configuration before activation

A restricted disabled API entrypoint registers only the explicitly opted-in configuration endpoints before activation. Administrators can configure Jitsi without activating feature routes, UI contributions, flows, or capabilities.

## Share configuration registration consistently

The enabled and disabled API entrypoints now use the same configuration registration layer, matching the Nextcloud Whiteboard lifecycle pattern. Configuration validation, authentication, liveness testing, CSP origin registration, enablement testing, and unavailable-dependency responses remain consistent in both states.

## Commits

- [3335e1f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3335e1fe833be67ee047c2e307ef0a5780e973c6)

- [2e52a5a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2e52a5ac0a26a29a582542ac97a11f7f3139dc29)

- [ffe2d69](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/ffe2d69c4cf489d3ff7c74b908113d816407084d)
