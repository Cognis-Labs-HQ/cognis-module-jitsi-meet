# Jitsi-Meet-Modul

Jitsi Meet bietet Cognis-Meetingräume mit Teilnehmerauswahl, Messages-Chat, Sitzungsübernahme, eingeschränkten Freigaben und einem optionalen synchronisierten Whiteboard. Externe Dienste werden über ctx aufgelöst; API, Browserressourcen und Speicherung gehören dem Modul.

## Anwendungsbeispiele

- Unter Administration → Module eine HTTP(S)-Jitsi-Instanz konfigurieren, den Aktivierungstest ausführen und Jitsi Meet aktivieren. Administration → Meetings zeigt aktive und bevorstehende Meetings.
- Meetings öffnen, Teilnehmer auswählen und einen Raum starten oder betreten. Profilabhängige Operationen benötigen einen sichtbaren Profilnamen. Bestehende aktive Mitgliedschaft bleibt über die authentifizierte Kontoidentität auffindbar, wenn der Profilname nicht verfügbar ist.
- Einen verfügbaren Teilnehmer in ein laufendes Meeting ziehen, um Share-Zustimmung anzufordern. Eine Ablehnung stellt den Teilnehmer in der verfügbaren Liste wieder her und zeigt einen Toast.
- Whiteboard öffnet die Meeting-Canvas; Whiteboard schließen schließt sie. Bildschirmfreigabe deaktiviert den Schalter mit erklärendem Tooltip. Link-Gäste folgen dem Zustand des Organisators ohne sichtbaren Schalter.

Browser-Aufrufer beziehen die VoIP-Integration über den vom Host initialisierten Kontext:

```js
const startCall = uiCtx.capabilities.get("voip:startCall");
const action = await startCall({
    source: "messages",
    room: { id: roomId, kind: "group" },
    users: members,
    supportedActions: ["component"],
});
```

Die zurückgegebene Aktion beschreibt eine Meetings-Komponente, die der Aufrufer über den Component-Page-Vertrag des Hosts startet.

## Technische Spezifikation

### Integration und Aktions-Flows

`bootstrap.js` registriert moduleigene Routen, UI-Beiträge, die öffentliche Capability `jitsi-meet:getMeetingChat`, den Browser-Provider `voip:startCall` sowie Hooks auf bestehende Meeting-, Freigabe- und Deprovisionierungs-Flows des Hosts. Das Modul ist nicht privilegiert und deklariert benötigte Komponenten-UUIDs und Capabilities im Manifest. Optionale Whiteboard-Dienste werden dynamisch ermittelt und verhindern keine Aktivierung.

Asynchrone Speicheroperationen des aktivierten Moduls führen moduleigene `jitsi-meet:*`-Flows mit `initialize-store` und `execute-action` aus. Autorisierung und Validierung bleiben an der API-Grenze; Owner-Handler führen die Operation aus, interne Speicheraufrufe erhalten ihre Transaktionsgrenzen. Fehlende Ausführungsergebnisse sind Fehler. Tests prüfen den vollständigen asynchronen Aktionskatalog, die tatsächliche Ausführung der Owner-Stufen und die Fehlerweitergabe mit Fakes der öffentlichen Verträge.

Der eingeschränkte Einstieg `api/disabled.js` registriert Konfiguration und Aktivierungstest ohne Feature-Routen oder UI. Cognis registriert keine Flows deaktivierter Module; diese Lifecycle-Konfiguration verwendet deshalb denselben injizierten Store direkt. Die Deinstallation entfernt Konfiguration und optional gespeicherte Moduldaten. Cognis entfernt seine lebenszyklusgebundenen Routen-, Capability-, Flow- und Hook-Registrierungen bei der Deaktivierung.

### Konfiguration und API-Zugriff

