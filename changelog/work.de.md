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

## Verfügbare Anrufe eingebettet und außerhalb von Meetings halten

Räume, die verfügbaren Anrufen zugeordnet sind, liefern weiterhin Komponentenaktionen statt Weiterleitungen; nur reguläre Meeting-Chaträume navigieren zu Meetings. Verfügbare Anrufe sind sowohl aus der Erkennung aktiver Meetings als auch aus dem Verlauf früherer Meetings ausgeschlossen.

## Meeting-Overlay in Komponentenfenstern ausblenden

Meetings, die über den Komponenten-Seiten-Vertrag eingebunden werden, unterdrücken nun das Meeting-Overlay während des Komponenten-Lebenszyklus. Dadurch bleibt der eingebettete Anruf-Frame frei, während vollständige Meetings-Seiten ihr normales Overlay behalten.

## Commits

- [790fa2d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/790fa2d660b5f6a0c46cc3d18058790444867329)
- [3bf5559](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3bf5559f3f68dd9a57a56c5d1818e5fa931cacc9)
