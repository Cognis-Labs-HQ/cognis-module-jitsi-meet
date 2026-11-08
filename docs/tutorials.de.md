# Geführtes Tutorial

Dieses Modul bindet seinen Einführungsablauf über `ui:tutorials` an seine eigene Seite. Beim ersten zulässigen Besuch startet er automatisch; das Fragezeichen-SVG neben dem Seitentitel wiederholt ihn. Der Host muss den seitengebundenen Tutorialvertrag der Version eins bereitstellen.

## Anwendungsbeispiele

Der Ablauf erklärt Besprechungen und vorgemerkte Teilnehmer, ohne eine Besprechung zu betreten oder zu erstellen. Er erfordert eine authentifizierte Online-Sitzung.

## Technische Spezifikation

Anbietertests prüfen den öffentlichen Vertrag, alle vier Übersetzungen, Verfügbarkeitsregeln, Fehlerbereinigung und die Ablehnung nicht unterstützter Host-Versionen.

Die Abdeckung umfasst Vorbereitung, Anruf-, Chat- und Freigabesteuerung sowie administrative Prüfung von Besprechungen, Beenden und Löschen.

Erklärungen zum Besprechungslebenszyklus heben die angezeigte Beenden- oder Löschen-Schaltfläche hervor. Der erste nutzbare Treffer wird im Tutorial-Abschnitt gewählt; ohne passenden Treffer wird der Schritt übersprungen.

Der gemeinsame Host stellt schwebende Aktionen über seine Warteschlange bereit. Erstbesuche bieten Weiter/Fertig ohne Abbrechen oder Überspringen; Wiederholungen bieten Überspringen vor dem letzten sichtbaren Schritt. Neustart erscheint nach dem ersten sichtbaren Schritt. Abschlüsse bleiben nach Inhaltsänderungen gültig. Ausdrückliche highlightNext-Angaben aktivieren nur die Atemanimation für Erklärungen; reduzierte Bewegung deaktiviert sie. Jeder Schritt hebt ein anderes reales Bedienelement in UI-Reihenfolge hervor. Anleitungen bleiben an die aktuelle Ansicht gebunden, behandeln leere und optionale Zustände und räumen bei Navigation oder Besitzerentfernung auf.

Die Besprechungsanleitung hebt zuerst den gesamten Teilnehmerbereich und bei der Auswahl den Abschnitt verfügbare Teilnehmer hervor.