Alle Endpunkte verwenden `/api/v1/modules/jitsi-meet`. Konfiguration per `GET` benötigt einen Benutzer; `PUT`, `DELETE` und `/admin/enable-test` benötigen einen Administrator und bleiben im deaktivierten Zustand verfügbar. Die Konfiguration validiert eine HTTP(S)-Instanz-URL. Der Aktivierungstest setzt eine konfigurierte, erreichbare Instanz voraus. Der konfigurierte Ursprung wird der CSP-Origin-Capability des Hosts übergeben. Der Wechsel einer bestehenden Instanz löscht moduleigene Meetingdaten in einer Datenbanktransaktion.

Meeting-Erstellung, Beitritt, Präsenz, Zustand, Passwortanforderungen, Sitzungsübernahme, Teilnehmeränderungen, Chat-Zusammenfassungen, persistente Austritte und Whiteboard-Änderungen benötigen authentifizierten Zugriff und Meeting-Autorisierung. Administrative Listen benötigen Administratorrechte. Profilidentitäten sowie Messages-, Share-, Benachrichtigungs- und Kalenderdaten verwenden Host-Capabilities. Share-Gäste benötigen die konkrete Ressource-Capability der Operation; eine Ablehnung wird niemals ohne diese Capability erneut geprüft. Benutzerfreigaben und Blockierungen werden über Host-Zugriffsverträge geprüft. Gast-Mounts rufen keine Konto-Profile oder Teilnehmersuche ab.

### Meeting-Identität und Speicherung

Meeting-IDs und Passwörter verwenden kryptografischen Zufall. Namen sind vom Host erzeugte, vierteilige Passphrasen mit großgeschriebenen Wortanfängen, die als Raum-Slug, URL und expliziter Jitsi-Raumname wiederverwendet werden. Die Initialisierung erzeugt bestehende Identitäten niemals neu. Persistente Meetings werden anhand der vollständigen normalisierten ursprünglichen Teilnehmermenge gefunden und behalten Raum und Passwort über Mitgliedschaftsänderungen und Neustarts hinweg. Zugangsdaten und Zustand verwenden moduleigene Speicherung mit injiziertem Datenbank-Executor und bereichsgebundener Verschlüsselung.

Gespeicherte Meetings besitzen eine eindeutige Messages-`chat_room_id`. Weitere gespeicherte Meetings fordern `reuseExisting: false` an; Wiederöffnen behält den vorhandenen Raum. Beitritte und Austritte ändern Mitgliedschaft statt Raumidentität. `jitsi_chat_calls` reserviert getrennt einen temporären Anruf pro Konversation. Raumzuordnung und Reservierung sind transaktional; Konflikte hinterlassen keine verwaisten Meetingzeilen. Serialisierte Schemainitialisierung verhindert konkurrierende Konfigurations- und Lebenszyklusänderungen.

Präsenz läuft nach ausgebliebenen Heartbeats ab. Ein Beitritt deaktiviert andere Meeting-Sitzungen desselben Kontos; beendete Meetings ignorieren verbleibende Präsenz. Teilnehmerfreie Meetings sind temporär und löschen bei ihrem Ende den eigenen Chat und Meetingdatensatz; aus Messages gestartete Anrufe behalten ihre ursprüngliche Konversation. Ein austretender Link-Gast bleibt auf dem Overlay für verlassene Meetings. Das Ende eines temporären Meetings entfernt auch seine Freigaben.

### Optionaler Whiteboard-Vertrag

Nextcloud Whiteboard ist eine weiche Abhängigkeit. Die Browsererkennung löst `whiteboard:uiGateway` nach Initialisierung des Host-UI-Kontexts sowie die Floating-Window-Capability auf. Die Canvas-Fabrik bestimmt die Verfügbarkeit des Schalters; fehlende Fabriken führen zu keinem Schalter. Die Aktivierung prüft vor der Erstellung den serverseitigen Verfügbarkeitsendpunkt. Die Serverprüfung benötigt die veröffentlichten Verträge `whiteboard:fetchBoardData`, `whiteboard:membership` und `whiteboard:deleteCanvas`. Verfügbarkeitsdiagnosen enthalten Provider-Version, Integrität und Vertrauensinformationen.

