# Teilnehmer zu aktiven Besprechungen einladen

**Feature-Zweig:** feature-update-participant-handling-during-meetings

## Aktive, nicht verwerfbare Besprechungen erweitern

Teilnehmer können nun in eine aktive Besprechung gezogen werden, die mit eingeladenen Personen begonnen hat. Die Besprechungsmitgliedschaft und der verschlüsselte Messages-Chat werden aktualisiert, der neue Teilnehmer erhält eine Einladung und kann beim Beitritt das Besprechungskennwort abrufen. Bereitgestellte Teilnehmer kehren nach Beginn der Besprechung nicht in die Liste der verfügbaren Personen zurück.

## Aktive Besprechungsoberflächen nutzbar halten

Teilnehmeraktualisierungen öffnen die Lobby-Einblendung nicht mehr über einer beigetretenen Besprechung, sodass Beitritte über Benachrichtigungen und die aktive Liste nutzbar bleiben. Die Spalte der verfügbaren Teilnehmer zeigt nun „Keine verfügbaren Teilnehmer.“ an, wenn sie leer ist.

## Aktiven Teilnehmer-Ablagebereich anzeigen

Beim Ziehen eines verfügbaren Teilnehmers wird nun vorübergehend ein lokalisierter Ablagebereich über einem geeigneten aktiven Besprechungsfenster angezeigt. Das Ablegen lädt den Teilnehmer ein; beim Ende des Ziehvorgangs wird die ungestörte Besprechungsansicht wiederhergestellt.

## Ablagebereich über der Jitsi-Einbettung anordnen

Ein gültiger Teilnehmer-Ziehvorgang aktiviert den Ablagebereich nun direkt über das Ziehereignis des Avatars. Der Ablagebereich entspricht exakt dem eingebetteten Jitsi-Fenster, liegt beim Ziehen über dem iframe und kehrt nach dem Ablegen oder Ende des Ziehvorgangs darunter zurück.

## Grüne Ziehhilfe dauerhaft anzeigen

Der aktive Teilnehmer-Zielbereich behält nun während des gesamten Ziehvorgangs dieselbe grüne Kontur, ergänzt eine grüne Innenkante und einen gestrichelten Zielbereich und entfernt die Hilfe erst beim Ende des Ziehvorgangs oder beim Ablegen des Teilnehmers.

## Zugriff entfernter Teilnehmer widerrufen

Der Meeting-Client erkennt nun lokale Jitsi-Entfernungsereignisse und -fehler. Entfernte Kontobenutzer werden aus dem gespeicherten Teilnehmerkreis gelöscht und erscheinen wieder als verfügbare Einzuladende; bei entfernten Gästen wird nur der für ihre Sitzung verwendete Share-Link widerrufen. Außerdem wird ihre Anwesenheit deaktiviert.

## Dauerhaftes Routen-Stammelement beim Unmount freigeben

Geroutete, freigegebene und eingebettete Meetings-Mounts beanspruchen kein bereits abgebrochenes Stammelement mehr und entfernen `.jitsi-route-root`, sobald ihr Lebenszyklus-Signal abbricht. Die asynchrone Initialisierung endet vor späteren Darstellungsarbeiten; die vorhandene Bereinigung entfernt weiterhin Observer, Handler, Timer, Chat-Arbeiten, Whiteboards und die Jitsi-Einbettung.

## Teilnehmerschlüssel-Kollisionen verhindern und reservierte Benutzer ausblenden

Änderungen der aktiven Mitgliedschaft verwenden nun einen besprechungsbezogenen Teilnehmerschlüssel. Dadurch entstehen keine PostgreSQL-Eindeutigkeitsfehler mehr, wenn die neue Teilnehmerliste einer anderen Besprechung entspricht. Die Teilnehmersuche blendet Benutzer aus, die in einer anderen Besprechung aktiv anwesend sind; die API für aktive Einladungen erzwingt dieselbe Verfügbarkeitsregel, ohne geplante Eingeladene auszublenden.

## Live-Teilnehmerintegrationen aktualisieren

Verfügbare Teilnehmer und aktive Besprechungen werden jetzt alle fünf Sekunden aktualisiert, Avatar-Anwesenheitsanbieter nach SPA-Navigation initialisiert, der Besprechungschat mit erweitertem Teilnehmerkreis und neuen Nachrichten neu geladen und erfolgreiche aktive Einladungen per Toast bestätigt. Vorhandene dauerhafte Whiteboards erhalten über eine optionale Anbieter-Capability erweiterten Teilnehmerzugriff. Der leere Teilnehmerhinweis entspricht dem Zustand für leere aktive Besprechungen, der Entfernungshinweis ist kürzer und die angegebene Mindestgröße für Bild-in-Bild beträgt 320 × 180 Pixel.

## Whiteboard-Aktionen unterscheiden

Die Whiteboard-Schaltfläche verwendet jetzt beim Öffnen die Bestätigungsdarstellung und wechselt zur Abbruchdarstellung, während sie „Whiteboard schließen“ anzeigt.

