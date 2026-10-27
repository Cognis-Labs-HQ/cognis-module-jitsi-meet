# Verbindungsverlust bei der Raumsuche behandeln

**Funktionszweig:** feature-offline-transitions

## Aktuelle Abfrage beibehalten

Timer für Anwesenheit und Status gehören zu einer Tracking-Generation und einer Meeting-Identität. Ein Meeting-Wechsel oder der Neustart des Trackings für dasselbe Meeting beendet die vorherige Generation. Verspätete Fehler und bereits eingeplante Rückrufe alter Generationen können die aktuellen Anwesenheits- und Statustimer weder stoppen noch Anfragen für die neue Sitzung senden. Fehler der aktuellen Generation stoppen weiterhin beide Timer; Seiten- und Offline-Bereinigung machen diese Generation ungültig.

## Verbindungsverlust bei der Raumsuche behandeln

Die Raumsuche stoppt nach einem Netzwerkfehler ihre Abfragen und fängt abgelehnte Timer-Anfragen ab. Offline- und abgebrochene Anfragen öffnen keine Fehlermeldungen zur Suche und löschen die letzten Raumlisten nicht. Das Modul nutzt die optionale Offline-Status-Fähigkeit des Hosts; die Bereinigung bleibt an das Seitensignal gebunden. Die Präsenz- und Statusabfragen laufender Meetings folgen demselben Lebenszyklus und stoppen gemeinsam nach einer fehlgeschlagenen Hintergrundanfrage.

## Commits

- [aa0931e](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/aa0931ebfe17662ccef1c95a507bc065d24f0fdd)
- [b3208b0](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b3208b04a9020af737e8217488389aab39fe10a6)
