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

## Whiteboard vor der Canvas-Vorbereitung aktivieren

Das Whiteboard-Steuerelement wird nun interaktiv, sobald seine Browser- und Komponentenfenster-Provider bereit sind. Die Canvas-Erstellung beginnt erst nach der Aktivierung, und eine noch nicht zugeordnete Arbeitsfläche wird bei Wiederholungen oder erneutem Einhängen wiederverwendet, sodass eine fehlgeschlagene Zustandssynchronisierung keine Duplikate erzeugt.

## Commits

- [9894d9e](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/9894d9ee1130f3aff7144bd2e17adc72795e986a)
- [dccbd01](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/dccbd01cb316ab7d02708b4d43a56fea53f7b060)
- [1d99048](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1d990487c733d1d4e9db03b9e2ec54d0f04632d1)
