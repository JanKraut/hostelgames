# Bridge

Webseite zum Kartenspiel Bridge (Kontrakt- / Rubber-Bridge), Teil des Monorepos
[hostelgames](../../README.md).
**Entwurf** (`status: draft`): nur in der Vorschau unter
https://jankraut.github.io/hostelgames/bridge/. Noch keine eigene Domain.

Design, Schrift, Layout (`layout: game`), Kopf/Footer, Sprachmenü, Teilen-Box, Steckbrief,
404-Seite, Sitemap, Offline-Service-Worker, Konfiguration (`eleventy.config.js`,
`playwright.config.js`), Übersetzungsprüfung (`check-i18n`) und Basis-Tests kommen aus
[`@hostelgames/core`](../../packages/core/README.md).

```sh
npm run start:bridge                     # Dev-Server: http://localhost:8080/hostelgames/bridge/
npm run build:bridge                     # prüft Texte und baut nach games/bridge/_site/
npm test -w @hostelgames/bridge          # Playwright-Tests (vorher bauen)
```

| Pfad | Inhalt |
| --- | --- |
| `game.json` | Name, Kategorie, Status, Sprachen, Seiten, Steckbrief (Felder: [Root-README](../../README.md#gamejson)) |
| `src/index.njk` | Regelseite (`/`, `/de/` …) |
| `src/strategy.njk` | Strategieseite (Figurenpunkte, Reizung, Alleinspiel, Gegenspiel; `/strategy/`, `/de/strategy/` …) |
| `src/quickstart.njk` | Quickstart: Spickzettel für den Tisch (`/quickstart/`, `/de/quickstart/` …) |
| `src/_includes/hero-art.njk` | Kartenfächer im Kopfbereich |
| `src/_includes/factsheet-art.njk` | Kartenbild im Steckbrief |
| `src/_data/i18n/*.json` | Texte (`en` + `de`, Referenz `en.json`) |
| `src/assets/favicon.svg` | Favicon |
| `src/assets/styles.css` | eigene Styles zusätzlich zu `core.css` |
| `tests/site.spec.js`, `tests/pages.spec.js` | Playwright-Tests (`siteTests` aus dem Core + spielspezifische Checks) |
| Aus dem Core | Seitenrahmen, Seitenreiter, Weiterleitung, Teilen-Box, 404-Seite, Sitemap, `eleventy.config.js`, `playwright.config.js`, Adresse und Sprachen – siehe [`packages/core/README.md`](../../packages/core/README.md) |
