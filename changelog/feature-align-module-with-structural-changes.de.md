# Jitsi Meet an Cognis-Verträge anpassen

**Feature-Branch:** feature-align-module-with-structural-changes

## Scoped ctx und ausgeführte Aktions-Flows verwenden

Bootstrap bezieht externe Dienste ausschließlich über den lebenszyklusgebundenen ctx und registriert moduleigene Routen, Provider, Capabilities und Hooks. Speicheroperationen des aktivierten Moduls führen benannte `jitsi-meet:*`-Flows mit den Stufen `initialize-store` und `execute-action` aus; interne Operationen behalten ihre Transaktion. Die Autorisierung erfolgt vor Routenaktionen. Unvollständige Runner scheitern, statt Arbeit still zu überspringen. Die deaktivierte Konfiguration verwendet den eingeschränkten Lifecycle-Einstieg, da Cognis bei deaktivierten Modulen keine Flows registriert.

## Meeting- und Konversationsidentitäten stabil halten

Persistente Meetings behalten ihre normalisierte ursprüngliche Teilnehmermenge, Raumidentität und ihr Passwort über Mitgliedschaftsänderungen und Neustarts hinweg. Gespeicherte Meetings dürfen einen Messages-Raum gemeinsam referenzieren; separate Reservierungen für temporäre Anrufe verhindern konkurrierende Anrufe, ohne historische Chat-Referenzen eindeutig machen zu müssen. Reservierungen und Meeting-Änderungen bleiben transaktional. Präsenz läuft nach ausgebliebenen Heartbeats ab; beendete Meetings ignorieren verbleibende Präsenz.

## Den optionalen Whiteboard-Provider respektieren

Die optionale Browser-Canvas-Fabrik wird nach der Host-Initialisierung ermittelt; serverseitig werden die vom Provider deklarierten Whiteboard-Capabilities dynamisch aufgelöst. Die Aktivierung prüft die Verfügbarkeit vor der Canvas-Erstellung. Gäste folgen einer bestehenden Zuordnung und erstellen keine Canvas. Gleichzeitige Vorbereitung teilt einen ausstehenden Fabrikaufruf, Wiederholungen verwenden noch nicht bestätigte Ergebnisse erneut, ein Providerwechsel isoliert den Cache und abgebrochene Fenster-Wiederholungen stoppen vor einem weiteren Start. Mitgliedschafts- und Zuordnungsprüfungen verwenden kanonische Kontoidentitäten.

## Bereinigung wiederverwenden und veraltete UI-Arbeit verwerfen

Die Kontolöschung aktualisiert gespeicherte Teilnehmerlisten oder bereinigt externe Ressourcen, bevor unbrauchbare Meetings gelöscht werden. Der letzte Austritt und die Kontobereinigung verwenden dieselbe vom Besitzer autorisierte Ressourcenlöschung. Ein gemeinsamer Katalog umfasst bei der Meeting-Löschung auch Anrufreservierungen. Gemeinsame abbrechbare Wartezeiten entfernen Listener sowohl bei Abschluss als auch bei Abbruch. Polling prüft Mount-Lebensdauer, Anfragefolge und Meeting-Identität vor der Ergebnisübernahme, auch bei beendeten oder übernommenen Sitzungen.

## Host-Darstellung und Konferenzsitzungen erhalten

Meetings verwendet den Page Composer, Router, Profilvorschauen, Bedienelemente, Overlays und Floating Windows des Hosts. Regeln für den ausgeblendeten Zustand gelten nur für Jitsi-eigene Bedienelemente und Flächen. Leere Meeting-Antworten schließen den anfänglichen Ladezustand ab. Das Whiteboard-Mounting behält die Keyring-Autorisierung und synchronisierte Bildschirmefreigabe-Sperren bei. Die Bereinigung der Jitsi-Authentifizierungssitzung erhält andere Browserpräferenzen und ermöglicht Beitritte auch bei verweigertem Speicherzugriff.

## Einen synchronisierten Release-Vertrag veröffentlichen

Modul 1.5.242 synchronisiert Paketversionen und SHA-256-Inventar. Die Standarddokumentation beschreibt das aktuelle Verhalten auf Deutsch, Englisch, Indonesisch und Japanisch. Dieser PR verwendet einen Changelog-Satz mit zusammengeführten Implementierungslinks. Verhaltenstests prüfen ausgeführte Aktions-Flows, verweigerte Berechtigungen, abgebrochene Wiederholungen, gleichzeitige Canvas-Vorbereitung und veraltete Antworten zusätzlich zu strukturellen Isolationstests.

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
