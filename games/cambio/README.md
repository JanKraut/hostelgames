# Cambio

Webseite zum Kartenspiel Cambio, Teil des Monorepos [hostelgames](../../README.md).
**Entwurf** (`status: draft`): Vorschau unter https://jankraut.github.io/hostelgames/cambiogame/
(Domain `cambiogame.de` noch nicht aktiv).

Standard-Aufbau und gemeinsame Teile siehe [Aufbau eines Spiels](../../README.md#aufbau-eines-spiels)
und [`@hostelgames/core`](../../packages/core/README.md); aktive Seiten, Sprachen und Status stehen
in [`game.json`](game.json).

```sh
npm run start:cambio                     # Dev-Server: http://localhost:8080/hostelgames/cambiogame/
npm run build:cambio                     # prüft Texte und baut nach games/cambio/_site/
npm test -w @hostelgames/cambio          # Playwright-Tests (vorher bauen)
```
