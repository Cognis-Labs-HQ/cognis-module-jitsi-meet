# Jitsi-Meet-Modul

Das Jitsi-Meet-Modul bietet Cognis-native Besprechungssteuerung mit Teilnehmerauswahl, wiederverwendbaren Besprechungsräumen, Sitzungswiederaufnahme, Messages-Chat-Integration und einem optionalen gemeinsamen Whiteboard.

Messages löst den Jitsi-Anbieter `voip:startCall` für jeden Direkt- oder Gruppenchat separat auf. Jitsi validiert die Raumanfrage mit seiner authentifizierten API. Verweist der Raum auf ein reguläres Meeting, gibt der Anbieter eine gleichursprüngliche `navigate`-Aktion für dieses Meeting zurück. Neue Anrufe und Räume, die bereits einem verfügbaren Anruf zugeordnet sind, liefern eine hostverwaltete `component`-Aktion für die Meetings-Route im Overlay-Modus. Nicht unterstützte Anfragen ergeben `null`.

Cognis verwaltet die temporäre Komponentenbühne und deren Bereinigung. Jitsi verändert weder das Messages-DOM noch ruft es selbst den Komponenten-Seiten-Broker auf. Komponentenanrufe verwenden in Jitsi den Betreff „Cognis VoIP Call“, enthalten keinen moduleigenen Zurück-Button und erstellen keinen Meeting-Chat. Sie erscheinen weder in der Liste aktiver noch früherer Meetings auf der Meetings-Seite und können weder geteilt noch um Teilnehmende erweitert oder mit einem Whiteboard verbunden werden.

Einbindungen in Komponentenfenstern unterdrücken sowohl das Meeting-Overlay als auch die Überschrift „Meeting-Fenster“, sodass die eingebettete Oberfläche beim Verbinden und während des Anrufs nur den Meeting-Frame zeigt.

Wenn der lokale Teilnehmer das Meeting verlässt, entfernt wird oder die Konferenz endet, schließt Jitsi die Meeting-Bereinigung ab und fordert anschließend über die Host-Capability für Komponentenseiten das Verwerfen des umgebenden Komponentenfensters an. Vollständige Sitzungen auf der Meetings-Seite lösen kein Komponenten-Verwerfen aus.

Komponenten-Metadaten können mit `allParticipantsRequired` die vollständige Teilnehmerliste verpflichtend machen. Sobald in einem solchen beigetretenen Komponenten-Meeting das erste Jitsi-Ereignis `participantLeft` eintritt, wird das Meeting beendet, regulär auf Server und Client bereinigt und das Komponentenfenster geschlossen. Messages-VoIP-Anrufe aktivieren dieses Flag.

Die Anbieteraktion weist mit `minSize: { width, height }` eine Mindestgröße von 400 × 225 Pixeln aus und verwendet damit dieselbe PiP-Nutzlastdefinition wie Nextcloud Whiteboard, sodass der Host die Mindestgröße des schwebenden Anrufs einheitlich durchsetzen kann.

Die Anbieter-Metadaten der Navigationsleiste ermöglichen Cognis, den Anbieter vor der ersten Verfügbarkeitsprüfung von Messages zu laden, sodass die Videokamera-Aktion bereits beim ersten Rendern des Chats angezeigt wird.

## Anwendungsbeispiele

- Besprechungen über `/meetings` und `/meeting` ohne vollständige Seitennavigation beitreten oder wiederaufnehmen.
- Teilnehmer auswählen, Besprechungszugriff teilen und den Messages-Chat der Besprechung verwenden.

Benutzer, die in einer anderen Besprechung aktiv anwesend sind, erscheinen nicht in der Teilnehmersuche und können nicht in eine aktive Besprechung gezogen werden; eine geplante Einladung allein macht einen Benutzer nicht unverfügbar.

Verfügbare Teilnehmer und aktive Besprechungen werden alle fünf Sekunden aktualisiert, einschließlich der Verfügbarkeitsanzeigen nach einer SPA-Navigation.

Die Teilnehmersuche übergibt den Cognis-Core-Ergebnisfilter `user`, und die Liste aktiver Besprechungen erscheint nur in der anfänglichen Einblendung direkt über „Besprechung starten“.

Meeting-Parameter aus Benachrichtigungen werden aus der URL entfernt, sobald sie verarbeitet wurden.

