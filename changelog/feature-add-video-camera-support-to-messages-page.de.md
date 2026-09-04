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

## Anrufe anhand der kanonischen Raummitgliedschaft autorisieren

Der VoIP-Endpunkt lässt nun den vertrauenswürdigen Messages-Raumauflöser die anfragende Person autorisieren und die vollständige Teilnehmerliste ableiten. Vom Client übermittelte Mitgliederlisten können keine Teilnehmenden mehr bestimmen.

## Eine Raumzuordnung sicher wiederverwenden

Verfügbare Anrufe verwenden nun die vorhandene Chatraumreferenz, die durch eine eindeutige Schemabedingung geschützt ist. Gleichzeitige Anfragen verwenden das zuerst erstellte Meeting, ohne ein zweites Quellraumfeld einzuführen, und die Bereinigung verwerfbarer Meetings löscht den Meeting-eigenen Chatraum über die autorisierte Messages-Capability.

## Anbieteranrufe lokalisieren und ordnungsgemäß beenden

Der Anbieter verwendet neutrale VoIP-Begriffe, übernimmt einen vom Verbraucher angegebenen Betreff und nutzt andernfalls einen lokalisierten Betreff. Beim Schließen der Host-Komponente wird nun die reguläre Anwesenheitsbereinigung vor dem Beenden von Jitsi ausgeführt. Einschränkungen für verwerfbare Meetings werden einheitlich als Meeting-Regeln statt als Regeln eines bestimmten VoIP-Verbrauchers beschrieben.

## Gäste verwerfbarer Freigaben auf der Ende-Einblendung halten

Gäste, die eine über einen Link geteilte verwerfbare Besprechung verlassen, bleiben nun auf der Einblendung „Besprechung verlassen“, statt die Meetings-Startseite zu sehen. Beim Beenden durch die organisierende Person bleibt die Geschlossen-Einblendung erhalten, während die Bereinigung den Freigabelink beendet.

## Whiteboard-Konsens für kleine Besprechungen umgehen

Verwerfbare Besprechungen und Besprechungen mit höchstens zwei aktuellen oder eingeladenen Teilnehmern öffnen ein Whiteboard jetzt sofort, ohne eine Share-Konsensentscheidung anzufordern. Besprechungen mit mehr Teilnehmern behalten den bestehenden Genehmigungsablauf bei.

## Startchat nach VoIP-Meetings beibehalten

Beim Beenden eines verwerfbaren VoIP-Meetings werden dessen Meeting-Daten und Freigaben bereinigt, der private Messages-Chat, aus dem der Anruf gestartet wurde, bleibt jedoch unverändert erhalten. Moduleigene Chats teilnehmerloser Meetings werden weiterhin gelöscht.

## Chat aus verwerfbaren Komponentenfenstern entfernen

Verwerfbare Meetings in Komponentenfenstern enthalten weder die Meeting-Chat-Oberfläche noch eine Chatkennung in ihren Nutzdaten. Die neue authentifizierte Capability `meeting:getMeetingChat` gibt die verknüpfte Chat-ID separat nur an autorisierte Meeting-Teilnehmer zurück.

## Host-Styles ohne erneutes Laden wiederverwenden

Meetings fordert beim Öffnen eines Routen- oder Komponentenfensters weder den globalen Page-Composer-Stylesheet noch den vollständigen gemeinsamen Stylesheet-Katalog erneut an. Es registriert ausschließlich sein moduleigenes, vollständig begrenztes Stylesheet und verhindert damit, dass eine spätere Kaskadenposition globale Cognis-Oberflächen umgestaltet.

## Mitgliedschaft im Startchat bei Entfernung beibehalten

Wird eine Person aus einem verwerfbaren VoIP-Meeting entfernt, entfernt Jitsi sie nur aus den Meeting- und Anwesenheitsdaten sowie gegebenenfalls aus dem Meeting-Whiteboard. Die Mitgliedschaft im privaten oder Gruppen-Chat, aus dem der Anruf gestartet wurde, bleibt unverändert.

## Wiederverwendete VoIP-Anrufe zuverlässig auflösen

Vorhandene Meeting-Zuordnungen autorisieren Raummitglieder nun über ihre stabile Kontoidentität statt über veränderliche Profilnamen. Außerdem kann ein Verbraucher, der nur `navigate` unterstützt, reguläre zugeordnete Meetings auflösen; die Aktion wird erst nach der Serverantwort gegen die angebotenen Aktionen geprüft.

## Komponentenanrufe bis zum PiP schützen

Verwerfbare Anrufe behalten im ursprünglichen Komponentenfenster den Schutz gegen Entladen, Links und Verlaufsnavigation. Hostverwaltete Navigation wird erst im tatsächlich schwebenden PiP-Fenster zugelassen. Verwerfbare Meetings senden außerdem keinerlei Meeting-Benachrichtigungen.

## Commits

- [86e9ab3](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/86e9ab36cd72e15e68648d23180ea238971bce77)
- [6161476](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/61614768725d67669811159ec059c7d9af91a537)
- [b3f0b4c](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b3f0b4ccb143dc068555df17e8731d5fe90b5074)
- [a11ea4a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a11ea4a31e51f806fd80c1fde2820c011467dee9)
- [5aea5d1](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/5aea5d1710aabf1cb2bdfff7a6c57f029e054c18)
- [6e02bef](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/6e02befec71d6adcd77a18e5a56487f835ee91bd)
- [14cc4de](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/14cc4de32fe631befbb9cd8cb460e00dec50239f)
- [e348c18](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e348c183eb5930a42aaddd8fc30883a52d9e1c80)

- [624111a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/624111a681b1a9bc49d1c4ec320ea718e5bd5d89)
- [47d031e](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/47d031ebbd27aa3bc1ae9b8b6c9926c5f4b149c1)
- [0d7d459](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/0d7d4599220a9e9c53fd89f7c61b9c83249ecd76)
- [a17a685](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a17a6852353a0e47376c352eb21213a8cf2c5f6e)
- [fa90ce2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/fa90ce290871f6ff69b52a9e4b2860ee3725e197)
- [ee9e19a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/ee9e19a1856c0eef35b6004a206e4ce1751887dd)
- [47ac3cb](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/47ac3cb3282a28e2ce0f40a72d3d592f42d49ea5)
