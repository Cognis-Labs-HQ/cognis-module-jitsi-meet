# Invite participants to active meetings

**Feature Branch:** work

## Extend active non-disposable meetings

Participants can now be dragged into an active meeting that began with invitees. The meeting membership and encrypted Messages chat are updated, the new participant receives an invitation, and they can claim the meeting password when joining. Staged participants are not returned to the available list after the meeting starts.

## Keep active meeting surfaces usable

Participant refreshes no longer reopen the lobby overlay over a joined meeting, so notification and active-list joins remain usable. The available participant column now displays “No available participants.” when empty.

## Reveal the active participant dropzone

Dragging an available participant now temporarily reveals a localized drop target over an eligible active meeting window. Dropping invites the participant, while ending the drag restores the uninterrupted meeting view.

## Layer the dropzone over the Jitsi embed

A valid participant drag now activates the dropzone directly from the avatar drag event. The dropzone exactly matches the embedded Jitsi window, moves above the iframe while dragging, and returns below it when the participant is dropped or the drag ends.

## Keep the green drag guide visible

The active participant target now keeps the same green outline throughout the entire drag, adds an inset green edge and dashed target, and clears the guide only when the drag ends or the participant is dropped.

## Revoke access for kicked attendees

The meeting client now recognizes local Jitsi kick events and errors. Kicked account users are removed from stored membership and reappear as available invitees, while kicked guests have only the Share link used for their session revoked; presence is also made inactive.

## Release the persistent route root on unmount

Routed, shared, and embedded Meetings mounts now avoid claiming an already-aborted root and remove `.jitsi-route-root` when their lifecycle signal aborts. Async initialization stops before creating later presentation work, while existing cleanup continues to dispose observers, handlers, timers, chat work, whiteboards, and the Jitsi embed.

## Prevent participant-key collisions and hide reserved users

Active membership changes now use a meeting-scoped participant key, preventing PostgreSQL uniqueness failures when the resulting roster matches another meeting. Participant discovery omits users actively present in another meeting, and the active-invite API enforces the same availability rule without hiding scheduled invitees.

## Refresh live participant integrations

Available participants and active meetings now refresh every five seconds, avatar presence providers initialize after SPA navigation, meeting chat reloads expanded membership and messages, and successful active invitations show a toast. Existing persistent whiteboards receive expanded participant access through an optional provider capability. Empty participant copy matches the active-meeting empty state, kick copy is shorter, and the advertised picture-in-picture minimum is 320 × 180 pixels.

## Commits

- [28774f3](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/28774f3df4a49adabc7e5470442e4cc087555e87)

- [4c26402](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/4c26402d1005c86a6f28eecc78883e447bb97c11)
- [206b29f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/206b29f70af70eab3d63d8dae871f182dc97f40a)
- [5f7683b](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/5f7683b1c03719763333174cd6802bf4d33d37e9)
- [33eddd2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/33eddd2c63b80998f6d8e9ee44b6152c0080628f)
- [1386015](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1386015409eeb5bd252208dcdff27b809e4db00e)
- [eb8aef2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/eb8aef223aa633bcd302ee27dd934a63e92bcf78)
- [2d07b3b](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2d07b3b6d0bd57563c83706f37c5dffcbf01f59f)
- [b88f6db](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b88f6db738e3bfad4ea1fd84ffecd2afe8bcb91f)