## Mindestgröße des Meeting-Bild-in-Bild skalieren

Die Mindestgröße des Meeting-Bild-in-Bild beträgt nun 400 × 225 Pixel und ist damit 25 % größer als zuvor. Der dritte aktive Teilnehmer erhöht beide Maße einmalig um 25 %, und Cognis wendet die begrenzte Mindestgröße sofort über seine Floating-Window-Aktualisierung an.

## Whiteboard-Erweiterungsvertrag prüfen

Meetings validiert nun den exakten Vertrag `whiteboard:uiGateway.expandCanvasAccess`, den Nextcloud Whiteboard PR 24 bereitstellt. Eine erfolgreiche Aktualisierung muss die angeforderte Arbeitsfläche identifizieren und jeden angeforderten Teilnehmer in der erweiterten Zugriffsliste zurückgeben, bevor Meetings die Synchronisierung als abgeschlossen speichert.

## Nicht autorisierte Whiteboard-Wiederholungen stoppen

Nur der Besprechungsorganisator ruft jetzt die eigentümerautorisierte Capability zur Arbeitsflächenerweiterung auf. Eingeladene Teilnehmer senden keine Erweiterungsanfrage, und eine fehlgeschlagene Eigentümeranfrage wird für genau diese Arbeitsfläche und Teilnehmermenge gespeichert, damit Abfragen und Einbettungs-Lebenszyklusaktualisierungen dieselbe verbotene Anfrage nicht wiederholt senden.

## Einblendungen im Bild-in-Bild halten und automatische Whiteboards wiederherstellen

Besprechungseinblendungen einschließlich der Aufforderung für alleinige Teilnehmer ziehen jetzt während des Whiteboard-Bild-in-Bild in den schwebenden Jitsi-Rahmen um und kehren beim Schließen zur Bühne zurück. Das automatische Öffnen des Whiteboards wiederholt vorübergehende Fehler beim dynamischen Modulimport nun über den vollständigen begrenzten Backoff, statt nach dem ersten Fehler abzubrechen.

## PiP-Wachstum bei drei Teilnehmern begrenzen

Das Meeting-Bild-in-Bild hat nun nur zwei Mindestgrößen: 400 × 225 Pixel für bis zu zwei aktive Teilnehmer und 500 × 282 Pixel für drei oder mehr. Größere Besprechungen erhöhen das Minimum nicht weiter und nehmen nicht mehr den verfügbaren Bildschirm ein.

## Parsing der Whiteboard-Steuerung wiederherstellen

DOM-Referenzen für Besprechungsrahmen und Einblendung bleiben jetzt lokal in der Meetings-Oberfläche, statt erneut aus der Whiteboard-Capability-Antwort deklariert zu werden. Der Browser kann die Steuerung wieder parsen und laden; eine direkte JavaScript-Syntaxprüfung schützt den Einstiegspunkt.

## Ablage für aktive Meetings im Bild-in-Bild halten

Der Start eines Teilnehmer-Ziehvorgangs bestätigt jetzt erneut das Einblendungs-Elternelement des aktuell aktiven Besprechungsfensters. Bei geöffnetem Whiteboard-Bild-in-Bild erscheint der grüne Teilnehmer-Ablagebereich über dem schwebenden Jitsi-Rahmen; andernfalls bleibt er über der normalen Besprechungsbühne.

## Jitsi-Bildschirmfreigabe priorisieren und Whiteboard-Sichtbarkeit vereinheitlichen

Jitsis Echtzeitereignis für lokale und entfernte Teilnehmer mit Bildschirmfreigabe schließt nun das synchronisierte Whiteboard für alle und verhindert das erneute Öffnen bis zum Ende der Freigabe, sodass der normale Bereich an die Konferenz zurückkehrt. Eine Backend-Capability-Prüfung entscheidet jetzt gemeinsam über die Whiteboard-Sichtbarkeit, damit jedes Konto während der Browser-Provider-Initialisierung dasselbe deaktivierte Steuerelement darstellt oder es bei nicht verfügbarem Provider ausblendet.

## Automatische Whiteboard-Fehlerschleifen stoppen und Diagnose offenlegen

Das automatische Öffnen für Konten wartet nun auf einen bereits entsperrten Schlüsselbund, statt eine vom Browser gesperrte Entsperrung ohne Benutzerinteraktion zu versuchen. Eine einmalige Warnung fordert bei erforderlicher Interaktion zur Auswahl von Whiteboard auf; eine fehlgeschlagene automatische Einbindung wird für dasselbe Board nicht wiederholt. Tatsächliche Fehler nennen nun die fehlgeschlagene Phase im Toast und schreiben strukturierte Kennungen, Fehlermeldung und vollständiges Error-Objekt sowohl ins Host-Protokoll als auch in die Browserkonsole.

## Einblendungen aktiver Besprechungen im aktiven Fenster halten

