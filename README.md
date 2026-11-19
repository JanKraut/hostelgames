# shithead-rules

**Shithead in 3 minutes** – eine mehrsprachige Kurzanleitung für das Kartenspiel Shithead.
Statische Seiten, gebaut mit [Eleventy](https://www.11ty.dev/): Jede Sprache ist eine eigene, fertig
gerenderte Seite (`/`, `/de/`, `/es/`, …), die Regeln sind also auch ohne JavaScript lesbar.
JavaScript ergänzt nur das Übungsquiz, QR-Code und Teilen-Buttons und merkt sich die gewählte Sprache.

## Entwickeln

```sh
npm install
npm start        # Dev-Server mit Live-Reload: http://localhost:8080/shitheadgame/
npm run check    # prüft die Übersetzungen (läuft auch bei jedem Build)
npm run build    # schreibt die Seite nach _site/
npm test         # Playwright-Tests gegen das gebaute _site/ (vorher npm run build)
```

Beim ersten Mal ggf. den Browser installieren: `npx playwright install chromium`.

## Aufbau

| Pfad | Inhalt |
| --- | --- |
| `src/index.njk` | Regelseite, wird einmal pro Sprache gerendert |
| `src/strategy.njk` | Strategieseite (`/strategy/`, `/de/strategy/` …) |
| `src/quickstart.njk` | Quickstart: Spickzettel, passt auf einen Handybildschirm (`/quickstart/`, `/de/quickstart/` …) |
| `src/_includes/pagenav.njk` | Reiter oben zwischen Regeln, Strategie und Quickstart |
| `src/play.njk` | Spielseite gegen Bots (`/play/`, `/de/play/` …) |
| `src/_includes/layouts/base.njk` | Gemeinsamer Rahmen: Kopf, `hreflang`, Skripte |
| `src/_includes/langmenu.njk` | Sprachmenü, verlinkt auf dieselbe Seite in jeder Sprache |
| `src/_includes/card.njk` | Makros für die Spielkarten-Grafiken |
| `src/_includes/redirect.njk` | Nur Startseite: leitet auf die gemerkte bzw. Browsersprache weiter |
| `src/_data/languages.js` | Liste der Sprachen (Reihenfolge im Menü, Flagge, Fallback-Kette) |
| `src/_data/i18n/*.json` | Texte pro Sprache, inklusive Quiztexte unter `quiz` |
| `src/_data/site.js` | Öffentliche URL und Pfad-Präfix |
| `src/_data/fonts.js` | Welche Schriften, Schnitte und Zeichensätze ausgeliefert werden |
| `src/fonts.11ty.js` | Erzeugt `/assets/fonts.css` aus den `@fontsource`-Paketen |
| `src/assets/` | Stylesheet, JavaScript und Icons, werden unverändert kopiert |
| `src/assets/site.js` | Auf jeder Seite: Sprachmenü, Service Worker |
| `src/assets/rules.js` | Regelseite: Quiz |
| `src/assets/share.js` | Teilen-Box unten auf der Seite und QR-Popup oben: QR-Code, Link kopieren, Teilen |
| `src/assets/game/` | Spiel: `engine.js` (Regeln), `bots.js` (Computergegner), `ui.js` (Oberfläche), `fx.js` (Animationen), `game.css` |
| `src/sw.js` | Service Worker (Vorlage), siehe „Offline“ |
| `src/manifest.webmanifest` | Web-App-Manifest, macht die Seite installierbar |
| `scripts/check-i18n.js` | Prüft die Übersetzungen, siehe unten |
| `tests/site.spec.js` | Playwright-Tests: alle Sprachseiten, Weiterleitung, ohne JavaScript, Quiz, Teilen, Offline |
| `tests/play.spec.js` | Spielseite in allen Sprachen, komplette Partien über die Oberfläche |
| `tests/engine.spec.js` | Spielregeln und Bots ohne Browser, inklusive Tausender simulierter Partien |
| `tests/serve.js` | Kleiner Server, der `_site/` unter dem Pages-Pfad ausliefert |

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

- **Schriften** kommen aus dem npm-Paket `@fontsource/manrope` (SIL Open Font License 1.1). Ausgeliefert werden nur die in
  `src/_data/fonts.js` gelisteten Schnitte und Zeichensätze. Dank `unicode-range` lädt der Browser
  nur, was eine Sprache wirklich braucht.
- **QR-Code** erzeugt `qrcode-generator` (MIT), kopiert nach `/assets/qrcode.js`.

Ein Test stellt sicher, dass das so bleibt.

## Offline

Nach dem ersten Besuch funktioniert die ganze Seite ohne Netz, inklusive aller Sprachen, Quiz und
QR-Code. Dafür speichert ein Service Worker alle Dateien der Seite (unter 1 MB):

- `eleventy.config.js` schreibt nach jedem Build `_site/sw.js` aus der Vorlage `src/sw.js` und
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

**Prüfung:** `npm run check` (Teil von `npm run build`) bricht mit einer Liste der Probleme ab, wenn
- ein Text fehlt, also weder in der Sprache selbst noch in einer ihrer Fallback-Sprachen steht und deshalb auf Englisch erscheinen würde,
- ein Text leer ist oder nicht in Englisch vorkommt (Tippfehler, Überbleibsel),
- Platzhalter wie `{mine}` oder `{top}` oder die HTML-Tags von Englisch abweichen oder Tags nicht geschlossen sind,
- ein Link auf einen `#abschnitt` zeigt, den es auf der Seite nicht gibt,
- `languages.js` und die JSON-Dateien nicht zusammenpassen.

## Deployment

`.github/workflows/ci.yml` baut die Seite und führt die Tests bei jedem Pull Request und Push aus.
Nur auf `main` und nur wenn die Tests grün sind, wird sie auf GitHub Pages veröffentlicht. Schlägt ein
Test fehl, liegen Report und Screenshots als Artefakt `playwright-report` am Workflow-Lauf. Einmalig nötig: *Settings → Pages → Build and deployment → Source:
GitHub Actions*. Adresse und Pfad-Präfix stehen in `src/_data/site.js` und lassen sich beim Build über
`SITE_ORIGIN` und `SITE_PATH_PREFIX` überschreiben.

### Hetzner (shitheadgame.de)

Ein Push auf den Branch `hetzner` baut die Seite für `https://shitheadgame.de/` (ohne Pfad-Präfix,
mit `src/.htaccess` für HTTPS-Weiterleitung und Caching) und lädt sie nach grünen Tests per FTPS
auf den Hetzner-Webspace. GitHub Pages bleibt davon unberührt.

Einmalig nötig unter *Settings → Environments → New environment* `hetzner`:

- *Deployment branches*: nur `hetzner`
- *Secrets*: `HETZNER_HOST` (z. B. `wwwXXX.your-server.de`), `HETZNER_USER`, `HETZNER_PASSWORD`
  – am besten ein zusätzlicher FTP-Benutzer aus konsoleH, der nur `public_html` (bzw. das Verzeichnis der Domain) sieht
- *Variable* (optional): `HETZNER_FTP_DIR`, Zielverzeichnis relativ zum FTP-Login, Standard `./`, mit `/` am Ende

Die Upload-Action merkt sich in `.ftp-deploy-sync-state.json` auf dem Server, was schon hochgeladen ist,
und überträgt danach nur noch Änderungen.
