# Zuverlässige Jitsi-Besprechungsbeitritte wiederherstellen

**Feature-Branch:** feature-investigate-jitsi-meet-impact-on-cognis

## Abgelaufene Jitsi-Authentifizierungssitzungen verwerfen

Meetings entfernt jetzt vor dem Erstellen einer eingebetteten Konferenz eine zwischengespeicherte Jitsi-Authentifizierungssitzungskennung und behält alle anderen Jitsi-Einstellungen bei. Dadurch führen Jicofo-Neustarts oder abgelaufene Sitzungen nicht mehr zu wiederholten `session-invalid`-Konferenzanfragen und einem geschlossenen Bridge-Kanal.

## Browser ohne Speicherzugriff beitrittsfähig halten

Browser-Richtlinien und undurchsichtige Ursprünge können den Zugriff auf `localStorage` verweigern. Meetings fängt jetzt sowohl Fehler beim Eigenschaftszugriff als auch bei Speichervorgängen ab, protokolliert den Rückfall strukturiert und erstellt den Jitsi-Iframe ohne Sitzungsbereinigung weiter.

## Commits

- [04158e4](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/04158e4a2da493d1413d5bbb7f580e0066cac468)
- [e804261](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e8042612c8e55a549db7aa32cbc8ab9e0d1cdd04)
