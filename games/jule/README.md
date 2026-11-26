# Jule

Webseite zum Würfelspiel Jule (mit der Variante Stumme Jule), Teil des Monorepos
[hostelgames](../../README.md).
**Entwurf** (`status: draft`): Vorschau unter https://jankraut.github.io/hostelgames/jule/
(noch keine eigene Domain).

Standard-Aufbau und gemeinsame Teile siehe [Aufbau eines Spiels](../../README.md#aufbau-eines-spiels)
und [`@hostelgames/core`](../../packages/core/README.md); aktive Seiten, Sprachen und Status stehen
in [`game.json`](game.json).

```sh
npm run start:jule                       # Dev-Server: http://localhost:8080/hostelgames/jule/
npm run build:jule                       # prüft Texte und baut nach games/jule/_site/
npm test -w @hostelgames/jule            # Playwright-Tests (vorher bauen)
```