Jitsi verwendet die öffentlichen Gateway-Methoden `requestCanvasPage({signal})` und `openCanvas({whiteboardId, elementId, signal})`. Der Whiteboard-Provider besitzt Routen-IDs, Canvas-Layout, Transport und Sitzungssemantik. Jitsi übergibt nur die exakte Board-ID und sein eigenes Mount-Ziel und gibt das Fenster beim Abbau frei. Mitgliedschaftsänderungen verwenden den serverseitigen öffentlichen Mitgliedschaftsvertrag. Jitsi begrenzt seinen eingebetteten Komponentenhost auf den Besprechungsbereich und streckt die eingebundene Wurzel in eine eindeutig bemessene Rasterzeile. Dadurch bleiben gekapselte Anbieterflächen sichtbar, ohne dass ihre intrinsische Größe das Besprechungsfenster vergrößert.

Ein aktivierter Whiteboard-Provider mit unvollständigem öffentlichen UI-Vertrag lässt einen deaktivierten Schalter mit erklärendem Tooltip stehen und protokolliert fehlende Capability-Methoden. Ein fehlgeschlagener Provider-Ladevorgang wird ebenfalls erklärt. Fehlt der optionale Provider, entfällt der Schalter. Die Avatar-Verfügbarkeit ist unabhängig von der Whiteboard-Bereitschaft; ein Profilverfügbarkeits-404 deaktiviert sie nicht.

Dauerhafte Meetings verwenden `createCanvas`; nur ausdrücklich als kurzlebig markierte Meetings verwenden `createDisposableCanvas`. Teilnehmerzahlen und geänderte Einladungslisten ändern die Persistenz nicht. Gespeicherte passende Canvas-Zuordnungen werden beim erneuten Öffnen verwendet. Zuordnungen müssen zur exakten Board-ID, zum Meeting-Titel und zum erwarteten Erstellerkonto passen. Mitgliedschaftsänderungen ermitteln den tatsächlichen Board-Besitzer und kanonische Teilnehmerkonten. Link-Gäste verwenden nur eine verifizierte bestehende Zuordnung und erstellen oder ersetzen sie niemals. Share delegiert Zugriff nur, solange die exakte Meeting-Board-Beziehung geöffnet ist.

Der Organisator öffnet sofort; andere Teilnehmer benötigen über Share-Zustimmung eine strikte Mehrheit der anwesenden Nicht-Organisatoren. Bildschirmfreigabe verhindert das Öffnen. Der Offen-Zustand gehört zur aktuellen Meeting-Sitzung; eine gespeicherte Zuordnung öffnet eine neue Sitzung nicht von selbst. Die Keyring-Autorisierung in der übergeordneten Seite erfolgt vor dem eingebetteten Fenster. Automatisches Öffnen wartet auf Browseraktivierung; ein fehlgeschlagener automatischer Versuch wird für dieses Board nicht wiederholt. Wartezeiten sind begrenzt und abbrechbar. Ein Abbruch entfernt Timer und Listener und verhindert einen weiteren Fensterstart.

Gleichzeitige Canvas-Vorbereitung teilt ihre ausstehende Fabrikoperation. Fehlgeschlagene Synchronisierung kann die noch unbestätigte Canvas über erneute Mounts wiederverwenden; eine andere Providerinstanz erhält einen isolierten Cache. Nach Navigation oder Meeting-Wechsel eintreffende Ergebnisse verändern den aktuellen Trigger nicht.

Der Beitritt zu einem aktiven Meeting stellt die Mitgliedschaft des autorisierten Kontos im geöffneten persistenten Whiteboard vor Rückgabe der Beitrittsdaten wieder her, unabhängig von der Chat-Auswahl. Automatisches Öffnen führt `jitsi-meet:followWhiteboard` aus, um die exakte offene Zuordnung zu prüfen, vom Besitzer autorisierte Mitgliedschaft zu gewähren und die Zuordnung vor dem Mount erneut zu bestätigen. Das Folgen startet keine erneute Abstimmung und ändert keinen Offen-Zustand; ein geschlossenes oder ersetztes Board bricht den Vorgang ohne Fehlermeldung ab. Link-Gäste behalten delegierten Zugriff, und geschlossene Zuordnungen machen den optionalen Provider nicht zur Beitrittsvoraussetzung.

