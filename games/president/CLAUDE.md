# President

Kartenspiel (`category: cards`) · Domain: presidentsgame.de · Ordner: presidentsgame · Slug: president · Status: draft · Sprachen: 2 (en, de)
Ähnliches Spiel: `asshole` (gegenseitig in `related` der `game.json`)

## Stand
- Regelseite (`src/index.njk`), Strategie (`src/strategy.njk`) und Quickstart (`src/quickstart.njk`)
  mit Texten `de` + `en`.
- Grundregeln: 3 niedrigste, 2 höchste Karte; 3♣ eröffnet die erste Runde, danach der Präsident;
  Bettler gibt 2 beste Karten, Vize-Bettler 1. Alles andere (Revolution, Gleiche überspringen,
  2 räumt ab …) nur als Variante.

## Begriffe
- Ränge: President / Präsident, Vice-President / Vizepräsident, Citizen / Bürger,
  Vice-Scum / Vize-Bettler, Scum / Bettler – in allen Sprachen diese Rollen.

## Regeln für dieses Spiel
- Nur Dateien in `games/president/` ändern. Fehlt etwas im Core, Jan fragen.
- Core-Basis: `layout: game`, Konfiguration (`eleventy.config.js`, `playwright.config.js`),
  `site`/`languages`/Sitemap, Hero, Steckbrief, Karten (`card.njk`), Bausteine (`blocks.njk`),
  404-Seite, Teilen-Box, Sprachmenü, Footer und `siteTests` kommen aus `@hostelgames/core`.
- Eigene Styles nur in `src/assets/styles.css`.
- Live gehen: `status` in `game.json` auf `"live"` – nur wenn Jan es sagt.
- Kein Spiel gegen Bots (`play`), solange Jan es nicht ausdrücklich sagt.
