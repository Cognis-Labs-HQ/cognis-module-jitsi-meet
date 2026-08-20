# Host-Rückmeldungen

## Protokollierung und Hinweise

Browserfehler verwenden nun die Cognis-Fähigkeit `ui:log`, vorübergehende Hinweise `ui:showToast` und schwerwiegende Fehler beim Seitenaufbau öffnen über `ui:openErrorPopup` den Fehlerberichtsdialog des Hosts. Server-Rückfallpfade verwenden jetzt die modulgebundene Funktion `ctx.log`.
