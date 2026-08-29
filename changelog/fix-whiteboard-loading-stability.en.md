# Stabilize Whiteboard Loading

Whiteboards now wait for late provider, component-page, and keyring capabilities when a participant opens an active meeting directly or refreshes it. Component windows retry transient loading failures, but a stored persistent canvas opens only when the current meeting session explicitly marks it open. Ending or restarting a meeting clears that open status.
