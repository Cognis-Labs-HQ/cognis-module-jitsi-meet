# Geführtes Tutorial

Dieses Modul bindet seinen Einführungsablauf über `ui:tutorials` an seine eigene Seite. Beim ersten zulässigen Besuch startet er automatisch; das Fragezeichen-SVG neben dem Seitentitel wiederholt ihn. Der Host muss den seitengebundenen Tutorialvertrag der Version eins bereitstellen.

## Anwendungsbeispiele

Der Ablauf erklärt Besprechungen und vorgemerkte Teilnehmer, ohne eine Besprechung zu betreten oder zu erstellen. Er erfordert eine authentifizierte Online-Sitzung.

## Technische Spezifikation

Der Host verwaltet Hinweise, Pfeile, Hervorhebung, Barrierefreiheit und das gemeinsame schwebende Aktionsmenü. Erstdurchläufe bieten stets Weiter, ohne Abbrechen oder Überspringen. Wiederholungen bieten Abbrechen mit `btn-cancel`. Der Abschluss wird im Browser pro Konto gespeichert. Navigation, Zugriffsverlust und Anbieterentfernung beenden die Sitzung; fehlgeschlagenes Mounten nimmt Registrierungen zurück.

Der Ablauf erklärt nur und führt keine privilegierte Aktion aus. Fehlende Ziele erlauben Weiter im Erstdurchlauf sowie Wiederholen oder Abbrechen bei erneuter Wiedergabe.

Anbietertests prüfen den öffentlichen Vertrag, alle vier Übersetzungen, Verfügbarkeitsregeln, Fehlerbereinigung und die Ablehnung nicht unterstützter Host-Versionen.

Die Abdeckung umfasst Vorbereitung, Anruf-, Chat- und Freigabesteuerung sowie administrative Prüfung von Besprechungen, Beenden und Löschen.

Jeder Tutorial-Schritt legt `highlightNext` ausdrücklich fest: Erklärungen, die Weiter oder Fertig benötigen, aktivieren den Hinweis; interaktive und wartebasierte Übungen deaktivieren ihn. Bei reduzierter Bewegung bleibt eine statische Umrandung.
