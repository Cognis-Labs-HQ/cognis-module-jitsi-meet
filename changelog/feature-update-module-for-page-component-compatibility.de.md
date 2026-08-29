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

Neue Besprechungen lassen jetzt die Jitsi-Iframe-API ihren standardmäßigen Raumnamen erzeugen. Cognis übernimmt diesen Namen nach dem Beitritt des Organisators und verwendet ihn für den Messages-Chat und die Whiteboard-Ressource. Die Whiteboard-Vorbereitung bindet asynchrone Ergebnisse an die ursprüngliche Besprechung, ausstehende Abstimmungen können nicht über eine vorgeschlagene Canvas-Zuordnung umgangen werden, und die Status-API lehnt nicht boolesche Aktivwerte ab.

Die Whiteboard-Provider-Erkennung befindet sich jetzt in einem fokussierten Provider-Modul; Canvas-Vorbereitung, Komponentenstart und Schlüsselbund-Koordination liegen in einem Sitzungsmodul. Das Schaltflächenmodul ist auf Darstellung und Interaktionssteuerung beschränkt.

Changelog-Dokumente bleiben Release-Metadaten des Repositorys und sind nicht mehr im Digest-Inventar der Laufzeitdateien enthalten.

Der Whiteboard-UI-Orchestrator heißt jetzt `whiteboard-control.js`, passend zu seiner umfassenderen Verantwortung für den Steuerungslebenszyklus. Das Modul enthält keinen Besprechungsnamengenerator, keine kopierten Wortlisten und keine Generatorlizenz mehr. Bevor Jitsi die Raumidentität meldet, zeigen Flächen ohne Nutzen daraus weiterhin „Cognis Classroom“ an.

Das Löschen der Konfiguration ist jetzt ausdrücklich als reine Administratorroute registriert, die auch bei deaktiviertem Modul einschließlich des Route-Satzes mit eingeschränkten Capabilities verfügbar bleibt.

Die Schemainrichtung bei Neuinstallationen teilt jetzt ein Initialisierungs-Promise pro Datenbank-Executor. Gleichzeitige Konfigurations- und Lebenszyklusanfragen warten auf dieselbe Tabellenerstellung, statt bei der PostgreSQL-Typerstellung zu konkurrieren.

Das Manifest deklariert Nextcloud Whiteboard jetzt als optionale weiche Abhängigkeit. Die abhängigkeitsbewusste Cognis-Installation kann Whiteboard zusammen mit Meetings anbieten, ohne Installation oder Aktivierung zu blockieren, wenn das optionale Modul nicht verfügbar ist.

Neue Besprechungen ohne übernommene Raumidentität deaktivieren jetzt ausdrücklich die eingebettete Jitsi-Willkommensseite. Dadurch erzeugt Jitsi bei einem leeren Raum sofort einen zufälligen Raum und tritt ihm bei, statt seine Startseite im begrenzten Besprechungsbereich darzustellen und Cognis mit einer unbrauchbaren leeren, scrollenden Ansicht zurückzulassen.

Die Meetings-SPA und Freigabebeiträge veröffentlichen wieder den kanonischen, nicht qualifizierten Modul-Einstiegspfad und überlassen die Versionierung des Asset-Caches vollständig Cognis.

Ausstehende Besprechungen speichern jetzt eine eindeutige, durch ein Fragment ergänzte Jitsi-Instanz-URL, die ihren vorhandenen Besprechungs-UUID verwendet. Damit wird das eindeutige, nicht leere Schemafeld `meeting_url` ohne erfundenen Raum-Slug erfüllt, gleichzeitige neue Besprechungen derselben Jitsi-Instanz kollidieren nicht, und die URL wird nach der Identitätsübernahme durch die kanonische Jitsi-Raum-URL ersetzt.

Meetings registriert oder injiziert keine Stylesheets des Messages-Providers mehr dynamisch, da diese nach der SPA-Navigation bestehen bleiben und fremde Seiten umgestalten konnten. Jeder Selektor in `jitsi-meet.css` ist jetzt unter der routeneigenen Klasse `.jitsi-route-root` verankert, der Animationsname ist modulspezifisch, und das ungenutzte ältere Asset `ui/styles/meetings.css` wurde entfernt.