Die Meeting-Auswahl bleibt beim Laden, während der Keyring-Auflösung, bei ausstehender Authentifizierung oder Sitzungsübernahme und während einer eingebetteten Konferenz gesperrt. Beitrittsanfragen teilen ihre ausstehende Operation; Abbruch und veraltete Antworten ersetzen das aktuelle Ziel nicht. Die aktive Suche enthält autorisierte eingeladene Meetings mit aktueller Präsenz auch bei ausstehender Authentifizierung. Beim Neustart eines persistenten Meetings wird seine gespeicherte Canvas über den öffentlichen, vom Besitzer autorisierten Mitgliedschaftsvertrag wiederhergestellt. Eine nicht verfügbare oder gelöschte optionale Canvas wird protokolliert und verhindert den Meeting-Beitritt nicht.

### UI-Mounts und Konferenzsitzungen

Meetings verwendet den Cognis Page Composer, SPA-Router, den vom Host initialisierten UI-Kontext und `ui:reuse`. Modul-CSS richtet sich auf Jitsi-eigene Flächen und Bedienelemente und überschreibt keine Composer-Darstellung. Eingebettete Mounts akzeptieren `meetingId` in `focusState` und verzichten auf doppelte Navigation. Jeder aktive Mount beansprucht `.jitsi-route-root`; ein Abbruch entfernt diesen Anspruch sowie moduleigene Observer, Timer, Handler und Konferenzarbeit. Polling prüft Mount-Lebensdauer, Anfragefolge und Meeting-Identität vor der Ergebnisübernahme, auch bei beendeten und übernommenen Sitzungen. Leere erfolgreiche Antworten beenden die Ladeanzeige; unveränderte Antworten erhalten das Teilnehmer-DOM.

Whiteboards werden über den Komponentenbroker des Hosts eingebunden. PiP verwendet die Floating-Window-Werkzeugleiste und die oberste Browserebene, behält aber die ursprüngliche DOM-Abstammung, das Theme und die Typografie. Overlays, Statussteuerung, Vorabprüfung und Einladung-Dropzones folgen dem aktiven Frame und kehren beim Freigeben zurück. Der Allein-Hinweis in voller Größe behält Überschrift, deaktivierten Startknopf und Vorabprüfungsstatus neben Verlassen/Bleiben. Nur PiP blendet diese zusätzlichen Elemente aus, damit die Mindestgröße ausreicht; im Hauptfenster erscheinen sie wieder. Die Mindestgröße beträgt 400 × 225 und steigt beim dritten aktiven Teilnehmer einmal auf 500 × 282. Abgebrochenes Ziehen, Escape und Fokusverlust entfernen das Einladungsziel. Beigetretene Nutzer können nicht zu einer anderen aktiven Besprechung wechseln. Gleichzeitige Austrittsereignisse teilen einen Abbau, der Frames schließt, Chat-Polling beendet und Verfügbarkeit aktualisiert.

Vor dem Einbetten entfernt das Modul nur Jitsis zwischengespeicherte Authentifizierungssitzungs-ID und erhält sonstige Präferenzen. Verweigerter oder fehlerhafter Browserspeicher wird protokolliert und verhindert den Beitritt nicht. Nach einem Neuverbinden durch DOM-Verschiebung darf ein zuvor erfolgreicher Beitritt das aufgelöste Passwort erneut senden. Wiederholte Ablehnung vor einem erfolgreichen Beitritt fordert weiter einen aktualisierten Keyring-Wert an. Der Meeting-Start hält das Page-Loading-Token des Hosts durch Vorprüfung und Beitrittsversuch.

### Bereinigung und Release-Prüfung

Hat das gelöschte Konto eine weiterhin nutzbare Besprechung organisiert, geht deren Eigentümerschaft an den ersten verbleibenden Teilnehmer in normalisierter Handle-Reihenfolge über, auch wenn der Organisator die Teilnehmerlisten bereits verlassen hatte. Andere Organisatoren und Chatraum-Identitäten bleiben unverändert.

