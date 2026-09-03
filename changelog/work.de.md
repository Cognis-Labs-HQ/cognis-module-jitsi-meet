# Messages-Videoanrufe mit verfügbaren Jitsi-Meetings

**Feature-Zweig:** work

## Eingeschränkte Anrufe aus Messages starten

Jitsi Meet stellt jetzt den Browser-VoIP-Anbieter für Direkt- und Gruppenchats bereit. Anrufe umfassen ausschließlich die Mitglieder des auslösenden Raums und erstellen keinen separaten Meeting-Chat.

## Anrufe verfügbar und fokussiert halten

Messages-Anrufe können weder geteilt noch um weitere Teilnehmende erweitert oder mit einem Whiteboard verbunden werden. Die Rückkehr zu Messages erhält das laufende Meeting in einem verschiebbaren Bild-im-Bild-Fenster; nach dem Anruf wird der Meeting-Datensatz gelöscht.

## Anbieter beim ersten Rendern verfügbar

Die Navigationsleisten-Registrierung weist nun `voip:startCall` aus. Dadurch kann Cognis Jitsi laden, bevor Messages die Anbieter-Verfügbarkeit prüft, und die Videokamera-Aktion bereits beim ersten Rendern des Chats anzeigen.

## Commits

- [39f6fde](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/39f6fde4a0a48b73f1ff77259ae47ea15c125049)
- [4800983](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/4800983502abcdd530a34419f6fe8ae6ead042f1)
