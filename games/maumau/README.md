# Mau-Mau

Webseite zum Kartenspiel Mau-Mau, Teil des Monorepos hostelgames.
**Entwurf** (`status: draft`): nur in der Vorschau unter https://jankraut.github.io/hostelgames/maumau/.
Noch keine eigene Domain.

```sh
npm run start:maumau                   # Dev-Server: http://localhost:8080/hostelgames/maumau/
npm run build:maumau                   # nach games/maumau/_site/
npm test -w @hostelgames/maumau        # Tests (vorher bauen)
```

| Pfad | Inhalt |
| --- | --- |
| `game.json` | Name, Kategorie, Status, Sprachen, Seiten (Felder: Root-README) |
| `src/index.njk` | Regelseite, einmal pro Sprache |
| `src/_includes/hero-art.njk` | Kartenfächer im Kopfbereich |
| `src/_includes/factsheet-art.njk` | Kartenbild im Steckbrief |
| `src/_data/i18n/*.json` | Texte, Referenz `en.json` |
| `src/assets/styles.css` | eigene Styles zusätzlich zu `core.css` |
| `tests/site.spec.js` | Playwright-Tests |
