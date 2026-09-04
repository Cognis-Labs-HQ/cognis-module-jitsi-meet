# Safer, provider-neutral VoIP calls

**Feature Branch:** work

## Authorize calls from canonical room membership

The VoIP endpoint now asks the trusted Messages room resolver to authorize the requester and derive the complete participant roster. Client-supplied member lists can no longer select participants.

## Reuse one room mapping safely

Disposable calls now use the existing chat-room reference, protected by a unique schema constraint. Concurrent requests reuse the meeting that won creation without introducing a second source-room field, and cleanup preserves the provider-owned conversation.

## Localize and clean up provider calls

The provider uses neutral VoIP terminology, accepts a consumer-supplied subject, and otherwise supplies a localized subject. Closing the host component now runs normal presence teardown before disposing Jitsi.

## Commits

- [6e02bef](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/6e02befec71d6adcd77a18e5a56487f835ee91bd)
