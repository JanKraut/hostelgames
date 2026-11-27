# Schafkopf

Webseite zum bayerischen Kartenspiel Schafkopf, Teil des Monorepos [hostelgames](../../README.md).

## Besonderheiten

- `src/scoresheet.njk`, `src/assets/scoresheet.js` – Online-Block (ohne Server, nur `localStorage`). Rundenblock: Spielart, Spieler und Partner, Schneider/Schwarz, Laufende, Verdopplung; verteilt den Spielwert auf vier Spieler (`roundsRules` aus dem Core, Tarif 1 / 5 einstellbar).
- `tests/scoresheet.spec.js` – Tests für den Block.