Beim Beitritt zu einer vorhandenen Besprechung stellt die Teilnehmerdarstellung die Lobby- oder Preflight-Einblendung nicht mehr wieder her. Die Platzierung erkennt nun das tatsächliche schwebende Elternelement des Besprechungsrahmens, statt sich nur auf einen lokalen Freigabe-Callback zu verlassen; beim Ziehen von Teilnehmern wird die verschobene Einblendung direkt verwendet, sodass die grüne Ablagezone dem Whiteboard-Bild-in-Bild folgt.

## PiP-Teilnehmer-Ablagezone binden und bereinigen

Das Teilnehmerziel erkennt nun die tatsächliche Cognis-Klasse `floating-window` und löst vor jedem Übergang die aktuelle Einblendung und den Jitsi-Rahmen aus dem aktiven DOM auf, sodass es an das PiP-Element statt an die Whiteboard-Bühne gebunden wird. Dokumentweite Bereinigung bei Drag-Ende und Ablegen sowie die Behandlung von Escape und Fensterfokusverlust entfernen das Ziel bei einem Abbruch.

## Besprechungsziel wiederverwenden, Core-Laden zeigen und Whiteboard-Aktivierung erklären

Beim Ziehen von Teilnehmern in eine aktive Besprechung werden nun die vorhandene Besprechungseinblendung und das grüne Zieldesign ohne das zusätzliche gestrichelte Popup wiederverwendet. Beim Start einer Besprechung bleibt das gemeinsame Seiten-Laderad von Cognis Core vom Klick auf „Besprechung starten“ bis zum abgeschlossenen Jitsi-Beitrittsversuch aktiv. Der gemeldete Whiteboard-Fehler wurde auf die Autorisierung beim Start einer Cognis-Komponentenseite zurückgeführt: Eine automatische Konto-Einbindung ohne aktuelle Browser-Aktivierung wird nun mit einer einmaligen Handlungsaufforderung verschoben, statt einen nicht autorisierten Start bis zur Meldung `whiteboard_component_window_unavailable` zu wiederholen.

## Bildschirmfreigabe-Sperren erklären, Whiteboards fortsetzen und aktive Einladungen genehmigen

Die deaktivierte Whiteboard-Aktion zeigt nun eine lokalisierte Hover-Erklärung, während die Bildschirmfreigabe die Besprechungsoberfläche belegt. Synchronisierte Konto-Boards, die auf die Cognis-Anforderung zur Benutzeraktivierung treffen, richten abbruchsichere Eingabeereignisse ein und werden bei der nächsten Aktivierung automatisch fortgesetzt, ohne einen Whiteboard-spezifischen Klick zu erfordern. Aktive Teilnehmereinladungen fordern vor der Änderung Konsens über die optionale Share-Genehmigungs-Capability an, lehnen ausdrückliche Ablehnungen ab und fahren bei nicht verfügbarer Genehmigungsinfrastruktur mit strukturierten Protokollen fort.

## Konsens beim Ablegen starten, Ablehnungen zurücknehmen und Besprechungswechsel sperren

Beim Ablegen aktiver Teilnehmer werden die Teilnehmerpools nun vorläufig aktualisiert und die genehmigungsgestützte API-Anfrage sofort ausgelöst. Eine abgelehnte Abstimmung stellt den vorgeschlagenen Teilnehmer in der verfügbaren Liste wieder her und zeigt dem Einladenden einen eigenen lokalisierten Ablehnungs-Toast. Das Raster „Aktive Besprechungen“ und seine Steuerelemente sind nun immer deaktiviert, solange der lokale Benutzer einer Besprechung beigetreten bleibt.

## Echten Share-Genehmigungsflow verwenden und doppelten PiP-Ziehbereich entfernen

Wenn die direkte Share-Genehmigungs-Capability fehlt, führen aktive Teilnehmereinladungen nun die vorhandene Share-Genehmigungsphase beim Erstellen aus, warten auf deren Entscheidung und widerrufen den temporären Token sofort, sodass aktuelle Installationen den Konsens nicht mehr überspringen. Whiteboard-Bild-in-Bild bindet den Besprechungsbühnenkopf nicht mehr zusätzlich zur Cognis-Floating-Window-Werkzeugleiste als Bewegungssteuerung.

## Endgültige Share-Genehmigung für Einladungen zu aktiven Besprechungen verlangen

Das Hinzufügen von Teilnehmern zu aktiven Besprechungen erfordert nun direkt die deklarierte Capability `share:requestApproval`. Nur eine ausdrückliche endgültige Zustimmung nimmt den Teilnehmer auf; abgelehnte, ausstehende oder ungültige Entscheidungen setzen ihn zurück in die Liste der verfügbaren Teilnehmer. Laufzeitfehler bleiben fehlertolerant und werden protokolliert, ohne veralteten Kompatibilitätsweg zum Erstellen und Widerrufen.

## Besprechungsabbau wiederherstellen und unnötige Whiteboard-Erweiterungen vermeiden

