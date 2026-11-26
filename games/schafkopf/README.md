# Schafkopf

Webseite zum bayerischen Kartenspiel Schafkopf, Teil des Monorepos [hostelgames](../../README.md).
**Entwurf** (`status: draft`): Vorschau unter https://jankraut.github.io/hostelgames/schafkopf/
(noch keine eigene Domain).

Standard-Aufbau und gemeinsame Teile siehe [Aufbau eines Spiels](../../README.md#aufbau-eines-spiels)
und [`@hostelgames/core`](../../packages/core/README.md); aktive Seiten, Sprachen und Status stehen
in [`game.json`](game.json).

```sh
npm run start:schafkopf                  # Dev-Server: http://localhost:8080/hostelgames/schafkopf/
npm run build:schafkopf                  # prüft Texte und baut nach games/schafkopf/_site/
npm test -w @hostelgames/schafkopf       # Playwright-Tests (vorher bauen)
```
