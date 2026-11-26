# Anwendung

Nehmen Sie in Cognis an Videokonferenzen teil oder veranstalten Sie eigene.

## Voraussetzungen

Ein Administrator muss einen erreichbaren Jitsi-Server einrichten und Meetings aktivieren. Erlauben Sie bei Bedarf Kamera und Mikrofon. Geteilte Links unterliegen ihren Zugriffs- und Passwortregeln.

## Beispiele

Öffnen Sie Meetings, wählen Sie optional Teilnehmer und warten Sie auf die Verbindungsprüfung. Wählen Sie Start und laden Sie anschließend weitere Personen über die Freigabe ein.

- Unter Administration → Module eine HTTP(S)-Jitsi-Instanz konfigurieren, den Aktivierungstest ausführen und Jitsi Meet aktivieren. Administration → Meetings zeigt aktive und bevorstehende Meetings.
- Meetings öffnen, Teilnehmer auswählen und einen Raum starten oder betreten. Profilabhängige Operationen benötigen einen sichtbaren Profilnamen. Bestehende aktive Mitgliedschaft bleibt über die authentifizierte Kontoidentität auffindbar, wenn der Profilname nicht verfügbar ist.
- Einen verfügbaren Teilnehmer in ein laufendes Meeting ziehen, um Share-Zustimmung anzufordern. Eine Ablehnung stellt den Teilnehmer in der verfügbaren Liste wieder her und zeigt einen Toast.
- Whiteboard öffnet die Meeting-Canvas; Whiteboard schließen schließt sie. Bildschirmfreigabe deaktiviert den Schalter mit erklärendem Tooltip. Link-Gäste folgen dem Zustand des Organisators ohne sichtbaren Schalter.

Browser-Aufrufer beziehen die VoIP-Integration über den vom Host initialisierten Kontext:

```js
const startCall = uiCtx.capabilities.get("voip:startCall");
const action = await startCall({
    source: "messages",
    room: { id: roomId, kind: "group" },
    users: members,
    supportedActions: ["component"],
});
```

Die zurückgegebene Aktion beschreibt eine Meetings-Komponente, die der Aufrufer über den Component-Page-Vertrag des Hosts startet.

Der Ablauf erklärt Besprechungen und vorgemerkte Teilnehmer, ohne eine Besprechung zu betreten oder zu erstellen. Er erfordert eine authentifizierte Online-Sitzung.

## Erwartete Ergebnisse

Nach erfolgreicher Vorbereitung öffnet sich die Konferenz. Ein leeres Teilnehmerverzeichnis verhindert bei erfolgreicher Verbindungsprüfung keine eigenständige Konferenz.

## Fehlerbehebung

Prüfen Sie bei fehlgeschlagener Vorbereitung Jitsi-Adresse, Netzwerk und Browserberechtigungen. Bei abgelehnten Links fragen Sie den Eigentümer; die Teilnehmerauswahl behebt keine fehlgeschlagene Serverprüfung.
