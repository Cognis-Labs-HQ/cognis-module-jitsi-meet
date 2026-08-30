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

Änderungen der aktiven Mitgliedschaft verwenden nun einen besprechungsbezogenen Teilnehmerschlüssel. Dadurch entstehen keine PostgreSQL-Eindeutigkeitsfehler mehr, wenn die neue Teilnehmerliste einer anderen Besprechung entspricht. Die Teilnehmersuche blendet Benutzer aus, die für eine andere aktive oder geplante Besprechung reserviert sind; die API für aktive Einladungen erzwingt dieselbe Verfügbarkeitsregel.

## Commits

- [4c26402](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/4c26402d1005c86a6f28eecc78883e447bb97c11)
- [206b29f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/206b29f70af70eab3d63d8dae871f182dc97f40a)
- [5f7683b](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/5f7683b1c03719763333174cd6802bf4d33d37e9)
- [33eddd2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/33eddd2c63b80998f6d8e9ee44b6152c0080628f)
- [1386015](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1386015409eeb5bd252208dcdff27b809e4db00e)
- [eb8aef2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/eb8aef223aa633bcd302ee27dd934a63e92bcf78)
- [2d07b3b](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2d07b3b6d0bd57563c83706f37c5dffcbf01f59f)
- [b88f6db](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b88f6db738e3bfad4ea1fd84ffecd2afe8bcb91f)
