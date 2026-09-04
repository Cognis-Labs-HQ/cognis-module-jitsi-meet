# Sicherere, anbieterneutrale VoIP-Anrufe

**Feature-Branch:** work

## Anrufe anhand der kanonischen Raummitgliedschaft autorisieren

Der VoIP-Endpunkt lässt nun den vertrauenswürdigen Messages-Raumauflöser die anfragende Person autorisieren und die vollständige Teilnehmerliste ableiten. Vom Client übermittelte Mitgliederlisten können keine Teilnehmenden mehr bestimmen.

## Eine Raumzuordnung sicher wiederverwenden

Verfügbare Anrufe verwenden nun die vorhandene Chatraumreferenz, die durch eine eindeutige Schemabedingung geschützt ist. Gleichzeitige Anfragen verwenden das zuerst erstellte Meeting, ohne ein zweites Quellraumfeld einzuführen, und die Bereinigung erhält die anbietereigene Unterhaltung.

## Anbieteranrufe lokalisieren und ordnungsgemäß beenden

Der Anbieter verwendet neutrale VoIP-Begriffe, übernimmt einen vom Verbraucher angegebenen Betreff und nutzt andernfalls einen lokalisierten Betreff. Beim Schließen der Host-Komponente wird nun die reguläre Anwesenheitsbereinigung vor dem Beenden von Jitsi ausgeführt.

## Commits

- [6e02bef](https://github.com/Cognis-Labs-HQ/cognis-module-jitsi-meet/commit/6e02befec71d6adcd77a18e5a56487f835ee91bd)
