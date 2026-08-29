# Abschließende Review-Kommentare umsetzen und Whiteboard-Stabilität verbessern

Der Whiteboard-Zustand gilt jetzt nur für die aktive Besprechungssitzung, dauerhafte Arbeitsflächen öffnen sich nicht mehr allein beim Start einer Besprechung, und das Beenden oder Neustarten löscht den Öffnungszustand. Komponentenseiten werden einmal pro Besprechungs-Mount angefordert, Einbindungswiederholungen bleiben begrenzt und veraltete asynchrone Fenster werden verworfen, wenn Navigation oder Besprechungszustand ihre Anfrage überholt haben.

Das Whiteboard-Steuerelement bleibt während der Schlüsselbundabfrage oder Komponenteneinbindung mit seiner normalen Beschriftung deaktiviert. Erst nach erfolgreicher Einbindung des Komponentenfensters ändert es sich in „Whiteboard schließen“, und abgebrochene veraltete Einbindungen zeigen keine irreführenden Fehlermeldungen mehr.

Die Versionshinweise für diesen Pull Request verwenden jetzt genau einen lokalisierten, nach dem Feature-Branch benannten Changelog-Satz. Die Beitragsrichtlinien definieren den Dateinamen als Branch-Nachweis und verlangen pro Commit einen übersetzten Fließtextabsatz in chronologischer Reihenfolge, statt eines vom bestehenden Changelog-Format abweichenden Metadatenblocks.
