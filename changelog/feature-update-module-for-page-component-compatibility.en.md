# Update module for page component compatibility

The Meetings SPA route now explicitly opts into Cognis component-page use. Other components can resolve it by the Jitsi Meet module UUID and stable route ID for overlay, fullscreen, or picture-in-picture presentation.

Embedded callers can provide a serializable meeting identifier through `focusState`. The page mounts inside the supplied root with a frameless composer so it does not duplicate host navigation, footer, or theme controls.

The component-page route identifiers use period-separated names so callers can resolve them with the platform's canonical route ID convention.

The meeting lifecycle now treats Jitsi `conference.destroyed` failures as closed meetings and immediately restores the Start Meeting action after leaving. Participant, performance, and background controls are omitted from the embedded Jitsi toolbar.

When the optional Nextcloud Whiteboard ctx capability is available, a Whiteboard button creates a disposable canvas and opens its synchronized component window in the meeting stage. The live meeting moves to picture-in-picture without disconnecting, and closing the whiteboard restores the normal meeting view.

The integration no longer calls a Jitsi API route to create a whiteboard through another module. The Whiteboard button is supplied only when the Whiteboard module contributes the optional browser CTX capability `whiteboard:uiGateway`, whose `createDisposableCanvas` method owns provider creation. Jitsi retains only its meeting-local active-window state endpoint.

Automatic restoration now supplies both the component-page focus state and the Whiteboard provider's current share context. A failed background restoration is logged once per meeting canvas without repeatedly showing user-action error toasts.
