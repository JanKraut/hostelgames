# Mau-Mau

Webseite zum Kartenspiel Mau-Mau, Teil des Monorepos [hostelgames](../../README.md).
**Entwurf** (`status: draft`): Vorschau unter https://jankraut.github.io/hostelgames/maumau/
(noch keine eigene Domain).

Standard-Aufbau und gemeinsame Teile siehe [Aufbau eines Spiels](../../README.md#aufbau-eines-spiels)
und [`@hostelgames/core`](../../packages/core/README.md); aktive Seiten, Sprachen und Status stehen
in [`game.json`](game.json).

```sh
npm run start:maumau                     # Dev-Server: http://localhost:8080/hostelgames/maumau/
npm run build:maumau                     # prüft Texte und baut nach games/maumau/_site/
npm test -w @hostelgames/maumau          # Playwright-Tests (vorher bauen)
```
