# Kniffel

## Besonderheiten
- Online-Block (Dateien siehe `README.md`): 1–8 Spieler auf einem Gerät,
  gespeichert nur in `localStorage` (`hostelgames:kniffel:scoresheet`), kein Server, kein Teilen.
  Konzept: Projekt-Doku „kniffel-block-konzept.md“. Rahmen, Ansichten und Styles liegen im Core
  (`packages/core`, nur Core-Farben); im Spiel nur die Regeln in `src/assets/scoresheet.js`.
- Strategie (`src/strategy.njk`): die Wahrscheinlichkeiten in der Chancen-Tabelle sind exakt
  gerechnet – bei Änderungen neu rechnen.

## Begriffe
- Feste Namen der Felder: de Einser … Sechser, Dreierpasch, Viererpasch, Full House,
  Kleine Straße, Große Straße, Kniffel, Chance; en Ones … Sixes, Three of a kind,
  Four of a kind, Full house, Small straight, Large straight, Kniffel, Chance.
- Auch im Englischen heißt das Spiel „Kniffel“; Yahtzee/Yatzy nur als Verwandte (FAQ).
