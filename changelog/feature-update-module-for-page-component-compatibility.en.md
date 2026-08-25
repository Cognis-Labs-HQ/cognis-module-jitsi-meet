# Update module for page component compatibility

The Meetings SPA route now explicitly opts into Cognis component-page use. Other components can resolve it by the Jitsi Meet module UUID and stable route ID for overlay, fullscreen, or picture-in-picture presentation.

Embedded callers can provide a serializable meeting identifier through `focusState`. The page mounts inside the supplied root with a frameless composer so it does not duplicate host navigation, footer, or theme controls.

The component-page route identifiers use period-separated names so callers can resolve them with the platform's canonical route ID convention.

The meeting lifecycle now treats Jitsi `conference.destroyed` failures as closed meetings and immediately restores the Start Meeting action after leaving. Participant, performance, and background controls are omitted from the embedded Jitsi toolbar.

When the optional Nextcloud Whiteboard ctx capability is available, a Whiteboard button creates a disposable canvas and opens its synchronized component window in the meeting stage. The live meeting moves to picture-in-picture without disconnecting, and closing the whiteboard restores the normal meeting view.

The integration no longer calls a Jitsi API route to create a whiteboard through another module. The Whiteboard button is supplied only when the Whiteboard module contributes the optional browser CTX capability `whiteboard:uiGateway`, whose `createDisposableCanvas` method owns provider creation. Jitsi retains only its meeting-local active-window state endpoint.

Whiteboard discovery now uses `component-pages:request` without mounting UI. After a disposable canvas has been prepared, the user's button activation synchronously invokes `component-pages:spawn` with the Meeting Window stage ID; the broker owns containment, navigation blocking, provider cleanup, and the returned discard handle. The meeting PiP responds to the broker's `component-page-stage` state without custom component-window positioning.

Repeated Whiteboard button presses no longer discard an open canvas. Participant meetings preserve their stable, resource-keyed canvas ID across meeting instances, participant-free meetings remain disposable, the broker window and embedded page fill the stage, and SPA remounts explicitly ensure UI providers and prepare the canvas for the current meeting.

Meetings now retries a missing Whiteboard gateway by forcing one host provider-catalog refresh, fixing stale startup and module-update catalogs without a disable/enable cycle. Component windows use their broker discard handle with a stage-scoped fallback, while route-wide `component-pages:discardAll` cleanup remains with the SPA shell.

SPA mounts now retry provider readiness, assign every newly bound meeting stage a collision-resistant destination ID, and request the Whiteboard in overlay mode. This prevents parked or stale Meetings DOM from receiving the mount and prevents a contained canvas from being treated as a fullscreen page.

Spawned Whiteboards now request frameless presentation and use stage-scoped workspace, panel, section, grid, and widget spacing overrides so the canvas expands to the available Meeting Window area while preserving the meeting PiP.

Meeting PiP is now owned entirely by the Cognis component-page broker. The module no longer requests the floating-window capability or carries PiP positioning and lifecycle code.

Whiteboard presentation now marks the canvas disposable only for participant-free meetings; meetings with staged participants open the normal resource-keyed canvas.