Fensterfokuswechsel ohne aktiven Teilnehmer-Ziehvorgang bewahren die aktuelle Einblendung, sodass eine inaktive Lobby startbereit bleibt.

Der Bereich aktiver Meetings ist immer gesperrt, wenn ein Meeting ausgewählt oder beigetreten wurde, einschließlich Beitritten über Benachrichtigungen; Benachrichtigungen über beendete Meetings enthalten weder Aktion noch E-Mail-Link.

Der Teilnehmerbereich behält verfügbare bekannte Benutzer in einer vertikal scrollbaren 30-Prozent-Spalte und zeigt in den verbleibenden 70 Prozent horizontal scrollbare Karten dauerhafter Besprechungen; jede Karte zentriert ihren stabilen Namen, verteilt bis zu zehn Standard-Profilbilder darauf und erhält bei einer aktiven Besprechung ein app-grünes Farbsegment, das am Rand entlangläuft.

Die kompakten Karten sind anklickbar: Eine Auswahl stellt ihren Teilnehmerkreis auf der Bühne wieder her und scrollt dorthin, damit „Besprechung starten“ das stabile Meeting wiederverwendet; drei Sekunden langes Halten wechselt die grüne Tönung zu Rot und öffnet eine Bestätigung, die den aktuellen Benutzer entfernt und nach dem Austritt des letzten Mitglieds Meeting, Chatraum und zugeordnetes Whiteboard dauerhaft löscht.

Karten früherer Besprechungen passen ihre Höhe an Titel und umbrochene Avatarzeilen an, ohne vertikalen Überlauf zu erzeugen.

Der aktive Status erscheint ausschließlich als laufendes Farbsegment am Kartenrand, während beim Gedrückthalten sofort ein Grün-zu-Rot-Verlauf mit gleichbleibender Deckkraft beginnt.

Die Bestätigung verwendet die destruktive beziehungsweise neutrale Schaltflächenbehandlung und meldet einen abgeschlossenen Austritt als Information.

„Teilnehmer suchen“ erscheint als Profilbild mit Fragezeichen am Anfang der verfügbaren Teilnehmer.

Die gemeinsame Teilnehmerüberschrift bleibt über beiden Spalten, sodass die Titel „Verfügbare Teilnehmer“ und „Frühere Besprechungen“ ausgerichtet sind.

Die inhaltshohe Galerie verhindert vertikalen Überlauf, und ihr Lösch-Haltevorgang animiert zuverlässig ab dem ersten Gedrückthalten einen Verlauf mit gleichbleibender Deckkraft.

Die Teilnehmerüberschrift behält ihre natürliche, geerbte Texthöhe ohne äußeren Überschriftenrand; der Bereich weist ihr unabhängig Platz zu, während sich das Teilnehmerlayout in den verbleibenden Elternbereich einpasst, ohne durch eine erzwungene Überschriftengröße zusammengedrückt zu werden.

Frühere Besprechungen bleiben per Zeiger, Berührung, Mausrad und Tastatur horizontal scrollbar, während die Bildlaufleiste visuell ausgeblendet ist.

Ein bereitgestellter Teilnehmer kann durch Klicken außerhalb seines Profillinks oder durch Zurückziehen zu Verfügbare Teilnehmer zurückgegeben werden.

Wenn die Auswahl einer vorherigen Besprechung geändert wird, erstellt Besprechung starten einen neuen Raum, anstatt einen stabilen Besprechungsnamen für die geänderte Teilnehmergruppe zu laden.

Der Avatar „Teilnehmer suchen“ wird zusammen mit dem leeren Pool ausgeblendet, wenn kein verfügbarer Teilnehmer vorhanden ist.

Die Aktivitätsanzeige einer vorherigen Besprechung verwendet ein dickeres, längeres und helleres grünes Segment mit stärkerem Leuchten und einem schnelleren Umlauf um die Karte.

Das Loslassen des Zeigers an einer beliebigen Stelle beendet einen unvollständigen Teilnehmer-Ziehvorgang und schließt dessen Bühnen-Ablagezone.

Vorherige Besprechungen zeigt nur eine Karte pro kanonischem Teilnehmerkreis und bevorzugt den aktiven Raum, sodass die wiederholte Erweiterung derselben Gruppe keine doppelten Verlaufskarten anhäuft.