Das Verlassen oder Beenden einer Konferenz führt nun einen einzigen sofortigen Abbau aus, stellt das Besprechungs-Overlay wieder her, leert die Teilnehmerauswahl und wartet auf die Aktualisierung aktiver Besprechungen und verfügbarer Teilnehmer. Die Whiteboard-Zugriffssynchronisierung behandelt die anfängliche Mitgliedschaft als bereits berechtigt und ruft den Erweiterungsanbieter erst nach Teilnehmeränderungen auf, wodurch wiederholte nur für Eigentümer erlaubte Anfragen während des Pollings entfallen.

## Besprechungsstatus und Teilnehmersuche absichern

Die Teilnehmersuche prüft jetzt den Besprechungszugriff, bevor eine Besprechung von der Filterung aktiver Anwesenheit ausgenommen wird. Der Bildschirmfreigabestatus verwendet einen unabhängigen Meetings-Endpunkt und wird zwischen Besprechungsinstanzen zurückgesetzt, damit keine veraltete Sperre übernommen wird.

## Bildschirmfreigabe jedes Teilnehmers priorisieren

Jeder autorisierte Kontoteilnehmer oder Share-Gast kann das von Jitsi beobachtete Bildschirmfreigabeereignis melden. Damit schließt und sperrt die Bildschirmfreigabe jedes Teilnehmers das synchronisierte Whiteboard für die gesamte Besprechung, bis Jitsi das Ende der Freigabe meldet.

## Genehmigungsanfragen für aktive Teilnehmer erklären

Genehmigungen für Einladungen zu aktiven Besprechungen teilen Share jetzt mit, welcher Teilnehmer hinzugefügt wird, und benennen die Zielbesprechung. Genehmigende sehen dadurch die konkrete Aktion und das Ziel statt eines allgemeinen Freigabelinktexts.

## Whiteboard-Abbau vor der Anzeige von Ausgangshinweisen abschließen

Beim Verlassen oder Beenden einer Besprechung wird jetzt die Whiteboard-Arbeitsfläche geschlossen, ihr Bild-in-Bild-Fenster freigegeben und der Hinweis vor dem Schließen der Konferenz auf die Jitsi-Bühne zurückgesetzt. Hinweise zu geschlossenen oder verlassenen Besprechungen erscheinen dadurch auf der normalen Bühne.

## Bereitgestellte Einladungen während Aktualisierungen stabil halten

Teilnehmer, die vorläufig in eine aktive Besprechung verschoben wurden, bleiben jetzt auf der Bühne, während sich die Einladungsanfrage und regelmäßige Mitgliedschaftsaktualisierungen überschneiden. Die ausstehende Markierung wird entfernt, wenn der Server die Mitgliedschaft bestätigt oder die Einladung fehlschlägt. Dadurch wechseln Avatare nicht mehr zwischen Bühne und verfügbarer Liste.

## Ausstehende Einladungen nach SPA-Navigation initialisieren

Die Teilnehmersteuerung für Besprechungen initialisiert jetzt bei jeder Routeneinbindung ihre Menge ausstehender Einladungen. Die SPA-Navigation kann Besprechungen dadurch auch dann sicher einbinden, wenn der Host den Zustand einer früheren Modulinstanz beibehalten hat, ohne dass Teilnehmeraktualisierungen fehlschlagen.

## Hinweis zur geschlossenen Besprechung nach PiP-Abbau wiederherstellen

Beim Whiteboard-Abbau wird jetzt zuerst die Komponenten-Arbeitsfläche verworfen und danach der Besprechungshinweis auf die normale Jitsi-Bühne zurückgesetzt. Die Bereinigung der Komponentenseite kann den wiederhergestellten Hinweis nicht mehr entfernen. Wenn ein Moderator die Besprechung bei geöffnetem PiP beendet, erscheint daher der Hinweis zur geschlossenen Besprechung statt einer leeren Bühne.

## Ausgangshinweise auf der aktuellen Bühne wiederherstellen

Beim Verwerfen der Whiteboard-Komponente kann deren Bühnenrahmen ersetzt werden, wodurch zuvor erfasste DOM-Referenzen veralten. Die Ausgangsbereinigung ermittelt jetzt den aktuellen Besprechungsrahmen und Bühnenrahmen aus der eingebundenen Route, bevor der Hinweis wiederhergestellt wird. Dadurch bleibt der Hinweis zur geschlossenen Besprechung nach dem Beenden durch einen Moderator in der aktuellen Composer-Ansicht sichtbar.

## Bewährte PiP-Ausgangsreihenfolge wiederherstellen

Der Abbau beim Verlassen einer Besprechung verwendet wieder die zuvor funktionierende Reihenfolge: Der Hinweis kehrt auf die Bühne zurück, bevor das schwebende Jitsi-Fenster freigegeben wird. Die Whiteboard-Komponente wird währenddessen asynchron und mit strukturierter Fehlerprotokollierung verworfen. Das Schließen der Jitsi-Einbettung und die Anzeige der geschlossenen Besprechung warten nicht mehr auf den Komponentenseitenabbau, der das Bühnen-DOM übernehmen kann.

