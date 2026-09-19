# Jitsi Meet an die bereichsgebundene Modul-Laufzeit anpassen

**Feature-Branch:** work

## Den lebenszyklusgebundenen Kontext verwenden

Jitsi Meet bezieht Capabilities nun direkt über seinen bereichsgebundenen Modulkontext und führt Host-Flows darüber aus oder erweitert sie. Freigabeverwaltung, Kontobereinigung, Whiteboard-Integration, Konfigurationsprüfungen vor der Aktivierung und Provider-Hooks hängen nicht mehr vom privaten Systemkontext ab, sodass Cognis Deaktivierungs- und erneute Aktivierungszyklen vollständig nachverfolgen kann.

## Den aktuellen Integrationsvertrag deklarieren

Das Manifest kennzeichnet nun die vertrauenswürdige privilegierte Integration für hosteigene Meeting-Capabilities und -Flows, verwendet Bootstrap als einzigen Laufzeiteinstiegspunkt und synchronisiert Version 1.5.205 sowie alle deklarierten Dateiprüfsummen. Strukturtests decken die neue Grenze ab.

## Commits

- [2da84cf](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2da84cf21e4804a39e2cf2de47f0b3770f13abf5)
