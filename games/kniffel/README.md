# Kniffel

Webseite zum Würfelspiel Kniffel, Teil des Monorepos [hostelgames](../../README.md).
**Live** (`status: live`): unter https://hostelgames.com/kniffel/ (noch keine eigene Domain).

Standard-Aufbau und gemeinsame Teile siehe [Aufbau eines Spiels](../../README.md#aufbau-eines-spiels)
und [`@hostelgames/core`](../../packages/core/README.md); aktive Seiten, Sprachen und Status stehen
in [`game.json`](game.json).

```sh
npm run start:kniffel                    # Dev-Server: http://localhost:8080/hostelgames/kniffel/
npm run build:kniffel                    # prüft Texte und baut nach games/kniffel/_site/
npm test -w @hostelgames/kniffel         # Playwright-Tests (vorher bauen)
```

## Besonderheiten

- `src/scoresheet.njk`, `src/assets/scoresheet.js` – Online-Spielblock (ohne Server, nur `localStorage`).
- `tests/pages.spec.js`, `tests/scoresheet.spec.js` – zusätzliche Tests für Strategie, Quickstart und Spielblock.
