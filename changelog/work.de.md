# Jitsi Meet an die bereichsgebundene Modul-Laufzeit anpassen

**Feature-Branch:** work

## Den lebenszyklusgebundenen Kontext verwenden

Jitsi Meet bezieht Capabilities nun direkt über seinen bereichsgebundenen Modulkontext und führt Host-Flows darüber aus oder erweitert sie. Freigabeverwaltung, Kontobereinigung, Whiteboard-Integration, Konfigurationsprüfungen vor der Aktivierung und Provider-Hooks hängen nicht mehr vom privaten Systemkontext ab, sodass Cognis Deaktivierungs- und erneute Aktivierungszyklen vollständig nachverfolgen kann.

## Den aktuellen Integrationsvertrag deklarieren

Das Manifest kennzeichnet nun die vertrauenswürdige privilegierte Integration für hosteigene Meeting-Capabilities und -Flows, verwendet Bootstrap als einzigen Laufzeiteinstiegspunkt und synchronisiert Version 1.5.207 sowie alle deklarierten Dateiprüfsummen. Strukturtests decken die neue Grenze ab.

## Inaktive Overlay-Steuerelemente ausgeblendet lassen

Die Meeting-Lobby erzwingt nun das HTML-Ausblendverhalten innerhalb der Moduloberfläche. Dadurch können Anzeigeregeln der Host-Schaltflächen Authentifizierungs-, Sitzungsübernahme-, Verlassen- oder Verbleiben-Aktionen nicht mehr vor dem zugehörigen Meeting-Zustand sichtbar machen. Release-Version und Integritätsprüfsummen sind auf 1.5.207 synchronisiert.

## Nextcloud-Whiteboard-Erkennung wiederherstellen

Jitsi löst nun die vom aktuellen Nextcloud-Whiteboard-Modul veröffentlichten namensraumgebundenen Server-Capabilities auf. Der Verfügbarkeitsendpunkt erkennt den aktivierten Provider wieder und stellt damit die Whiteboard-Schaltfläche sowie Board-Prüfung, Mitgliedschaftsaktualisierungen und Bereinigung wieder her.

## Commits

- [17491e9](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/17491e947e3c67ebd030080bf619df59b1e2775f)
- [c7ac761](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/c7ac7619266b446dff0101b80ab7a95afbab3174)
