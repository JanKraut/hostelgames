# King’s Cup

Webseite zum Trinkspiel King’s Cup (auch Ring of Fire oder Circle of Death), Teil des Monorepos
[hostelgames](../../README.md).
**Entwurf** (`status: draft`): nur in der Vorschau unter
https://jankraut.github.io/hostelgames/kingscup/. Noch keine eigene Domain.

Design, Schrift, Layout (`layout: game`), Kopf/Footer, Sprachmenü, Teilen-Box, Steckbrief,
404-Seite, Sitemap, Offline-Service-Worker, Konfiguration (`eleventy.config.js`,
`playwright.config.js`), Übersetzungsprüfung (`check-i18n`) und Basis-Tests kommen aus
[`@hostelgames/core`](../../packages/core/README.md).

```sh
npm run start:kingscup                   # Dev-Server: http://localhost:8080/hostelgames/kingscup/
npm run build:kingscup                   # prüft Texte und baut nach games/kingscup/_site/
npm test -w @hostelgames/kingscup        # Playwright-Tests (vorher bauen)
```

| Pfad | Inhalt |
| --- | --- |
| `game.json` | Name, Kategorie, Status, Sprachen, Seiten, Steckbrief (Felder: [Root-README](../../README.md#gamejson)) |
| `src/index.njk` | Regelseite (`/`, `/de/` …) |
| `src/_includes/hero-art.njk` | Kartenring im Kopfbereich |
| `src/_includes/factsheet-art.njk` | Karten und Becher im Steckbrief |
| `src/_includes/ring.njk` | Kartenring mit Becher (Kopfbereich, Aufbau) |
| `src/_data/i18n/*.json` | Texte (15 Sprachen, Referenz `en.json`) |
| `src/assets/favicon.svg` | Favicon |
| `src/assets/styles.css` | eigene Styles zusätzlich zu `core.css` |
| `tests/site.spec.js` | Playwright-Tests (`siteTests` aus dem Core + spielspezifische Checks) |
| Aus dem Core | Seitenrahmen, Seitenreiter, Weiterleitung, Teilen-Box, 404-Seite, Sitemap, `eleventy.config.js`, `playwright.config.js`, Adresse und Sprachen – siehe [`packages/core/README.md`](../../packages/core/README.md) |
