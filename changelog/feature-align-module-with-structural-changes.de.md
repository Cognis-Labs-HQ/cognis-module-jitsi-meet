# Jitsi Meet an die bereichsgebundene Modul-Laufzeit anpassen

**Feature-Branch:** feature-align-module-with-structural-changes

## Den lebenszyklusgebundenen Kontext verwenden

Jitsi Meet bezieht Capabilities nun direkt über seinen bereichsgebundenen Modulkontext und führt Host-Flows darüber aus oder erweitert sie. Freigabeverwaltung, Kontobereinigung, Whiteboard-Integration, Konfigurationsprüfungen vor der Aktivierung und Provider-Hooks hängen nicht mehr vom privaten Systemkontext ab, sodass Cognis Deaktivierungs- und erneute Aktivierungszyklen vollständig nachverfolgen kann.

## Den aktuellen Integrationsvertrag deklarieren

Das Manifest belässt das Modul nun unprivilegiert und veröffentlicht seine Browser-Capability über den lebenszyklusgebundenen Provider-Katalog, verwendet Bootstrap als einzigen Laufzeiteinstiegspunkt und synchronisiert Version 1.5.221 sowie alle deklarierten Dateiprüfsummen. Strukturtests decken die neue Grenze ab.

## Inaktive Overlay-Steuerelemente ausgeblendet lassen

Die Meeting-Lobby erzwingt nun das HTML-Ausblendverhalten innerhalb der Moduloberfläche. Dadurch können Anzeigeregeln der Host-Schaltflächen Authentifizierungs-, Sitzungsübernahme-, Verlassen- oder Verbleiben-Aktionen nicht mehr vor dem zugehörigen Meeting-Zustand sichtbar machen. Release-Version und Integritätsprüfsummen sind auf 1.5.221 synchronisiert.

## Nextcloud-Whiteboard-Erkennung wiederherstellen

Jitsi löst nun die vom aktuellen Nextcloud-Whiteboard-Modul veröffentlichten Server-Capabilities auf. Der Verfügbarkeitsendpunkt erkennt den aktivierten Provider wieder und stellt damit die Whiteboard-Schaltfläche sowie Board-Prüfung, Mitgliedschaftsaktualisierungen und Bereinigung wieder her.

## Den dedizierten UI-Provider laden

Jitsi deklariert `whiteboard:uiGateway` nun als optionale Browser-Capability-Anforderung. Cognis kann dadurch den mit den neuesten Nextcloud-Whiteboard-Änderungen eingeführten dedizierten Provider vor Meetings laden, ohne die Canvas-Factory über die Whiteboard-Navigationsleiste initialisieren zu müssen.

## Browser-Provider-Erkennung für die Sichtbarkeit verwenden

Nachdem Cognis PR #222 die Registrierung externer Capability-Provider an den Lebenszyklus gebunden hat, verwendet das Meetings-Steuerelement direkt das geladene `whiteboard:uiGateway`, statt sich aufgrund einer separaten Backend-Verfügbarkeitsanfrage zu entfernen. Der Backend-Endpunkt bleibt für Diagnosen verfügbar.

## Die vom Provider deklarierten Whiteboard-Verträge verwenden

Jitsi löst nun `whiteboard:fetchBoardData`, `whiteboard:membership` und `whiteboard:deleteCanvas` auf, die im aktuellen Nextcloud-Whiteboard-Manifest deklariert sind. Die nicht deklarierte Implementierungsfassade `whiteboard:api` wird nicht mehr vorausgesetzt; Serverprüfung und synchronisierte Meeting-Whiteboards funktionieren damit wieder.

## Die bereitgestellte Browser-Laufzeit initialisieren

Gemäß Cognis PR #224 importiert der Browser-Einstieg von Meetings die vom Deployment bereitgestellte Laufzeitressource `/static/reuse/ui-ctx.js`, damit direkte Aufrufe und Aktualisierungen denselben Kontext wie die SPA-Navigation initialisieren. Weitere Browser-Hilfsmittel werden über `ui:reuse` aufgelöst; Jitsi verwendet nun `ctx.registerCapabilityProvider` für `voip:startCall`, entfernt die redundante Capability `meetings:isProviderAvailable` und fordert keinen privilegierten Zugriff an.

## Die Whiteboard-Integration optional halten

Jitsi löst Capabilities für Whiteboard-Prüfung, Mitgliedschaft und Löschung nur auf, wenn der optionale Provider aktiviert ist. Diese Server-Capabilities blockieren die Aktivierung von Jitsi nicht mehr, während `whiteboard:uiGateway` der Vertrag zur Erkennung des Browser-Providers bleibt.

## Die Datenbank-Laufzeitabhängigkeit deklarieren

Jitsi deklariert nun `db:executor`, das von den deaktivierten Konfigurationsrouten, dem Aktivierungstest und dem aktivierten Meeting-Speicher benötigt wird. Cognis kann den Datenbank-Provider vor der Registrierung von `/config` initialisieren, sodass die Konfiguration nicht mehr auf HTTP 503 zurückfällt und die Aktivierungsprüfung die gespeicherte Jitsi-URL verwenden kann.

## Server-Capabilities im Modulnamensraum halten

Der authentifizierte Resolver für Meeting-Chats wird nun als `jitsi-meet:getMeetingChat` veröffentlicht. Damit verbleibt jede von Jitsi bereitgestellte Capability im moduleigenen Namensraum und besteht die Cognis-Grenzprüfung ohne privilegierten Zugriff.

## Gespeicherte Besprechungen nach Kontolöschung aktualisieren

Wenn Cognis ein Konto löscht, entfernt Jitsi das Konto nun sowohl aus den aktuellen als auch aus den ursprünglichen Teilnehmerdatensätzen. Wiederverwendbare Besprechungen erhalten einen neuen Schlüssel für die verbleibende gespeicherte Gruppe; Besprechungen mit weniger als zwei gespeicherten Teilnehmern werden gelöscht.

## Commits

- [7c8e314](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/7c8e31420c361f86e1d20a025e9ce4ffa23abb28)
- [6042833](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/60428332b3deae87b46d0c4eb125986b28426a8b)
- [055fd2a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/055fd2a7a760c5c29d1e5c9abe9d3956763712aa)
- [f20e6ae](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/f20e6ae22b52b88b285b0d6388d5ca619f0bf7f0)

- [1e557a1](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/1e557a1aa154d546f37276c86c77358583c8bef7)

- [e869c66](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e869c6682d4b2ff13db0a72afd6889c9aa5f282f)

- [2432bb4](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2432bb4857744996c6cebb5e92eba8ac72cf490a)

- [6af5e9d](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/6af5e9d449b87a30616d01a4aa3cbd06754c3d16)

- [3e99028](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3e99028a46b22727d6a74c79be66307e2cdf689f)

- [a94d066](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/a94d06602a508b05c7d5ce5a389212aa7a2a3ac8)

- [18feef0](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/18feef04c15884d664bfc838e565fd4de5505129)

- [34a9e73](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/34a9e730d6389aa4ba0fd49e4594f3219c47c7dd)

- [444c415](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/444c415532dc20a285123231368cf2c30e376f1a)

- [d8c7696](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d8c769663b694a244b402304b37047c5e3bea699)

- [33a2ecd](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/33a2ecdb02e84101247c48c7247b527a4863077f)
