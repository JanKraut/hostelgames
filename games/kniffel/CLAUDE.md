# Kniffel

Würfelspiel (`category: dice`) · Domain: noch keine · Ordner: kniffel · Slug: kniffel · Status: draft

## Stand
- Regelseite (src/index.njk) mit Texten de + en.
- Steckbrief im Kopfbereich (src/_includes/factsheet.njk, Texte unter `info`): gleicher Aufbau
  wie bei Shithead, mit Würfeln statt Karten. Styles als Core-Kandidat markiert.
- Würfel kommen aus src/_includes/dice.njk (`die(n, size, extra)`, `dice([...])`),
  Styles in src/assets/styles.css. Kein Core-Include, weil bisher nur Kniffel würfelt;
  beim zweiten Würfelspiel in den Core verschieben.
- Online-Block (src/scoresheet.njk, src/assets/scoresheet.js, Seite `scoresheet` in game.json):
  1–8 Spieler auf einem Gerät, gespeichert nur in localStorage (`hostelgames:kniffel:scoresheet`),
  kein Server, kein Teilen. Konzept: Projekt-Doku „kniffel-block-konzept.md“. Styles am Ende von
  styles.css (nur Core-Farben). Beim zweiten Block-Spiel Logik und Styles in den Core verschieben.
- Nächste Schritte: ggf. Strategie / Quickstart / Spielblock zum Ausdrucken
  (Datei anlegen UND in `pages` der game.json eintragen, sonst bricht der Build ab).
- Domain festlegen, dann `domain` in game.json setzen (Ordner = Domain ohne Endung).
- Kein Spiel gegen Bots (play), solange Jan es nicht ausdrücklich sagt.

## Begriffe
- Feste Namen der Felder: de Einser … Sechser, Dreierpasch, Viererpasch, Full House,
  Kleine Straße, Große Straße, Kniffel, Chance; en Ones … Sixes, Three of a kind,
  Four of a kind, Full house, Small straight, Large straight, Kniffel, Chance.
- Auch im Englischen heißt das Spiel „Kniffel“; Yahtzee/Yatzy nur als Verwandte (FAQ).

## Regeln für dieses Spiel
- Nur Dateien in games/kniffel/ ändern. Fehlt etwas im Core, Jan fragen.
- Layout aus dem Core: `layout: game`; Reiter, Teilen-Box, Sprachmenü, Footer sind Core-Includes.
- Eigene Styles nur in src/assets/styles.css.
- Live gehen: `status` in game.json auf "live" – nur wenn Jan es sagt.
