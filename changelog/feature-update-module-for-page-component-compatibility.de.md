# Modul für Komponentenseiten-Kompatibilität aktualisieren

Die Meetings-SPA-Route erlaubt jetzt ausdrücklich die Nutzung als Cognis-Komponentenseite. Andere Komponenten können sie über die UUID des Jitsi-Meet-Moduls und die stabile Routen-ID für Overlay-, Vollbild- oder Bild-im-Bild-Darstellung auflösen.

Eingebettete Aufrufer können eine serialisierbare Meeting-Kennung über `focusState` übergeben. Die Seite wird mit einem rahmenlosen Composer im bereitgestellten Wurzelelement eingebunden und dupliziert daher weder Host-Navigation noch Fußzeile oder Designsteuerung.

Die Routenkennungen der Komponentenseite verwenden durch Punkte getrennte Namen, damit Aufrufer sie gemäß der kanonischen Routen-ID-Konvention der Plattform auflösen können.

Der Besprechungslebenszyklus behandelt Jitsi-Fehler vom Typ `conference.destroyed` jetzt als geschlossene Besprechungen und stellt die Aktion „Besprechung starten“ nach dem Verlassen sofort wieder her. Teilnehmer-, Leistungs- und Hintergrundfunktionen sind aus der eingebetteten Jitsi-Werkzeugleiste entfernt.

Wenn die optionale Nextcloud-Whiteboard-ctx-Capability verfügbar ist, erstellt eine Whiteboard-Schaltfläche eine temporäre Zeichenfläche und öffnet ihr synchronisiertes Komponentenfenster in der Besprechungsbühne. Die laufende Besprechung wechselt ohne Verbindungsabbruch in den Bild-im-Bild-Modus; das Schließen des Whiteboards stellt die normale Ansicht wieder her.

Die Integration ruft keine Jitsi-API-Route mehr auf, um ein Whiteboard über ein anderes Modul zu erstellen. Die Whiteboard-Schaltfläche wird nur bereitgestellt, wenn das Whiteboard-Modul die optionale Browser-CTX-Capability `whiteboard:uiGateway` beiträgt, deren Methode `createDisposableCanvas` die Provider-Erstellung übernimmt. Jitsi behält nur seinen besprechungslokalen Endpunkt für den Zustand des aktiven Fensters.

Die automatische Wiederherstellung übergibt jetzt sowohl den Fokuszustand der Komponentenseite als auch den aktuellen Freigabekontext des Whiteboard-Anbieters. Eine fehlgeschlagene Wiederherstellung im Hintergrund wird pro Besprechungszeichenfläche nur einmal protokolliert, ohne wiederholt Fehlermeldungen für Benutzeraktionen anzuzeigen.

Das eingebettete Whiteboard verwendet jetzt die Zielelement-ID des Komponentenfenster-Brokers, um direkt in die Besprechungsfenster-Bühne eingebunden zu werden. Die Bühne verwendet für Whiteboard und Besprechungs-Bild-im-Bild ein normales Rasterlayout statt einer absoluten Positionierung des Komponentenfensters.
