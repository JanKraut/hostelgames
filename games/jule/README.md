# Jule

Webseite zum Würfelspiel Jule (mit der Variante Stumme Jule), Teil des Monorepos hostelgames.
**Entwurf** (`status: draft`): nur in der Vorschau unter https://jankraut.github.io/hostelgames/jule/.
Noch keine eigene Domain.

```sh
npm run start:jule                   # Dev-Server: http://localhost:8080/hostelgames/jule/
npm run build:jule                   # nach games/jule/_site/
npm test -w @hostelgames/jule        # Tests (vorher bauen)
```

| Pfad | Inhalt |
| --- | --- |
| `game.json` | Name, Kategorie, Status, Sprachen, Seiten (Felder: Root-README) |
| `src/index.njk` | Regelseite, einmal pro Sprache |
| `src/_includes/hero-art.njk` | Würfel im Kopfbereich |
| `src/_includes/factsheet-art.njk` | Bild im Steckbrief |
| `src/_data/i18n/*.json` | Texte, Referenz `en.json` |
| `src/assets/styles.css` | eigene Styles zusätzlich zu `core.css` |
| `tests/site.spec.js` | Playwright-Tests |
