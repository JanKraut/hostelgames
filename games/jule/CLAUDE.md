# Jule

Würfelspiel (`category: dice`) · Domain: noch keine · Ordner: jule · Slug: jule · Status: draft · Sprachen: 2 (en, de)

## Stand
- Regelseite (`src/index.njk`), Strategie (`src/strategy.njk`) und Quickstart (`src/quickstart.njk`)
  mit Texten `de` + `en`, aufgebaut wie Kniffel.
- Grundregeln: ein Würfel, reihum je ein Wurf; 1 bis 6 der Reihe nach notieren (Hinweg),
  dann 6 bis 1 streichen (Rückweg); für den Rückweg braucht es eine neue 6. Wer zuerst die 1
  streicht, gewinnt. Strafpunkte = Summe der noch fehlenden Zahlen (freiwillig).
- Stumme Jule als eigener Abschnitt (`#silent`): wer einen Ton macht, fängt bei der 1 neu an.
- Eigenes Bild im Steckbrief: `src/_includes/factsheet-art.njk`, im Kopf: `src/_includes/hero-art.njk`.
- Nächste Schritte: Domain festlegen, dann `domain` in `game.json` setzen.

## Begriffe
- Name in allen Sprachen „Jule“; Variante „Stumme Jule“ (en: Silent Jule).
- Hinweg / Rückweg (en: way there / way back).

## Regeln für dieses Spiel
- Nur Dateien in `games/jule/` ändern. Fehlt etwas im Core, Jan fragen.
- Core-Basis: `layout: game`, Konfiguration (`eleventy.config.js`, `playwright.config.js`),
  `site`/`languages`/Sitemap, Hero, Steckbrief, Würfel (`dice.njk`), Bausteine (`blocks.njk`),
  404-Seite, Teilen-Box, Sprachmenü, Footer und `siteTests` kommen aus `@hostelgames/core`.
- Eigene Styles nur in `src/assets/styles.css`.
- Live gehen: `status` in `game.json` auf `"live"` – nur wenn Jan es sagt.
- Kein Spiel gegen Bots (`play`), solange Jan es nicht ausdrücklich sagt.
