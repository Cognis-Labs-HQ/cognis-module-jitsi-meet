# Whiteboard-Zugriff für Freigabegäste

**Feature-Branch:** work

## Besprechungsgebundenen Gastzustand autorisieren

Whiteboard-Zustandsänderungen prüfen Gäste über Freigabelinks jetzt über das Share-Gateway für die angeforderte Besprechung und verwenden für Konsensstimmen dieselbe stabile synthetische Identität wie die Besprechungsanwesenheit.

## Vom Gastgeber erstellte Whiteboards wiederverwenden

Gäste über Freigabelinks verwenden jetzt die vorhandene Whiteboard-Zuordnung der Besprechung und warten auf die Erstellung durch ein autorisiertes Konto oder den Gastgeber, wenn noch keine Zuordnung vorhanden ist.

## Generische Share-Delegierung verwenden

Jitsi Meet erweitert jetzt `resolve-share-delegated-access`, statt eine Whiteboard-spezifische Capability zu veröffentlichen. Es weist die exakte aktive Beziehung zwischen Besprechung und Board nach und deklariert `meeting:join` als Quellberechtigung, während Share das Gast-Token unabhängig validiert.

## Übergroße Module aufteilen

Schemaerstellung und Zugangsdaten-Nachpflege wurden in ein fokussiertes Store-Schema-Modul verschoben, die UI-Regressionsabdeckung wurde in zwei zusammenhängende Testdateien aufgeteilt und normale Abstände zwischen Deklarationen und Methoden wurden wiederhergestellt.

## Sichere Whiteboard-Steuerung für Gäste aktivieren

Freigabeansichten binden jetzt das Whiteboard-Steuerelement ein und authentifizieren Zustandsanfragen mit dem besprechungsgebundenen Gast-Token. Die API erlaubt Gästen nur, die exakt ihrer Besprechung zugeordnete Arbeitsfläche zu öffnen oder zu schließen, und lehnt das Erstellen oder Ersetzen einer Zuordnung ab. Die Gast-Orchestrierung benötigt die nur für Konten verfügbare Canvas-Factory nicht mehr, sodass ein entfernter Öffnungszustand die Komponentenbereitstellung erreicht und die Besprechung in ihre schwebende Bild-in-Bild-Darstellung verschiebt. Das Einbinden des Komponentenfensters verwendet jetzt einen längeren begrenzten exponentiellen Backoff, damit Organisatoren fortfahren können, wenn ein eingeladener Teilnehmer das Board öffnet, bevor das Provider-Fenster des Organisators bereit ist.

## Commits

- [afbb29a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/afbb29a0276ea2f9a870b3f50429448a0db04a8c)
- [777e683](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/777e6839d246ceffe0d999227554c85da8b0f103)
- [88e72f2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/88e72f2b8ceb38fd137d22d97ab2749bc4a1e2bb)
- [c0f05fb](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/c0f05fb22382b2f18b2ecbacee654a6007944b78)
- [3583bce](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3583bce288b495d3d44f1efe049063f267c82ad3)
- [18fb935](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/18fb935e94e6819bc4884599f80f7a07a9d24fc7)
- [91c689d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/91c689df7e719ec03fc207c82d283510362d69c8)
- [54caf84](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/54caf840c8578bca200e7d9c897bc62413547cff)
- [2512c1f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2512c1fcb45ffe494b0c6945edea7031d303b5b8)
- [78f8ba7](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/78f8ba77509b5f104ae076d7d98840865791a312)
