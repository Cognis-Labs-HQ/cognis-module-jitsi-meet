# Geführtes Tutorial

**Feature Branch:** feature-guided-tutorials

## Technische Spezifikation

Der Ablauf erklärt Besprechungen und vorgemerkte Teilnehmer, ohne eine Besprechung zu betreten oder zu erstellen. Er erfordert eine authentifizierte Online-Sitzung.

Das Modul registriert seinen Ablauf und übersetzte Texte über ctx. Der Host verwaltet Katalog, Hinweise, Pfeile, Hervorhebung, Tastatur- und Zeigersteuerung, geschützte SPA-Navigation und Barrierefreiheit. Schließen, fremde Navigation, Zugriffsverlust oder Deaktivierung beenden die Sitzung. Scheitert das Einhängen des Anbieters, werden seine Registrierungen zurückgenommen.

Anbietertests prüfen den öffentlichen Vertrag, alle vier Übersetzungen, Verfügbarkeitsregeln, Fehlerbereinigung und die Ablehnung nicht unterstützter Host-Versionen.

## Seitengebundener Erstbesuch

Der Host verwaltet Hinweise, Pfeile, Hervorhebung, Barrierefreiheit und das gemeinsame schwebende Aktionsmenü. Erstdurchläufe bieten stets Weiter, ohne Abbrechen oder Überspringen. Wiederholungen bieten Abbrechen mit `btn-cancel`. Der Abschluss wird im Browser pro Konto gespeichert. Navigation, Zugriffsverlust und Anbieterentfernung beenden die Sitzung; fehlgeschlagenes Mounten nimmt Registrierungen zurück.

## Seitenanleitungen

Die Abdeckung umfasst Vorbereitung, Anruf-, Chat- und Freigabesteuerung sowie administrative Prüfung von Besprechungen, Beenden und Löschen.

## Beschreibende Anleitungsschlüssel

Die Übersetzungsschlüssel und Zielkennungen der Anleitungsschritte beschreiben ihr Thema statt ihrer Position. Dieselben Schlüssel sind in allen vier unterstützten Sprachen vorhanden.

## Konkrete Anleitungstexte

Die Schritte beschreiben verfügbare Bedienelemente und Aufgaben, ohne sachfremde Zusicherungen über Berechtigungen oder nicht ausgeführte Aktionen.

## Weiter-Hinweise pro Schritt festlegen

Jeder Tutorial-Schritt legt `highlightNext` ausdrücklich fest: Erklärungen, die Weiter oder Fertig benötigen, aktivieren den Hinweis; interaktive und wartebasierte Übungen deaktivieren ihn. Bei reduzierter Bewegung bleibt eine statische Umrandung.

Alle UI-Komponenten benötigen eine Anleitung. Die Beitragsrichtlinien verlangen nutzerorientierte Aufgabenabläufe und eine Prüfung bestehender Anleitungen bei neuen Funktionen oder geänderter Bedienung.

## Präzise Ziele und erneuter Zweigstart

Erklärungen zum Besprechungslebenszyklus heben die angezeigte Beenden- oder Löschen-Schaltfläche hervor. Der erste nutzbare Treffer wird im Tutorial-Abschnitt gewählt; ohne passenden Treffer wird der Schritt übersprungen.

## Sichtbare Tutorial-Ziele

Tutorial-Ziele und Weiter-Hinweise sind ausdrücklich festgelegt.

## Gemeinsame Menüwarteschlange

Menüs folgen der gemeinsamen Host-Warteschlange und der Komponentenlebensdauer.

## Dokumentierte Wiederherstellungsaktionen

Bei fehlenden Zielen stehen Weiter und Tutorial neu starten bereit; Wiederholungen bieten auch Abbrechen.

## Browser-Testfixture entfernen

Das eigenständige Browser-Tutorial-Fixture ist entfernt; automatisierte Anbieter- und Modultests bleiben erhalten.

## Gezielte Tutorialführung

Anleitungen erklären unterschiedliche sichtbare Bedienelemente in UI-Reihenfolge. Die gemeinsamen Vorgaben behandeln aktive Ansichten, stabile Beispiele, Leerzustände, bedingte Zweige und Lebensdauerbereinigung. Wiederholungsaktionen und Dokumentation zu reduzierter Bewegung entsprechen dem gemeinsamen Host.

## Commits

- [2ca1e32](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2ca1e3292d5c02ae229f8a5652b40929b0272219)
- [d051ae2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d051ae21ab8a123834e74ef86d24e14809d77e4b)
- [15730bd](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/15730bdfee1eb85b53cc208310add93bf7a14704)
- [f9a767f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f9a767f19179e0e1b5bfbf981bd634d2e2d684f9)
- [6678445](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/66784457b47bd835d947f862890365272f5d6e16)
- [2fada40](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2fada407ffe66e9590f037ce6f500e5a5e2cd158)
- [1235d37](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1235d37629580ae9bdde13c07520a783a1c81949)
- [dcf444a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/dcf444aafe4e88fc1d5b21064c6356013c8e3900)
- [e422908](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e4229088d211facd06d3464ee1e578f4eda7a8b7)
