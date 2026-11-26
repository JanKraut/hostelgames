# President

Webseite zum Kartenspiel President, Teil des Monorepos hostelgames.
**Entwurf** (`status: draft`): nur in der Vorschau unter
https://jankraut.github.io/hostelgames/presidentsgame/, noch nicht auf presidentsgame.de.

```sh
npm run start:president                       # Dev-Server: http://localhost:8080/hostelgames/presidentsgame/
npm run build:president                       # nach games/president/_site/
npm test -w @hostelgames/president            # Tests (vorher bauen)
```

| Pfad | Inhalt |
| --- | --- |
| `game.json` | Name, Domain, Status, Sprachen, Seiten, ähnliche Spiele (Felder: Root-README) |
| `src/index.njk` | Regelseite, einmal pro Sprache |
| `src/strategy.njk` | Strategieseite |
| `src/_includes/hero-art.njk` | Kartenfächer im Kopfbereich |
| `src/_includes/factsheet-art.njk` | Kartenbild im Steckbrief |
| `src/_data/i18n/*.json` | Texte, Referenz `en.json` |
| `src/assets/styles.css` | eigene Styles zusätzlich zu `core.css` |
| `tests/site.spec.js` | Playwright-Tests |
