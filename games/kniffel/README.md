# Kniffel

Webseite zum Würfelspiel Kniffel, Teil des Monorepos [hostelgames](../../README.md).
**Live** (`status: live`): unter https://hostelgames.com/kniffel/ (noch keine eigene Domain).

Standard-Aufbau und gemeinsame Teile siehe [Aufbau eines Spiels](../../README.md#aufbau-eines-spiels)
und [`@hostelgames/core`](../../packages/core/README.md); aktive Seiten, Sprachen und Status stehen
in [`game.json`](game.json).

## Besonderheiten

- `src/scoresheet.njk`, `src/assets/scoresheet.js` – Online-Spielblock (ohne Server, nur `localStorage`).
- `tests/pages.spec.js`, `tests/scoresheet.spec.js` – zusätzliche Tests für Strategie, Quickstart und Spielblock.
