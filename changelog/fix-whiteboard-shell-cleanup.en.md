# Fix Whiteboard shell cleanup

Whiteboard component windows now keep their borderless appearance local to the Meetings stage. Closing the component or navigating away synchronously removes that local state and no longer places the shared Cognis page shell into broker-owned borderless mode.
