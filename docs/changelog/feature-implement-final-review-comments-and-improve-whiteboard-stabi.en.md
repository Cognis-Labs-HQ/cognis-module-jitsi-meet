# Stable meeting Whiteboards

**Feature Branch:** feature-implement-final-review-comments-and-improve-whiteboard-stabi

## Keep Whiteboard state within its meeting session

Persistent canvases no longer open merely because a meeting starts. Ending or restarting a meeting clears its open state, while participants only mount a canvas that the active session explicitly marks open.

## Make component mounting predictable

Component pages are requested once per meeting mount and mounting retries remain bounded. The Whiteboard control stays disabled with its normal label while keyring access or mounting is pending, changes to “Close Whiteboard” only after mounting succeeds, and discards stale asynchronous windows without misleading failure toasts.

## Align release provenance with Cognis

The pull request uses one localized changelog set named after its feature branch. Each change is represented by a release-summary heading and detailed body, followed by full repository links for the implementation commits, matching Cognis core and adjacent external modules.

## Commits

- [7141534](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/7141534703ebe3f38581e748172c38e5e990baa6)
- [12ad748](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/12ad7488915d047a891307f37b16964c2c239f42)
- [b1d430d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b1d430d91e19abe31a348f9749dc386df07c6a6c)
- [fe48d89](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/fe48d89a5447460c40f45dc4192962c2b6b2d554)
- [6d87f99](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/6d87f998c14b17fa4f3a567d86fd64279b79379b)
