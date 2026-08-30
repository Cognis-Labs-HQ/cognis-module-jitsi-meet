# Teilnehmer zu aktiven Besprechungen einladen

**Feature-Zweig:** work

## Aktive, nicht verwerfbare Besprechungen erweitern

Teilnehmer können nun in eine aktive Besprechung gezogen werden, die mit eingeladenen Personen begonnen hat. Die Besprechungsmitgliedschaft und der verschlüsselte Messages-Chat werden aktualisiert, der neue Teilnehmer erhält eine Einladung und kann beim Beitritt das Besprechungskennwort abrufen. Bereitgestellte Teilnehmer kehren nach Beginn der Besprechung nicht in die Liste der verfügbaren Personen zurück.

## Aktive Besprechungsoberflächen nutzbar halten

Teilnehmeraktualisierungen öffnen die Lobby-Einblendung nicht mehr über einer beigetretenen Besprechung, sodass Beitritte über Benachrichtigungen und die aktive Liste nutzbar bleiben. Die Spalte der verfügbaren Teilnehmer zeigt nun „Keine verfügbaren Teilnehmer.“ an, wenn sie leer ist.

## Aktiven Teilnehmer-Ablagebereich anzeigen

Beim Ziehen eines verfügbaren Teilnehmers wird nun vorübergehend ein lokalisierter Ablagebereich über einem geeigneten aktiven Besprechungsfenster angezeigt. Das Ablegen lädt den Teilnehmer ein; beim Ende des Ziehvorgangs wird die ungestörte Besprechungsansicht wiederhergestellt.

## Ablagebereich über der Jitsi-Einbettung anordnen

Ein gültiger Teilnehmer-Ziehvorgang aktiviert den Ablagebereich nun direkt über das Ziehereignis des Avatars. Der Ablagebereich entspricht exakt dem eingebetteten Jitsi-Fenster, liegt beim Ziehen über dem iframe und kehrt nach dem Ablegen oder Ende des Ziehvorgangs darunter zurück.

## Grüne Ziehhilfe dauerhaft anzeigen

Der aktive Teilnehmer-Zielbereich behält nun während des gesamten Ziehvorgangs dieselbe grüne Kontur, ergänzt eine grüne Innenkante und einen gestrichelten Zielbereich und entfernt die Hilfe erst beim Ende des Ziehvorgangs oder beim Ablegen des Teilnehmers.

## Zugriff entfernter Teilnehmer widerrufen

Der Meeting-Client erkennt nun lokale Jitsi-Entfernungsereignisse und -fehler. Entfernte Kontobenutzer werden aus dem gespeicherten Teilnehmerkreis gelöscht und erscheinen wieder als verfügbare Einzuladende; bei entfernten Gästen wird nur der für ihre Sitzung verwendete Share-Link widerrufen. Außerdem wird ihre Anwesenheit deaktiviert.

## Dauerhaftes Routen-Stammelement beim Unmount freigeben

Geroutete, freigegebene und eingebettete Meetings-Mounts beanspruchen kein bereits abgebrochenes Stammelement mehr und entfernen `.jitsi-route-root`, sobald ihr Lebenszyklus-Signal abbricht. Die asynchrone Initialisierung endet vor späteren Darstellungsarbeiten; die vorhandene Bereinigung entfernt weiterhin Observer, Handler, Timer, Chat-Arbeiten, Whiteboards und die Jitsi-Einbettung.

## Teilnehmerschlüssel-Kollisionen verhindern und reservierte Benutzer ausblenden

Änderungen der aktiven Mitgliedschaft verwenden nun einen besprechungsbezogenen Teilnehmerschlüssel. Dadurch entstehen keine PostgreSQL-Eindeutigkeitsfehler mehr, wenn die neue Teilnehmerliste einer anderen Besprechung entspricht. Die Teilnehmersuche blendet Benutzer aus, die in einer anderen Besprechung aktiv anwesend sind; die API für aktive Einladungen erzwingt dieselbe Verfügbarkeitsregel, ohne geplante Eingeladene auszublenden.

## Live-Teilnehmerintegrationen aktualisieren

Verfügbare Teilnehmer und aktive Besprechungen werden jetzt alle fünf Sekunden aktualisiert, Avatar-Anwesenheitsanbieter nach SPA-Navigation initialisiert, der Besprechungschat mit erweitertem Teilnehmerkreis und neuen Nachrichten neu geladen und erfolgreiche aktive Einladungen per Toast bestätigt. Vorhandene dauerhafte Whiteboards erhalten über eine optionale Anbieter-Capability erweiterten Teilnehmerzugriff. Der leere Teilnehmerhinweis entspricht dem Zustand für leere aktive Besprechungen, der Entfernungshinweis ist kürzer und die angegebene Mindestgröße für Bild-in-Bild beträgt 320 × 180 Pixel.

