# Jitsi-Meet-Modul

Das Jitsi-Meet-Modul bietet Cognis-native Besprechungssteuerung mit Teilnehmerauswahl, wiederverwendbaren Besprechungsräumen, Sitzungswiederaufnahme, Messages-Chat-Integration und einem optionalen gemeinsamen Whiteboard.

## Anwendungsbeispiele

- Besprechungen über `/meetings` und `/meeting` ohne vollständige Seitennavigation beitreten oder wiederaufnehmen.
- Teilnehmer auswählen, Besprechungszugriff teilen und den Messages-Chat der Besprechung verwenden.
- Aktive und bevorstehende Besprechungen unter Administration → Meetings überwachen.
- Die Meetings-Route als Overlay-, Vollbild- oder Bild-in-Bild-Komponentenseite einbetten.

## Technische Spezifikation

- API-Aufrufe erfordern ein gültiges Cognis-Zugriffstoken; Besprechungsdetails werden nur autorisierten Teilnehmern oder begrenzten Freigabegästen zurückgegeben.
- Kennwörter werden pro Besprechungsdatensatz erzeugt. Anzeigenamen sind eindeutige Vier-Wort-Phrasen ohne Produktpräfix; derselbe Name kennzeichnet das Whiteboard und den undatierten Messages-Chat. Teilnehmerlose, verwerfbare Besprechungen erstellen keine Messages-Chats, und ein zuvor zugeordneter Chat wird beim Beenden der Besprechung dauerhaft gelöscht.
- Moduleigene Persistenz speichert Konfiguration, Teilnehmer, Anwesenheit, Lebenszykluszustand, Whiteboard-Zustand und Konsensstimmen.
- Die Sitzungswiederaufnahme trennt die vorherige aktive Besprechungssitzung des Benutzers.

### Integrationsvertrag

- `bootstrap.js` ist der einzige Plattform-Einstiegspunkt; ctx-Fähigkeiten und Flows sind die einzige komponentenübergreifende Integrationsoberfläche.
- Die Meetings-SPA verwendet Cognis-Router und Page Composer. Eingebettete Aufrufer übergeben eine serialisierbare `meetingId` in `focusState`; eingebettete Mounts sind rahmenlos und duplizieren nicht die Host-Navigation.
- Browser-Werkzeuge und der vollständige Katalog gemeinsamer Stylesheets werden vor der Darstellung der Meetings-Oberfläche über die erforderliche Fähigkeit `ui:reuse` geladen. Cognis Core liefert die Standarddarstellung der Steuerelemente; das Modul-CSS besitzt nur das Jitsi-spezifische Layout.
- Die optionale Whiteboard-Integration erscheint, wenn die grundlegende Canvas-Factory `whiteboard:uiGateway` sowie Komponentenfenster- und Floating-Window-Fähigkeiten verfügbar sind; die Provider-Vertragsmethode `createCanvas` erstellt normale Arbeitsflächen mit den Kennungen der eingeladenen Teilnehmer, während nur teilnehmerlose Besprechungen `createDisposableCanvas` verwenden. Meetings greift niemals von dauerhafter auf verwerfbare Erstellung zurück und speichert den Zuordnungstyp, ersetzen unbekannte oder nicht passende ältere Zuordnungen und öffnen beim Laden der Besprechung automatisch die geprüfte dauerhafte Arbeitsfläche.
- Der Organisator kann das Whiteboard sofort öffnen. Andere Teilnehmer benötigen eine strikte Mehrheit der aktuell anwesenden Nicht-Organisatoren. Der Öffnungszustand bleibt gespeichert, sodass aktuelle und spätere Teilnehmer dieselbe Arbeitsfläche automatisch öffnen und die Besprechung in Bild-in-Bild verschieben.
- Bevor eine Whiteboard-Komponente geöffnet wird, fordert Meetings den Schlüsselbundzugriff auf der übergeordneten Seite an, damit eine Entsperrabfrage einen Popup-Host besitzt. Whiteboards werden anschließend über den Komponentenfenster-Broker als eingebettete Overlay-Komponenten mit dokumenteigenem Scrollen gestartet. Meetings verwendet die importierten Komponentenfenster- und Schaltflächenklassen, statt Darstellungsklassen hinzuzufügen oder die gemeinsame Seiten-Shell zu überschreiben.
- Das Whiteboard-Steuerelement ist eine Standard-`<button>`-Schaltfläche wie das benachbarte Teilen-Steuerelement. Es verwendet standardmäßig die Core-Darstellung `btn-neutral` und im aktiven Zustand die importierten Zustände `active` und `btn-confirm`; außerdem ändert sich die Beschriftung in „Whiteboard schließen“. Die Auswahl des aktiven Steuerelements schließt es für die Besprechung. Schlägt Vorbereitung oder Einbindung fehl, protokolliert Meetings den Fehler, zeigt „Fehler beim Laden des Whiteboards“ und deaktiviert das Steuerelement für diesen Browser-Mount, damit Polling den Vorgang nicht wiederholt. Aktualisieren oder Weg- und Zurücknavigieren erzeugt einen neuen Mount und erlaubt einen weiteren Versuch.
