Ausgabe 1.5.258 — Direkt geladene Meetings-Seiten brechen ihren Mount ab, wenn der Host einen Routenwechsel ausführt oder das Dokument verlassen wird. Die Meeting-Abfrage gehört zu diesem Mount, endet beim Abbruch und kann danach nicht neu starten. Verspätete Antworten und abgebrochene Anfragen dürfen weder die Zielseite verändern noch dort Meeting-Fehler anzeigen. Ein abgebrochener Navigationsversuch lässt die aktuelle Seite aktiv.

# Jitsi Meet an Cognis-Verträge anpassen

**Feature-Branch:** feature-align-module-with-structural-changes

## Zustimmung, Ressourcenbesitz und Abfragen

Ausgabe 1.5.260 — Quellzuordnungen von Zeichenflächen erfolgen erst nach Zustimmung innerhalb der serialisierten Zustandsänderung. Fehler beim Teilnehmerabgleich oder Speichern geben neue Zuordnungen frei und erhalten bestehende Verknüpfungen. Allgemeine Meeting-Erstellung erzeugt keine kurzlebigen Anrufe; deren Wiederherstellung nutzt die VoIP-Route des vorhandenen Gesprächs. Überholte Abfragen bevorstehender Meetings werden verworfen. Direkte Seiten verwenden das Lebenszyklussignal des Hosts statt unabhängiger Controller.

## Verwaltungsfilter und Verweise

Ausgabe 1.5.259 — Verweise verwenden den aufklappbaren Abschnittskomponisten des Hosts wie Components. Geöffnete Verweise bleiben bei Aktualisierungen von Meetings und bevorstehenden Meetings erhalten; die Steuerelemente sind per Tastatur bedienbar. Die Filter heißen Aktive Meetings, Alle Meetings und Problematische Meetings und haben jeweils eine eigene Leermeldung.

## Scoped ctx und ausgeführte Aktions-Flows verwenden

Bootstrap bezieht externe Dienste ausschließlich über den lebenszyklusgebundenen ctx und registriert moduleigene Routen, Provider, Capabilities und Hooks. Speicheroperationen des aktivierten Moduls führen benannte `jitsi-meet:*`-Flows mit den Stufen `initialize-store` und `execute-action` aus; interne Operationen behalten ihre Transaktion. Die Autorisierung erfolgt vor Routenaktionen. Unvollständige Runner scheitern, statt Arbeit still zu überspringen. Die deaktivierte Konfiguration verwendet den eingeschränkten Lifecycle-Einstieg, da Cognis bei deaktivierten Modulen keine Flows registriert.

## Meeting- und Konversationsidentitäten stabil halten

Gespeicherte Meetings behalten eigene Chaträume, abgesichert durch aktuelle Schema-Constraints und anbietereigene Quellzuordnungen. Reservierungen für temporäre Anrufe verhindern konkurrierende Anrufe.

## Den optionalen Whiteboard-Provider respektieren

Die optionale Browser-Canvas-Fabrik wird nach der Host-Initialisierung ermittelt; serverseitig werden die vom Provider deklarierten Whiteboard-Capabilities dynamisch aufgelöst. Die Aktivierung prüft die Verfügbarkeit vor der Canvas-Erstellung. Gäste folgen einer bestehenden Zuordnung und erstellen keine Canvas. Gleichzeitige Vorbereitung teilt einen ausstehenden Fabrikaufruf, Wiederholungen verwenden noch nicht bestätigte Ergebnisse erneut, ein Providerwechsel isoliert den Cache und abgebrochene Fenster-Wiederholungen stoppen vor einem weiteren Start. Mitgliedschafts- und Zuordnungsprüfungen verwenden kanonische Kontoidentitäten.

## Bereinigung wiederverwenden und veraltete UI-Arbeit verwerfen

Die Kontolöschung aktualisiert gespeicherte Teilnehmerlisten oder bereinigt externe Ressourcen, bevor unbrauchbare Meetings gelöscht werden. Der letzte Austritt und die Kontobereinigung verwenden dieselbe vom Besitzer autorisierte Ressourcenlöschung. Ein gemeinsamer Katalog umfasst bei der Meeting-Löschung auch Anrufreservierungen. Gemeinsame abbrechbare Wartezeiten entfernen Listener sowohl bei Abschluss als auch bei Abbruch. Polling prüft Mount-Lebensdauer, Anfragefolge und Meeting-Identität vor der Ergebnisübernahme, auch bei beendeten oder übernommenen Sitzungen.

