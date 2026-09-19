# Jitsi Meet an die bereichsgebundene Modul-Laufzeit anpassen

**Feature-Branch:** feature-align-module-with-structural-changes

## Den lebenszyklusgebundenen Kontext verwenden

Jitsi Meet bezieht Capabilities nun direkt über seinen bereichsgebundenen Modulkontext und führt Host-Flows darüber aus oder erweitert sie. Freigabeverwaltung, Kontobereinigung, Whiteboard-Integration, Konfigurationsprüfungen vor der Aktivierung und Provider-Hooks hängen nicht mehr vom privaten Systemkontext ab, sodass Cognis Deaktivierungs- und erneute Aktivierungszyklen vollständig nachverfolgen kann.

## Den aktuellen Integrationsvertrag deklarieren

Das Manifest kennzeichnet nun die vertrauenswürdige privilegierte Integration für hosteigene Meeting-Capabilities und -Flows, verwendet Bootstrap als einzigen Laufzeiteinstiegspunkt und synchronisiert Version 1.5.210 sowie alle deklarierten Dateiprüfsummen. Strukturtests decken die neue Grenze ab.

## Inaktive Overlay-Steuerelemente ausgeblendet lassen

Die Meeting-Lobby erzwingt nun das HTML-Ausblendverhalten innerhalb der Moduloberfläche. Dadurch können Anzeigeregeln der Host-Schaltflächen Authentifizierungs-, Sitzungsübernahme-, Verlassen- oder Verbleiben-Aktionen nicht mehr vor dem zugehörigen Meeting-Zustand sichtbar machen. Release-Version und Integritätsprüfsummen sind auf 1.5.210 synchronisiert.

## Nextcloud-Whiteboard-Erkennung wiederherstellen

Jitsi löst nun die vom aktuellen Nextcloud-Whiteboard-Modul veröffentlichten namensraumgebundenen Server-Capabilities auf. Der Verfügbarkeitsendpunkt erkennt den aktivierten Provider wieder und stellt damit die Whiteboard-Schaltfläche sowie Board-Prüfung, Mitgliedschaftsaktualisierungen und Bereinigung wieder her.

## Auf die Provider-Aktivierung warten

Der Meetings-Client wiederholt die Backend-Verfügbarkeitsentscheidung für Whiteboard nun mit begrenztem exponentiellem Backoff. Ein Provider, der seine Capability-Registrierung während des Seiten-Mounts abschließt, kann dadurch das Whiteboard-Steuerelement befüllen, statt dessen Platz dauerhaft leer zu lassen.

## Den dedizierten UI-Provider laden

Jitsi deklariert `whiteboard:uiGateway` nun als optionale Browser-Capability-Anforderung. Cognis kann dadurch den mit den neuesten Nextcloud-Whiteboard-Änderungen eingeführten dedizierten Provider vor Meetings laden, ohne die Canvas-Factory über die Whiteboard-Navigationsleiste initialisieren zu müssen.

## Verfügbarkeitsergebnisse aktuell halten

Whiteboard-Verfügbarkeitsanfragen und -antworten umgehen nun ausdrücklich Browser-Caches. Nach dem Aktivieren oder erneuten Registrieren des Providers verwendet Meetings dadurch kein früheres Nichtverfügbarkeitsergebnis mehr, während der Platz des Steuerelements leer bleibt.

## Commits

- [7c8e314](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/7c8e31420c361f86e1d20a025e9ce4ffa23abb28)
- [6042833](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/60428332b3deae87b46d0c4eb125986b28426a8b)
- [055fd2a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/055fd2a7a760c5c29d1e5c9abe9d3956763712aa)
