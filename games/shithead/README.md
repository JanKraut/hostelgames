# Shithead

Webseite zum Kartenspiel Shithead (**Shithead in 3 minutes**), erstes Spiel im Monorepo
[hostelgames](../../README.md).
**Live** (`status: live`): eigene Domain https://shitheadgame.de (zusätzlich unter
https://hostelgames.com/shitheadgame/).

Design, Schrift, Layout (`layout: game`), Kopf/Footer, Sprachmenü, Teilen-Box, Steckbrief,
Quiz-Rahmen, 404-Seite, Sitemap, Offline-Service-Worker, Konfiguration (`eleventy.config.js`,
`playwright.config.js`), Übersetzungsprüfung (`check-i18n`) und Basis-Tests kommen aus
[`@hostelgames/core`](../../packages/core/README.md).

```sh
npm run start:shithead                   # Dev-Server: http://localhost:8080/hostelgames/shitheadgame/
npm run build:shithead                   # prüft Texte und baut nach games/shithead/_site/
npm test -w @hostelgames/shithead        # Playwright-Tests (vorher bauen)

# Build für die eigene Domain (inkl. src/.htaccess):
SITE_ORIGIN=https://shitheadgame.de SITE_PATH_PREFIX=/ npm run build:shithead
```

| Pfad | Inhalt |
| --- | --- |
| `game.json` | Name, Kategorie, Domain (Ordner `shitheadgame`), Status, Sprachen, Seiten, Steckbrief (Felder: [Root-README](../../README.md#gamejson)) |
| `src/index.njk` | Regelseite (`/`, `/de/` …) |
| `src/strategy.njk` | Strategieseite (`/strategy/`, `/de/strategy/` …) |
| `src/quickstart.njk` | Quickstart: Spickzettel, passt auf einen Handybildschirm (`/quickstart/`, `/de/quickstart/` …) |
| `src/play.njk` | Spielseite gegen Bots (`/play/`, `/de/play/` …) |
| `src/_includes/hero-art.njk` | Kartenfächer im Kopfbereich |
| `src/_includes/factsheet-players.njk`, `factsheet-gear.njk` | Shithead-Steckbrief-Overrides (Decks statt Text, Karten mit Joker) |
| `src/_includes/notfound-art.njk` | Grafik auf der 404-Seite |
| `src/_includes/shithead-card.njk` | Die Shithead-Karte (Haufen statt Wert und Farbe) |
| `src/_includes/specials.njk` | Sonderkarten-Abschnitt (Regelseite und Quickstart) |
| `src/_data/i18n/*.json` | Texte (15 Sprachen, inkl. Quiz-Erklärungen unter `quiz`, Referenz `en.json`) |
| `src/favicon.ico`, `src/manifest.webmanifest`, `src/.htaccess` | Root-Dateien (klassisches Favicon, Web-App-Manifest, Apache-Konfiguration nur für eigene Domain) |
| `src/assets/favicon.svg`, `apple-touch-icon.png`, `icon-*.png`, `og-image.png` | Icons und Social-Vorschaubild |
| `src/assets/styles.css` | eigene Styles zusätzlich zu `core.css` |
| `src/assets/site.js` | Weiterleitung alter deutscher `#abschnitt`-Links auf jeder Seite |
| `src/assets/quiz.js` | Regel des Übungsquiz (`deal`, `judge`); Rahmen, Ablauf und Standardtexte aus dem Core |
| `src/assets/game/` | Spiel gegen Bots: `engine.js` (Regeln), `bots.js`, `ui.js`, `fx.js`, `game.css` |
| `tests/site.spec.js`, `tests/play.spec.js`, `tests/engine.spec.js` | Playwright-Tests (`siteTests` aus dem Core, Bot-Spiel-UI, Engine-/Bot-Simulationen) |
| Aus dem Core | Seitenrahmen, Seitenreiter, Weiterleitung, Teilen-Box, Quiz-Engine, 404-Seite, Sitemap, `eleventy.config.js`, `playwright.config.js`, Adresse und Sprachen – siehe [`packages/core/README.md`](../../packages/core/README.md) |

Allgemeines zu Offline-Betrieb, fehlenden externen Ressourcen sowie Sprachen und Fallbacks steht in
[`packages/core/README.md`](../../packages/core/README.md), zu Deployment und Tracking im
[Root-README](../../README.md#deployment).

## Gegen Bots spielen

Die Spielseite läuft komplett im Browser, ohne Server, auch offline.

- `engine.js` enthält nur die Regeln, genau wie auf der Regelseite, ohne Oberfläche. Dadurch lässt sie
  sich in Node testen und simulieren.
- `bots.js`: **Leicht** legt eine zufällige passende Karte. **Normal** spielt die Strategien von der
  Regelseite: starke Karten offen hinlegen, kleine Karten zuerst, Sonderkarten sparen, große Stapel mit
  der 10 verbrennen, Vierlinge vollmachen, die 7 gezielt einsetzen. Im Endspiel legt er seine höchste
  Karte auf einen freien Stapel.
- **Namen:** Du kannst deinen eigenen Namen eingeben (wird mit den Einstellungen gespeichert). Die Bots
  heißen wie in der Sprache üblich: `game.botNames` in den i18n-Dateien enthält vier Paare
  `Name/Ersatzname`, z. B. `Lukas/Jonas`. Heißt du wie ein Bot (Groß-/Kleinschreibung und Akzente egal),
  spielt sein Ersatzname mit.
- **Statistik:** Spiele, Siege und Shithead-Runden pro Schwierigkeit stehen nur im `localStorage`
  des Geräts (`game-stats`), nichts verlässt das Gerät. Sie lässt sich im Spiel zurücksetzen.
- **Animationen** (`fx.js`): Gelegte Karten fliegen vom Spieler auf den Stapel, ein aufgenommener
  Stapel rutscht zu dem, der ihn nimmt, ein verbrannter Stapel flackert mit 🔥 weg, wer aussetzt,
  wackelt kurz mit ⏭. Bewegt werden nur Kopien über dem Tisch, das Layout bleibt fest. Mit
  „Bewegung reduzieren“ im System gibt es keine Animationen (so laufen auch die meisten Tests).
- **Layout:** Während einer Partie füllt der Tisch genau einen Bildschirm (`100dvh`). Jeder Bereich hat
  eine feste Höhe, die Kartengröße richtet sich nach der Bildschirmhöhe, Buttons werden nur unsichtbar
  statt entfernt, und viele Handkarten überlappen in einer Reihe. So verschiebt sich zwischen den
  Zügen nichts. Ein Test prüft das auf dem kleinsten Handy (320 × 568) und einem Tablet.
- **Endlosschleifen:** In seltenen Endspielen ist jeder Zug erzwungen und dieselben Karten wandern ewig
  im Kreis (gefunden per Simulation, etwa 1 von 3.000 Partien). Kommt dieselbe Stellung zum 10. Mal vor,
  endet die Partie unentschieden. Bots weichen wiederholten Stellungen aus, wo sie eine Wahl haben.
