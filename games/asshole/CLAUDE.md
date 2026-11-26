# Asshole

Kartenspiel (`category: cards`) · Domain: assholegame.de · Ordner: assholegame · Slug: asshole · Status: draft · Sprachen: 2 (en, de)
Ähnliches Spiel: `president` (gegenseitig in `related` der `game.json`)

## Stand
- Regelseite (`src/index.njk`), Strategie (`src/strategy.njk`) und Quickstart (`src/quickstart.njk`)
  mit Texten `de` + `en`.
- Grundregeln: 32 Karten (7 bis Ass, Ass hoch), gleich viele höhere Karten legen, Passen jederzeit,
  Arschloch gibt 2 höchste an den König, Vize-Arschloch 1 an den Vize-König.

## Begriffe
- Feste Begriffe: König / Vize-König / Bürger / Vize-Arschloch / Arschloch
  (en: king / vice king / citizen / vice asshole / asshole), „drücken“ = Kartentausch.

## Regeln für dieses Spiel
- Nur Dateien in `games/asshole/` ändern. Fehlt etwas im Core, Jan fragen.
- Core-Basis: `layout: game`, Konfiguration (`eleventy.config.js`, `playwright.config.js`),
  `site`/`languages`/Sitemap, Hero, Steckbrief, Karten (`card.njk`), Bausteine (`blocks.njk`),
  404-Seite, Teilen-Box, Sprachmenü, Footer und `siteTests` kommen aus `@hostelgames/core`.
- Eigene Styles nur in `src/assets/styles.css`.
- Live gehen: `status` in `game.json` auf `"live"` – nur wenn Jan es sagt.
- Kein Spiel gegen Bots (`play`), solange Jan es nicht ausdrücklich sagt.
