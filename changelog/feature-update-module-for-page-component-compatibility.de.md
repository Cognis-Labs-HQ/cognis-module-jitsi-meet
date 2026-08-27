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

Meetings verwendet jetzt den Page Builder, das wiederverwendbare Seitenabschnitt-Stylesheet und das Hilfsprogramm `ensurePageStylesheet` von Cognis Core, statt Schaltflächenpaletten, Umschaltungen des Komponentenbühnen-Lebenszyklus und Stylesheet-Injektion zu duplizieren. Dadurch erbt der inaktive Whiteboard-Anker nicht mehr die globale blaue Linkfarbe: `btn-neutral` und `btn-confirm` stammen nun aus dem kanonischen Core-Stylesheet-Bundle.

Meetings verwendet jetzt die neu veröffentlichte Fähigkeit `ui:reuse` als einziges Browser-Gateway zu Produktionsmodulen unter `ui/reuse/` und gemeinsamen Wiederverwendungs-Stylesheets. Eine kleine moduleigene Fassade prüft die Verfügbarkeit der Fähigkeit, alle UI-Einstiegspunkte fordern nur die von ihnen verwendeten Werkzeuge an, `page-sections.css` wird über die Fähigkeit geladen und der duplizierte Stylesheet-Injektor wurde entfernt.

Der lokale Export `ensureStylesheetLoaded` wurde als durch `ui:reuse` gestützte Delegation wiederhergestellt und wird auch vom aktuellen Meetings-Einstiegspunkt verwendet. Dadurch laden gemischte SPA-Caches keinen älteren Routeneinstieg mehr gegen ein neueres Hilfsmodul und die Modulinstanziierung scheitert nicht mehr an einem fehlenden benannten Export.

Fehler beim Einbinden des Whiteboards werden jetzt für den aktuellen Meetings-SPA-Mount gespeichert. Nicht wiederholbare Fehler dynamischer Importe werden sofort beendet; alle endgültigen Vorbereitungs- oder Einbindungsfehler werden einmal protokolliert, zeigen „Fehler beim Laden des Whiteboards“, deaktivieren das lokale Whiteboard-Steuerelement und verhindern weitere Einbindungsversuche durch die Konsensabfrage bis zur Aktualisierung oder zum SPA-Remount.

Die Whiteboard-Aktion bleibt ein Anker und delegiert jetzt alle visuellen Zustände an Cognis Core: `btn-neutral` ist der Standard, während beim Darüberfahren sowie im aktiven/geöffneten Zustand `btn-confirm` gilt. Nach dem Verlassen wird `btn-neutral` wiederhergestellt, sofern das Whiteboard nicht weiterhin aktiv ist.

Der Whiteboard-Anker trägt keine modulspezifische Darstellungsklasse mehr. Sein Standard-, Hover- und Aktiv-Erscheinungsbild stammt vollständig aus den Cognis-Core-Werkzeugen `btn-neutral`, `btn-confirm` und `btn-animated`; das Modul behält nur semantischen ARIA-Zustand und Verhalten.

Die Meetings-SPA ruft jetzt vor der Darstellung den Vertrag `loadCommonStyles()` der Fähigkeit `ui:reuse` auf, statt nur `page-sections.css` zu laden. Damit steht der vollständige Cognis-Core-Stylesheet-Katalog einschließlich der Standarddarstellung von Schaltflächen nach direkter Navigation und SPA-Navigation zur Verfügung.

Die Whiteboard-Aktion verwendet jetzt denselben nativen `<button>`- und Core-`btn-*`-Vertrag wie die benachbarte Teilen-Aktion, einschließlich des nativen Deaktiviert-Zustands. Randlose Einbindungen leiten außerdem den Dokument-Scroll-Layoutvertrag im Komponentenkontext weiter, und die aktive Jitsi-Bühne verwendet eine inhaltsgroße Rasterzeile mit sichtbarem Überlauf, damit sich die eingebettete Zeichenfläche ausdehnen kann, statt einen verschachtelten vertikalen Bildlauf zu erzeugen.