Der ursprüngliche Teilnehmerkreis wird getrennt von der aktuellen Mitgliedschaft gespeichert: Frühere Besprechungen stellt weiterhin diese stabile Gruppe dar, und ihr Start verwendet auch nach hinzugefügten oder entfernten Live-Teilnehmern dieselbe Besprechungs-ID und denselben verschlüsselten Chatverlauf.

Die Auswahl einer Besprechung unter „Frühere Besprechungen“ oder „Aktive Besprechungen“ markiert die zugehörige Karte in beiden Bereichen als ausgewählt.

Jeder berechtigte Besprechungsteilnehmer kann einen fehlenden zugehörigen Messages-Raum neu erstellen; die neue Raum-ID wird gespeichert, bevor das Laden des Chats fortgesetzt wird.

Einweg-Besprechungen mit nur einem Konto werden unter „Frühere Besprechungen“ nicht angezeigt; dort erscheinen ausschließlich dauerhafte Besprechungen mit einem ursprünglichen oder aktuellen Teilnehmerkreis aus mehreren Konten.

Die automatische Freigabeaufforderung gilt nur für eine neu erstellte leere Bühne; eine aus „Frühere Besprechungen“ oder „Aktive Besprechungen“ gefüllte Bühne gilt auch dann als belegt, wenn sie außer dem aktuellen Konto keinen Teilnehmer enthält.

Während einer verbundenen Konferenz ist „Frühere Besprechungen“ inaktiv und ausgegraut, verwendet einen Verbotscursor und lädt keine Profilvorschauen, während die Animation aktiver Karten weiterläuft.

„Frühere Besprechungen“ verwendet dieselbe durch Deckkraft blockierte Darstellung wie „Aktive Besprechungen“, ohne Graustufenfilter; eine transparente Interaktionssperre trägt den Verbotscursor, sodass er über die gesamte Kartenfläche sichtbar bleibt.

- Während einer aktiven, nicht verwerfbaren Besprechung kann ein weiterer verfügbarer Benutzer in das Besprechungsfenster gezogen und dauerhaft zum Teilnehmerkreis hinzugefügt werden.

Cognis richtet dessen Zugriff auf den verschlüsselten Messages-Chat über die Capability `social:messages:membership` mit kanonischen Konto-IDs für Akteur und Benutzer ein, sendet eine Einladung und ermöglicht beim Beitritt den Abruf des Besprechungskennworts.

Bei jedem authentifizierten Beitritt wird die idempotente Mitgliedschaftsoperation vor dem Laden des Chats erneut ausgeführt, sodass Teilnehmer nach einem früheren Verlassen oder Archivieren dieses Meeting-Chats wieder Zugriff erhalten.

Teilnehmeraktualisierungen verdecken eine aktive Besprechung niemals mit der Lobby-Einblendung, und ein leerer Pool verfügbarer Teilnehmer wird ausdrücklich gekennzeichnet.

Beim Ziehen eines verfügbaren Benutzers während einer aktiven Besprechung erscheint ein lokalisierter Ablagebereich mit exakt den Abmessungen des eingebetteten Fensters.

Er liegt während des Ziehens über der Einbettung und kehrt nach dem Ablegen oder Ende des Ziehvorgangs darunter zurück.

Eine dauerhafte grüne Innenkontur und ein gestrichelter Zielbereich bleiben während des gesamten Teilnehmer-Ziehvorgangs sichtbar.

Ist nur ein Teilnehmer aktiv anwesend, wird eine neue Teilnehmereinladung sofort genehmigt, ohne die Zustimmung abwesender Teilnehmer anzufordern.

Erfolgreiche aktive Einladungen zeigen einen Toast, aktualisieren die Mitgliedschaft des vorhandenen verschlüsselten Chatraums über die Messages-API und zeichnen denselben Chat während der Zustandsabfrage neu und aktualisieren ein vorhandenes dauerhaftes Whiteboard über `whiteboard:membership` mit kanonischen Konto-IDs für Akteur und Benutzer.

Die Meeting-API schließt die Mitgliedschaftsaktualisierung des vorhandenen Raums ab, bevor sie die Teilnehmeränderung speichert, sodass Clients niemals die Raumkennung wechseln.