## Whiteboard-Komponente von der Besprechungsbühne isolieren

Die Whiteboard-Komponente wird jetzt in einen eigenen Host eingebunden, statt den Rahmen zu übernehmen, der auch Jitsi und den Besprechungshinweis enthält. Beim Verwerfen der Komponente kann die Oberfläche für geschlossene Besprechungen nicht mehr entfernt werden. Der PiP-Abbau blendet nur den Whiteboard-Host aus und verwirft ihn; Jitsi und sein Hinweis werden davon unabhängig wiederhergestellt.

## Besprechungshinweis im Bühnenlayout halten

Der Hinweis vor und nach der Besprechung ist jetzt ein vollflächiges Rasterelement statt eines absolut positionierten Kindelements, dessen übergeordnetes Element zusammenbrechen konnte, wenn Jitsi und Whiteboard ausgeblendet waren. Eine schützende Whiteboard-Hülle schafft eine zusätzliche Besitzgrenze um den Komponenten-Host und verhindert, dass die Komponentenbereinigung benachbarte Besprechungsoberflächen entfernt, selbst wenn die Hostplattform das übergeordnete Element eines Ziels bereinigt.

## Besprechungsbühne von Teilnehmeraktualisierungen ausschließen

Regelmäßige Aktualisierungen verfügbarer Teilnehmer ändern jetzt nur noch Teilnehmer- und aktive Besprechungsflächen. Sie rendern weder bereitgestellte Avatare neu noch ersetzen sie den Bühnenhinweis, sodass die Hinweise zur geschlossenen oder verlassenen Besprechung sichtbar bleiben. Nach dem Whiteboard-Abbau wird außerdem das beibehaltene Hinweiselement mit seinem letzten Darstellungszustand wiederhergestellt, falls die Hostbereinigung es gelöst hat.

## Hinweiswiederherstellung mit SPA-Modulcache kompatibel halten

Die Wiederherstellung des Hinweises nach dem Whiteboard verwendet jetzt direkt die vorhandene `updateOverlay`-Funktion, statt eine neue modulübergreifende Hilfsmethode hinzuzufügen. Gemischte Modulinstanzen während der SPA-Navigation können das Bereinigungsversprechen nicht mehr mit `restoreMeetingOverlay is not a function` ablehnen. Aktuelle Einbindungen wenden den beibehaltenen Hinweis zur geschlossenen oder verlassenen Besprechung weiterhin erneut an.

## Verhindere Reaktionen von Beenden-Overlays auf den nächsten Klick

Beim Beenden wird das aktive Meeting jetzt vor der Synchronisierung der Whiteboard-Steuerelemente gelöscht. Dadurch kann ein verzögerter automatischer Whiteboard-Öffner während des Beendens nicht erneut aktiviert werden und den nächsten Klick verwenden, um das Overlay „Meeting beendet“ oder „Meeting verlassen“ auszublenden.

## Stelle nach der Bereinigung die vollständige Meeting-Bühne wieder her

Die Overlay-Wiederherstellung behält jetzt den vollständigen Meeting-Frame-Wrapper und stellt ihn wieder her, wenn die Komponentenbereinigung ihn entfernt. Dadurch erscheint die Anzeige „Meeting beendet“ oder „Meeting verlassen“ zusammen mit der Bühne erneut, nachdem Teilnehmer- und aktive Meeting-Listen neu gezeichnet wurden.

## Halte Ressourcen aktiver Meetings synchron

Dauerhafte Whiteboards bestätigen jetzt bei der ersten Synchronisierung den Zugriff aller Teilnehmer, damit nach dem Meeting-Start eingeladene Personen die vorhandene Arbeitsfläche öffnen können. Messages-Aktualisierungen behalten den bestehenden Chatraum des Meetings bei, während seine Mitgliedschaft für hinzugefügte und entfernte Benutzer geändert wird; der Mini-Chat wird aus diesem Raum neu gezeichnet. Tests sichern außerdem, dass der erzeugte Meeting-Name und die URL bei Mitgliedschaftsänderungen am gespeicherten, nicht verwerfbaren Meeting erhalten bleiben.

## Stelle die Teilnehmer-Ablagezone über Bild-in-Bild wieder her

Die Ablagezone für aktive Teilnehmer wechselt jetzt von ihrer normalen Rasterposition auf der Bühne zur absoluten Innenpositionierung, wenn sie in den schwebenden Jitsi-Rahmen verschoben wird. Beim Ziehen eines verfügbaren Teilnehmers bedeckt das Einladungsziel wieder das vollständige Bild-in-Bild-Meetingfenster.

## Verhindere Fehler beim Hinzufügen von Teilnehmern während der Chat-Wiederverwendung

Die API zum Hinzufügen von Teilnehmern verwendet jetzt direkt den gespeicherten Messages-Raum des Meetings, statt von der Auflösung exakter Mitglieder diesen Raum zu erwarten und den dabei erstellten anderen Raum abzulehnen. Der Browser aktualisiert die Mitgliedschaft über den Messages-Client des Hosts, zeichnet den vorhandenen Mini-Chat neu und meldet einen lokalisierten Fehler mit strukturierten Diagnosedaten, wenn die Chat-Mitgliedschaft nicht geändert werden kann.

