# Jitsi-Meet-Modul

[English](README.en.md) · **Deutsch** · [Bahasa Indonesia](README.id.md) · [日本語](README.ja.md)

Dieses Repository enthält das externe Jitsi-Meet-Modul für Cognis. Es ermöglicht das Erstellen und Beitreten von Videokonferenzen, Moderation, Teilnehmerverwaltung, integrierten Besprechungschat und freigegebene Gastzugänge mit begrenztem Umfang.

## Installation

Füge dieses Repository in Cognis über **Module → Modulquellen** hinzu, installiere das Modul, prüfe die angeforderten Fähigkeiten und Abhängigkeiten und aktiviere es anschließend separat. Beim Aktivieren werden die Anwendungsrouten `/meetings` und `/meeting`, der Navigationseintrag „Besprechungen“, der Administrationsbereich, statische Browserressourcen, APIs, Fähigkeiten und Flow-Hooks registriert. Beim Deaktivieren werden diese bereichsgebundenen Beiträge entfernt. Konfiguriere die URL der Jitsi-Instanz im Einstellungsdialog des installierten Moduls. Cognis rendert die im Manifest deklarierten Felder; dieses Modul validiert und speichert Änderungen über seinen GET- und PUT-Konfigurationsendpunkt.

## Fähigkeiten und Abhängigkeiten

Das Modul veröffentlicht `meeting:video`, `meeting:chat` und `meeting:moderation`. Laufzeitintegrationen werden über Cognis-`ctx`-Fähigkeiten und Flows aufgelöst. Das Manifest deklariert UUID-basierte Abhängigkeiten vom Social-Gateway, Profiladapter, Freigabe-Gateway und Nachrichtenadapter sowie eng begrenzte Laufzeitfähigkeiten. Es werden keine internen Cognis-Pakete oder Quellbaumimporte benötigt.

## Entwicklung

Führe `npm install` und anschließend `npm test` aus. Tests und Laufzeitcode verwenden ausschließlich repository-relative Modulpfade, sodass die Testsuite außerhalb des Cognis-Monorepos läuft. Das Manifest veröffentlicht `ui.stringsBaseUrl`, damit Cognis die lokalisierten Metadaten des Moduls bereits vor dem Laden seiner Browseroberfläche auflösen kann.

## Sicherheit

Verwende eine vertrauenswürdige Jitsi-Bereitstellung mit HTTPS. Der Zugriff auf die Besprechungs-API ist authentifiziert, Besprechungsdatensätze sind auf Teilnehmer beschränkt, Passwörter werden pro Besprechung erzeugt und Gastzugriffe sind durch bereichsgebundene Freigabefähigkeiten eingeschränkt. Prüfe das Repository und die deklarierten Datei-Digests vor der Aktivierung.
