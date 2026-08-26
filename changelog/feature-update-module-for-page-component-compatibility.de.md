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

Eingebundene Whiteboards fordern jetzt eine rahmenlose Darstellung an und verwenden bühnenbezogene Abstandsüberschreibungen für Arbeitsbereich, Panel, Abschnitt, Raster und Widget, damit die Zeichenfläche den verfügbaren Bereich des Besprechungsfensters ausfüllt und das Besprechungs-Bild-im-Bild erhalten bleibt.

Das Meeting-Bild-in-Bild wird jetzt vollständig vom Cognis-Komponentenseiten-Broker verwaltet. Das Modul ruft die Floating-Window-Fähigkeit des Kerns auf, ohne PiP-Positionierungscode oder -Stile zu enthalten. Die Whiteboard-Aktivierung bleibt nun ausstehend, bis Komponenten-Einbindung und Zustandssynchronisierung abgeschlossen sind, damit Polling keine laufende Einbindung verwirft.

Die Whiteboard-Darstellung markiert die Zeichenfläche jetzt nur bei teilnehmerlosen Besprechungen als temporär; Besprechungen mit vorgemerkten Teilnehmern öffnen die normale ressourcengebundene Zeichenfläche.

Die Floating-Window-Fähigkeit des Kerns wird jetzt aktiviert, bevor das asynchrone Einbinden der Komponentenseite beginnt. Damit wird das zuvor funktionierende Verhalten wiederhergestellt: Das Meeting wechselt in PiP, sobald das Whiteboard die Bühne übernimmt, statt auf den Abschluss der Whiteboard-Einbindung zu warten.

Beim Erzeugen des Whiteboard-Komponentenfensters wird jetzt das Cognis-Core-Vertragsflag `borderless` gesetzt, sodass der Broker den äußeren Fensterrahmen entfernt, während der vorhandene rahmenlose Fokuszustand die eingebettete Whiteboard-Oberfläche steuert.

Die Whiteboard-Schaltfläche wird sofort hervorgehoben, solange ihr Komponentenfenster aktiv ist. Durch erneutes Auswählen der hervorgehobenen Schaltfläche wird das Komponentenfenster verworfen, das Bild-in-Bild der Besprechung beendet und die Standardansicht der Besprechung synchronisiert.

Neue Besprechungen leiten ihren Anzeigenamen jetzt vom erzeugten Jitsi-Raum-Slug ab. Genau dieser eindeutige Name wird an das Besprechungs-Whiteboard übergeben; der zugehörige Messages-Chat verwendet den eindeutigen Besprechungsnamen mit anschließendem Erstellungsdatum.

Rahmenlose Whiteboard-Fenster lassen die Jitsi-Bühne jetzt mit ihrem Inhalt wachsen, statt ihn in einem Bereich fester Höhe mit vertikalem Überlauf abzuschneiden. Die Bühne reagiert auf die Core-Hostklasse `app-page__main--component-borderless`; redundante moduleigene Abstandsüberschreibungen für Komponentenfenster wurden zugunsten des Core-Vertrags entfernt.

Die Host-Überschreibung `app-page__main--component-borderless` wurde entfernt. Der Überlauf entstand, weil die später geladene Jitsi-Bühnenregel `overflow: hidden` das generische Core-Verhalten von `component-page-stage` überschrieb. Die Korrektur zielt jetzt direkt auf `.jitsi-stage-frame-wrap.component-page-stage` und lässt das rahmenlose Kindelement eine automatische Bühnenhöhe bestimmen.

Meetings speichert jetzt einen optionalen besprechungsbezogenen Zustand `whiteboardOpen` nur, wenn eine Whiteboard-Zeichenfläche existiert. Organisatoren öffnen sie sofort; Nicht-Organisatoren sammeln anwesenheitsbezogene Stimmen, bis eine strikte Mehrheit zustimmt. Abfragende Clients öffnen bei erkanntem Zustand automatisch die gemeinsame Zeichenfläche und aktivieren das Meeting-Bild-in-Bild, auch für später beitretende Teilnehmer.

Beim Starten oder Übernehmen einer Besprechungsinstanz wird ein bereits geöffnetes besprechungsbezogenes Whiteboard nicht mehr zurückgesetzt. Dadurch entfällt der Join-Lebenszyklus-Wettlauf, der Whiteboards teilnehmerloser Besprechungen bei der nächsten fünfsekündigen Zustandsaktualisierung schloss; eine ausdrückliche Besprechungsbeendigung schließt das gemeinsame Whiteboard weiterhin.

Der Fünf-Sekunden-Zustandsendpunkt liefert jetzt dieselbe öffentliche Besprechungszustandsform wie das erstmalige Laden. Er bildet das intern gespeicherte Whiteboard-Flag auf `whiteboardOpen` ab und verhindert, dass die Abfrage ein geöffnetes Whiteboard einer teilnehmerlosen Besprechung als nicht vorhanden behandelt und dessen Komponentenfenster schließt.

Meetings spiegelt jetzt ein aktives randloses Whiteboard-Handle als `component-page-stage--borderless` auf die Besprechungsbühne. Nur solange dieses Handle aktiv ist, werden die feste Besprechungshöhe und der abgeschnittene Bühnenüberlauf gelockert, damit die Komponenten-Arbeitsfläche die Bühne vergrößern kann; beim Schließen oder Fehlschlagen des Komponentenstarts wird das standardmäßige Jitsi-Layout wiederhergestellt.

Das Whiteboard-Steuerelement wird jetzt als Anker dargestellt und verwendet im aktiven Zustand die standardmäßige Gestaltung `btn-confirm`. Die Synchronisierung des Öffnungszustands durch den Organisator wird nun vor der Aktivierung von Komponentenseite und PiP abgeschlossen, wodurch das anfängliche Polling-/Einbindungsrennen mit wiederholten Fehlermeldungen beim Öffnen entfällt. Vorübergehende Startfehler beim Einbinden der Komponente werden intern wiederholt, bevor eine Fehlermeldung angezeigt wird.

Die ankerbasierte Whiteboard-Aktion verfügt jetzt über vollständige moduleigene Steuerelement-Stile. Sie wird nicht mehr als einfacher unterstrichener Link dargestellt, wenn Host-Standards für Schaltflächen oder nur in der Administration verfügbare `btn-*`-Deklarationen fehlen; `btn-confirm` wählt weiterhin ihre aktiven Farben aus.
