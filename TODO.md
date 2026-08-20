# TODO

## Replace direct gateway UI requests

`ui/app.js`, `ui/jitsi-chat.js`, and `ui/jitsi-helpers.js` still call Messages, Profile, Files, and Share gateway endpoints directly. The currently available host UI contracts expose keyring loading, share-button rendering, and share-token callbacks, but they do not expose client functions for listing/sending room messages, loading the current profile or guest profile, or resolving namespaced file URLs. Replacing these requests inside this repository would require importing gateway or adapter implementation files, which would violate component isolation. Migrate these calls once Cognis exposes the corresponding ctx-backed UI client capabilities.
