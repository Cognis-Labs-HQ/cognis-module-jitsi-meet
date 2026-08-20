# Jitsi-Meet-Modul

## Zusammenfassung

Das Jitsi-Meet-Modul bietet Cognis-native Meeting-Orchestrierung mit Teilnehmerauswahl, Wiederverwendung von Meeting-URLs, Sitzungsübernahme und Wiederverwendung von Nachrichten-Chaträumen.

## Funktionen

- Konfigurierbare Jitsi-Instanz-URL und optionales URI-Präfix, die ausschließlich aus den von Cognis dargestellten Einstellungen des installierten Moduls gelesen werden
- Anwendungsrouten `/meetings` und `/meeting` mit:
    - Meeting-Bereich/Overlay
    - Teilnehmerauswahl und Drag-and-Drop
    - Chat-URL-Übergabe an den Messages-Adapter
- Meeting-Persistenz in modulspezifischen Tabellen
- Teilnehmergebundene API-Zugriffe per Benutzername
- Classroom-Fallback-Autorisierung, wenn `classroom_id` gesetzt ist
- Live-Meeting-Überwachung in Administration → Meetings
- UUID-basierte Abhängigkeiten vom Social-Gateway, Profil-Adapter, Share-Gateway und Messages-Adapter sowie fähigkeitsbasierte Laufzeitanforderungen `auth:requireAuth` und `ui:profileAvatarRenderer`

## Sicherheitshinweise

- API-Aufrufe erfordern ein gültiges Cognis-Access-Token.
- Meeting-Details werden nur an berechtigte Teilnehmer ausgegeben.
- Meeting-Passwörter werden pro Meeting-Datensatz generiert.
- Die Sitzungsübernahme ermöglicht das Trennen einer vorherigen aktiven Sitzung.

## Goldstandard-Vertrag

- `bootstrap.js` ist der einzige vom Plattformkern genutzte Moduleinstieg.
- Das Bootstrap-ctx ist der einzige Integrationsbus dieses Moduls (API-Routen, UI-Registrierung, Fähigkeiten sowie künftige CLI/DB-Anbindung).
- Direkte Imports aus anderen Modulen oder Core-Interna sind verboten; Integration muss über ctx erfolgen.
