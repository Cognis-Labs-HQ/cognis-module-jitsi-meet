# Zuverlässige Jitsi-Besprechungsbeitritte wiederherstellen

**Feature-Branch:** work

## Abgelaufene Jitsi-Authentifizierungssitzungen verwerfen

Meetings entfernt jetzt vor dem Erstellen einer eingebetteten Konferenz eine zwischengespeicherte Jitsi-Authentifizierungssitzungskennung und behält alle anderen Jitsi-Einstellungen bei. Dadurch führen Jicofo-Neustarts oder abgelaufene Sitzungen nicht mehr zu wiederholten `session-invalid`-Konferenzanfragen und einem geschlossenen Bridge-Kanal.

## Commits

- [04158e4](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/04158e4a2da493d1413d5bbb7f580e0066cac468)
