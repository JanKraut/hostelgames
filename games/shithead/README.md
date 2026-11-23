# Shithead (games/shithead)

**Shithead in 3 minutes** – eine mehrsprachige Kurzanleitung für das Kartenspiel Shithead.
Statische Seiten, gebaut mit [Eleventy](https://www.11ty.dev/): Jede Sprache ist eine eigene, fertig
gerenderte Seite (`/`, `/de/`, `/es/`, …), die Regeln sind also auch ohne JavaScript lesbar.
JavaScript ergänzt nur das Übungsquiz, QR-Code und Teilen-Buttons und merkt sich die gewählte Sprache.

Das erste Spiel im Monorepo [hostelgames](../../README.md). Design, Schrift, Spielkarten-Grafik,
Hell/Dunkel-Schalter, Sprachmenü, Footer, Tracking, Offline-Service-Worker, Übersetzungsprüfung und
Testserver kommen aus dem gemeinsamen Core [`packages/core`](../../packages/core/README.md).

## Entwickeln

Einmal im Root des Repos `npm install` (installiert alle Workspaces). Dann in `games/shithead/`:

```sh
npm start        # Dev-Server mit Live-Reload: http://localhost:8080/hostelgames/shitheadgame/
npm run check    # prüft die Übersetzungen (läuft auch bei jedem Build)
npm run build    # schreibt die Seite nach games/shithead/_site/
npm test         # Playwright-Tests gegen das gebaute _site/ (vorher npm run build)
```

Oder aus dem Root: `npm run start:shithead`, `npm run build:shithead`.
Beim ersten Mal ggf. den Browser installieren: `npx playwright install chromium`.

## Aufbau

| Pfad | Inhalt |
| --- | --- |
| `src/index.njk` | Regelseite, wird einmal pro Sprache gerendert |
| `src/strategy.njk` | Strategieseite (`/strategy/`, `/de/strategy/` …) |
| `src/quickstart.njk` | Quickstart: Spickzettel, passt auf einen Handybildschirm (`/quickstart/`, `/de/quickstart/` …) |
| `src/_includes/pagenav.njk` | Reiter oben zwischen Regeln, Strategie und Quickstart |
| `src/play.njk` | Spielseite gegen Bots (`/play/`, `/de/play/` …) |
| `game.json` | Name, Slug, Domain (daraus der Ordner `shitheadgame`), Status, Sprachen und Seiten, siehe Root-README |
| `src/_includes/layouts/base.njk` | Rahmen jeder Seite: Kopf, `hreflang`, lädt erst die Core-Styles und -Skripte, dann die eigenen |
| `src/_includes/card.njk` | Makros für die Spielkarten-Grafiken |
| `src/_includes/redirect.njk` | Nur englische Seiten: leitet auf die im Menü gewählte Sprache weiter; ohne Wahl bleibt es Englisch, egal welche Browsersprache |
| `src/_data/languages.js` | Sprachen der Seiten: Codes aus `game.json`, Flagge, Name und Fallbacks aus `@hostelgames/core/languages` |
| `src/_data/i18n/*.json` | Texte pro Sprache, inklusive Quiztexte unter `quiz` |
| `src/_data/site.js` | Öffentliche URL und Pfad-Präfix (über `@hostelgames/core/site`) |
| `src/assets/` | Eigenes Stylesheet (nur Shithead-Teile), JavaScript und Icons, werden unverändert kopiert |
| `src/assets/site.js` | Auf jeder Seite: alte deutsche Abschnitts-Links umleiten |
| `src/assets/rules.js` | Regelseite: Quiz |
| `src/assets/share.js` | Teilen-Box unten auf der Seite und QR-Popup oben: QR-Code, Link kopieren, Teilen |
| `src/assets/game/` | Spiel: `engine.js` (Regeln), `bots.js` (Computergegner), `ui.js` (Oberfläche), `fx.js` (Animationen), `game.css` |
| `src/manifest.webmanifest` | Web-App-Manifest, macht die Seite installierbar |
| `tests/site.spec.js` | Playwright-Tests: alle Sprachseiten, Weiterleitung, ohne JavaScript, Quiz, Teilen, Offline |
| `tests/play.spec.js` | Spielseite in allen Sprachen, komplette Partien über die Oberfläche |
| `tests/engine.spec.js` | Spielregeln und Bots ohne Browser, inklusive Tausender simulierter Partien |

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

## Keine externen Ressourcen

Die Seite lädt nichts von fremden Servern (kein Google Fonts, kein CDN):

- **Schriften** kommen über den Core aus dem npm-Paket `@fontsource/manrope` (SIL Open Font License 1.1). Ausgeliefert werden nur die in
  `packages/core/data/fonts.js` gelisteten Schnitte und Zeichensätze. Dank `unicode-range` lädt der Browser
  nur, was eine Sprache wirklich braucht.
- **QR-Code** erzeugt `qrcode-generator` (MIT), kopiert nach `/assets/qrcode.js`.

Ein Test stellt sicher, dass das so bleibt. Einzige Ausnahme ist ein Tracking, falls es beim Build
eingeschaltet wird (siehe „Tracking“).

## Offline

Nach dem ersten Besuch funktioniert die ganze Seite ohne Netz, inklusive aller Sprachen, Quiz und
QR-Code. Dafür speichert ein Service Worker alle Dateien der Seite (unter 1 MB):

- Das Eleventy-Plugin des Cores schreibt nach jedem Build `_site/sw.js` aus der Vorlage `packages/core/assets/sw.js` und
  trägt die Liste aller Dateien und einen Hash über ihren Inhalt ein. Ändert sich etwas, bekommt
  der nächste Besuch eine neue Version und der alte Speicher wird gelöscht.
- Seiten kommen zuerst aus dem Netz (Updates sind sofort da), nur offline aus dem Speicher.
  CSS, JavaScript, Schriften und Icons kommen aus dem Speicher.
- Über das Manifest lässt sich die Seite auf den Homescreen legen.

Beim Entwickeln mit `npm start` ist der Service Worker auch aktiv: Geänderte CSS- oder JS-Dateien
erscheinen deshalb erst nach einem zweiten Neuladen (oder in den DevTools „Update on reload“ aktivieren).

## Sprachen und Fallbacks

Englisch ist Standard und liegt unter `/`, jede andere Sprache unter `/<code>/`.
Eine Sprache muss nur die Texte enthalten, die sie wirklich braucht: Fehlende Texte kommen der Reihe
nach aus ihren `fallback`-Sprachen und zuletzt aus Englisch. `es-419` (Lateinamerika) enthält zum
Beispiel nur die wenigen Texte, die von `es` abweichen.

**Neue Sprache:** `src/_data/i18n/<code>.json` anlegen und eine Zeile in `src/_data/languages.js` ergänzen.

**Prüfung:** `npm run check` (Teil von `npm run build`, Skript `hostelgames-check-i18n` aus dem Core) bricht mit einer Liste der Probleme ab, wenn
- ein Text fehlt, also weder in der Sprache selbst noch in einer ihrer Fallback-Sprachen steht und deshalb auf Englisch erscheinen würde,
- ein Text leer ist oder nicht in Englisch vorkommt (Tippfehler, Überbleibsel),
- Platzhalter wie `{mine}` oder `{top}` oder die HTML-Tags von Englisch abweichen oder Tags nicht geschlossen sind,
- ein Link auf einen `#abschnitt` zeigt, den es auf der Seite nicht gibt,
- `languages.js` und die JSON-Dateien nicht zusammenpassen.

## Deployment und Tracking

Gebaut und deployt wird aus dem Root des Repos, siehe [README im Root](../../README.md#deployment).
Kurz: `SITE_ORIGIN=https://shitheadgame.de SITE_PATH_PREFIX=/ npm run build -w @hostelgames/shithead`
baut die Seite für die eigene Domain (dann mit `src/.htaccess`); Tracking per Umgebungsvariablen
wie im Root-README beschrieben.