## Host-Darstellung und Konferenzsitzungen erhalten

Meetings verwendet den Page Composer, Router, Profilvorschauen, Bedienelemente, Overlays und Floating Windows des Hosts. Regeln für den ausgeblendeten Zustand gelten nur für Jitsi-eigene Bedienelemente und Flächen. Leere Meeting-Antworten schließen den anfänglichen Ladezustand ab. Das Whiteboard-Mounting behält die Keyring-Autorisierung und synchronisierte Bildschirmefreigabe-Sperren bei. Die Bereinigung der Jitsi-Authentifizierungssitzung erhält andere Browserpräferenzen und ermöglicht Beitritte auch bei verweigertem Speicherzugriff.

## Einen synchronisierten Release-Vertrag veröffentlichen

Modul 1.5.250 synchronisiert Paketversionen und SHA-256-Inventar. Die Standarddokumentation beschreibt das aktuelle Verhalten auf Deutsch, Englisch, Indonesisch und Japanisch. Dieser PR verwendet einen Changelog-Satz mit zusammengeführten Implementierungslinks. Verhaltenstests prüfen ausgeführte Aktions-Flows, verweigerte Berechtigungen, abgebrochene Wiederholungen, gleichzeitige Canvas-Vorbereitung und veraltete Antworten zusätzlich zu strukturellen Isolationstests.

## Whiteboard-Zugriff vor automatischem Öffnen wiederherstellen

Der Beitritt zu einem aktiven Meeting stellt die Mitgliedschaft des autorisierten Kontos im geöffneten persistenten Whiteboard vor Rückgabe der Beitrittsdaten wieder her, unabhängig von der Chat-Auswahl. Automatisches Öffnen führt `jitsi-meet:follow-whiteboard` aus, um die exakte offene Zuordnung zu prüfen, vom Besitzer autorisierte Mitgliedschaft zu gewähren und die Zuordnung vor dem Mount erneut zu bestätigen. Das Folgen startet keine erneute Abstimmung und ändert keinen Offen-Zustand; ein geschlossenes oder ersetztes Board bricht den Vorgang ohne Fehlermeldung ab. Link-Gäste behalten delegierten Zugriff, und geschlossene Zuordnungen machen den optionalen Provider nicht zur Beitrittsvoraussetzung.

## Öffentlicher Darstellungsvertrag

Jitsi verwendet die öffentlichen Gateway-Methoden `requestCanvasPage({signal})` und `openCanvas({whiteboardId, elementId, signal})`. Der Whiteboard-Provider besitzt Routen-IDs, Canvas-Layout, Transport und Sitzungssemantik. Jitsi übergibt nur die exakte Board-ID und sein eigenes Mount-Ziel und gibt das Fenster beim Abbau frei. Die Darstellung benötigt Whiteboard ab 2.3.147. Mitgliedschaftsänderungen verwenden den serverseitigen öffentlichen Mitgliedschaftsvertrag.

## Nicht verfügbare Whiteboard-Schalter erklären

Ein aktivierter Whiteboard-Provider mit unvollständigem öffentlichen UI-Vertrag lässt einen deaktivierten Schalter mit erklärendem Tooltip stehen und protokolliert fehlende Capability-Methoden. Ein fehlgeschlagener Provider-Ladevorgang wird ebenfalls erklärt. Fehlt der optionale Provider, entfällt der Schalter. Die Avatar-Verfügbarkeit ist unabhängig von der Whiteboard-Bereitschaft; ein Profilverfügbarkeits-404 deaktiviert sie nicht.

## Meeting-Übergänge schützen und persistente Canvas wiederherstellen

Die Meeting-Auswahl bleibt beim Laden, während der Keyring-Auflösung, bei ausstehender Authentifizierung oder Sitzungsübernahme und während einer eingebetteten Konferenz gesperrt. Beitrittsanfragen teilen ihre ausstehende Operation; Abbruch und veraltete Antworten ersetzen das aktuelle Ziel nicht. Die aktive Suche enthält autorisierte eingeladene Meetings mit aktueller Präsenz auch bei ausstehender Authentifizierung. Beim Neustart eines persistenten Meetings wird seine gespeicherte Canvas über den öffentlichen, vom Besitzer autorisierten Mitgliedschaftsvertrag wiederhergestellt. Eine nicht verfügbare oder gelöschte optionale Canvas wird protokolliert und verhindert den Meeting-Beitritt nicht.

