# Whiteboard-Zugriff für Freigabegäste

**Feature-Branch:** work

## Besprechungsgebundenen Gastzustand autorisieren

Whiteboard-Zustandsänderungen prüfen Gäste über Freigabelinks jetzt über das Share-Gateway für die angeforderte Besprechung und verwenden für Konsensstimmen dieselbe stabile synthetische Identität wie die Besprechungsanwesenheit.

## Vom Gastgeber erstellte Whiteboards wiederverwenden

Gäste über Freigabelinks verwenden jetzt die vorhandene Whiteboard-Zuordnung der Besprechung und warten auf die Erstellung durch ein autorisiertes Konto oder den Gastgeber, wenn noch keine Zuordnung vorhanden ist.

## Delegierte Whiteboard-Zuordnungen bereitstellen

Jitsi Meet veröffentlicht jetzt `meetings:resolveWhiteboardAssociation`. Die Capability gibt eine aktive Besprechung nur zurück, wenn das angeforderte Board exakt dem maßgeblichen Besprechungszustand entspricht und der echte Share-Gastanspruch für diese Besprechung autorisiert ist; fehlende, inaktive, geschlossene, mehrdeutige und nicht passende Zuordnungen werden abgelehnt.

## Übergroße Module aufteilen

Schemaerstellung und Zugangsdaten-Nachpflege wurden in ein fokussiertes Store-Schema-Modul verschoben, die UI-Regressionsabdeckung wurde in zwei zusammenhängende Testdateien aufgeteilt und normale Abstände zwischen Deklarationen und Methoden wurden wiederhergestellt.

## Commits

- [afbb29a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/afbb29a0276ea2f9a870b3f50429448a0db04a8c)
- [777e683](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/777e6839d246ceffe0d999227554c85da8b0f103)
- [88e72f2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/88e72f2b8ceb38fd137d22d97ab2749bc4a1e2bb)
- [c0f05fb](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/c0f05fb22382b2f18b2ecbacee654a6007944b78)