## Whiteboard-Aktionen unterscheiden

Die Whiteboard-Schaltfläche verwendet jetzt beim Öffnen die Bestätigungsdarstellung und wechselt zur Abbruchdarstellung, während sie „Whiteboard schließen“ anzeigt.

## Mindestgröße des Meeting-Bild-in-Bild skalieren

Die Mindestgröße des Meeting-Bild-in-Bild beträgt nun 400 × 225 Pixel und ist damit 25 % größer als zuvor. Der dritte aktive Teilnehmer erhöht beide Maße einmalig um 25 %, und Cognis wendet die begrenzte Mindestgröße sofort über seine Floating-Window-Aktualisierung an.

## Whiteboard-Erweiterungsvertrag prüfen

Meetings validiert nun den exakten Vertrag `whiteboard:uiGateway.expandCanvasAccess`, den Nextcloud Whiteboard PR 24 bereitstellt. Eine erfolgreiche Aktualisierung muss die angeforderte Arbeitsfläche identifizieren und jeden angeforderten Teilnehmer in der erweiterten Zugriffsliste zurückgeben, bevor Meetings die Synchronisierung als abgeschlossen speichert.

## Nicht autorisierte Whiteboard-Wiederholungen stoppen

Nur der Besprechungsorganisator ruft jetzt die eigentümerautorisierte Capability zur Arbeitsflächenerweiterung auf. Eingeladene Teilnehmer senden keine Erweiterungsanfrage, und eine fehlgeschlagene Eigentümeranfrage wird für genau diese Arbeitsfläche und Teilnehmermenge gespeichert, damit Abfragen und Einbettungs-Lebenszyklusaktualisierungen dieselbe verbotene Anfrage nicht wiederholt senden.

## Einblendungen im Bild-in-Bild halten und automatische Whiteboards wiederherstellen

Besprechungseinblendungen einschließlich der Aufforderung für alleinige Teilnehmer ziehen jetzt während des Whiteboard-Bild-in-Bild in den schwebenden Jitsi-Rahmen um und kehren beim Schließen zur Bühne zurück. Das automatische Öffnen des Whiteboards wiederholt vorübergehende Fehler beim dynamischen Modulimport nun über den vollständigen begrenzten Backoff, statt nach dem ersten Fehler abzubrechen.

## PiP-Wachstum bei drei Teilnehmern begrenzen

Das Meeting-Bild-in-Bild hat nun nur zwei Mindestgrößen: 400 × 225 Pixel für bis zu zwei aktive Teilnehmer und 500 × 282 Pixel für drei oder mehr. Größere Besprechungen erhöhen das Minimum nicht weiter und nehmen nicht mehr den verfügbaren Bildschirm ein.

## Parsing der Whiteboard-Steuerung wiederherstellen

DOM-Referenzen für Besprechungsrahmen und Einblendung bleiben jetzt lokal in der Meetings-Oberfläche, statt erneut aus der Whiteboard-Capability-Antwort deklariert zu werden. Der Browser kann die Steuerung wieder parsen und laden; eine direkte JavaScript-Syntaxprüfung schützt den Einstiegspunkt.

## Commits

- [ff60844](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/ff6084469d7c8c18c631d6c59bac0b65fdf04b44)

- [0afee2e](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/0afee2e9720010b6a2b5c8de256310dd77efd947)

- [3aa0da6](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3aa0da6b54b2bf66dd36e760630cf7c50d7a55b3)

- [a854724](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a8547244e698f6e3ef1c4b93d31531891a8edae2)

- [12de19a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/12de19a4fcf312a67e238efd23c0beb0ffe03d2e)

- [a47b5b4](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a47b5b48340e023192dc88a1cbbc6f2c4ecb4587)

- [790401f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/790401f6d0c6714179d977e0d9384c59bc91f30c)

- [28774f3](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/28774f3df4a49adabc7e5470442e4cc087555e87)

- [4c26402](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/4c26402d1005c86a6f28eecc78883e447bb97c11)
- [206b29f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/206b29f70af70eab3d63d8dae871f182dc97f40a)
- [5f7683b](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/5f7683b1c03719763333174cd6802bf4d33d37e9)
- [33eddd2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/33eddd2c63b80998f6d8e9ee44b6152c0080628f)
- [1386015](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1386015409eeb5bd252208dcdff27b809e4db00e)
- [eb8aef2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/eb8aef223aa633bcd302ee27dd934a63e92bcf78)
- [2d07b3b](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2d07b3b6d0bd57563c83706f37c5dffcbf01f59f)
- [b88f6db](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b88f6db738e3bfad4ea1fd84ffecd2afe8bcb91f)
