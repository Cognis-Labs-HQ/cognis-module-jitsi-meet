# Jitsi-Kontobereinigung autorisieren

**Feature-Branch:** feature-auth-deprovision-outcome

## Von Auth bestätigte Löschungen voraussetzen

Jitsi 1.6.16 löst das Protokoll v1 von `auth:deprovisionOutcome` über den aktiven Stufenkontext und `system:contracts` auf. Nur eine vom Anbieter bestätigte, abgeschlossene Löschung berechtigt zur Bereinigung des ursprünglichen Kontos. Veränderbare Eingaben und öffentliche Persistenzergebnisse können diese Berechtigung weder erteilen noch umlenken. Fehlende oder inkompatible Verträge verhindern die Bereinigung. Bestehende Besitzverhältnisse, Löschreihenfolge, Fehlerbehandlung und Modullebensdauer bleiben erhalten.

## Host- und Modulveröffentlichung koordinieren

Diese Ergänzung benötigt den Ergebnisvertrag des Kandidaten Auth 2.2.12 und unveränderliche Flow-Stufenreferenzen aus Core 0.6.6. Dies sind Abhängigkeiten für eine koordinierte Veröffentlichung, keine Behauptung bereits veröffentlichter Hostunterstützung. Installieren Sie den passenden Host vor Aktivierung des Moduls und aktualisieren Sie ältere Jitsi-Verbraucher, bevor deren Bereinigung als geschützt gilt. Die Änderungen für verifizierten Gastzugang aus [PR #33](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/pull/33) bleiben erhalten. Ein Rückfall auf ältere Hosts ist nicht vorgesehen.

Die hostgestützte Validierung verwendete den lokalen Cognis-Kandidaten `dd4da31aa021aa6e714473bff2486d59a2d37521`. Vier synthetische Fälle bestanden über dessen öffentliches Core-Paket und den registrierten Jitsi-Bereinigungshook: Wiederverwendung eines früheren Aufrufpaars, Ersetzen des Kontexts durch eine Fälschung und veränderbare öffentliche Ergebnisse bei abgelehnten sowie abgeschlossenen Löschungen. Dies dokumentiert den geprüften Kandidaten, keine veröffentlichte Hostversion.

## Bereinigung über registrierte Flows prüfen

Synthetische Tests führen den exportierten Bootstrap sowie registrierte Bereinigungs- und Speicher-Flows aus. Sie prüfen gefälschte Ergebnisse, geänderte Ziele, Aufrufbindung, Anbieterlebensdauer, Ressourcenfehler, optionale Whiteboards, Deaktivierung/Reaktivierung und Deinstallation. Diese reine Serveränderung ergänzt keine Tutorial-Bedienelemente oder Ablaufschritte. Die Validierung verändert keine realen Konten, Meetings oder externen Ressourcen.

## Commits

- [411b7d5](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/411b7d53a3a98927252a62854861dcb332bcbe7f)
