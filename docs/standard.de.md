# Jitsi-Meet-Modul

Das Jitsi-Meet-Modul bietet Cognis-native Meeting-Orchestrierung mit Teilnehmerauswahl, Wiederverwendung von Meeting-URLs, Sitzungsübernahme und Wiederverwendung von Nachrichten-Chaträumen.

## Anwendungsbeispiele

- Konfigurierbare Jitsi-Instanz-URL und optionales URI-Präfix, von Cognis aus dem Manifest dargestellt und über den moduleigenen Konfigurationsendpunkt gespeichert
- Anwendungsrouten `/meetings` und `/meeting` mit:
    - eine seitenspezifische Verfügbarkeitsprüfung, die beim Verlassen sofort endet
    - Meeting-Bereich/Overlay
    - Teilnehmerauswahl und Drag-and-Drop
    - Chat-URL-Übergabe an den Messages-Adapter
- Meeting-Persistenz in modulspezifischen Tabellen
- Teilnehmergebundene API-Zugriffe per Benutzername
- Classroom-Fallback-Autorisierung, wenn `classroom_id` gesetzt ist
- Live-Meeting-Überwachung in Administration → Meetings
- UUID-basierte Abhängigkeiten vom Social-Gateway, Profil-Adapter, Share-Gateway und Messages-Adapter sowie fähigkeitsbasierte Laufzeitanforderungen `auth:requireAuth` und `ui:profileAvatarRenderer`
- Eine ausdrücklich freigegebene Meetings-Komponentenseite, die über die unveränderliche UUID dieses Moduls und die Routen-ID `module.jitsi.meet.meetings` aufgelöst wird und Overlay-, Vollbild- sowie Bild-im-Bild-Darstellung unterstützt

## Technische Spezifikation

- API-Aufrufe erfordern ein gültiges Cognis-Access-Token.
- Meeting-Details werden nur an berechtigte Teilnehmer ausgegeben.
- Meeting-Passwörter werden pro Meeting-Datensatz generiert.
- Die Sitzungsübernahme ermöglicht das Trennen einer vorherigen aktiven Sitzung.

### Integrationsvertrag

- `bootstrap.js` ist der einzige vom Plattformkern genutzte Moduleinstieg.
- Das Bootstrap-ctx ist der einzige Integrationsbus dieses Moduls (API-Routen, UI-Registrierung, Fähigkeiten sowie künftige CLI/DB-Anbindung).
- Direkte Imports aus anderen Modulen oder Core-Interna sind verboten; Integration muss über ctx erfolgen.
- Aufrufer der Komponentenseite übergeben eine serialisierbare `meetingId` in `focusState`; die eingebettete Ansicht bleibt im bereitgestellten Wurzelelement und nutzt einen rahmenlosen Composer ohne doppelte Host-Navigation.
- Die Erkennung des Besprechungsendes berücksichtigt Jitsi-Fehler vom Typ `conference.destroyed`, stellt die Aktion „Besprechung starten“ nach dem Verlassen sofort wieder her und blendet Teilnehmer-, Leistungs- und Hintergrundfunktionen aus der eingebetteten Werkzeugleiste aus.
- Wenn die optionale Nextcloud-Whiteboard-Browser-Capability `whiteboard:uiGateway` aktiv ist, bietet die Besprechungsbühne ein synchronisiertes, temporäres Whiteboard-Komponentenfenster und zeigt die ununterbrochene Besprechung bis zum Schließen des Whiteboards als Bild-im-Bild an.
- Die Whiteboard-Verfügbarkeit wird ohne Einbindung einer Oberfläche ermittelt. Ein Benutzerklick ruft `component-pages:spawn` mit der Element-ID der Besprechungsbühne auf; beim Schließen des Fensters oder Entfernen der Besprechungsseite wird das zurückgegebene Handle verworfen.
- Ein geöffnetes Whiteboard bleibt bis zum Ende der Besprechung eingebunden. Besprechungen mit eingeladenen Teilnehmern behalten ihre ressourcengebundene Zeichenflächen-ID für spätere Instanzen, während Besprechungen ohne Teilnehmer temporär bleiben; Provider-Laden und Zeichenflächenvorbereitung werden bei einem Besprechungswechsel per SPA sicher wiederholt.
- Fehlt das Whiteboard-Gateway in einem zwischengespeicherten Provider-Katalog, erzwingt Meetings vor dem Ausblenden der Integration eine einmalige Aktualisierung des Provider-Katalogs. Der Fensterabbau verwendet das Broker-Handle oder den bühnenbezogenen Discard-Fallback; das globale `component-pages:discardAll` bleibt Aufgabe der Cognis-SPA-Shell.
- Die Provider-Bereitschaft wird bei SPA-Einbindungen erneut geprüft, und jede gerenderte Besprechungsbühne erhält eine kollisionssichere Ziel-ID, damit geparktes oder veraltetes DOM kein neues Komponentenfenster abfangen kann. Whiteboards fordern eine Overlay- statt einer Vollbilddarstellung an.
- Das eingebundene Whiteboard fordert eine rahmenlose Darstellung an und entfernt innerhalb des besprechungseigenen Komponentenfensters die Abstände von Arbeitsbereich, Panel, Abschnitt und Widget, damit die Zeichenfläche den verfügbaren Bühnenbereich nutzt.