## Komponentenbereich der Besprechung begrenzen

Jitsi begrenzt seinen eingebetteten Komponentenhost auf den Besprechungsbereich und streckt die eingebundene Wurzel in eine eindeutig bemessene Rasterzeile. Dadurch bleiben gekapselte Anbieterflächen sichtbar, ohne dass ihre intrinsische Größe das Besprechungsfenster vergrößert. Ein Chromium-Regressionstest prüft Öffnen und Größenänderungen mit dem tatsächlichen Besprechungs-Markup im Standardmodus. Die Integration bleibt unabhängig von Whiteboard-internen Darstellungsdetails.

## Aktive Besprechungs-Overlays im PiP behalten

Statusänderungen finden das Overlay im aktiven Fenster, statt es aus dem Portal zurück auf die Hauptseite zu ziehen. Schaltflächen, Meldungen und Vorabprüfungen werden dort aktualisiert und gebunden; schwebende Frames bleiben beim Composer-Aktualisieren gültige laufende Einbettungen. Der PiP-Frame behält den Modul-Stilbereich und das Overlay bedeckt ihn durch absolute Positionierung. Beim Schließen werden ursprünglicher Stilbereich und Platzierung wiederhergestellt. Verhaltenstests prüfen Statusänderungen außerhalb der Seitenwurzel; Chromium prüft die Overlay-Abmessungen.

## Ursprüngliche Overlay-Darstellung wiederherstellen

PiP nutzt die vorhandenen Floating-Window-Optionen: Die Besprechung bleibt in ihrer ursprünglichen DOM-Abstammung und erscheint in der obersten Browserebene. Theme und Typografie werden ohne neuen Route-Stilbereich vererbt; das native Popover übernimmt die Vordergrundfarbe des Frames. Der Allein-Hinweis zeigt seine Meldung sowie Verlassen/Bleiben, ohne Anfangstitel, Teilnehmerauswahl, Startknopf oder Vorabprüfungsstatus. Browsertests vergleichen Normal- und PiP-Darstellung, prüfen fehlendes vertikales Scrollen bei der bestehenden Mindestgröße und die Rückkehr zu den Anfangssteuerelementen. Der ursprüngliche Floating-Window-Handle behält seine Mindestgrößenaktualisierung.

## Allein-Hinweis in voller Größe beibehalten

Die ursprüngliche Überschrift, der deaktivierte Startknopf und die Vorabprüfungsanzeige werden im Allein-Hinweis des Hauptfensters wiederhergestellt. Die kompakte Darstellung gilt nur für PiP, damit bei der Mindestgröße kein vertikales Scrollen entsteht. Browsertests prüfen die Steuerelemente vor dem Schweben und ihre Wiederherstellung beim Freigeben.

## Eindeutige Meeting-Konversationen

Eindeutige Chatraum-IDs wiederherstellen. Getrennte Räume für gespeicherte Meetings anfordern und vorhandene Räume nach Teilnehmeränderungen über ihre ID auflösen; gelöschte Räume werden über Messages ersetzt. Transaktionale Anrufreservierungen und Rücknahme bei Konflikten bleiben erhalten.

## Vorlagenstruktur und Bereinigung

Routenhandler in Domänenverzeichnisse, Styles und Markup in eigene UI-Verzeichnisse sowie Release-Notizen nach docs/changelog verschieben. Vorlagenregeln und Aktionsflows in Camel Case übernehmen. Browseranbieter, Health und Keyring bereinigen; Keyring-Reset löscht Zustellbelege und behält Meetings und Canvases.

## Entwicklerverträge und Befehle

Aktuelle öffentliche Schnittstellen in vier Sprachen dokumentieren. Checkout-lokale npm-Skripte von Betriebsbefehlen mit modules-Präfix unterscheiden. Die irreführende Mindestversionsangabe durch getestete Release-Diagnosen ersetzen; Verfügbarkeit bleibt fähigkeitsbasiert. Chromium/CDP ohne Playwright verwenden.

## Gültige Eigentümer und optionale Darstellung erhalten

Die veraltete Anforderung zum direkten Erstellen von Komponentenseiten entfällt; das optionale Whiteboard-Gateway erstellt die Seite. Nach einer Kontolöschung gehen erhaltene Besprechungen an einen verbleibenden Organisator über, ohne die Chatraum-Identität zu ändern. Leitfäden beschreiben öffentliche Verträge ohne Versionsnummern; der synchronisierte Stand ist 1.5.250.

