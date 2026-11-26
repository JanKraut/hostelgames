# King’s Cup

Webseite zum Trinkspiel King’s Cup (auch Ring of Fire oder Circle of Death), Teil des Monorepos
hostelgames. **Entwurf** (`status: draft`): nur in der Vorschau unter
https://jankraut.github.io/hostelgames/kingscup/. Noch keine eigene Domain.

```sh
npm run start:kingscup                   # Dev-Server: http://localhost:8080/hostelgames/kingscup/
npm run build:kingscup                   # nach games/kingscup/_site/
npm test -w @hostelgames/kingscup        # Tests (vorher bauen)
```

| Pfad | Inhalt |
| --- | --- |
| `game.json` | Name, Kategorie, Status, Sprachen, Seiten (Felder: Root-README) |
| `src/index.njk` | Regelseite, einmal pro Sprache |
| `src/_includes/ring.njk` | Kartenring mit Becher (Kopfbereich, Aufbau) |
| `src/_includes/hero-art.njk` | Kartenring im Kopfbereich |
| `src/_includes/factsheet-art.njk` | Karten und Becher im Steckbrief |
| `src/_data/i18n/*.json` | Texte, Referenz `en.json` |
| `src/assets/styles.css` | eigene Styles zusätzlich zu `core.css` |
| `tests/site.spec.js` | Playwright-Tests |
