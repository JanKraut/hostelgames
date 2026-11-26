# Shithead

Kartenspiel (`category: cards`) · Domain: shitheadgame.de · Ordner: shitheadgame · Slug: shithead · Status: live · Sprachen: 15
Gehört inhaltlich zu mut-im-rucksack.de: beim Design hat Mut im Rucksack das letzte Wort.

## Stand
- Regelseite (`src/index.njk`), Strategie (`src/strategy.njk`), Quickstart (`src/quickstart.njk` –
  Spickzettel, muss auf einen Handybildschirm passen, Kopfbereich wie bei den Regeln) und Spiel
  gegen Bots (`src/play.njk`, `src/assets/game/`) komplett in 15 Sprachen.
- Übungsquiz: Rahmen, Ablauf und Standardtexte kommen aus dem Core (`quiz.njk`,
  `assets/core/quiz.js`); hier liegen nur die Spielregel (`src/assets/quiz.js`) und die Texte
  `qH`, `qLead`, `qQ`, `qTop`, `qMine`, `qNext`, `quiz.*`.
- Eigene Includes: `hero-art.njk`, `factsheet-players.njk`, `factsheet-gear.njk`,
  `notfound-art.njk`, `shithead-card.njk`, `specials.njk`.
- Root-/PWA-Dateien: `src/favicon.ico`, `src/manifest.webmanifest`, `src/.htaccess` (nur für die
  eigene Domain `shitheadgame.de`), PNG-Icons, `src/assets/og-image.png`, `src/assets/site.js`
  (Redirects alter deutscher `#abschnitt`-Links).
- Tests: `tests/site.spec.js` (Seiten), `tests/play.spec.js` (Bot-Spiel), `tests/engine.spec.js`
  (Spielregeln und Simulationen).

## Begriffe
- „Four of a Kind Burn“, nicht „Vierling“ – in allen Sprachen.

## Regeln für dieses Spiel
- Nur Dateien in `games/shithead/` ändern. Fehlt etwas im Core, Jan fragen.
- Core-Basis: `layout: game`, Konfiguration (`eleventy.config.js`, `playwright.config.js`),
  `site`/`languages`/Sitemap, Hero, Steckbrief, Karten (`card.njk`), Quiz (`quiz.njk`), Bausteine
  (`blocks.njk`), 404-Seite, Teilen-Box, Sprachmenü, Footer und `siteTests` kommen aus
  `@hostelgames/core`.
- Eigene Styles nur in `src/assets/styles.css` (bzw. `src/assets/game/game.css` fürs Bot-Spiel).
- `src/play.njk` und `src/assets/game/` beim Umbau vorerst nicht anfassen; bei Änderungen an
  `src/assets/game/` immer `engine.spec.js` und `play.spec.js` laufen lassen.
- Jan liefert neue Texte meist auf Deutsch, einen nach dem anderen → `de` + `en` anpassen, die
  übrigen 13 Sprachen nur auf Wunsch (`docs/alle-sprachen.md`).
- Status ist `live` (auf `shitheadgame.de` und `hostelgames.com/shitheadgame/`); Änderungen am
  Status nur auf Wunsch von Jan.
