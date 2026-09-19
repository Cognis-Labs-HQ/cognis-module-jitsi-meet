# Jitsi Meet an die bereichsgebundene Modul-Laufzeit anpassen

**Feature-Branch:** feature-align-module-with-structural-changes

## Den lebenszyklusgebundenen Kontext verwenden

Jitsi Meet bezieht Capabilities nun direkt über seinen bereichsgebundenen Modulkontext und führt Host-Flows darüber aus oder erweitert sie. Freigabeverwaltung, Kontobereinigung, Whiteboard-Integration, Konfigurationsprüfungen vor der Aktivierung und Provider-Hooks hängen nicht mehr vom privaten Systemkontext ab, sodass Cognis Deaktivierungs- und erneute Aktivierungszyklen vollständig nachverfolgen kann.

## Den aktuellen Integrationsvertrag deklarieren

Das Manifest kennzeichnet nun die vertrauenswürdige privilegierte Integration für hosteigene Meeting-Capabilities und -Flows, verwendet Bootstrap als einzigen Laufzeiteinstiegspunkt und synchronisiert Version 1.5.214 sowie alle deklarierten Dateiprüfsummen. Strukturtests decken die neue Grenze ab.

## Inaktive Overlay-Steuerelemente ausgeblendet lassen

Die Meeting-Lobby erzwingt nun das HTML-Ausblendverhalten innerhalb der Moduloberfläche. Dadurch können Anzeigeregeln der Host-Schaltflächen Authentifizierungs-, Sitzungsübernahme-, Verlassen- oder Verbleiben-Aktionen nicht mehr vor dem zugehörigen Meeting-Zustand sichtbar machen. Release-Version und Integritätsprüfsummen sind auf 1.5.214 synchronisiert.

## Nextcloud-Whiteboard-Erkennung wiederherstellen

Jitsi löst nun die vom aktuellen Nextcloud-Whiteboard-Modul veröffentlichten Server-Capabilities auf. Der Verfügbarkeitsendpunkt erkennt den aktivierten Provider wieder und stellt damit die Whiteboard-Schaltfläche sowie Board-Prüfung, Mitgliedschaftsaktualisierungen und Bereinigung wieder her.

## Den dedizierten UI-Provider laden

Jitsi deklariert `whiteboard:uiGateway` nun als optionale Browser-Capability-Anforderung. Cognis kann dadurch den mit den neuesten Nextcloud-Whiteboard-Änderungen eingeführten dedizierten Provider vor Meetings laden, ohne die Canvas-Factory über die Whiteboard-Navigationsleiste initialisieren zu müssen.

## Browser-Provider-Erkennung für die Sichtbarkeit verwenden

Nachdem Cognis PR #222 die Registrierung externer Capability-Provider an den Lebenszyklus gebunden hat, verwendet das Meetings-Steuerelement direkt das geladene `whiteboard:uiGateway`, statt sich aufgrund einer separaten Backend-Verfügbarkeitsanfrage zu entfernen. Der Backend-Endpunkt bleibt für Diagnosen verfügbar.

## Den einheitlichen Whiteboard-Capability-Namensraum verwenden

Jitsi löst nun `whiteboard:fetchBoardData`, `whiteboard:membership` und `whiteboard:deleteCanvas` auf und entspricht damit dem neuesten Provider-Vertrag von Nextcloud Whiteboard. Serverprüfung, Teilnehmermitgliedschaft, delegierter Zugriff und Bereinigung verwenden nicht mehr den abgelösten modulspezifischen Namensraum.

## Den Host-UI-Kontext bei direktem Laden initialisieren

Direkte Aufrufe von `/meetings` und Browser-Aktualisierungen importieren nun den öffentlichen UI-Kontext-Bootstrap von Cognis, bevor auf `ui:reuse` oder optionale Capability-Provider zugegriffen wird. Die Seite setzt nicht mehr voraus, dass die Dashboard-Shell den UI-Kontext bereits erstellt hat.

## Den Vertrag der Whiteboard-Server-Capabilities deklarieren

Jitsi deklariert nun die verwendeten Capabilities für Whiteboard-Prüfung, Mitgliedschaft und Löschung. Cognis validiert den aktivierten Provider, bevor Jitsi den Whiteboard-Zustand synchronisiert, sodass das Steuerelement keine Route mit einer nicht verfügbaren begrenzten Server-Capability erreicht.

## Commits

- [7c8e314](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/7c8e31420c361f86e1d20a025e9ce4ffa23abb28)
- [6042833](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/60428332b3deae87b46d0c4eb125986b28426a8b)
- [055fd2a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/055fd2a7a760c5c29d1e5c9abe9d3956763712aa)
- [f20e6ae](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f20e6ae22b52b88b285b0d6388d5ca619f0bf7f0)

- [1e557a1](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1e557a1aa154d546f37276c86c77358583c8bef7)

- [e869c66](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e869c6682d4b2ff13db0a72afd6889c9aa5f282f)

- [2432bb4](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2432bb4857744996c6cebb5e92eba8ac72cf490a)
