# President

Webseite zum Kartenspiel President, Teil des Monorepos [hostelgames](../../README.md).
**Entwurf** (`status: draft`): Vorschau unter https://jankraut.github.io/hostelgames/presidentsgame/
(Domain `presidentsgame.de` noch nicht aktiv).

Standard-Aufbau und gemeinsame Teile siehe [Aufbau eines Spiels](../../README.md#aufbau-eines-spiels)
und [`@hostelgames/core`](../../packages/core/README.md); aktive Seiten, Sprachen und Status stehen
in [`game.json`](game.json).

```sh
npm run start:president                  # Dev-Server: http://localhost:8080/hostelgames/presidentsgame/
npm run build:president                  # prüft Texte und baut nach games/president/_site/
npm test -w @hostelgames/president       # Playwright-Tests (vorher bauen)
```