Meldet Jitsi, dass der lokale Teilnehmer entfernt wurde, werden authentifizierte Benutzer aus dem gespeicherten Teilnehmerkreis entfernt und stehen für eine neue Einladung bereit; bei entfernten Gästen wird der jeweils verwendete Share-Link widerrufen.

Die gesamte serverseitige Vereinheitlichung von Benutzernamen und Handles wird an die öffentliche Capability `social:profile:identity` delegiert, wobei die Capability explizit an jeden Normalisierungsaufruf übergeben wird; das Modul unterhält keine eigenen Normalisierungsregeln.

Die Chatraum-Bereinigung verwendet die öffentliche Capability `social:messages:deleteChatroom` mit `roomId` und kanonischer `actorAccountId`; Messages autorisiert den Raumersteller oder den einzigen verbleibenden Teilnehmer und entfernt abhängige Chatdatensätze transaktional.

Meldet ein referenziertes Whiteboard oder ein Chatraum beim Abbau eines Meetings einen standardmäßigen Nicht-gefunden-Status, -Code oder eine entsprechende Meldung, gilt die Ressource als bereits gelöscht; der Fallback wird mit strukturierten Ressourcenmetadaten protokolliert und die Bereinigung der übrigen Ressourcen sowie des Meeting-Datensatzes fortgesetzt.

Die aktuelle Messages-Integration stellt die Löschung als Flow-gestützte öffentliche Capability bereit; Jitsi deklariert `social:messages:deleteChatroom` als erforderlich und prüft bei der API-Registrierung, dass sie als aufrufbare Funktion aufgelöst wird, sodass Fehler früh statt erst bei der Bereinigung auftreten.

Wenn der Organisator eine aktive Besprechung erweitert, synchronisiert dessen Client zusätzlich den vollständigen Teilnehmerkreis über das Whiteboard-UI-Gateway.

Die Öffnungsanfrage eines Nicht-Organisators verwendet die Share-Genehmigung, sodass alle anderen aktiven Kontoteilnehmer die Konsensentscheidung erhalten, anstatt sich nur auf passive Statusabstimmungen zu verlassen.

Eine gesendete Whiteboard-Genehmigungsanfrage zeigt einen Informationstoast.

Verlässt ein Besprechungseigentümer die Besprechung vor den anderen Mitgliedern, wird seine Chatmitgliedschaft entfernt, während die Eigentumsmetadaten erhalten bleiben; dadurch löscht das letzte verbleibende Mitglied den Chat als autorisierter alleiniger Teilnehmer.

Beim Öffnen eines dauerhaften Besprechungs-Whiteboards wird dessen Mitgliedschaft mit den aufgeführten und den aktuell anwesenden Kontoteilnehmern synchronisiert, bevor die Zeichenfläche freigegeben wird.

Nach dem Senden einer Besprechungs- oder Privatnachricht ruft der ausgelagerte Interaktions-Binder den eingebundenen Rückruf zum Aktualisieren des Chats auf, sodass die neue Nachricht ohne Gültigkeitsbereichsfehler erscheint.

Renderdurchläufe des Page Composers binden nur Interaktionsereignisse und rufen die Chataktualisierung beim Einbinden der Route nicht auf; die Aktualisierung nach dem Senden verwendet einen garantierten Wrapper, der eine nicht verfügbare Chatoperation protokolliert, statt das SPA-Einbinden abzulehnen.

Die Bühnen- und Messages-Composer-Elemente behalten übereinstimmende Standardhöhen von fünf Zeilen und Mindestgrößen bei, belegen mit einer Aufteilung von acht zu vier die vollständige Composer-Zeile mit zwölf Spalten und verwenden eine neue Layout-Einstellung, damit das fehlerhafte gespeicherte Layout nicht wiederhergestellt wird.

Die Erkennung der Whiteboard-Steuerung verlangt nicht mehr, dass jeder Teilnehmer Methoden zur Canvas-Erstellung bereitstellt; sobald das Backend den Anbieter bestätigt, können zugeordnete Canvases für alle Besprechungsmitglieder einheitlich eingebunden werden.

Die Whiteboard-Einbindung wendet nach der Fähigkeitserkennung keine zweite Canvas-Factory-Sperre für angemeldete Benutzer mehr an, sodass die Verbindung eines Benutzers die Steuerung nicht für einen anderen Teilnehmer verschwinden lässt.

