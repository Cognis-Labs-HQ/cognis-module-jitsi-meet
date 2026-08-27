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

Meeting PiP is now owned entirely by the Cognis component-page broker. The module invokes the core floating-window capability without carrying PiP positioning code or styles. Whiteboard activation now remains pending until component mounting and state synchronization finish, preventing polling from discarding an in-progress mount.

Whiteboard presentation now marks the canvas disposable only for participant-free meetings; meetings with staged participants open the normal resource-keyed canvas.

The core floating-window capability is now activated before the asynchronous component-page spawn begins. This restores the previously working behavior where the meeting enters PiP as soon as the Whiteboard takes over the stage, instead of waiting for the Whiteboard mount to finish.

Whiteboard component-window spawns now set the Cognis core `borderless` contract flag, allowing the broker to remove the outer window frame while the existing frameless focus state controls the embedded Whiteboard shell.

The Whiteboard button highlights immediately while its component window is active. Selecting the highlighted button again discards the component window, releases meeting picture-in-picture, and synchronizes the default meeting view.

New meetings now derive their display name from the generated Jitsi room slug. That exact unique name is passed to the meeting Whiteboard, while the associated Messages chat uses the unique meeting name followed by its creation date.

Borderless Whiteboard windows now let the Jitsi stage grow with their content instead of clipping it into a fixed-height area with vertical overflow. The stage responds to core’s `app-page__main--component-borderless` host class, and redundant module-level component-window margin overrides were removed in favor of the core contract.

The host-level `app-page__main--component-borderless` override was removed. The overflow came from the Jitsi stage’s own later-loaded `overflow: hidden` rule overriding core’s generic `component-page-stage` behavior; the fix now targets `.jitsi-stage-frame-wrap.component-page-stage` directly and lets its borderless child establish an automatic stage height.

Meetings now persists an optional per-meeting `whiteboardOpen` state only when a Whiteboard canvas exists. Organizers open it immediately; non-organizers accumulate presence-scoped votes until a strict majority agrees. Polling clients that observe the open state automatically spawn the shared canvas and activate meeting PiP, including participants who join later.

Starting or reclaiming a meeting instance no longer resets an already-open per-meeting Whiteboard. This removes the join-lifecycle race that closed participant-free meeting Whiteboards on the next five-second state refresh; explicit meeting termination still closes the shared Whiteboard.

The five-second state endpoint now returns the same public meeting-state shape as initial meeting loads. It maps the persisted internal Whiteboard flag to `whiteboardOpen`, preventing polling from treating an open participant-free Whiteboard as absent and closing its component window.

Meetings now mirrors an active borderless Whiteboard handle onto the meeting stage as `component-page-stage--borderless`. Only while that handle is active, the fixed meeting height and clipped stage overflow are relaxed so the component canvas can grow the stage; closing or failing the component spawn restores the default Jitsi layout.

The Whiteboard control now renders as an anchor and uses the standard `btn-confirm` active treatment. Organizer open-state synchronization now finishes before component-page and PiP activation, removing the initial polling/mount race that produced repeated open-failure feedback. Transient component-mount startup failures are retried internally before any failure toast is shown.

The anchor-based Whiteboard action now has complete module-owned control styling. It no longer renders as a bare underlined link when host button defaults or administration-only `btn-*` declarations are unavailable, while `btn-confirm` continues to select its active colors.

Meetings now consumes Cognis core’s page-builder, reusable page-section stylesheet, and `ensurePageStylesheet` utility instead of duplicating button palettes, component-stage lifecycle toggling, and stylesheet injection. This also fixes the inactive Whiteboard anchor inheriting the global blue link color: `btn-neutral` and `btn-confirm` now come from the canonical core stylesheet bundle.

Meetings now uses the newly published `ui:reuse` capability as its sole browser gateway to production modules under `ui/reuse/` and common reuse stylesheets. A small module-owned facade validates capability availability, all UI entrypoints request only the utilities they use, `page-sections.css` loads through the capability, and the duplicated stylesheet injector has been removed.

The local `ensureStylesheetLoaded` export has been restored as a `ui:reuse`-backed delegate, and the current Meetings entrypoint consumes that same export. This prevents mixed SPA caches from loading an older route entry against a newer helper module and failing module instantiation with a missing named export.

Whiteboard mount failures are now latched for the current Meetings SPA mount. Non-retryable dynamic-import failures stop immediately; all terminal preparation or mount failures are logged once, show “Error loading whiteboard,” disable the local Whiteboard control, and prevent consensus polling from attempting another mount until refresh or SPA remount.

The Whiteboard action remains an anchor and now delegates all visual states to Cognis core: `btn-neutral` is the default, while hover and the active/open state apply `btn-confirm`. Leaving hover restores `btn-neutral` unless the Whiteboard is still active.

The Whiteboard anchor no longer carries a module-specific presentation class. Its default, hover, and active appearance now comes entirely from the Cognis core `btn-neutral`, `btn-confirm`, and `btn-animated` utilities; the module retains only semantic ARIA state and behavior.

