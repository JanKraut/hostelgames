# Kniffel

Webseite zum Würfelspiel Kniffel, Teil des Monorepos [hostelgames](../../README.md).

## Besonderheiten

- `src/scoresheet.njk`, `src/assets/scoresheet.js` – Online-Spielblock (ohne Server, nur `localStorage`). Rahmen, Ansichten und Styles kommen aus dem Core (`includes/sheet.njk`, `assets/scoresheet.js`, `core.css`); hier liegen nur die Kniffel-Regeln (13 Felder, Bonus, Eingabe je Feldart).
- `tests/pages.spec.js`, `tests/scoresheet.spec.js` – zusätzliche Tests für Strategie, Quickstart und Spielblock.