- Die Whiteboard-Aktion verwendet beim verfügbaren Öffnen die Bestätigungsdarstellung und wechselt zur Abbruchdarstellung, während sie „Whiteboard schließen“ anzeigt.

Sobald Jitsi einen lokalen oder entfernten Teilnehmer mit Bildschirmfreigabe meldet, wird das gemeinsame Whiteboard für alle geschlossen und bleibt deaktiviert, bis die Bildschirmfreigabe endet.

Wenn die Besprechung für ein Whiteboard in Bild-in-Bild wechselt, ziehen Besprechungseinblendungen einschließlich des Ablagebereichs für aktive Teilnehmer in diese schwebende Oberfläche um und kehren beim Schließen zu ihrer Bühne zurück.

Jeder Teilnehmer-Ziehvorgang bestätigt vor dem Anzeigen des Ziels erneut den aktuellen Einblendungs-Host; ein in den schwebenden Jitsi-Rahmen verschobenes Ziel verwendet absolute Innenabstände und bedeckt weiterhin das vollständige Bild-in-Bild-Fenster.

- Aktive und bevorstehende Besprechungen unter Administration → Meetings überwachen.
- Die Meetings-Route als Overlay-, Vollbild- oder Bild-in-Bild-Komponentenseite einbetten.

Die angegebene Mindestgröße für Bild-in-Bild beträgt 400 × 225 Pixel und ist damit 25 % größer als die kleinste von Jitsi Meet unterstützte mobile Fläche von 320 × 180 Pixeln. Während die Besprechung schwebt, erhöht der dritte aktive Teilnehmer beide Mindestmaße einmalig um 25 % auf 500 × 282 Pixel; weitere Teilnehmer vergrößern sie nicht weiter, und das Modul wendet diese einzelne Änderung über die Freigabefunktion des Host-Floating-Windows an.

## Technische Spezifikation

- API-Aufrufe erfordern ein gültiges Cognis-Zugriffstoken; Besprechungsdetails werden nur autorisierten Teilnehmern oder begrenzten Freigabegästen zurückgegeben.

Die Suche nach aktiven Besprechungen autorisiert die Teilnehmermitgliedschaft über die authentifizierte Kontoidentität, selbst wenn für das Konto derzeit kein Profil-Handle aufgelöst werden kann, sodass jede in Cognis aktive Besprechung mit diesem Teilnehmer sichtbar bleibt, während profilabhängige Besprechungsvorgänge nicht verfügbar bleiben.

Eingeschränkte Freigabeansichten lösen die Identität ausschließlich über das Share-Gastprofil auf und fragen niemals Konto-Profile oder die Teilnehmersuche ab.

Gastbeitritte behalten die Schlüsselbundauflösung für das Besprechungskennwort und den verschlüsselten Chat bei.

Ein Gast ohne vorhandene Whiteboard-Zuordnung wartet auf den synchronisierten Besprechungszustand, ohne wiederholt wirkungslose Arbeitsflächenvorbereitungen einzuplanen.

- Kennwörter werden pro Besprechungsdatensatz erzeugt.

Besprechungsnamen sind Vier-Wort-Passphrasen in Titelschreibweise, die über die Host-Capability `reuse:generatePassphrase` erzeugt werden.

Derselbe durch Bindestriche getrennte Name wird als Anzeigename und Jitsi-Raumkennung gespeichert, in die Besprechungs-URL aufgenommen und immer ausdrücklich an `JitsiMeetExternalAPI` übergeben; das Modul fordert Jitsi niemals auf, einen Raumnamen zu erzeugen oder zurückzumelden.

Die Schemainitialisierung erzeugt oder überschreibt einen vorhandenen Meeting-Namen, eine URL oder eine Raumkennung niemals neu.

Der Name wird außerdem an Besprechungslisten, Messages-Chats, Freigaben und Whiteboards weitergegeben.

Dauerhafte Besprechungen werden anhand ihres vollständigen normalisierten Teilnehmerkreises aufgelöst und verwenden dieselbe gespeicherte Besprechungs-ID, denselben Namen, dieselbe URL, denselben Raum-Slug, dasselbe Kennwort und denselben Messages-Raum über Prozessneustarts hinweg erneut, auch nach aktiven Mitgliedschaftsänderungen.

Teilnehmerlose Besprechungen sind verwerfbar, erhalten immer eine neue Identität und einen neuen Messages-Chat mit einem Mitglied und löschen beim Ende sowohl den Chat als auch den Besprechungsdatensatz dauerhaft.