## Halte Meeting-Identität, Chat und Whiteboard-Mitgliedschaft konsistent

Das Meeting-Modul ruft die gezielte serverseitige Messages-Operation zum Hinzufügen oder Entfernen eines Mitglieds auf, bevor es die entsprechende Teilnehmeränderung speichert. Die gespeicherte Chatraumkennung ändert sich niemals, Clients zeichnen nur diesen Raum neu und die Whiteboard-Erweiterung erhält denselben gespeicherten Teilnehmerkreis. Die Schemainitialisierung erzeugt gespeicherte Meeting-Namen, Raumkennungen oder URLs nicht mehr neu und beseitigt damit die Identitätsabweichung zwischen Jitsi-, Messages- und Whiteboard-Ressourcen.

## Verwende gezielte Messages-Mitgliederoperationen

Änderungen an Meeting-Teilnehmern verwenden jetzt die einfache Capability `social:messages:addRoomMember` oder `social:messages:removeRoomMember` für den gespeicherten Meeting-Raum. Die Raumerstellung bleibt eine separate einmalige Operation, das Meeting verwaltet weiterhin die Raumzuordnung und es ist keine zusammengefasste Synchronisierungs-Capability erforderlich.

## Kanonische Messages-Mitgliedschafts-Capability verwenden

Einladungen zu aktiven Meetings und das Entfernen von Teilnehmern verwenden nun die einheitliche Capability `social:messages:membership` mit kanonischen Konto-IDs für Akteur und Benutzer und entsprechen damit dem aktuellen Integrationsvertrag von Cognis Messages.

## Chat-Zugriff beim erneuten Beitritt wiederherstellen

Bei jedem authentifizierten Meeting-Beitritt wird nun vor dem Laden des Chats die idempotente Messages-Mitgliedschaftsoperation erneut ausgeführt. Teilnehmer, die den Meeting-Chat zuvor verlassen oder archiviert haben, können ihn daher nach dem erneuten Beitritt zum Meeting wieder sehen.

## Kanonische Whiteboard-Mitgliedschaftsoperationen verwenden

Beim Hinzufügen und Entfernen aktiver Teilnehmer werden dauerhafte Arbeitsflächen nun vor dem Speichern des Meeting-Teilnehmerkreises über `whiteboard:membership` mit kanonischen Konto-IDs für Organisator und Teilnehmer aktualisiert. Die frühere browserseitige zusammengefasste Zugriffserweiterung wird nicht mehr verwendet.

## Einladungen bei einem einzelnen Teilnehmer automatisch genehmigen

Wenn höchstens ein Teilnehmer aktiv anwesend ist, wird das Hinzufügen eines weiteren Teilnehmers nun sofort genehmigt, statt auf die Zustimmung bereits abwesender Personen zu warten. Bei Meetings mit mehreren aktiven Teilnehmern wird weiterhin die Share-Genehmigungsentscheidung verwendet.

## Benachrichtigungsbeitritte und Sperre aktiver Meetings stabilisieren

Verarbeitete Meeting-Parameter aus Benachrichtigungen werden nun vor dem Beitritt aus der URL entfernt, und der Bereich aktiver Meetings wird bereits bei Auswahl eines Meetings gesperrt, auch bei Einstiegen über Benachrichtigungen. Benachrichtigungen über beendete Meetings enthalten keine Aktions-URL und keinen Meeting-Link in der E-Mail mehr.

## Handle-Normalisierung an die Profilidentität delegieren

Die gesamte serverseitige Vereinheitlichung von Handles verwendet nun die öffentliche Capability `social:profile:identity`. Meeting-Speicher, Zugriffsprüfungen, Teilnehmersuche, Share-Orchestrierung, Whiteboard-Routen und Lebenszyklusoperationen unterhalten oder importieren keine moduleigenen Normalisierungsregeln mehr.

## Abgleich verzeichnisgestützter Teilnehmer beibehalten

Die kanonische Normalisierung der Profilidentität wird auch beim Vergleich verzeichnisgestützter Teilnehmerkennungen angewendet. Dadurch bleibt der Meeting-Zugriff nach einer Änderung des Profil-Handles erhalten, ohne moduleigene Normalisierung erneut einzuführen.

## Aktive Besprechungen ohne Profilkonflikte abfragen

Die passive Suche nach aktiven Besprechungen gibt nun eine erfolgreiche leere Liste zurück, wenn für das authentifizierte Konto noch kein verwendbares Profil-Handle aufgelöst werden kann. Der Auflösungsfehler wird strukturiert protokolliert, während profilabhängige Besprechungsvorgänge weiterhin ein Profil erfordern; dadurch erzeugt die regelmäßige Aktualisierung keine wiederholten 409-Konflikte mehr.

## Aktive Teilnehmerbesprechungen zuverlässig erkennen

