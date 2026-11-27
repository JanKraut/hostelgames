# Cambio

Webseite zum Kartenspiel Cambio, Teil des Monorepos [hostelgames](../../README.md).

## Besonderheiten

- `src/scoresheet.njk`, `src/assets/scoresheet.js` – Online-Block (ohne Server, nur `localStorage`). Rundenblock: Kartensummen je Runde (auch negativ), optionale Strafe für den Ansager, Spielende über 100 (`cardRoundsRules` aus dem Core).
- `tests/scoresheet.spec.js` – Tests für den Block.
