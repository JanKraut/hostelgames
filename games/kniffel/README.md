# Kniffel

Webseite zum Würfelspiel Kniffel, Teil des Monorepos hostelgames.
**Live** (`status: live`): unter https://hostelgames.com/kniffel/ (noch keine eigene Domain).

```sh
npm run start:kniffel                    # Dev-Server: http://localhost:8080/hostelgames/kniffel/
npm run build:kniffel                    # nach games/kniffel/_site/
npm test -w @hostelgames/kniffel         # Tests (vorher bauen)
```

| Pfad | Inhalt |
| --- | --- |
| `game.json` | Name, Kategorie, Status, Sprachen, Seiten (Felder: Root-README) |
| `src/index.njk` | Regelseite, einmal pro Sprache |
| `src/strategy.njk` | Strategieseite (Bonus, Wahrscheinlichkeiten, Streichen) |
| `src/quickstart.njk` | Spickzettel für den Tisch |
| `src/scoresheet.njk` | Online-Spielblock (ohne Server, nur `localStorage`) |
| `src/_includes/hero-art.njk` | Würfel im Kopfbereich |
| `src/_includes/factsheet-art.njk` | Würfel und Block im Steckbrief |
| `src/_data/i18n/*.json` | Texte, Referenz `en.json` |
| `src/assets/scoresheet.js` | Logik des Online-Spielblocks |
| `src/assets/styles.css` | eigene Styles zusätzlich zu `core.css` |
| `tests/site.spec.js`, `tests/pages.spec.js`, `tests/scoresheet.spec.js` | Playwright-Tests |