## Cognis- und Anbieterbild

Das Marketplace-Banner erhält eine Kombination aus Cognis und Anbieter, deren Marken im mittigen sichtbaren Bereich bleiben. Das vorhandene Icon wird beibehalten.

## Einheitliche Marketplace-Texte

Verwenden Sie kurze Aktionszusammenfassungen und konkrete Funktionsbeschreibungen in den Marketplace-Metadaten mit inhaltlich abgestimmten Übersetzungen.

## Meeting-Verwaltung und Wiederherstellung

Version 1.5.251 ergänzt die administrative Wiederherstellung bei widersprüchlichen Meeting-Referenzen.

Administration → Meetings bietet die Filter Aktiv, Alle Meetings und Probleme. Die ausschließlich für Administratoren verfügbare Liste liest bestehende Datensätze ohne Schema-Initialisierung und markiert doppelte Teilnehmergruppen und URLs sowie gemeinsam referenzierte Chaträume und Zeichenflächen. Passwörter werden nicht ausgegeben. Beenden setzt die Cognis-Präsenz zurück und schließt das Meeting für verbundene Cognis-Clients; unabhängig verbundene Jitsi-Konferenzen werden nicht administriert. Aktive Meetings müssen vor dem Löschen beendet werden. Löschen entfernt Meeting-Datensätze und Freigaben sowie Chaträume oder Zeichenflächen, wenn kein anderes Meeting darauf verweist. Bei Bereinigungsfehlern bleibt der Datensatz für einen erneuten Versuch erhalten; bereits fehlende Ressourcen verhindern die Bereinigung nicht. Das Löschen doppelter Referenzen leert zwischengespeicherte Eindeutigkeitsfehler, damit die normale Schema-Initialisierung erneut erfolgen kann. Andere Routen erzwingen weiterhin das reguläre Schema. Bei fehlgeschlagener Meeting-Abfrage wird die automatische Aktualisierung mit einer Fehlermeldung angehalten.

## Exklusive Quellzuordnung für Integrationen

Meeting-Chats deklarieren `source: {sourceType: "meeting", sourceId: meeting.id}` über die Messages-Auflösung. Zeichenflächen werden mit derselben Identität über `whiteboard:sourceBinding` zugeordnet. Die Anbieter weisen konkurrierende Zuordnungen zurück; Jitsi ändert keine fremden Zuordnungsspalten. Administratives Löschen gibt nur die Zuordnung des gelöschten Meetings frei, wenn eine historische Referenz bestehen bleibt. Die Bereinigung von Messages-Anrufen gibt die Zuordnung frei und erhält das ursprüngliche Gespräch. Scheitert die Chat-Zuordnung eines neuen Anrufs, wird dessen Meeting-Datensatz zurückgesetzt. Messages-Quellzuordnung ist erforderlich; Whiteboard bleibt optional und benötigt seinen Zuordnungsvertrag.

## Scoped Browser-Aktionen und verifizierte Administration

Konfiguration und Aktivierung initialisieren ausschließlich die Konfigurationstabelle. Fehler der Meeting-Integrität verhindern daher nicht die Aktivierung und den Zugriff auf die administrative Wiederherstellung. Die Verwaltung initialisiert nur die zur Prüfung benötigte Hilfstabelle für Teilnehmerhistorie und erhält die Meeting-Constraints.

## Übersichtliche Meeting-Verwaltung

Die Meeting-Listen teilen sich ein Panel mit Abstand zwischen den Bereichen für aktive und bevorstehende Meetings. Namen, IDs und aufklappbare Chat- und Zeichenflächen-Verknüpfungen bleiben zusammen; kompakte Problem-Pills schaffen Platz für Teilnehmer, Aktivität und Aktionen. Filter verwenden neutrale Host-Steuerelemente ohne Positionsänderung beim Überfahren. Bevorstehende Meetings sind inaktiv, nicht beendet und haben einen gültigen zukünftigen Termin. Vergangene, fehlende und ungültige Termine bleiben unter Alle Meetings zugänglich.

Ausgabe 1.5.252 — Verwaltungslayout und Terminfilterung.

## Canvas-Persistenz nach Meeting-Typ

Ausgabe 1.5.253 — Dauerhafte Meetings verwenden `createCanvas`; nur ausdrücklich als kurzlebig markierte Meetings verwenden `createDisposableCanvas`. Teilnehmerzahlen und geänderte Einladungslisten ändern die Persistenz nicht. Gespeicherte passende Canvas-Zuordnungen werden beim erneuten Öffnen verwendet.

