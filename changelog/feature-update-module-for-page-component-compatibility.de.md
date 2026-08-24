# Modul für Komponentenseiten-Kompatibilität aktualisieren

Die Meetings-SPA-Route erlaubt jetzt ausdrücklich die Nutzung als Cognis-Komponentenseite. Andere Komponenten können sie über die UUID des Jitsi-Meet-Moduls und die stabile Routen-ID für Overlay-, Vollbild- oder Bild-im-Bild-Darstellung auflösen.

Eingebettete Aufrufer können eine serialisierbare Meeting-Kennung über `focusState` übergeben. Die Seite wird mit einem rahmenlosen Composer im bereitgestellten Wurzelelement eingebunden und dupliziert daher weder Host-Navigation noch Fußzeile oder Designsteuerung.

Die Routenkennungen der Komponentenseite verwenden durch Punkte getrennte Namen, damit Aufrufer sie gemäß der kanonischen Routen-ID-Konvention der Plattform auflösen können.

Der Besprechungslebenszyklus behandelt Jitsi-Fehler vom Typ `conference.destroyed` jetzt als geschlossene Besprechungen und stellt die Aktion „Besprechung starten“ nach dem Verlassen sofort wieder her. Teilnehmer-, Leistungs- und Hintergrundfunktionen sind aus der eingebetteten Jitsi-Werkzeugleiste entfernt.

Wenn die optionale Nextcloud-Whiteboard-ctx-Capability verfügbar ist, erstellt eine Whiteboard-Schaltfläche eine temporäre Zeichenfläche und öffnet ihr synchronisiertes Komponentenfenster in der Besprechungsbühne. Die laufende Besprechung wechselt ohne Verbindungsabbruch in den Bild-im-Bild-Modus; das Schließen des Whiteboards stellt die normale Ansicht wieder her.

Die Integration ruft keine Jitsi-API-Route mehr auf, um ein Whiteboard über ein anderes Modul zu erstellen. Die Whiteboard-Schaltfläche wird nur bereitgestellt, wenn das Whiteboard-Modul die optionale Browser-CTX-Capability `whiteboard:uiGateway` beiträgt, deren Methode `createDisposableCanvas` die Provider-Erstellung übernimmt. Jitsi behält nur seinen besprechungslokalen Endpunkt für den Zustand des aktiven Fensters.

Die Whiteboard-Erkennung verwendet jetzt `component-pages:request`, ohne eine Oberfläche einzubinden. Nachdem eine temporäre Zeichenfläche vorbereitet wurde, ruft die Benutzeraktivierung der Schaltfläche synchron `component-pages:spawn` mit der ID der Besprechungsfenster-Bühne auf. Der Broker verwaltet Begrenzung, Navigationssperre, Provider-Bereinigung und das zurückgegebene Discard-Handle. Das Besprechungs-Bild-im-Bild reagiert ohne eigene Komponentenfenster-Positionierung auf den Broker-Zustand `component-page-stage`.

Wiederholtes Betätigen der Whiteboard-Schaltfläche verwirft eine geöffnete Zeichenfläche nicht mehr. Teilnehmerbesprechungen behalten ihre stabile, ressourcengebundene Zeichenflächen-ID über Besprechungsinstanzen hinweg, Besprechungen ohne Teilnehmer bleiben temporär, Broker-Fenster und eingebettete Seite füllen die Bühne aus, und SPA-Neueinbindungen laden die UI-Provider ausdrücklich und bereiten die Zeichenfläche für die aktuelle Besprechung vor.

Bei fehlendem Whiteboard-Gateway erzwingt Meetings jetzt eine einmalige Aktualisierung des Host-Provider-Katalogs. Dadurch funktionieren veraltete Kataloge nach Start oder Modulaktualisierung ohne Deaktivierungs-/Aktivierungszyklus. Komponentenfenster verwenden ihr Broker-Discard-Handle mit bühnenbezogenem Fallback; die routenweite Bereinigung über `component-pages:discardAll` bleibt bei der SPA-Shell.

SPA-Einbindungen wiederholen jetzt die Provider-Bereitschaftsprüfung, vergeben für jede neu gebundene Besprechungsbühne eine kollisionssichere Ziel-ID und fordern das Whiteboard im Overlay-Modus an. Dadurch erhält geparktes oder veraltetes Meetings-DOM nicht mehr die Einbindung, und eine begrenzte Zeichenfläche wird nicht als Vollbildseite behandelt.