Der authentifizierte Konfigurationsendpunkt `DELETE` bleibt auch bei deaktiviertem Modul verfügbar, damit Administratoren eine ungültige Jitsi-URL löschen können.

- Moduleigene Persistenz speichert Konfiguration, Teilnehmer, Anwesenheit, Lebenszykluszustand, Whiteboard-Zustand und Konsensstimmen. Die Schemainitialisierung bei Neuinstallationen wird pro Datenbank-Executor serialisiert, damit gleichzeitige Lebenszyklus- und Konfigurationsanfragen beim Erstellen von PostgreSQL-Tabellen nicht konkurrieren. Schemaerstellung und Zugangsdaten-Nachpflege liegen in einem fokussierten Store-Schema-Modul, während der Haupt-Store Besprechungs-, Zustands- und Anwesenheitsoperationen enthält.
- Die Sitzungswiederaufnahme trennt die vorherige aktive Besprechungssitzung des Benutzers.

### Integrationsvertrag

- `bootstrap.js` ist der einzige Plattform-Einstiegspunkt; ctx-Fähigkeiten und Flows sind die einzige komponentenübergreifende Integrationsoberfläche.
- Jede geroutete, freigegebene und eingebettete Meetings-Ansicht beansprucht `.jitsi-route-root` nur, solange ihr Lebenszyklus-Signal aktiv ist. Eine bereits abgebrochene Einbindung beansprucht das dauerhafte Cognis-App-Stammelement nicht; beim Abbruch einer aktiven Einbindung werden die Klasse sowie moduleigene Observer, Ereignisbehandlungen, Timer und eingebettete Meeting-Arbeiten entfernt.
- Die Meetings-SPA verwendet Cognis-Router und Page Composer. Eingebettete Aufrufer übergeben eine serialisierbare `meetingId` in `focusState`; eingebettete Mounts sind rahmenlos und duplizieren nicht die Host-Navigation.
- Browser-Werkzeuge und der vollständige Katalog gemeinsamer Stylesheets werden vor der Darstellung der Meetings-Oberfläche über die erforderliche Fähigkeit `ui:reuse` geladen. Besprechungsrahmen und Einblendungselemente werden aus dem Modul-DOM aufgelöst und niemals aus der Capability-Antwort des Whiteboard-Providers gelesen. Cognis Core liefert die Standarddarstellung der Steuerelemente; das Modul lädt keine Provider-eigenen Stylesheets und begrenzt jeden Modul-CSS-Selektor auf `.jitsi-route-root`. Nicht verwendete ältere Besprechungsstile werden nicht ausgeliefert.
- Nextcloud Whiteboard ist als weiche Modulabhängigkeit deklariert, damit Administratoren es bei der Installation auswählen können, ohne es vorauszusetzen.

Ein moduleigener Backend-Verfügbarkeitsendpunkt entscheidet einheitlich über die Sichtbarkeit für alle Konto-Clients; die Capability-Erkennung im Browser initialisiert nur ein bereits genehmigtes Steuerelement.

Die optionale Integration erscheint, wenn die grundlegende Canvas-Factory `whiteboard:uiGateway` sowie Komponentenfenster- und Floating-Window-Fähigkeiten verfügbar sind; die Meeting-API löst den tatsächlichen Eigentümer der zugeordneten Arbeitsfläche auf und ruft vor dem Speichern von Teilnehmeränderungen die eigentümerautorisierten Funktionen `add` und `remove` von `whiteboard:membership` mit kanonischen Konto-IDs auf; die Provider-Vertragsmethode `createCanvas` erstellt normale Arbeitsflächen mit den Kennungen der eingeladenen Teilnehmer, während nur teilnehmerlose Besprechungen `createDisposableCanvas` verwenden.

Meetings greift niemals von dauerhafter auf verwerfbare Erstellung zurück, löst den Provider zum Anfragezeitpunkt über die bereichsgebundene oder systemweite ctx-Capability-Oberfläche auf und prüft vor Annahme oder Delegierung einer Zuordnung deren Kennung, Besprechungstitel und bei neuen Zuordnungen den Ersteller, speichert den Zuordnungstyp, ersetzt unbekannte oder nicht passende ältere Zuordnungen und verwendet die geprüfte dauerhafte Arbeitsfläche nur, wenn ein Benutzer sie bewusst öffnet.

