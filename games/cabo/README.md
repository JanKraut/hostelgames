# Cabo

Webseite zum Kartenspiel Cabo, Teil des Monorepos [hostelgames](../../README.md).
**Entwurf** (`status: draft`): Vorschau unter https://jankraut.github.io/hostelgames/cabogame/
(Domain `cabogame.de` noch nicht aktiv).

Standard-Aufbau und gemeinsame Teile siehe [Aufbau eines Spiels](../../README.md#aufbau-eines-spiels)
und [`@hostelgames/core`](../../packages/core/README.md); aktive Seiten, Sprachen und Status stehen
in [`game.json`](game.json).

```sh
npm run start:cabo                       # Dev-Server: http://localhost:8080/hostelgames/cabogame/
npm run build:cabo                       # prüft Texte und baut nach games/cabo/_site/
npm test -w @hostelgames/cabo            # Playwright-Tests (vorher bauen)
```
