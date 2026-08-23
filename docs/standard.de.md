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