Gäste über Freigabelinks erhalten eine nicht interaktive Whiteboard-Orchestrierung ohne sichtbares Steuerelement oder Capability zur Arbeitsflächenerstellung, folgen dem synchronisierten Öffnungs- und Schließzustand des Organisators und verwenden nur die exakt vorhandene Besprechungszuordnung und stoßen weder die Arbeitsflächenerstellung noch das Ersetzen dieser Zuordnung an; ihre besprechungsgebundene Share-Identität autorisiert den synchronisierten Zustand und liefert eine stabile Identität für Anwesenheit und Konsensabstimmungen.

Das Modul erweitert den generischen Flow `resolve-share-delegated-access`, damit Share eine exakte, aktuell geöffnete Beziehung zwischen Besprechung und Board prüfen kann.

Jitsi deklariert delegierte Whiteboard-Lese- und Schreiboperationen sowie die erforderliche Quell-Capability `meeting:join`; Share validiert das ursprüngliche Gast-Token unabhängig.

- Der Organisator kann das Whiteboard sofort öffnen. Andere Teilnehmer benötigen eine strikte Mehrheit der aktuell anwesenden Nicht-Organisatoren. Der Öffnungszustand wird nur für die aktuelle Besprechungssitzung synchronisiert, sodass aktuelle Teilnehmer dieselbe Arbeitsfläche öffnen und die Besprechung in Bild-in-Bild verschieben. Das Beenden der Besprechung löscht diesen Zustand; eine dauerhafte Arbeitsflächenzuordnung wird nicht allein beim Start einer neuen Sitzung geöffnet.
- Bevor eine Whiteboard-Komponente geöffnet wird, fordert Meetings den Schlüsselbundzugriff auf der übergeordneten Seite an, damit eine Entsperrabfrage einen Popup-Host besitzt. Whiteboards werden anschließend über den Komponentenfenster-Broker als eingebettete Overlay-Komponenten mit dokumenteigenem Scrollen gestartet. Meetings verwendet die importierten Komponentenfenster- und Schaltflächenklassen, statt Darstellungsklassen hinzuzufügen oder die gemeinsame Seiten-Shell zu überschreiben.
- Das Whiteboard-Steuerelement ist eine Standard-`<button>`-Schaltfläche wie das benachbarte Teilen-Steuerelement.

Es verwendet standardmäßig die Core-Darstellung `btn-confirm` und im aktiven Zustand die importierten Zustände `active` und `btn-cancel`; außerdem ändert sich die Beschriftung in „Whiteboard schließen“.

Die Auswahl des aktiven Steuerelements schließt es für die Besprechung.

Provider-Capabilities werden vor der Whiteboard-Vorbereitung einmal über den Host geladen.

Vorübergehende Fehler beim Einbinden des Komponentenfensters werden mit begrenztem exponentiellem Backoff wiederholt, ohne die Komponentenseite erneut zu registrieren oder zu ersetzen.

Während eine Entsperrabfrage oder das Einbinden der Komponente aussteht, bleibt das Steuerelement mit der normalen Beschriftung „Whiteboard“ deaktiviert; erst nach erfolgreicher Einbindung des Komponentenfensters ändert es sich in „Whiteboard schließen“.

Durch einen geänderten Besprechungszustand oder eine Navigation abgebrochene veraltete Arbeit wird ohne Fehlermeldung verworfen.

Das synchronisierte automatische Öffnen wird bei aktueller Browser-Aktivierung ausgeführt; andernfalls setzen signalgebundene Eingabeereignisse es bei der nächsten Aktivierung fort, damit Schlüsselbundabfrage und Komponentenstart vom Browser autorisiert bleiben.

Ein fehlgeschlagener automatischer Versuch wird für dasselbe Board nicht wiederholt.

Jeder tatsächliche Fehler schreibt Phase, Besprechungs- und Board-Kennung, Fehlermeldung und vollständiges Error-Objekt sowohl in das Host-Protokoll als auch in die Browserkonsole; der lokalisierte Toast nennt die fehlgeschlagene Phase.

