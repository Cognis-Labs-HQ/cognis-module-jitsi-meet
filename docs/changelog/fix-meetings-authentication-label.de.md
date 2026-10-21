# Besprechungslabels reparieren

**Feature-Zweig:** fix-meetings-authentication-label

## Authentifizierung wiederherstellen

1.5.262 — Die Besprechungsansicht stellt die Beschriftung der Authentifizierungsschaltfläche in allen vier unterstützten Sprachen bereit. Regressionstests rendern die Seitenelemente mit den tatsächlichen Sprachkatalogen, damit fehlende Vorlagenübersetzungen vor der Veröffentlichung auffallen.

## Übersetzungsabdeckung prüfen

Modulreferenzen, Manifestbeschriftungen sowie dynamisch ausgewählte Verwaltungsfilter, Probleme, Aktionen und Bestätigungen werden gegen alle vier tatsächlichen Sprachkataloge geprüft. Die Prüfung fand keine weiteren fehlenden Laufzeittexte; das Rückmeldungsbeispiel verwendet einen vorhandenen Schlüssel.

## Commits

- [feedcc1c](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/feedcc1cd007336610fa8c1be6287c6589544f58)
