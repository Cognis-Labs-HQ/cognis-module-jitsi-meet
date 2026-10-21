# Restore Meeting Labels

**Feature Branch:** fix-meetings-authentication-label

## Restore Authentication Action

1.5.262 — The Meetings stage now provides its authentication button label in all four supported languages. Page elements are rendered against real locale catalogs in regression tests so missing template translations fail before release.

## Validate Translation Coverage

Check module string references, manifest labels and dynamically selected administration filters, issues, actions and confirmations against all four real locale catalogs. The audit found no further missing runtime definitions; the feedback example now references an existing key.

## Commits

- [feedcc1c](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/feedcc1cd007336610fa8c1be6287c6589544f58)
