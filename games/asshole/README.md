# Asshole

Webseite zum Kartenspiel Asshole (Arschloch), Teil des Monorepos hostelgames.
**Entwurf** (`status: draft`): nur in der Vorschau unter
https://jankraut.github.io/hostelgames/assholegame/, noch nicht auf assholegame.de.

```sh
npm run start:asshole                       # Dev-Server: http://localhost:8080/hostelgames/assholegame/
npm run build:asshole                       # nach games/asshole/_site/
npm test -w @hostelgames/asshole            # Tests (vorher bauen)
```

| Pfad | Inhalt |
| --- | --- |
| `game.json` | Name, Domain, Status, Sprachen, Seiten, ähnliche Spiele (Felder: Root-README) |
| `src/index.njk` | Regelseite, einmal pro Sprache |
| `src/_includes/hero-art.njk` | Kartenfächer im Kopfbereich |
| `src/_includes/factsheet-art.njk` | Kartenbild im Steckbrief |
| `src/_data/i18n/*.json` | Texte, Referenz `en.json` |
| `src/assets/styles.css` | eigene Styles zusätzlich zu `core.css` |
| `tests/site.spec.js` | Playwright-Tests |
