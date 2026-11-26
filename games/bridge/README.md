# Bridge

Webseite zum Kartenspiel Bridge (Kontrakt- / Rubber-Bridge), Teil des Monorepos hostelgames.
**Entwurf** (`status: draft`): nur in der Vorschau unter https://jankraut.github.io/hostelgames/bridge/.
Noch keine eigene Domain.

```sh
npm run start:bridge                   # Dev-Server: http://localhost:8080/hostelgames/bridge/
npm run build:bridge                   # nach games/bridge/_site/
npm test -w @hostelgames/bridge        # Tests (vorher bauen)
```

| Pfad | Inhalt |
| --- | --- |
| `game.json` | Name, Kategorie, Status, Sprachen, Seiten (Felder: Root-README) |
| `src/index.njk` | Regelseite, einmal pro Sprache |
| `src/strategy.njk` | Strategiesite (Figurenpunkte, Reizung, Alleinspiel, Gegenspiel) |
| `src/quickstart.njk` | Spickzettel für den Tisch |
| `src/_includes/hero-art.njk` | Kartenfächer im Kopfbereich |
| `src/_includes/factsheet-art.njk` | Kartenbild im Steckbrief |
| `src/_data/i18n/*.json` | Texte, Referenz `en.json` |
| `src/assets/styles.css` | eigene Styles zusätzlich zu `core.css` |
| `tests/site.spec.js`, `tests/pages.spec.js` | Playwright-Tests |
