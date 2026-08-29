# Stabile Besprechungs-Whiteboards

**Feature-Zweig:** feature-implement-final-review-comments-and-improve-whiteboard-stabi

## Whiteboard-Zustand auf die Besprechungssitzung begrenzen

Dauerhafte Arbeitsflächen öffnen sich nicht mehr allein beim Start einer Besprechung. Das Beenden oder Neustarten löscht den Öffnungszustand, und Teilnehmer binden nur eine Arbeitsfläche ein, die in der aktiven Sitzung ausdrücklich als geöffnet markiert ist.

## Komponenteneinbindung vorhersehbar machen

Komponentenseiten werden einmal pro Besprechungs-Mount angefordert und Einbindungswiederholungen bleiben begrenzt. Das Whiteboard-Steuerelement bleibt während der Schlüsselbundabfrage oder Einbindung mit seiner normalen Beschriftung deaktiviert, ändert sich erst nach erfolgreicher Einbindung in „Whiteboard schließen“ und verwirft veraltete asynchrone Fenster ohne irreführende Fehlermeldungen.

## Herkunft der Versionshinweise an Cognis ausrichten

Der Pull Request verwendet genau einen lokalisierten, nach seinem Feature-Zweig benannten Changelog-Satz. Jede Änderung besitzt eine Überschrift für die Versionszusammenfassung und einen ausführlichen Text; anschließend folgen vollständige Repository-Links zu den Implementierungs-Commits, entsprechend Cognis Core und benachbarten externen Modulen.

## Commits

- [7141534](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/7141534703ebe3f38581e748172c38e5e990baa6)
- [12ad748](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/12ad7488915d047a891307f37b16964c2c239f42)
- [b1d430d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b1d430d91e19abe31a348f9749dc386df07c6a6c)
- [fe48d89](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/fe48d89a5447460c40f45dc4192962c2b6b2d554)
- [6d87f99](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/6d87f998c14b17fa4f3a567d86fd64279b79379b)
