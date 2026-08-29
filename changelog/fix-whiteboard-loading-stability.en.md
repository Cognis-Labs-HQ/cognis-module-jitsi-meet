# Stabilize Whiteboard Loading

Whiteboard component pages are now requested once per meeting mount instead of being repeatedly replaced while a window opens. Component-window retries remain bounded, persistent canvases open only from the current session's explicit state, and ending or restarting a meeting clears that state.
