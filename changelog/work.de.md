# Besprechungslisten, Whiteboard-Integration und Kontobereinigung stabilisieren

**Feature-Branch:** work

## Erstes Rendern der Besprechungslisten abschließen

Erfolgreiche leere Antworten für aktive und gespeicherte Besprechungen ersetzen nun ihre Ladeanzeigen, sodass Konten ohne Besprechungen sofort den korrekten Leerzustand sehen.

## Optionale Whiteboard-Verfügbarkeit berücksichtigen

Die Besprechungssymbolleiste bleibt nun ausgeblendet, wenn die Whiteboard-Canvas-Factory im Browser nicht verfügbar ist. Die serverseitige Prüfung verwendet weiterhin die stabilen `whiteboard:`-Capabilities des neuesten Nextcloud-Whiteboard-Moduls, sodass nicht verfügbare Provider nicht bis zur Zustandssynchronisierung gelangen.

## Ressourcen vor dem Löschen von Besprechungen bereinigen

Bei der Kontodeprovisionierung werden nun zugeordnete Whiteboards, Messages-Chaträume und Besprechungsfreigaben gelöscht, bevor eine unbrauchbare Besprechung aus dem Speicher entfernt wird. Dabei werden strukturierte Fehlerprotokolle und vom Eigentümer autorisierte Capability-Aufrufe verwendet.

## Lebenszyklusgebundene Integration dokumentieren

Alle unterstützten Dokumentationen beschreiben die Auflösung von Whiteboard-Capabilities nun ausschließlich über den lebenszyklusgebundenen Modulkontext.

## Beide Whiteboard-Integrationsoberflächen vor der Canvas-Erstellung prüfen

Meeting-Whiteboards bestätigen nun vor der Canvas-Erstellung, dass der Browser die passende Canvas-Factory für den Besprechungstyp und der Server die Provider-Prüf-Capability bereitstellen. Dadurch funktioniert die PiP-Initialisierung mit dem vollständigen Provider-Vertrag, während fehlgeschlagene Starts keine doppelten Arbeitsflächen mehr hinterlassen.

## Commits

- [9894d9e](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/9894d9ee1130f3aff7144bd2e17adc72795e986a)
- [dccbd01](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/dccbd01cb316ab7d02708b4d43a56fea53f7b060)
