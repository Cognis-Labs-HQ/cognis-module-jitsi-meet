# Automatische Entsperrung nach Neuverbindungen wiederherstellen

**Feature-Branch:** feature-fix-automatic-password-unlocking-for-pip-windows

## Gespeichertes Kennwort nach bestätigtem Beitritt erneut verwenden

Jitsi-Neuverbindungen übermitteln das aufgelöste Besprechungskennwort nun automatisch erneut, nachdem der Konferenzbeitritt bereits bestätigt wurde. Dies gilt auch für Neuverbindungen beim Verschieben einer Besprechung in Bild-in-Bild unter macOS. Eine wiederholte Anforderung vor dem ersten Beitritt öffnet weiterhin die Schlüsselbundkorrektur für ein abgelehntes Kennwort.

## Eingebettete Besprechung beim Verschieben beibehalten

Die Bild-in-Bild-Anforderung weist den Host nun an, den Browsing-Kontext des Jitsi-Iframes beim Verschieben seines Frames beizubehalten. Dies adressiert, dass Safari den eingebetteten Kontext beim Wechsel des DOM-Elternelements neu erstellen kann; die automatische Kennwortwiederherstellung bleibt als Rückfall erhalten.

## Commits

- [ec5ae21](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/ec5ae213f8288e7b6fc1325493e972fb2624010b)
- [e47e3d0](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/e47e3d0be4d37fe1ddb119a442ccd10adf512e86)
