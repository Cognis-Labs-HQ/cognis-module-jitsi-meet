# Sichere Synchronisierung des Besprechungsstatus

**Feature-Branch:** work

## Autoritative Aktualisierungen des Besprechungsstatus beschränken

Nur der Organisator der Besprechung kann jetzt den Status der Jitsi-Bildschirmfreigabe melden, und der unabhängige Endpunkt ist nicht mehr dem Whiteboard untergeordnet. Der Bildschirmfreigabestatus wird beim Start und Ende jeder Besprechungsinstanz zurückgesetzt, damit eine spätere Instanz keine veraltete Sperre übernimmt.

## Filterung der Teilnehmeranwesenheit schützen

Die Teilnehmersuche prüft jetzt den Zugriff, bevor die angeforderte Besprechung von der Filterung aktiver Anwesenheit ausgenommen wird. Dadurch können unbefugte Besprechungskennungen keine Anwesenheitsunterschiede offenlegen.

## Commits

- [f6d7cdb](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f6d7cdb9645e336a672b7749a7aab616b74b32d9)
