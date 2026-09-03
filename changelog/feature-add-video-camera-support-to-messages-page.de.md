# Messages-Videoanrufe mit verfügbaren Jitsi-Meetings

**Feature-Zweig:** feature-add-video-camera-support-to-messages-page

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

## Vollständige Teilnehmerliste für Komponentenanrufe verlangen

Komponenten-Metadaten können nun alle Teilnehmenden für den gesamten Anruf voraussetzen. Messages-VoIP-Anrufe aktivieren dieses Verhalten, sodass ein lokales oder entferntes Verlassen das Meeting beendet, regulär bereinigt und das Host-Komponentenfenster schließt.

## Jitsi-PiP-Abmessungen bekannt geben

Jitsi-VoIP-Komponentenaktionen enthalten nun Abmessungen von 400 × 225 Pixeln in ihrer Nutzlast. Die Werte entsprechen der Mindestgröße der Meetings-Komponentenseite und ermöglichen dem Host eine einheitliche Dimensionierung des schwebenden Anrufs.

## Gemeinsame Nutzlast für die PiP-Mindestgröße verwenden

VoIP-Komponentenaktionen veröffentlichen nun `minSize: { width, height }` und entsprechen damit der von Nextcloud Whiteboard verwendeten PiP-Metadatendefinition, anstatt ein anbieterspezifisches Abmessungsfeld bereitzustellen.

## Whiteboard-PiP über die Host-Oberfläche schließen

Meeting-PiP-Fenster, die neben einem Whiteboard geöffnet werden, stellen nun die `closeButton`-Definition für das schwebende Host-Fenster bereit. Ihre Betätigung führt die vorhandene Aktion zum Schließen des Whiteboards aus, synchronisiert den Meeting-Status und stellt das Meeting aus PiP wieder her.

## Anrufe während der Host-Navigation bewahren

Messages-VoIP-Aktionen aktivieren nun `allowNavigation`, sodass Cognis navigieren kann, während ein Komponenten-Meeting in PiP erhalten bleibt. Der Schutz vor Entladen, Link- und Verlaufsnavigation bleibt standardmäßig für alle anderen Meetings aktiv. Die Definition der Whiteboard-PiP-Schließen-Schaltfläche fordert außerdem den Stil `btn-cancel` an.

## Commits

- [86e9ab3](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/86e9ab36cd72e15e68648d23180ea238971bce77)
- [6161476](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/61614768725d67669811159ec059c7d9af91a537)
- [b3f0b4c](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b3f0b4ccb143dc068555df17e8731d5fe90b5074)
- [a11ea4a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a11ea4a31e51f806fd80c1fde2820c011467dee9)
- [5aea5d1](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/5aea5d1710aabf1cb2bdfff7a6c57f029e054c18)
