# Kniffel

Webseite zum Würfelspiel Kniffel, Teil des Monorepos hostelgames.
**Entwurf** (`status: draft`): nur in der Vorschau unter
https://jankraut.github.io/hostelgames/kniffel/. Noch keine eigene Domain.

```sh
npm run start:kniffel                    # Dev-Server: http://localhost:8080/hostelgames/kniffel/
npm run build:kniffel                    # nach games/kniffel/_site/
npm test -w @hostelgames/kniffel         # Tests (vorher bauen)
```

| Pfad | Inhalt |
| --- | --- |
| `game.json` | Name, Kategorie, Status, Sprachen, Seiten (Felder: Root-README) |
| `src/index.njk` | Regelseite, einmal pro Sprache |
| `src/_includes/dice.njk` | Würfel als HTML (Makros `die` und `dice`) |
| `src/404.njk` | Fehlerseite |
| `src/_data/i18n/*.json` | Texte, Referenz `en.json` |
| `src/assets/styles.css` | eigene Styles zusätzlich zu `core.css` |
| `tests/site.spec.js` | Playwright-Tests |
