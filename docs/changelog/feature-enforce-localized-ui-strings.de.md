# Strikte UI-Lokalisierung

**Feature-Zweig:** `feature-enforce-localized-ui-strings`

## Sprachschlüssel ohne wörtliche Ersatztexte verlangen

Die KI-Anweisungen verbieten fest kodierte englische Benutzertexte in allen Abläufen. Fehlende Werte der bevorzugten Sprache dürfen dieselben Schlüssel der englischen XML-Ressourcen verwenden. Fehlende oder leere englische Ersatzwerte müssen ausdrücklich einen Fehler auslösen, statt englische Literale, rohe Schlüssel oder leeren Text anzuzeigen. Fehler wegen fehlender Übersetzungen dürfen nicht unterdrückt werden.

## Commits

- [8ae9e14](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/8ae9e14d7b6aa26afc692fe7475d74be12c023c9)
