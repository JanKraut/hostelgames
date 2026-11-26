# Kniffel

Würfelspiel (`category: dice`) · Domain: noch keine · Ordner: kniffel · Slug: kniffel · Status: live · Sprachen: 15

## Stand
- Regelseite (`src/index.njk`), Quickstart (`src/quickstart.njk`), Online-Block
  (`src/scoresheet.njk`) und Strategie (`src/strategy.njk`) komplett in 15 Sprachen.
- Eigenes Bild im Steckbrief: `src/_includes/factsheet-art.njk`, die fünf Würfel im Kopf:
  `src/_includes/hero-art.njk`.
- Online-Block (`src/scoresheet.njk`, `src/assets/scoresheet.js`, Seite `scoresheet` in
  `game.json`): 1–8 Spieler auf einem Gerät, gespeichert nur in `localStorage`
  (`hostelgames:kniffel:scoresheet`), kein Server, kein Teilen. Konzept: Projekt-Doku
  „kniffel-block-konzept.md“. Styles am Ende von `src/assets/styles.css` (nur Core-Farben).
  Beim zweiten Block-Spiel Logik und Styles in den Core verschieben.
- Strategie (`src/strategy.njk`): die Wahrscheinlichkeiten in der Chancen-Tabelle sind exakt
  gerechnet – bei Änderungen neu rechnen.
- Nächste Schritte: ggf. Spielblock zum Ausdrucken (Datei anlegen UND in `pages` der `game.json`
  eintragen, sonst bricht der Build ab); Domain festlegen, dann `domain` in `game.json` setzen
  (Ordner = Domain ohne Endung).

## Begriffe
- Feste Namen der Felder: de Einser … Sechser, Dreierpasch, Viererpasch, Full House,
  Kleine Straße, Große Straße, Kniffel, Chance; en Ones … Sixes, Three of a kind,
  Four of a kind, Full house, Small straight, Large straight, Kniffel, Chance.
- Auch im Englischen heißt das Spiel „Kniffel“; Yahtzee/Yatzy nur als Verwandte (FAQ).

## Regeln für dieses Spiel
- Nur Dateien in `games/kniffel/` ändern. Fehlt etwas im Core, Jan fragen.
- Core-Basis: `layout: game`, Konfiguration (`eleventy.config.js`, `playwright.config.js`),
  `site`/`languages`/Sitemap, Hero, Steckbrief, Würfel (`dice.njk`: `die(n, size, extra)`,
  `dice([...])`), Bausteine (`blocks.njk`), 404-Seite, Teilen-Box, Sprachmenü, Footer und
  `siteTests` kommen aus `@hostelgames/core`.
- Eigene Styles nur in `src/assets/styles.css`.
- Status ist `live` (unter `hostelgames.com/kniffel/`); Änderungen am Status nur auf Wunsch von Jan.
- Kein Spiel gegen Bots (`play`), solange Jan es nicht ausdrücklich sagt.
