# Cabo

Webseite zum Kartenspiel Cabo, Teil des Monorepos [hostelgames](../../README.md).

## Besonderheiten

- `src/scoresheet.njk`, `src/assets/scoresheet.js` – Online-Block (ohne Server, nur `localStorage`). Rundenblock: Kartensummen je Runde, Ansager mit 10 Strafpunkten, Spielende über 100, genau 100 → 50 (`cardRoundsRules` aus dem Core).
- `tests/scoresheet.spec.js` – Tests für den Block.