Besprechungsnamen werden jetzt von einem gepflegten, kryptografisch sicheren Passphrasenpaket als vier Wörter erzeugt. Die Whiteboard-Vorbereitung bindet asynchrone Ergebnisse an die ursprüngliche Besprechung, ausstehende Abstimmungen können nicht über eine vorgeschlagene Canvas-Zuordnung umgangen werden, und die Status-API lehnt nicht boolesche Aktivwerte ab.

## Deinstallationsbereinigung und lokalisierte Metadaten hinzufügen

Jitsi Meet entfernt nun bei der Deinstallation seine gespeicherte Konfiguration und kann auf Wunsch auch alle gespeicherten Meeting-Inhalte löschen. Die Metadaten im Modul-Store werden jetzt über moduleigene Sprachschlüssel übersetzt.

## Chats für einmalige Besprechungen löschen

Wenn eine Besprechung nur aus dem Ersteller und einem Freigabelink besteht, wird beim Schließen jetzt auch der zugehörige Nachrichten-Chat des Erstellers gelöscht. Falls das Löschen des Chats fehlschlägt, bleibt der Besprechungseintrag erhalten, damit die Bereinigung sicher wiederholt werden kann.

## Moduleinstellungen

## Vom Kern dargestellte Konfiguration

Cognis stellt nun die im Manifest deklarierten Einstellungen dar und tauscht Werte über den moduleigenen GET- und PUT-Konfigurationsendpunkt aus. Browser-Protokollierung, Hinweise und schwerwiegende Fehlerberichte verwenden die Host-Fähigkeiten.

## Qualitätsstandards

Das Modul verwendet nun die Cognis-Prettier-Konfiguration sowie eigenständige Prüfungen für Struktur, Lokalisierung, Benennung und Dokumentationskonventionen.

## Lokalisierte Dokumentvorlagen

Die Dokumentvorlagen für Mitwirkende enthalten nun deutsche, englische, indonesische und japanische Varianten aus dem Cognis-Standard.

## Teilen-UI-Gateway in das Besprechungsmodul integrieren

Die Schaltfläche zum Teilen einer Besprechung wird jetzt über die Container-Schnittstelle des zentralen Teilen-UI-Gateways eingebunden. Symbol, lokalisierte Beschriftung, Darstellung, Gastverhalten und Abbau entsprechen damit dem etablierten Cognis-Verhalten. Die Besprechungsseite bleibt außerdem verwendbar, wenn das Gateway den Auslöser für den aktuellen Freigabekontext ausblendet.

Besitzer können zudem einer aktiven Besprechung beitreten, wenn nur ein Gast über einen Freigabelink anwesend ist.

## Lokalisierte README-Varianten

Deutsche, englische, indonesische und japanische README-Varianten mit einem englischen `README.md`-Symlink sowie eine Regressionsprüfung für die URL des Manifest-Sprachpakets wurden hinzugefügt.

## Besprechungsnamen und verwerfbare Chats korrigiert

Besprechungen verwenden jetzt einheitlich eindeutige Vier-Wort-Namen für Whiteboards und undatierte Messages-Chats. Teilnehmerlose, verwerfbare Besprechungen erstellen keine Chats mehr, und vorhandene zugehörige Chats werden beim Ende dauerhaft gelöscht. Außerdem behält die Whiteboard-Schaltfläche ihren aktiven Zustand bei Neudarstellungen bei.

## Meeting-Freigabeschaltfläche wiederhergestellt

Das Meeting-Fenster deklariert nun die verwendete Freigabe-Popup-Fähigkeit. Dadurch kann Cognis nach dem Beitritt eines Teilnehmers die Schaltfläche „Teilen“ bereitstellen und den Standard-Freigabedialog öffnen.

## Dauerhafte Teilnehmer-Whiteboards korrigiert

