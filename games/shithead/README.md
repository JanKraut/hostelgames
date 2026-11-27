# Shithead

Webseite zum Kartenspiel Shithead (**Shithead in 3 minutes**), erstes Spiel im Monorepo
[hostelgames](../../README.md).

```sh
# Build für die eigene Domain (inkl. src/.htaccess):
SITE_ORIGIN=https://shitheadgame.de SITE_PATH_PREFIX=/ npm run build:shithead
```

## Besonderheiten

| Pfad | Inhalt |
| --- | --- |
| `src/play.njk`, `src/assets/game/` | Spiel gegen Bots (`engine.js`, `bots.js`, `ui.js`, `fx.js`, `game.css`) |
| `src/assets/quiz.js` | Shithead-Regel (`deal`, `judge`) für das Übungsquiz aus dem Core |
| `src/assets/site.js` | Weiterleitung alter deutscher `#abschnitt`-Links auf jeder Seite |
| `src/_includes/factsheet-players.njk`, `factsheet-gear.njk` | Shithead-Steckbrief-Overrides (Decks statt Text, Karten mit Joker) |
| `src/_includes/notfound-art.njk`, `shithead-card.njk`, `specials.njk` | 404-Grafik, Shithead-Karte (Haufen statt Wert/Farbe), Sonderkarten-Abschnitt |
| `src/favicon.ico`, `src/manifest.webmanifest`, `src/.htaccess` | Root-Dateien (klassisches Favicon, Web-App-Manifest, Apache-Konfiguration nur für eigene Domain) |
| `src/assets/apple-touch-icon.png`, `icon-*.png`, `og-image.png` | PWA-Icons und Social-Vorschaubild |
| `tests/play.spec.js`, `tests/engine.spec.js` | Bot-Spiel-UI-Tests und Engine-/Bot-Simulationen |

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