## Stabile Canvas-Kennungen für Meetings

Ausgabe 1.5.254 — Jitsi übergibt die Meeting-UUID als `resourceId` und `meeting` als `resourceType`; der Anzeigename dient nur als Titel. Erneutes Öffnen fordert dieselbe allgemeine Anbieter-Verknüpfung an, auch nach einer Namensänderung. Whiteboard verwaltet Persistenz, Zugriff und gleichzeitige Auflösung ohne Kenntnis der Jitsi-Interna.

## Allein-im-Meeting-Hinweis nach bestätigtem Beitritt

Ausgabe 1.5.255 — Der Hinweis folgt einer bestätigten lokalen Jitsi-Konferenz und der aktuellen Anwesenheit statt der Zahl der Einladungen oder Mitgliedschaften. Die bestehende Wartezeit nach Beitritt oder Anmeldung sowie das Ausblenden durch Bleiben gelten weiter. Der Hinweis kehrt zurück, wenn eine weitere Person beitritt und später geht. Während einer ausstehenden Anmeldung erscheint er nicht. Nach bestätigtem Jitsi-Beitritt kann ein veralteter Anmeldestatus den aktuellen Hinweis nicht ersetzen. Darstellung und Position im Hauptfenster und PiP bleiben unverändert.

## Eine Meeting-Identität pro Teilnehmergruppe

Ausgabe 1.5.256 — Die Erstellung verwendet ein Datenbank-Meeting mit derselben normalisierten aktuellen oder ursprünglichen Teilnehmergruppe unabhängig vom Kontext erneut. Es gibt keine forceNew-Option. Ein stabiler Teilnehmerschlüssel und atomisches Einfügen mit Konfliktbehandlung sorgen dafür, dass gleichzeitige Anfragen dieselbe ID erhalten. Mitgliedschaftsänderungen erhalten den Erstellungsschlüssel; Suche und Erkennung haben keine feste Datensatzgrenze mehr. Bei historischen Treffern wird das einzige aktive Meeting bevorzugt; mehrere aktive Treffer benötigen Administrator-Reparatur. Wiederverwendung stellt angeforderte Mitgliedschaften wieder her und ersetzt keine vorhandene Chat-Zuordnung. Während der Anmeldung bleiben Anwesenheit und Abfragen für dasselbe Meeting aktiv; nach Abschluss wird dieselbe ID betreten. Bestätigter Jitsi-Beitritt startet fortlaufende Anwesenheit auch bei veraltetem Anmeldestatus. Die Meeting-Liste bleibt während Beitritt und Konferenz gesperrt, mit Nicht-erlaubt-Cursor und inaktiven Karten.

## Wiederherstellung gelöschter Meeting- und Canvas-Verknüpfungen

Ausgabe 1.5.257 — Explizites Öffnen aktualisiert die allgemeine Anbieter-Verknüpfung statt einer vorbereiteten Canvas-ID zu vertrauen. Fehlende Zeichenflächen werden über den Anbieter neu erstellt und dem Meeting zugeordnet. Eine bereits genehmigte offene Zeichenfläche darf ohne erneute Abstimmung ersetzt werden, wenn der Anbieter das Fehlen der vorherigen Fläche und den exakten Ressourcentyp sowie die Kennung des Ersatzes bestätigt. Das explizite Starten eines gelöschten Meetings verwendet geladene Teilnehmerdaten und die normale kanonische Erstellung, erhält den Kurzlebigkeitsmodus und betritt die zurückgegebene Ersatz-ID. Unbekannte Verweise, Gäste sowie Berechtigungs- und Dienstfehler dienen nicht zur Ableitung neuer Ressourcen. Gelöschte Inhalte werden nicht wiederhergestellt; begrenzte Versuche erzeugen ein neues Element mit Erfolgsmeldung.

## Commits