Besprechungsdaten geben jetzt ausdrücklich an, ob eingeladene Teilnehmer vorhanden sind. Teilnehmerbesprechungen erfordern die dauerhafte Canvas-Factory des Providers und greifen niemals auf verwerfbare Erstellung zurück, sodass die automatische Speicherung ihrer zugeordneten Arbeitsflächen erhalten bleibt.

## Aktive Whiteboard-Klasse korrigiert

Die Whiteboard-Schaltfläche erhält jetzt die Standardklasse `active`, solange ihr Komponentenfenster geöffnet ist. Damit entspricht sie ausgewählten Navigationselementen und behält die Markierung bei Neudarstellungen der Besprechung bei.

## Erkennung der Whiteboard-Schaltfläche korrigiert

Die Whiteboard-Schaltfläche hängt jetzt nur noch von der grundlegenden Canvas-Factory des Providers und den Komponentenfenster-Fähigkeiten ab. Optionale Methoden für dauerhafte Canvas und Teilnehmerspeicherung lassen das Steuerelement beim Laden oder Aktualisieren von Provider-Versionen nicht mehr verschwinden.

## Whiteboard-CSS-Integration reduziert

Meetings fügt keine Whiteboard-spezifischen Darstellungsklassen mehr hinzu und überschreibt das gemeinsame Komponentenfenster nicht mehr. Das Steuerelement verwendet importierte Schaltflächenzustände und die Komponente importierte Broker-Klassen, sodass ihr Stylesheet spätere SPA-Seiten nicht beeinflusst.

## Schlüsselbund-Popup für Whiteboards korrigiert

Meetings fordert den Schlüsselbundzugriff jetzt auf der übergeordneten Seite an, bevor ein Whiteboard-Komponentenfenster eingebunden wird. Ein gesperrter Schlüsselbund kann dadurch sein Entsperr-Popup anzeigen, statt das Laden der Komponente mit einer unbehandelten Autorisierungsantwort abzubrechen.

## Whiteboard-Zuordnungstyp korrigiert

Meetings speichert jetzt, ob jedes zugeordnete Whiteboard verwerfbar ist. Teilnehmerbesprechungen verwerfen unbekannte oder verwerfbare Zuordnungen älterer Integrationen und fordern eine neue dauerhafte Arbeitsfläche an, statt eine verwerfbare Arbeitsfläche mit deaktivierter automatischer Speicherung erneut zu öffnen.

## Anzeige für geöffnetes Whiteboard korrigiert

Ein geöffnetes Whiteboard gibt seinem Besprechungs-Steuerelement jetzt eine akzenthinterlegte aktive Darstellung und ändert die Beschriftung in „Whiteboard schließen“. Damit wird sichtbar und textlich erkennbar, dass die Auswahl die aktuelle Arbeitsfläche schließt.

## Whiteboard-Synchronisierung für Teilnehmer korrigiert

Meetings verwenden verwerfbare Arbeitsflächen jetzt nur für teilnehmerlose Sitzungen. Dauerhafte Besprechungs-Whiteboards werden für alle Teilnehmer gespeichert und über ihre Besprechungszuordnung automatisch erneut geöffnet, während die Steuerelemente von Organisator und Teilnehmern dem synchronisierten Öffnungszustand folgen.

## Bereinigung der Whiteboard-Seiten-Shell korrigiert

Whiteboard-Komponentenfenster begrenzen ihre randlose Darstellung jetzt auf die Meetings-Bühne. Beim Schließen der Komponente oder beim Wegnavigieren wird dieser lokale Zustand synchron entfernt, und die gemeinsame Cognis-Seiten-Shell wird nicht mehr in den randlosen Broker-Modus versetzt.

## Dauerhaftes Whiteboard-Gateway integriert

Teilnehmerbesprechungen rufen jetzt die vom aktualisierten Gateway bereitgestellte Whiteboard-Provider-Methode `createCanvas` genau mit dem Besprechungstitel und den Kennungen der eingeladenen Teilnehmer auf. Teilnehmerlose Besprechungen verwenden weiterhin die ressourcengebundene Methode `createDisposableCanvas`.