The Meetings SPA now calls the `ui:reuse` capability's `loadCommonStyles()` contract before rendering instead of loading only `page-sections.css`. This ensures the complete Cognis core stylesheet catalog, including standard button presentation, is available after direct and SPA navigation.

The Whiteboard action now uses the same native `<button>` and core `btn-*` contract as the adjacent Share action, including the native disabled state. Borderless spawns also forward the document-scroll layout contract in their component context, and the active Jitsi stage uses a content-sized grid row with visible overflow so the embedded canvas can expand instead of creating a nested vertical scroller.

Meeting names are now generated as four words by a maintained, cryptographically secure passphrase package. Whiteboard preparation binds asynchronous results to the original meeting, pending consensus cannot be bypassed through a proposed canvas mapping, and the state API rejects non-boolean active values.

## Add uninstall cleanup and localized metadata

Jitsi Meet now removes its saved configuration when uninstalled and can also remove all stored meeting content when requested. Module store metadata is now translated through module-owned language keys.

## Delete chats for disposable meetings

When a meeting has only its creator and a share link, closing it now also deletes its associated Messages chat for the creator. If chat deletion fails, the meeting record is retained so cleanup can be retried safely.

## Module Settings

## Core-rendered configuration

Cognis now renders the manifest-declared settings and exchanges values with the module-owned GET and PUT config endpoint. Browser logging, toasts, and fatal error reporting use the host capabilities.

## Quality standards

The module now uses the Cognis Prettier configuration and standalone structural, localization, naming, and documentation-convention checks.

## Localized documentation templates

Contributor documentation templates now include German, English, Indonesian, and Japanese variants copied from the Cognis standard.

## Integrate the Share UI gateway in the meeting module

The meeting share button is now mounted through the central Share UI gateway using its container interface. Its icon, localized label, styling, guest behavior, and teardown follow the established Cognis behavior, and the meeting page remains usable when the gateway hides the trigger for the current sharing context.

Meeting owners can also join an active meeting when only a guest using a share link is present.

## Localized README variants

Added German, English, Indonesian, and Japanese README variants with an English `README.md` symlink, and added a regression check for the manifest locale bundle URL.

## Fix meeting identities and disposable chats

Meetings now use unique four-word names consistently for Whiteboards and undated Messages chats. Participant-free disposable meetings no longer create chats, and any existing associated chat is permanently deleted when the meeting ends. The Whiteboard control also preserves its active presentation across redraws.

## Restore the meeting share button

The meeting window now declares the share popup capability it uses, so Cognis can provide the Share button and open the standard share dialog after a participant joins.

## Fix participant Whiteboard persistence

Meeting payloads now explicitly identify whether invited participants exist. Participant meetings require the provider's persistent canvas factory and never fall back to disposable creation, preserving automatic saving for their mapped canvases.

## Fix Whiteboard active class

The Whiteboard button now receives the standard `active` class while its component window is open, matching selected navigation items and preserving the marker across meeting redraws.

## Fix Whiteboard button discovery

The Whiteboard button now depends only on the provider's base canvas factory and component-window capabilities. Optional persistent-canvas and participant-save methods no longer cause the control to disappear while provider versions are loading or upgrading.

## Trim Whiteboard CSS integration

Meetings no longer adds Whiteboard-specific presentation classes or overrides the shared component window. The control uses imported button states and the component uses imported broker classes, preventing its stylesheet from affecting later SPA pages.

## Fix Whiteboard keyring popup

Meetings now requests keyring access from the parent page before mounting a Whiteboard component window, allowing a locked keyring to present its unlock popup instead of leaving the component load on an unhandled authorization response.

## Fix Whiteboard mapping type

Meetings now persist whether each mapped Whiteboard is disposable. Participant meetings reject unknown or disposable mappings left by earlier integrations and request a new persistent canvas instead of reopening a disposable canvas with auto-save disabled.

## Fix Whiteboard open indicator

An open Whiteboard now gives its meeting control an accent-backed active presentation and changes the label to “Close Whiteboard,” providing a visible and textual indication that selecting it will close the current canvas.

## Fix Whiteboard participant synchronization

Meetings now reserve disposable canvases for participant-free sessions. Persistent meeting canvases are saved for every participant and automatically reopen from their meeting mapping, while organizer and participant controls follow the synchronized open state.

## Fix Whiteboard shell cleanup

Whiteboard component windows now keep their borderless appearance local to the Meetings stage. Closing the component or navigating away synchronously removes that local state and no longer places the shared Cognis page shell into broker-owned borderless mode.

## Integrate persistent Whiteboard gateway

Participant meetings now call the Whiteboard provider's `createCanvas` method with the meeting title and invited participant handles exactly as exposed by the updated gateway. Participant-free meetings continue to use the resource-keyed `createDisposableCanvas` method.