Letzter persistenter Austritt und Kontodeprovisionierung verwenden gemeinsame, vom Besitzer autorisierte externe Ressourcenbereinigung. Fehlende Ressourcen werden protokolliert und blockieren die Bereinigung nicht; andere Fehler werden vor Entfernen des Meetingdatensatzes weitergegeben. Die Kontolöschung aktualisiert ursprüngliche und aktive Teilnehmerlisten, erhält nutzbare Räume und löscht unbrauchbare Meetings. Ein gemeinsamer Katalog löscht abhängige Tabellen vor dem Meeting und umfasst Präsenz, Zustand, Teilnehmer und Anrufreservierungen.

Das Modul synchronisiert Manifest-, Paket- und Lockfile-Versionen und prüft SHA-256-Hashes des Paketinhalts. Tests verwenden lokale Fakes öffentlicher Verträge und erzwingen Komponentenisolierung, Namespace-Zuständigkeit, Dateigröße, Dokumentationsstruktur und Sprachparität. Release Notes verwenden pro PR einen Changelog-Satz auf Deutsch, Englisch, Indonesisch und Japanisch.

Anbieterversionen in Verfügbarkeitsantworten sind Diagnosen: `testedProvider` nennt den getesteten Stand, `provider.version` den durch Host-Assurance ermittelten installierten Stand. Die öffentliche Fähigkeit entscheidet über Verfügbarkeit, nicht eine versteckte Mindestversionsprüfung. Andere Integrationen können denselben neutralen Vertrag ohne Nextcloud implementieren.

### Modulstruktur und Lebenszyklus

API-Registrierung liegt in `api/index.js`, Domänenhandler in `api/routes/<domain>/index.js`, CSS in `ui/styles/` und Markup in `ui/templates/`. Die vorlagenbasierte AGENTS.md verwenden und lokale Skripte mit `npm --prefix <checkout> test` starten; installierte Operationen nutzen `cognisctl modules:jitsi-meet:ping`. Browseranbieter exportieren `mountProvider(scopedUiCtx)` und verwenden begrenzte Flows, Fähigkeiten und Listener. Navigation wird über `ui:navbarLinks` beigetragen. Health-Beiträge und Keyring-Eigentümer liefern Bereinigung für `ctx.registerDisposer`. Keyring-Reset löscht nur Passwortzustellbelege für erneute Zustellung und behält Meetings, Mitgliedschaft und Canvases.

Der Browsertest nutzt ein installiertes Chromium über CDP ohne Playwright: `CHROMIUM_EXECUTABLE_PATH=/path/to/chromium npm --prefix <checkout> run test:browser`. Hashes mit `npm run manifest:hashes` erneuern und mit `npm run check:manifest` prüfen. Release-Metadaten liegen in `docs/changelog/` und sind nicht Teil der Paket-Hashes.

Das Marketplace-Banner kombiniert Cognis mit der Anbieteridentität in einem mittigen, gegen Beschneiden geschützten Layout; das vorhandene Anbieter-Icon bleibt erhalten.

## Meeting-Verwaltung und Wiederherstellung

Administration → Meetings bietet die Filter Aktiv, Alle Meetings und Probleme. Die ausschließlich für Administratoren verfügbare Liste liest bestehende Datensätze ohne Schema-Initialisierung und markiert doppelte Teilnehmergruppen und URLs sowie gemeinsam referenzierte Chaträume und Zeichenflächen. Passwörter werden nicht ausgegeben. Beenden setzt die Cognis-Präsenz zurück und schließt das Meeting für verbundene Cognis-Clients; unabhängig verbundene Jitsi-Konferenzen werden nicht administriert. Aktive Meetings müssen vor dem Löschen beendet werden. Löschen entfernt Meeting-Datensätze und Freigaben sowie Chaträume oder Zeichenflächen, wenn kein anderes Meeting darauf verweist. Bei Bereinigungsfehlern bleibt der Datensatz für einen erneuten Versuch erhalten; bereits fehlende Ressourcen verhindern die Bereinigung nicht. Das Löschen doppelter Referenzen leert zwischengespeicherte Eindeutigkeitsfehler, damit die normale Schema-Initialisierung erneut erfolgen kann. Andere Routen erzwingen weiterhin das reguläre Schema. Bei fehlgeschlagener Meeting-Abfrage wird die automatische Aktualisierung mit einer Fehlermeldung angehalten.

