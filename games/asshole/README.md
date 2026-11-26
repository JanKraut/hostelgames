# Asshole

Webseite zum Kartenspiel Asshole (Arschloch), Teil des Monorepos [hostelgames](../../README.md).
**Entwurf** (`status: draft`): Vorschau unter https://jankraut.github.io/hostelgames/assholegame/
(Domain `assholegame.de` noch nicht aktiv).

Standard-Aufbau und gemeinsame Teile siehe [Aufbau eines Spiels](../../README.md#aufbau-eines-spiels)
und [`@hostelgames/core`](../../packages/core/README.md); aktive Seiten, Sprachen und Status stehen
in [`game.json`](game.json).

```sh
npm run start:asshole                    # Dev-Server: http://localhost:8080/hostelgames/assholegame/
npm run build:asshole                    # prüft Texte und baut nach games/asshole/_site/
npm test -w @hostelgames/asshole         # Playwright-Tests (vorher bauen)
```
