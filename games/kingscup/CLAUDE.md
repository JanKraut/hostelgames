# King’s Cup

Trinkspiel (`category: drinking`) · Domain: noch keine · Ordner: kingscup · Slug: kingscup · Status: draft · Sprachen: 15

## Stand
- Regelseite (`src/index.njk`) komplett in 15 Sprachen, aufgebaut wie Kniffel.
- Eigenes Bild im Steckbrief: `src/_includes/factsheet-art.njk`, Kartenring im Kopf:
  `src/_includes/hero-art.njk`; Kartenring und Becher (`src/_includes/ring.njk`) nur hier.
- Abschnitt „Verantwortungsvoll spielen“ (`#safe`) bleibt immer drin.
- Nächste Schritte: ggf. Quickstart (Spickzettel A–K fürs Handy; Datei anlegen UND in `pages`
  der `game.json` eintragen, sonst bricht der Build ab); Domain festlegen, dann `domain` in
  `game.json` setzen (Ordner = Domain ohne Endung).

## Begriffe
- Name in allen Sprachen „King’s Cup“; „Ring of Fire“ und „Circle of Death“ als andere Namen.
- Feste Namen der Karten en / de: A Waterfall / Wasserfall, 2 You / Du, 3 Me / Ich,
  4 Floor / Boden, 5 Guys / Jungs, 6 Girls / Mädels, 7 Heaven / Himmel, 8 Mate / Partner,
  9 Rhyme / Reim, 10 Categories / Kategorien, J Rule / Regel, Q Question Master / Fragemeister,
  K King’s Cup.
- Trinken wird in Schlucken angegeben, nie in Shots oder Mengen.

## Regeln für dieses Spiel
- Nur Dateien in `games/kingscup/` ändern. Fehlt etwas im Core, Jan fragen.
- Core-Basis: `layout: game`, Konfiguration (`eleventy.config.js`, `playwright.config.js`),
  `site`/`languages`/Sitemap, Hero, Steckbrief, Karten (`card.njk`), Bausteine (`blocks.njk`),
  404-Seite, Teilen-Box, Sprachmenü, Footer und `siteTests` kommen aus `@hostelgames/core`.
- Eigene Styles nur in `src/assets/styles.css`.
- Live gehen: `status` in `game.json` auf `"live"` – nur wenn Jan es sagt.
- Kein Spiel gegen Bots (`play`), solange Jan es nicht ausdrücklich sagt.