## Exklusive Quellzuordnung für Integrationen

Meeting-Chats deklarieren `source: {sourceType: "meeting", sourceId: meeting.id}` über die Messages-Auflösung. Zeichenflächen werden mit derselben Identität über `whiteboard:sourceBinding` zugeordnet. Die Anbieter weisen konkurrierende Zuordnungen zurück; Jitsi ändert keine fremden Zuordnungsspalten. Administratives Löschen gibt nur die Zuordnung des gelöschten Meetings frei, wenn eine historische Referenz bestehen bleibt. Die Bereinigung von Messages-Anrufen gibt die Zuordnung frei und erhält das ursprüngliche Gespräch. Scheitert die Chat-Zuordnung eines neuen Anrufs, wird dessen Meeting-Datensatz zurückgesetzt. Messages-Quellzuordnung ist erforderlich; Whiteboard bleibt optional und benötigt seinen Zuordnungsvertrag.

Konfiguration und Aktivierung initialisieren ausschließlich die Konfigurationstabelle. Fehler der Meeting-Integrität verhindern daher nicht die Aktivierung und den Zugriff auf die administrative Wiederherstellung. Die Verwaltung initialisiert nur die zur Prüfung benötigte Hilfstabelle für Teilnehmerhistorie und erhält die Meeting-Constraints.

## Übersichtliche Meeting-Verwaltung

Die Meeting-Listen teilen sich ein Panel mit Abstand zwischen den Bereichen für aktive und bevorstehende Meetings. Namen, IDs und aufklappbare Chat- und Zeichenflächen-Verknüpfungen bleiben zusammen; kompakte Problem-Pills schaffen Platz für Teilnehmer, Aktivität und Aktionen. Filter verwenden neutrale Host-Steuerelemente ohne Positionsänderung beim Überfahren. Bevorstehende Meetings sind inaktiv, nicht beendet und haben einen gültigen zukünftigen Termin. Vergangene, fehlende und ungültige Termine bleiben unter Alle Meetings zugänglich.

## Stabile Canvas-Kennungen für Meetings

Jitsi übergibt die Meeting-UUID als `resourceId` und `meeting` als `resourceType`; der Anzeigename dient nur als Titel. Erneutes Öffnen fordert dieselbe allgemeine Anbieter-Verknüpfung an, auch nach einer Namensänderung. Whiteboard verwaltet Persistenz, Zugriff und gleichzeitige Auflösung ohne Kenntnis der Jitsi-Interna.

## Allein-im-Meeting-Hinweis nach bestätigtem Beitritt

Der Hinweis folgt einer bestätigten lokalen Jitsi-Konferenz und der aktuellen Anwesenheit statt der Zahl der Einladungen oder Mitgliedschaften. Die bestehende Wartezeit nach Beitritt oder Anmeldung sowie das Ausblenden durch Bleiben gelten weiter. Der Hinweis kehrt zurück, wenn eine weitere Person beitritt und später geht. Während einer ausstehenden Anmeldung erscheint er nicht. Nach bestätigtem Jitsi-Beitritt kann ein veralteter Anmeldestatus den aktuellen Hinweis nicht ersetzen. Darstellung und Position im Hauptfenster und PiP bleiben unverändert.

## Eine Meeting-Identität pro Teilnehmergruppe

