# Geführtes Tutorial

Das Kontomenü zeigt den Einführungsablauf dieses Moduls, wenn sein UI-Anbieter aktiviert ist und das aktuelle Konto Zugriff hat. Der Host muss den Vertrag `ui:tutorials` in Version eins bereitstellen.

## Anwendungsbeispiele

Der Ablauf erklärt Besprechungen und vorgemerkte Teilnehmer, ohne eine Besprechung zu betreten oder zu erstellen. Er erfordert eine authentifizierte Online-Sitzung.

## Technische Spezifikation

Das Modul registriert seinen Ablauf und übersetzte Texte über ctx. Der Host verwaltet Katalog, Hinweise, Pfeile, Hervorhebung, Tastatur- und Zeigersteuerung, geschützte SPA-Navigation und Barrierefreiheit. Schließen, fremde Navigation, Zugriffsverlust oder Deaktivierung beenden die Sitzung. Scheitert das Einhängen des Anbieters, werden seine Registrierungen zurückgenommen.

Der Ablauf informiert nur. Er erstellt keine Konten, ändert keine Konfiguration, sendet keine Nachrichten, akzeptiert keine Vereinbarungen und startet keine Anrufe. Ziele müssen eindeutig sein; bei fehlenden Inhalten sind Wiederholen und Abbrechen möglich.

Anbietertests prüfen den öffentlichen Vertrag, alle vier Übersetzungen, Verfügbarkeitsregeln, Fehlerbereinigung und die Ablehnung nicht unterstützter Host-Versionen.
