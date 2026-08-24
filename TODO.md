# TODO

- Complete the optional meeting Whiteboard button integration after the Nextcloud Whiteboard module contributes the browser CTX capability `whiteboard:uiGateway`. The capability must expose `createDisposableCanvas({ resourceType, resourceId, title, participantHandles })` and return `{ whiteboardId }` (or `{ id }`). Jitsi intentionally does not create provider resources through an inter-module HTTP request; its module-owned `/api/v1/modules/jitsi-meet/whiteboard/state` route only synchronizes the returned stable canvas identifier and active-window state for meeting participants.
