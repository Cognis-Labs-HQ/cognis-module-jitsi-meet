# Jitsi Meet an den verschärften Modul-Lebenszyklus anpassen

**Feature-Branch:** feature-fix-module-lifecycle-alignment

## Sichere Modulaktivierung wiederherstellen

Jitsi Meet bezieht den Browserkontext des Hosts jetzt aus dem bewusst bereitgestellten globalen Capability-Bus, statt ein Cognis-internes Modul zu importieren. Dadurch besteht das Modul die verschärfte Grenzprüfung für externe Module.

## Konfiguration vor der Aktivierung unterstützen

Ein eingeschränkter API-Einstiegspunkt für deaktivierte Module registriert vor der Aktivierung nur die ausdrücklich freigegebenen Konfigurationsendpunkte. Administratoren können Jitsi konfigurieren, ohne Funktionsrouten, UI-Beiträge, Abläufe oder Fähigkeiten zu aktivieren.

## Konfigurationsregistrierung einheitlich gemeinsam nutzen

Die API-Einstiegspunkte für den aktivierten und deaktivierten Zustand verwenden jetzt dieselbe Konfigurationsschicht und entsprechen damit dem Lebenszyklusmuster von Nextcloud Whiteboard. Konfigurationsvalidierung, Authentifizierung, Erreichbarkeitsprüfung, CSP-Ursprungsregistrierung, Aktivierungstest und Antworten bei nicht verfügbaren Abhängigkeiten bleiben in beiden Zuständen konsistent.

## Commits

- [3335e1f](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/3335e1fe833be67ee047c2e307ef0a5780e973c6)

- [2e52a5a](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/2e52a5ac0a26a29a582542ac97a11f7f3139dc29)

- [ffe2d69](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/ffe2d69c4cf489d3ff7c74b908113d816407084d)
