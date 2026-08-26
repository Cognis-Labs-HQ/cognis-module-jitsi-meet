# Jitsi-Meet-Modul

Das Jitsi-Meet-Modul bietet Cognis-native Besprechungssteuerung mit Teilnehmerauswahl, wiederverwendbaren Besprechungsräumen, Sitzungswiederaufnahme, Messages-Chat-Integration und einem optionalen gemeinsamen Whiteboard.

## Anwendungsbeispiele

- Besprechungen über `/meetings` und `/meeting` ohne vollständige Seitennavigation beitreten oder wiederaufnehmen.
- Teilnehmer auswählen, Besprechungszugriff teilen und den Messages-Chat der Besprechung verwenden.
- Aktive und bevorstehende Besprechungen unter Administration → Meetings überwachen.
- Die Meetings-Route als Overlay-, Vollbild- oder Bild-in-Bild-Komponentenseite einbetten.

## Technische Spezifikation

- API-Aufrufe erfordern ein gültiges Cognis-Zugriffstoken; Besprechungsdetails werden nur autorisierten Teilnehmern oder begrenzten Freigabegästen zurückgegeben.
- Kennwörter werden pro Besprechungsdatensatz erzeugt. Anzeigenamen enthalten den generierten Jitsi-Raum-Slug; derselbe Name kennzeichnet das Whiteboard und steht vor dem datierten Messages-Chat-Titel.
- Moduleigene Persistenz speichert Konfiguration, Teilnehmer, Anwesenheit, Lebenszykluszustand, Whiteboard-Zustand und Konsensstimmen.
- Die Sitzungswiederaufnahme trennt die vorherige aktive Besprechungssitzung des Benutzers.

### Integrationsvertrag

- `bootstrap.js` ist der einzige Plattform-Einstiegspunkt; ctx-Fähigkeiten und Flows sind die einzige komponentenübergreifende Integrationsoberfläche.
- Die Meetings-SPA verwendet Cognis-Router und Page Composer. Eingebettete Aufrufer übergeben eine serialisierbare `meetingId` in `focusState`; eingebettete Mounts sind rahmenlos und duplizieren nicht die Host-Navigation.
- Browser-Werkzeuge und der vollständige Katalog gemeinsamer Stylesheets werden vor der Darstellung der Meetings-Oberfläche über die erforderliche Fähigkeit `ui:reuse` geladen. Cognis Core liefert die Standarddarstellung der Steuerelemente; das Modul-CSS besitzt nur das Jitsi-spezifische Layout.
- Die optionale Whiteboard-Integration erscheint nur, wenn `whiteboard:uiGateway`, Komponentenfenster- und Floating-Window-Fähigkeiten verfügbar sind. Besprechungen mit Teilnehmern verwenden eine dauerhafte Ressourcen-Arbeitsfläche; teilnehmerlose Besprechungen eine verwerfbare Arbeitsfläche.
- Der Organisator kann das Whiteboard sofort öffnen. Andere Teilnehmer benötigen eine strikte Mehrheit der aktuell anwesenden Nicht-Organisatoren. Der Öffnungszustand bleibt gespeichert, sodass aktuelle und spätere Teilnehmer dieselbe Arbeitsfläche automatisch öffnen und die Besprechung in Bild-in-Bild verschieben.
- Whiteboards werden über den Komponentenfenster-Broker als randlose Overlay-Komponenten gestartet. Cognis Core verwaltet Begrenzung, randlosen Bühnenzustand, Bereinigung und PiP-Positionierung; Meetings lockert das Abschneiden seiner Bühne nur, solange der randlose Broker-Zustand aktiv ist.
- Das Whiteboard-Steuerelement ist ein `<a>`-Element, das standardmäßig den Core-Stil `btn-neutral` und beim Darüberfahren oder im aktiven Zustand `btn-confirm` verwendet. Die Auswahl des aktiven Steuerelements schließt es für die Besprechung. Schlägt Vorbereitung oder Einbindung fehl, protokolliert Meetings den Fehler, zeigt „Fehler beim Laden des Whiteboards“ und deaktiviert das Steuerelement für diesen Browser-Mount, damit Polling den Vorgang nicht wiederholt. Aktualisieren oder Weg- und Zurücknavigieren erzeugt einen neuen Mount und erlaubt einen weiteren Versuch.
