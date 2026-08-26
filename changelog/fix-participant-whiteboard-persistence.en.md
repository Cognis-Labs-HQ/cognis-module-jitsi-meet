# Fix participant Whiteboard persistence

Meeting payloads now explicitly identify whether invited participants exist. Participant meetings require the provider's persistent canvas factory and never fall back to disposable creation, preserving automatic saving for their mapped canvases.
