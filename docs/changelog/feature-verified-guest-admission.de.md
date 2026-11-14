# Verifizierter Gastzugang

**Feature-Branch:** `feature-verified-guest-admission`

## Verifizierter Gastzugang

Ressourcenrouten für Besprechungen beziehen verifizierte Gast-Claims über `share:getGuestClaims`, bevor sie die bestehenden Besprechungs- und Berechtigungsprüfungen anwenden. Die vollständigen Claims gelangen über `ctx` zu Share; ein mit `share:` beginnendes Subjekt kennzeichnet keinen Gast. Fehlende, widerrufene oder abgelaufene Zugangsdaten und Freigaben führen nicht zu einem Kontozugriff. Konto- und Verwaltungsrouten verlangen weiterhin eine Sitzung einschließlich der Einschränkungen für ausstehende Sitzungen.

Das Modul benötigt Shares Funktionen für verifizierten Gastzugang, Gastidentität und Ressourcenautorisierung. Installieren Sie den passenden Auth-/Share-Hostvertrag vor diesem Modul. Gemischte Gastrouten authentifizieren in ihren Handlern statt über die sitzungsgebundene Routensperre des Hosts; jede Zielbesprechung wird weiterhin autorisiert. Bestehende Whiteboard-Delegations- und Teilnahmeprüfungen bleiben wirksam.

Beim Gaststart werden UI-Ressourcen und die Whiteboard-Verfügbarkeit nur für die autorisierte Besprechung geladen. Die Zugangsdaten stehen im Anfragekontext statt in der URL. Bestehende Gastbesprechungen führen die kontogebundene globale Vorprüfung nicht aus. Gastdaten übernehmen niemals die Authentifizierungssteuerung des Erstellers; das Besprechungskennwort bleibt auf die bestehende autorisierte Teilnahmeantwort beschränkt.

## Commits

- [ea6b331](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/ea6b331722d3b7f709431a9b30c4e6cb1e517ee5)
