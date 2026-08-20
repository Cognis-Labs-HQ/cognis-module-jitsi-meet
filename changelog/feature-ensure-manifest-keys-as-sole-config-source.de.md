# Beitragsstandards

## Abgleich mit Kernrichtlinien

Die Beitragsanweisungen des Repositorys enthalten nun die anwendbaren Architektur-, Sicherheits-, UI-, Test-, Lokalisierungs-, Versionierungs- und Qualitätsanforderungen des Cognis-Hauptrepositorys.

## Eigenständiger Geltungsbereich

Regeln, die ausschließlich Verzeichnisse, Docker, Gateways, Adapter, Study und zentrale Register des Monorepos betreffen, sind ausdrücklich ausgenommen; ihre relevanten Architekturprinzipien bleiben verbindlich.

## Repository-Konformität

Die JavaScript-Formatierung folgt nun der Cognis-Prettier-Konfiguration mit vier Leerzeichen, authentifizierte Routen autorisieren Aufrufende vor der Initialisierung der Persistenz und Listen-APIs erzwingen keine nicht deklarierten serverseitigen Ergebnisgrenzen mehr. Die Cognis-Prüfungen für Formatierung, Lesbarkeit und mehrdeutige Namen laufen nun lokal. Beabsichtigte Rückfallpfade werden mit strukturiertem Kontext protokolliert und Meeting-Sitzungskennungen erfordern Web Crypto.

## Trennung der Versionshinweise

Modul-Changelogs liegen nun außerhalb von `docs/`, damit die Cognis-Dokumentationserkennung Versionshinweise nicht als Moduldokumentation darstellt.

## Lokalisierte Einstellungsdaten

Manifest-Einstellungen verweisen nun auf übersetzte Modultexte, die über die Sprachressourcen-URL des Moduls bereitgestellt werden. Browsercode nutzt vom Host bereitgestellte Gateway-Clients, und aus Cognis übernommene Qualitätsprüfungen erzwingen Formatierungsumfang, Lokalisierungsparität, Titelschreibweise und Komponententrennung.
