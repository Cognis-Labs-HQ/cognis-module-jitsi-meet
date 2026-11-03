# Besprechungen erstellen

**Funktionszweig:** fix-meeting-creation-capability

## Besprechungserstellung beim Anbieter

Die Browser-Capability `meetings:createMeeting({ participants, scheduledAt, signal })` liefert `{ meetingId, navigationUrl }`. Ihr Anbieter besitzt HTTP-Anfrage und Ziel und führt `jitsi-meet:creation:create` über den Hostvertrag `ui:scopedActions` aus. Verbraucher erkennen diese optionale Capability, statt Modul-Endpunkte zusammenzusetzen. Authentifizierung und Validierung bleiben an der bestehenden API-Grenze. Abgebrochene oder entfernte Anbieter können keine weiteren Aktionen ausführen.

## Commits

- [aca37ed](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/aca37edcbfad8b47d2ad5df47a5d4e878c8c0111)