- Die Lobby-Darstellung einer aktiven Besprechung öffnet die Preflight-Einblendung nicht erneut, nachdem ein Besprechungseintrag ausgewählt wurde. Wenn der Besprechungsrahmen für Whiteboard-Bild-in-Bild den hosteigenen Zustand `floating-window` besitzt, werden Besprechungseinblendungen und die Einlade-Ablagezone für Teilnehmer aus dem aktiven DOM aufgelöst und diesem schwebenden Rahmen zugeordnet; nach dem Schließen von Bild-in-Bild kehren sie zur normalen Bühne zurück. Das Abbrechen durch Drag-Ende, Ablegen außerhalb des Ziels, Escape oder Verlust des Fensterfokus entfernt die Ablagezone immer.
- Beim Ziehen einer Einladung für aktive Teilnehmer werden die normale Struktur der Besprechungseinblendung und die grüne aktive Zielkontur wiederverwendet, statt ein separates Popup darzustellen.

Beim Start einer neuen Besprechung wird vor Preflight- oder Erstellungsarbeiten das Cognis-Core-Token `beginPageLoading()` aus der vom Modul bereitgestellten Page-Entry-Ressource `ui:reuse` bezogen und erst nach Abschluss des Jitsi-Beitrittsversuchs freigegeben.

Da das Starten einer Cognis-Komponentenseite eine aktuelle Browser-Benutzeraktivierung erfordert, verschieben synchronisierte Konto-Whiteboards die automatische Einbindung bis zur nächsten Browser-Aktivierung, statt Wiederholungen mit `whiteboard_component_window_unavailable` auszuschöpfen.

- Während die Jitsi-Bildschirmfreigabe den Whiteboard-Zugriff sperrt, zeigen das deaktivierte Whiteboard-Steuerelement und sein Slot einen lokalisierten Hover-Titel mit einer Erklärung der Sperre.

Ein synchronisiertes Konto-Whiteboard ohne aktuelle Browser-Aktivierung richtet signalgebundene Zeiger- und Tastaturereignisse ein und setzt die Einbindung bei der nächsten Benutzeraktivierung automatisch fort; das Schließen des Boards oder der Abbruch der Einbindung entfernt diese Ereignisse.

Das Hinzufügen eines Teilnehmers zu einer aktiven Besprechung erfordert die Share-Capability `share:requestApproval` und wird nur nach einer ausdrücklichen endgültigen Zustimmung fortgesetzt.

Ablehnungen und unvollständige Entscheidungen verhindern das Hinzufügen; Laufzeitfehler der Genehmigung verhindern das Hinzufügen und werden strukturiert protokolliert.

- Wird ein verfügbarer Benutzer in eine aktive Besprechung gezogen, wird er vorläufig aus der Verfügbarkeit entfernt und die serverseitige Share-Konsensabfrage sofort gestartet. Bei ausdrücklicher Ablehnung wird der Benutzer in den sortierten verfügbaren Pool zurückgelegt und dem Einladenden ein lokalisierter Ablehnungs-Toast angezeigt; andere Anfragefehler führen dieselbe Rücknahme mit dem allgemeinen Fehler-Toast aus. Solange der lokale Benutzer einer Besprechung beigetreten ist, wird das gesamte Raster „Aktive Besprechungen“ als deaktiviert markiert, jede Besprechungsschaltfläche deaktiviert und der Klick-Handler verweigert Besprechungswechsel bis zum Ende der aktuellen Besprechung.
- Whiteboard-Bild-in-Bild überlässt die Bewegung der hosteigenen Floating-Window-Werkzeugleiste von Cognis. Das Modul übergibt `.jitsi-stage-header` beim Aufruf von `ui:makeFloatingWindow` nicht mehr als zweiten Ziehbereich.
- Ereignisse zum Verlassen einer Konferenz werden zu einem einzigen Abbau zusammengeführt. Besprechungsfenster und Whiteboard schließen sofort, Zeitgeber und Raumidentität der Besprechungschat-Abfrage werden vor jeder Neudarstellung geleert, das normale Overlay wird wiederhergestellt, die Teilnehmerauswahl geleert und aktive Besprechungen sowie verfügbare Teilnehmer werden vollständig aktualisiert. Die Erweiterung des dauerhaften Whiteboard-Zugriffs bestätigt bei der ersten Synchronisierung die vollständige aktuelle Mitgliedschaft beim Anbieter und wiederholt die Erweiterung nach jeder Mitgliedschaftsänderung.