- [7c8e3142](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/7c8e31420c361f86e1d20a025e9ce4ffa23abb28)
- [60428332](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/60428332b3deae87b46d0c4eb125986b28426a8b)
- [055fd2a7](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/055fd2a7a760c5c29d1e5c9abe9d3956763712aa)
- [f20e6ae2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f20e6ae22b52b88b285b0d6388d5ca619f0bf7f0)
- [1e557a1a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1e557a1aa154d546f37276c86c77358583c8bef7)
- [e869c668](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e869c6682d4b2ff13db0a72afd6889c9aa5f282f)
- [2432bb48](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2432bb4857744996c6cebb5e92eba8ac72cf490a)
- [6af5e9d4](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/6af5e9d449b87a30616d01a4aa3cbd06754c3d16)
- [3e99028a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3e99028a46b22727d6a74c79be66307e2cdf689f)
- [a94d0660](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a94d06602a508b05c7d5ce5a389212aa7a2a3ac8)
- [18feef04](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/18feef04c15884d664bfc838e565fd4de5505129)
- [34a9e730](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/34a9e730d6389aa4ba0fd49e4594f3219c47c7dd)
- [444c4155](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/444c415532dc20a285123231368cf2c30e376f1a)
- [d8c76966](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d8c769663b694a244b402304b37047c5e3bea699)
- [33a2ecdb](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/33a2ecdb02e84101247c48c7247b527a4863077f)
- [09c93f4d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/09c93f4d5bb52cff518455cda7494ca302cb3b7f)
- [bce5f43f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/bce5f43fef2cc079f596771553e947adc2a77e28)
- [d0ed7631](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d0ed763193e09ee5807ff0ffa89718f45b65ffbb)
- [b864da0c](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b864da0c1388c35000b8f21117ab7b52340f13a8)
- [c69fa5fc](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/c69fa5fc53db518779c9ac7905cc2919d4911aae)
- [8e79fd7d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/8e79fd7d77cc8857bb1482f245ea9aa56a7afeb7)
- [de197326](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/de19732675ee9d054088787f8710adfc96c809ce)
- [82899c91](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/82899c9148162acd33805632d5ce0d749e40ba6c)
- [9894d9ee](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/9894d9ee1130f3aff7144bd2e17adc72795e986a)
- [dccbd01c](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/dccbd01cb316ab7d02708b4d43a56fea53f7b060)
- [1d990487](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1d990487c733d1d4e9db03b9e2ec54d0f04632d1)
- [561ab35f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/561ab35f41d807651f2ec5c28b5ab43eda928305)
- [30603f26](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/30603f2679ed778ee2a3467de9d18b4932445836)
- [736abfbf](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/736abfbf2a8579b7c6961755ad26cb6446a54cac)
- [04158e4a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/04158e4a2da493d1413d5bbb7f580e0066cac468)
- [e8042612](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e8042612c8e55a549db7aa32cbc8ab9e0d1cdd04)
- [6bd01f73](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/6bd01f73b330f9d69169a81693325f3c89d445da)
- [b26fc491](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b26fc4912e6d48c8b31c18b474af3b2fd625b642)
- [65f51269](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/65f5126935c0e9f0ed63e89def8110589b88edde)
- [b1311b8d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/b1311b8d637806ae49c5b96067c4627cd6f182e5)
- [8d709449](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/8d70944999fb802c5b776d1760d370d45696c427)
- [1e6f727](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1e6f7271ff3b1fece3c748f71b10d502c7351aa8)
- [a1bceaa](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a1bceaa85535892a60cc3f3203d265a87e0b136e)
- [f129d7d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f129d7d1fea5518b657e7bd88991c3c5e96ee029)
- [ed255e0](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/ed255e0ff54d332cd92dc1781d11a3009be14f68)
- [1b064f2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1b064f20fef5a6c239a7772a24913b370c445332)
- [daabd62](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/daabd620f48c797c05df6171576fb2e33c1d8849)
- [f47348f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f47348f871886d8fa72ca0e8fa1c0e6a126357ed)
- [202c527](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/202c527a84226b8beea541a3902136d8be2a9384)
- [adb2cb2](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/adb2cb2af083776f91d58ce963cf565fe96ffb3b)
- [2abb9b4](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2abb9b447b81299f68ecf92a02cf935efe33c1df)
- [3318f35](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3318f352bff2c16c79688dde53cfaa3c737c21ee)
- [d2aedf7](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d2aedf74428a7eaf937f67032c1521279e38387b)
- [0d2dd75](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/0d2dd75cdd8dbefe85e7850a7f95c87f0353f140)
- [e03210b](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e03210b2a65f161c16a266cf85645235084690cf)
- [56838ae](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/56838ae4539bfae71e10088830e698248c3471cb)
- [a040064](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a040064d599dd686f662cb34a17d29192c5222b0)
- [dca2b28](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/dca2b2890b9d1d63268eb086061e38def6da856a)
