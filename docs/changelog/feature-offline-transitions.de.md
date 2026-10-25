# Verbindungsverlust bei der Raumsuche behandeln

**Funktionszweig:** feature-offline-transitions

## Verbindungsverlust bei der Raumsuche behandeln

Die Raumsuche stoppt nach einem Netzwerkfehler ihre Abfragen und fängt abgelehnte Timer-Anfragen ab. Offline- und abgebrochene Anfragen öffnen keine Fehlermeldungen zur Suche und löschen die letzten Raumlisten nicht. Das Modul nutzt die optionale Offline-Status-Fähigkeit des Hosts; die Bereinigung bleibt an das Seitensignal gebunden. Die Präsenz- und Statusabfragen laufender Meetings folgen demselben Lebenszyklus und stoppen gemeinsam nach einer fehlgeschlagenen Hintergrundanfrage.

## Commits
