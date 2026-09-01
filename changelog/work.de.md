# Steuerung der Meeting-Chatmitgliedschaft ausrichten

**Feature-Branch:** work

## Kanonische Messages-Mitgliedschafts-Capability verwenden

Einladungen zu aktiven Meetings und das Entfernen von Teilnehmern verwenden nun die einheitliche Capability `social:messages:membership` mit kanonischen Konto-IDs für Akteur und Benutzer und entsprechen damit dem aktuellen Integrationsvertrag von Cognis Messages.

## Chat-Zugriff beim erneuten Beitritt wiederherstellen

Bei jedem authentifizierten Meeting-Beitritt wird nun vor dem Laden des Chats die idempotente Messages-Mitgliedschaftsoperation erneut ausgeführt. Teilnehmer, die den Meeting-Chat zuvor verlassen oder archiviert haben, können ihn daher nach dem erneuten Beitritt zum Meeting wieder sehen.

## Commits

- [d6f689a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/d6f689a8d46f17897c4d1abf65f93673e99b4b30)

- [8665186](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/86651863fcf6af7736904af8c01f7cc89d5a45de)
