# Kniffel

Webseite zum Würfelspiel Kniffel, Teil des Monorepos [hostelgames](../../README.md).
**Live** (`status: live`): unter https://hostelgames.com/kniffel/ (noch keine eigene Domain).

Design, Schrift, Layout (`layout: game`), Kopf/Footer, Sprachmenü, Teilen-Box, Steckbrief,
404-Seite, Sitemap, Offline-Service-Worker, Konfiguration (`eleventy.config.js`,
`playwright.config.js`), Übersetzungsprüfung (`check-i18n`) und Basis-Tests kommen aus
[`@hostelgames/core`](../../packages/core/README.md).

```sh
npm run start:kniffel                    # Dev-Server: http://localhost:8080/hostelgames/kniffel/
npm run build:kniffel                    # prüft Texte und baut nach games/kniffel/_site/
npm test -w @hostelgames/kniffel         # Playwright-Tests (vorher bauen)
```

| Pfad | Inhalt |
| --- | --- |
| `game.json` | Name, Kategorie, Status, Sprachen, Seiten, Steckbrief (Felder: [Root-README](../../README.md#gamejson)) |
| `src/index.njk` | Regelseite (`/`, `/de/` …) |
| `src/quickstart.njk` | Quickstart: Spickzettel für den Tisch (`/quickstart/`, `/de/quickstart/` …) |
| `src/scoresheet.njk` | Online-Spielblock (ohne Server, nur `localStorage`; `/scoresheet/`, `/de/scoresheet/` …) |
| `src/strategy.njk` | Strategieseite (Bonus, Wahrscheinlichkeiten, Streichen; `/strategy/`, `/de/strategy/` …) |
| `src/_includes/hero-art.njk` | Würfel im Kopfbereich |
| `src/_includes/factsheet-art.njk` | Würfel und Block im Steckbrief |
| `src/_data/i18n/*.json` | Texte (15 Sprachen, Referenz `en.json`) |
| `src/assets/favicon.svg` | Favicon |
| `src/assets/scoresheet.js` | Logik des Online-Spielblocks |
| `src/assets/styles.css` | eigene Styles zusätzlich zu `core.css` |
| `tests/site.spec.js`, `tests/pages.spec.js`, `tests/scoresheet.spec.js` | Playwright-Tests (`siteTests` aus dem Core + Seiten- und Spielblock-Tests) |
| Aus dem Core | Seitenrahmen, Seitenreiter, Weiterleitung, Teilen-Box, 404-Seite, Sitemap, `eleventy.config.js`, `playwright.config.js`, Adresse und Sprachen – siehe [`packages/core/README.md`](../../packages/core/README.md) |