Der Startablauf deaktiviert Jitsis Willkommensroute nicht mehr, wenn ein Iframe ohne übernommene Raumbezeichnung erstellt wird. Stattdessen aktiviert er Jitsis eigenen Raumnamengenerator der Willkommensseite, vermeidet damit die nicht unterstützte Weiterleitungsschleife für leere Räume, die den Browser-Tab blockieren konnte, und meldet Fehler beim Start des Embeds über strukturierte UI-Protokollierung und Rückmeldung.

Ein vollständiger Vergleich mit `master` führte das Einfrieren der Besprechung auf die Lebenszyklusänderung zurück, die `JitsiMeetExternalAPI` ohne Raumnamen aufrief. Beim Erstellen wird nun vor dem Start des Embeds eine konkrete, kryptografisch zufällige und undurchsichtige Raumkennung vergeben, die sofortige Chat-Zuordnung für mehrere Teilnehmer wiederhergestellt und „Cognis Classroom“ als sichtbarer Titel beibehalten. Die Aktion „Besprechung starten“ verwendet jetzt den Core-Vertrag `btn-confirm btn-animated`, während Modulüberschriften das aktive Core-Theme-Token `--text` verwenden.

Teilnehmerlose Besprechungen erstellen bei der Anlage wieder einen Messages-Chat mit einem Mitglied, damit Gäste ihn später über einen Freigabelink nutzen können; die Bereinigung der verwerfbaren Besprechung löscht diesen Chat weiterhin nach dem Ende. Besprechungsdatensätze verwenden nun einen unterscheidbaren Titel aus der geplanten UTC-Minute und einer kurzen kryptografischen Kennung und geben denselben eindeutigen Titel an Chats, Freigaben und Whiteboards weiter, anstatt überall nur „Cognis Classroom“ zu wiederholen.

Die Benennung verwendet wieder Jitsis unterstützten Willkommensseiten-Ablauf: Ein Iframe mit leerem Raum aktiviert `GENERATE_ROOMNAMES_ON_WELCOME_PAGE`, das Ereignis `videoConferenceJoined` liefert den erzeugten Raumnamen und der nur für Organisatoren zugängliche Identitätsendpunkt validiert und speichert genau diesen Wert, bevor selbst ein teilbarer Chat mit einem Mitglied erstellt wird. Zeitstempelbasierte Titel wurden entfernt. Schutzmaßnahmen weisen fehlende oder abweichende Identitäten zurück, protokollieren und melden Übernahmefehler, begrenzen das Laden des Iframes zeitlich und entsorgen fehlgeschlagene Embeds.

Besprechungsnamen stammen jetzt ausschließlich aus der Host-Capability `reuse:generatePassphrase` und bestehen aus vier titelartig geschriebenen, durch Bindestriche getrennten Wörtern. Bei der Erstellung wird genau dieser Wert als Anzeigename, Raumkennung und URL gespeichert und vom Browser immer an `JitsiMeetExternalAPI` übergeben; die Jitsi-Willkommensseitengenerierung und die Identitätsübernahme wurden entfernt. Messages-Chats mit einem Mitglied werden bei der Besprechungserstellung angelegt. Gespeicherte Besprechungsdatensätze, die diesen Vertrag für erzeugte Namen nicht erfüllen, erhalten bei der Schemainitialisierung einen neuen, von der Capability erzeugten Namen, bevor sie geöffnet werden können. Dadurch gelangen kodierte Zeitstempeltitel nicht mehr als ungültige 404-Raumpfade zu Jitsi. Das vorübergehende Iframe-Ladeversprechen, das Zeitlimit und die Fehlerhülle beim Beitritt aus dem abgelösten, von Jitsi erzeugten Namenslebenszyklus wurden entfernt. Damit entspricht der Embed-Start wieder dem Master-Branch, während der ausdrücklich übergebene, von der Capability erzeugte Raumname erhalten bleibt.

Whiteboard-Komponentenseiten werden nun einmal pro Besprechungs-Mount angefordert und Wiederholungen für Komponentenfenster bleiben begrenzt. Dauerhafte Arbeitsflächen öffnen sich nur durch den ausdrücklichen Zustand der aktuellen Sitzung, und das Beenden oder Neustarten einer Besprechung löscht diesen Zustand. Während die Schlüsselbundabfrage oder das Einbinden aussteht, bleibt das Steuerelement mit seiner normalen Beschriftung deaktiviert und ändert sich erst nach erfolgreicher Einbindung in „Whiteboard schließen“. Abgebrochene veraltete Einbindungen zeigen keine Fehlermeldungen mehr.