Wenn die aktuelle Profilauflösung kein Handle liefert, führt die Suche nach aktiven Besprechungen die Autorisierung nun mit der authentifizierten Kontoidentität fort. Dadurch bleiben alle von Cognis als aktiv erkannten Besprechungen sichtbar, in denen das Konto über einen gespeicherten Teilnehmer gehört, einschließlich Besprechungen mit einem früheren Profil-Handle.

## Profilidentität korrekt an aktive Abfragen übergeben

Die Suche nach aktiven Besprechungen übergibt die Capability `social:profile:identity` nun explizit an die kanonische Handle-Auflösung. Dadurch werden normale Konten wie `admin`, `firehawk` und `test` wieder ohne wiederholte Normalisierungsfehler erkannt.

## Einladungen mit dem tatsächlichen Whiteboard-Eigentümer abschließen

Nach einer erfolgreichen Zustimmung liest die Teilnehmereinladung den tatsächlichen Eigentümer der zugeordneten dauerhaften Arbeitsfläche, löst dessen kanonische Konto-ID auf und verwendet sie für `whiteboard:membership`. So kann auch eine Arbeitsfläche, die von einem anderen berechtigten Teilnehmer geöffnet wurde, aktualisiert werden, ohne die Einladung mit 503 abzubrechen.

## Chat-Abfrage nach dem Entfernen beenden

Wird der lokale Benutzer entfernt oder die Besprechung anderweitig abgebaut, stoppt Meetings nun zuerst den Chat-Abfragezeitgeber und leert die aktive sowie die zuletzt verwendete Raumkennung und den zwischengespeicherten Raumschlüssel. Die anschließende Neudarstellung kann den entfernten Besprechungsraum dadurch nicht erneut aktivieren oder weitere nicht autorisierte Nachrichtenanfragen senden.

## Dauerhafte Besprechungsidentitäten wiederverwenden

Beim Erstellen einer Besprechung sucht Meetings nun zusätzlich anhand des vollständigen normalisierten Teilnehmerkreises in den gespeicherten Teilnehmerzeilen. Dadurch wird eine dauerhafte Besprechung nach einem Serverneustart und nach aktiven Mitgliedschaftsänderungen mit derselben ID, demselben Namen, derselben URL und demselben Messages-Raum wiederverwendet. Teilnehmerlose Besprechungen überspringen die Wiederverwendung, erhalten jedes Mal eine neue Identität und speichern ihren Chat auf dem neuen Datensatz; beim Ende wird der Chat weiterhin vor dem Besprechungsdatensatz dauerhaft gelöscht.

## Teilnehmersuche und anfängliche Besprechungseinblendung korrigieren

„Teilnehmer suchen“ übergibt nun den von Cognis Core angebotenen Ergebnisfilter `user`, sodass nur Benutzerergebnisse erscheinen. Fokuswechsel ohne laufenden Ziehvorgang verändern die Besprechungseinblendung nicht mehr. Die aktiven Besprechungen wurden aus dem Teilnehmerbereich in eine angepasste Karte der anfänglichen Einblendung direkt über „Besprechung starten“ verschoben und werden ausgeblendet, sobald eine Besprechung ausgewählt oder beigetreten wurde. Während einer aktiven Besprechung hinzugefügte Teilnehmer bleiben weiterhin im dauerhaften Teilnehmerdatensatz und bestimmen die wiederverwendete Besprechungsidentität.

## Dauerhafte Besprechungen im Teilnehmerbereich anzeigen

Der Teilnehmerbereich verwendet nun links etwa 30 Prozent für die vertikal scrollbare Auswahl bekannter Benutzer und rechts etwa 70 Prozent für eine horizontal scrollbare Galerie dauerhafter Besprechungen, an denen das aktuelle Konto teilnimmt. Jede kurze Karte zeigt den stabilen Besprechungsnamen oben zentriert und verteilt bis zu zehn Standard-Profilbilder mit leichter Überlappung. Von Cognis als aktiv erkannte Besprechungen erhalten ein umlaufendes app-grünes Kantenlicht; teilnehmerlose verwerfbare Besprechungen erscheinen nicht in der Galerie.

## Commits

