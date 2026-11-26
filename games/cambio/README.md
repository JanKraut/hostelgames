# Cambio

Webseite zum Kartenspiel Cambio, Teil des Monorepos hostelgames.
**Entwurf** (`status: draft`): nur in der Vorschau unter
https://jankraut.github.io/hostelgames/cambiogame/, noch nicht auf cambiogame.de.

```sh
npm run start:cambio                       # Dev-Server: http://localhost:8080/hostelgames/cambiogame/
npm run build:cambio                       # nach games/cambio/_site/
npm test -w @hostelgames/cambio            # Tests (vorher bauen)
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
