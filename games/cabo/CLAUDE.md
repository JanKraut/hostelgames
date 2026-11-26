# Cabo

Kartenspiel (`category: cards`) · Domain: cabogame.de · Ordner: cabogame · Slug: cabo · Status: draft · Sprachen: 2 (en, de)
Ähnliches Spiel: `cambio` (gegenseitig in `related` der `game.json`)

## Stand
- Regelseite (`src/index.njk`), Strategie (`src/strategy.njk`) und Quickstart (`src/quickstart.njk`)
  mit Texten `de` + `en`.

## Regeln für dieses Spiel
- Nur Dateien in `games/cabo/` ändern. Fehlt etwas im Core, Jan fragen.
- Core-Basis: `layout: game`, Konfiguration (`eleventy.config.js`, `playwright.config.js`),
  `site`/`languages`/Sitemap, Hero, Steckbrief, Karten (`card.njk`), Bausteine (`blocks.njk`),
  404-Seite, Teilen-Box, Sprachmenü, Footer und `siteTests` kommen aus `@hostelgames/core`.
- Eigene Styles nur in `src/assets/styles.css`.
- Live gehen: `status` in `game.json` auf `"live"` – nur wenn Jan es sagt.
- Kein Spiel gegen Bots (`play`), solange Jan es nicht ausdrücklich sagt.