- [736ed26](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/736ed2651843b76e095f075a58b0ee7823128942)
- [b95fb10](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b95fb1027087f679a699ea807295f7b1286bb8b0)
- [0523439](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/05234396cd0e1bfc99075aecd9575291df1fab54)
- [ff60844](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/ff6084469d7c8c18c631d6c59bac0b65fdf04b44)
- [0afee2e](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/0afee2e9720010b6a2b5c8de256310dd77efd947)
- [3aa0da6](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3aa0da6b54b2bf66dd36e760630cf7c50d7a55b3)
- [a854724](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a8547244e698f6e3ef1c4b93d31531891a8edae2)
- [12de19a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/12de19a4fcf312a67e238efd23c0beb0ffe03d2e)
- [a47b5b4](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a47b5b48340e023192dc88a1cbbc6f2c4ecb4587)
- [790401f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/790401f6d0c6714179d977e0d9384c59bc91f30c)
- [28774f3](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/28774f3df4a49adabc7e5470442e4cc087555e87)
- [4c26402](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/4c26402d1005c86a6f28eecc78883e447bb97c11)
- [206b29f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/206b29f70af70eab3d63d8dae871f182dc97f40a)
- [5f7683b](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/5f7683b1c03719763333174cd6802bf4d33d37e9)
- [33eddd2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/33eddd2c63b80998f6d8e9ee44b6152c0080628f)
- [1386015](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1386015409eeb5bd252208dcdff27b809e4db00e)
- [eb8aef2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/eb8aef223aa633bcd302ee27dd934a63e92bcf78)
- [2d07b3b](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2d07b3b6d0bd57563c83706f37c5dffcbf01f59f)
- [b88f6db](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b88f6db738e3bfad4ea1fd84ffecd2afe8bcb91f)
- [6a1e873](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/6a1e873ff9454735dcbbcc0ed3290d7a446ac8b6)
- [cef74a0](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/cef74a09b02dfc3f50523dcadaf497488f9822ef)
- [812a79e](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/812a79eb9960118a6addc5d17147e565db413639)
- [402045d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/402045d752ae3dcfd03497565a0c6bf70328ab66)
- [3b50f6d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3b50f6d1707d136ad222a615771e7a43d0289481)
- [cc022ac](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/cc022ace92fafd44941961ea8282b3f051c94f5e)
- [e65d307](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e65d3078012ebca12c5a0c5cda15235a8c216c96)
- [2a9cc59](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2a9cc59e8ad051da54ca7919de34fde15256fde9)
- [2d72282](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2d722820c4bd77d0c7ef6dd8991ec63c8ed11b52)
- [f6d7cdb](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f6d7cdb9645e336a672b7749a7aab616b74b32d9)
- [b064315](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b0643159333c67f4117d5afc6fdbdcad9ba1b1ec)
- [c373996](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/c37399694fa2c71da5ddda3f26133eebf5e985f2)
- [b8d6adb](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b8d6adbd9c3aec0cf7e34e60233f804445f0baa5)
- [3c87494](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3c87494d228a96afa177602e3a3c7ae8e40d5c01)
- [8019153](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/8019153c46dd027cc05b849a272327e3114a1c63)
- [d105cf3](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d105cf394e47fefc26c894d8ba0278e97b7f09b2)
- [0e5340a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/0e5340abd33d63446a5d6bf557748040c1e49fc7)
- [8c26ddf](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/8c26ddf4ca40c8964c36e15ad43ef055a31c627b)
- [d18e4d2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d18e4d21b84c5f88898873bd83d74f3a74840e10)
- [6eb02e6](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/6eb02e68d05d3bb907945a891232023f45908e89)
- [8454f05](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/8454f05f4aab00b90e83f46c039a1a31a0b2ff72)
- [a243551](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a24355173a41a0c442dc624f54b7e22fd88b1313)
- [4514fab](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/4514fab46af476bda59562f58440bb0f19003ccf)
- [b778ee7](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b778ee7b3dd80dd15582ac7e982a1b435869236a)
- [3b6bda6](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3b6bda658696fdf143e042b6b14d8ff96d36b0dd)
- [e0e916f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e0e916f59892bc0c812451a359ca2b36e6864cff)
- [93727a1](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/93727a180bc1bdede576460b6d3bdf54dcae3604)
- [f7d14b3](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f7d14b3ccaef984bf26b51d4e82a96fe80d3077b)
- [d6f689a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d6f689a8d46f17897c4d1abf65f93673e99b4b30)

- [8665186](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/86651863fcf6af7736904af8c01f7cc89d5a45de)

- [59c24f4](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/59c24f423c6f965dc02c97444c955c334cf4c7c5)
- [5675466](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/56754666a4937045764a6ab61dff35010e5c64f1)
- [3d93676](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3d93676af78496cbcd33ad943e7a62ca11553745)
- [a3e1cf2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a3e1cf2ccc718579c47d66551fe480a1727981b2)
- [483e085](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/483e0858f5afc6861ee502a816a770fa7f393290)
- [6c42f79](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/6c42f79e0872703d785ac3b8e1143cd0fd68d077)
- [05be888](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/05be8883b9154da291ebf195c09d5048067ac026)
- [5288d1d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/5288d1d9cb3343ca92529ef66f35e55d6fb77c22)
- [d6fa13f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d6fa13fe33cc5e764127f0d83721ac0a549568cb)
- [ab6210b](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/ab6210b46afc7d0abb5c7063419744075e21c460)
- [e555c2b](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e555c2bc1f4c262bde5c29e988cd0aea91937ffa)
- [03f9098](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/03f909850369d744334ef22885a246acc75709a5)
- [d41ae6e](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d41ae6e3d090201a450f9622efc615adb5c0d56f)
- [c2f39a9](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/c2f39a9b76a7ae0075d6523f5e6b5cc65cdbd516)
