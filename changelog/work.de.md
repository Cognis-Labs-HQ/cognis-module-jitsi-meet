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

## Eingebettete Anrufoberfläche vereinfachen und VoIP-Anrufe kennzeichnen

Meetings in Komponentenfenstern blenden nun die Überschrift „Meeting-Fenster“ zusammen mit dem Overlay aus und fügen keinen „Zurück zu Nachrichten“-Button mehr hinzu. Messages übergibt „Cognis VoIP Call“ über die Komponenten-Metadaten als Jitsi-Betreff; reguläre Meetings behalten „Cognis Classroom“.

## Komponentenfenster nach Anrufende schließen

Nachdem ein in einem Komponentenfenster eingebundenes Meeting wegen Verlassen, Entfernen des Teilnehmers oder Konferenzende bereinigt wurde, verwirft Jitsi nun das umgebende Host-Komponentenfenster. Vollständige Sitzungen auf der Meetings-Seite bleiben geöffnet.

## Commits

- [8443708](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/8443708a97361cf0d755442beabcca2c9f20e781)
- [cc6a92c](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/cc6a92c0054168293a38133b4e520d50bd8344c2)
