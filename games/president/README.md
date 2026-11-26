# President

Webseite zum Kartenspiel President, Teil des Monorepos [hostelgames](../../README.md).
**Entwurf** (`status: draft`): nur in der Vorschau unter
https://jankraut.github.io/hostelgames/presidentsgame/, noch nicht auf presidentsgame.de.

Design, Schrift, Layout (`layout: game`), Kopf/Footer, Sprachmenü, Teilen-Box, Steckbrief,
404-Seite, Sitemap, Offline-Service-Worker, Konfiguration (`eleventy.config.js`,
`playwright.config.js`), Übersetzungsprüfung (`check-i18n`) und Basis-Tests kommen aus
[`@hostelgames/core`](../../packages/core/README.md).

```sh
npm run start:president                  # Dev-Server: http://localhost:8080/hostelgames/presidentsgame/
npm run build:president                  # prüft Texte und baut nach games/president/_site/
npm test -w @hostelgames/president       # Playwright-Tests (vorher bauen)
```

| Pfad | Inhalt |
| --- | --- |
| `game.json` | Name, Kategorie, Domain, Status, Sprachen, Seiten, Steckbrief, ähnliche Spiele (Felder: [Root-README](../../README.md#gamejson)) |
| `src/index.njk` | Regelseite (`/`, `/de/` …) |
| `src/strategy.njk` | Strategieseite (`/strategy/`, `/de/strategy/` …) |
| `src/quickstart.njk` | Quickstart: Spickzettel für den Tisch (`/quickstart/`, `/de/quickstart/` …) |
| `src/_includes/hero-art.njk` | Kartenfächer im Kopfbereich |
| `src/_includes/factsheet-art.njk` | Kartenbild im Steckbrief |
| `src/_data/i18n/*.json` | Texte (`en` + `de`, Referenz `en.json`) |
| `src/assets/favicon.svg` | Favicon |
| `src/assets/styles.css` | eigene Styles zusätzlich zu `core.css` |
| `tests/site.spec.js` | Playwright-Tests (`siteTests` aus dem Core + spielspezifische Checks) |
| Aus dem Core | Seitenrahmen, Seitenreiter, Weiterleitung, Teilen-Box, 404-Seite, Sitemap, `eleventy.config.js`, `playwright.config.js`, Adresse und Sprachen – siehe [`packages/core/README.md`](../../packages/core/README.md) |