Die Erstellung verwendet ein Datenbank-Meeting mit derselben normalisierten aktuellen oder ursprünglichen Teilnehmergruppe unabhängig vom Kontext erneut. Es gibt keine forceNew-Option. Ein stabiler Teilnehmerschlüssel und atomisches Einfügen mit Konfliktbehandlung sorgen dafür, dass gleichzeitige Anfragen dieselbe ID erhalten. Mitgliedschaftsänderungen erhalten den Erstellungsschlüssel; Suche und Erkennung haben keine feste Datensatzgrenze mehr. Bei historischen Treffern wird das einzige aktive Meeting bevorzugt; mehrere aktive Treffer benötigen Administrator-Reparatur. Wiederverwendung stellt angeforderte Mitgliedschaften wieder her und ersetzt keine vorhandene Chat-Zuordnung. Während der Anmeldung bleiben Anwesenheit und Abfragen für dasselbe Meeting aktiv; nach Abschluss wird dieselbe ID betreten. Bestätigter Jitsi-Beitritt startet fortlaufende Anwesenheit auch bei veraltetem Anmeldestatus. Die Meeting-Liste bleibt während Beitritt und Konferenz gesperrt, mit Nicht-erlaubt-Cursor und inaktiven Karten.

## Wiederherstellung gelöschter Meeting- und Canvas-Verknüpfungen

Explizites Öffnen aktualisiert die allgemeine Anbieter-Verknüpfung statt einer vorbereiteten Canvas-ID zu vertrauen. Fehlende Zeichenflächen werden über den Anbieter neu erstellt und dem Meeting zugeordnet. Eine bereits genehmigte offene Zeichenfläche darf ohne erneute Abstimmung ersetzt werden, wenn der Anbieter das Fehlen der vorherigen Fläche und den exakten Ressourcentyp sowie die Kennung des Ersatzes bestätigt. Das explizite Starten eines gelöschten Meetings verwendet geladene Teilnehmerdaten und die normale kanonische Erstellung, erhält den Kurzlebigkeitsmodus und betritt die zurückgegebene Ersatz-ID. Unbekannte Verweise, Gäste sowie Berechtigungs- und Dienstfehler dienen nicht zur Ableitung neuer Ressourcen. Gelöschte Inhalte werden nicht wiederhergestellt; begrenzte Versuche erzeugen ein neues Element mit Erfolgsmeldung.

Direkt geladene Meetings-Seiten brechen ihren Mount ab, wenn der Host einen Routenwechsel ausführt oder das Dokument verlassen wird. Die Meeting-Abfrage gehört zu diesem Mount, endet beim Abbruch und kann danach nicht neu starten. Verspätete Antworten und abgebrochene Anfragen dürfen weder die Zielseite verändern noch dort Meeting-Fehler anzeigen. Ein abgebrochener Navigationsversuch lässt die aktuelle Seite aktiv.

Verweise verwenden den aufklappbaren Abschnittskomponisten des Hosts wie Components. Geöffnete Verweise bleiben bei Aktualisierungen von Meetings und bevorstehenden Meetings erhalten; die Steuerelemente sind per Tastatur bedienbar. Die Filter heißen Aktive Meetings, Alle Meetings und Problematische Meetings und haben jeweils eine eigene Leermeldung.

Quellzuordnungen von Zeichenflächen erfolgen erst nach Zustimmung innerhalb der serialisierten Zustandsänderung. Fehler beim Teilnehmerabgleich oder Speichern geben neue Zuordnungen frei und erhalten bestehende Verknüpfungen. Allgemeine Meeting-Erstellung erzeugt keine kurzlebigen Anrufe; deren Wiederherstellung nutzt die VoIP-Route des vorhandenen Gesprächs. Überholte Abfragen bevorstehender Meetings werden verworfen. Direkte Seiten verwenden das Lebenszyklussignal des Hosts statt unabhängiger Controller.

## Verbindungsverlust bei der Raumsuche behandeln

Die Raumsuche stoppt nach einem Netzwerkfehler ihre Abfragen und fängt abgelehnte Timer-Anfragen ab. Offline- und abgebrochene Anfragen öffnen keine Fehlermeldungen zur Suche und löschen die letzten Raumlisten nicht. Das Modul nutzt die optionale Offline-Status-Fähigkeit des Hosts; die Bereinigung bleibt an das Seitensignal gebunden. Die Präsenz- und Statusabfragen laufender Meetings folgen demselben Lebenszyklus und stoppen gemeinsam nach einer fehlgeschlagenen Hintergrundanfrage.
