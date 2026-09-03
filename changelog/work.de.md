# Messages-Videoanrufe mit verfügbaren Jitsi-Meetings

**Feature-Zweig:** work

## Eingeschränkte Anrufe aus Messages starten

Jitsi Meet stellt jetzt den Browser-VoIP-Anbieter für Direkt- und Gruppenchats bereit. Anrufe umfassen ausschließlich die Mitglieder des auslösenden Raums und erstellen keinen separaten Meeting-Chat.

## Anrufe verfügbar und fokussiert halten

Messages-Anrufe können weder geteilt noch um weitere Teilnehmende erweitert oder mit einem Whiteboard verbunden werden. Die Rückkehr zu Messages erhält das laufende Meeting in einem verschiebbaren Bild-im-Bild-Fenster; nach dem Anruf wird der Meeting-Datensatz gelöscht.

## Anbieter beim ersten Rendern verfügbar

Die Navigationsleisten-Registrierung weist nun `voip:startCall` aus. Dadurch kann Cognis Jitsi laden, bevor Messages die Anbieter-Verfügbarkeit prüft, und die Videokamera-Aktion bereits beim ersten Rendern des Chats anzeigen.

## Raumbezogene, hostverwaltete Anrufaktionen

Jitsi löst nun jede Raumanfrage in eine normalisierte `component`-Aktion auf, statt selbst eine Bühne zu erstellen und einzubinden. Cognis Messages verwaltet nach dem neuesten Anbieter-Vertrag das Einbinden und Bereinigen der Komponente sowie die Start-Rückmeldung.

## Meeting-Räume wiederverwenden und kollisionsfreie Anrufe erstellen

Jede VoIP-Capability-Anfrage prüft nun sowohl Meeting-Chaträume als auch Quellräume verfügbarer Anrufe. Bestehende Meetings liefern eine Router-Weiterleitung; nicht zugeordnete Räume erstellen ein verfügbares Komponenten-Meeting mit eindeutigem Teilnehmerschlüssel und vermeiden dadurch Datenbank-Konflikte.

## Commits

- [15f072f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/15f072fa11c997d9c427c4fb01c132068eeb73ec)
- [c4612ac](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/c4612ac89019f9643fefbd41b79cfb8c30797fc6)
