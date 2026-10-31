# Guided tutorial

**Feature Branch:** feature-guided-tutorials

## Technical Specification

The play introduces meetings and staged participants without joining or creating a meeting. It requires an authenticated online session.

The module registers its own play and localized strings through ctx. The host owns the catalog, callouts, arrows, spotlight, keyboard and pointer controls, guarded SPA navigation and accessibility. Closing a tutorial, navigating away, losing access or disabling the module releases the session. Failed provider mounting rolls back its registrations.

Provider tests check the public contract, all four translations, availability rules, rollback and rejection of unsupported host versions.

## Commits

- [81bba10](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/81bba1029024c0060b92c506475eb134462d0268)
