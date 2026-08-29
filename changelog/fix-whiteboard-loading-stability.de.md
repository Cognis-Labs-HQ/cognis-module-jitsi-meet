# Whiteboard-Ladevorgang stabilisieren

- **Feature-Branch:** `fix-whiteboard-loading-stability`
- **Commits:**
    - `7141534` — Whiteboard-Ladevorgang und Sitzungssynchronisierung stabilisieren
    - `12ad748` — Whiteboard-Versionshinweise zusammenführen

## Änderungen

Whiteboard-Komponentenseiten werden einmal pro Besprechungs-Mount angefordert und Wiederholungen für Komponentenfenster bleiben begrenzt. Während die Schlüsselbundabfrage oder das Einbinden aussteht, bleibt das Steuerelement mit seiner normalen Beschriftung deaktiviert und ändert sich erst nach erfolgreicher Einbindung in „Whiteboard schließen“. Abgebrochene veraltete Einbindungen zeigen keine Fehlermeldungen mehr, dauerhafte Arbeitsflächen öffnen sich nur durch den ausdrücklichen Zustand der aktuellen Sitzung, und das Beenden oder Neustarten einer Besprechung löscht diesen Zustand.
