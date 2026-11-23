# Hostel Games

Kartenspiele aus jedem Hostel der Welt: Regeln, Strategie, Spickzettel und Spiele gegen Bots,
mehrsprachig und offline-fähig. Ein Monorepo: alle Spiele teilen sich einen Core, damit Design und
Verhalten überall gleich sind. Pro Spiel gibt es einen Unterordner.

Später: Hauptdomain **hostelgames.com** (Startseite + jedes Spiel unter `/<path>/`) und zusätzlich
eine eigene Domain pro Spiel (z. B. shitheadgame.de). Bis die Domains bereitstehen, gibt es eine
Vorschau auf GitHub Pages: `https://jankraut.github.io/hostelgames/`, jedes Spiel in seinem Unterordner,
z. B. `https://jankraut.github.io/hostelgames/shitheadgame/`.

## Aufbau

| Pfad | Inhalt |
| --- | --- |
| `packages/core/` | **`@hostelgames/core`**: gemeinsamer Kern aller Seiten, siehe [README](packages/core/README.md) |
| `games/<slug>/` | Ein Spiel, eigene Eleventy-Seite mit `game.json`, Texten, Tests. Erstes Spiel: [`games/shithead/`](games/shithead/README.md) |
| `hub/` | Startseite von hostelgames.com, listet automatisch alle Spiele aus `games/*/game.json` |
| `scripts/build-all.js` | Baut Hub und alle Spiele in ein gemeinsames `_site/` (Aufbau wie hostelgames.com) |
| `scripts/ci-plan.js` | Bestimmt, welche Spiele getestet und deployt werden (geänderte Dateien) |
| `.github/workflows/ci.yml` | Build und Tests bei jedem Push und Pull Request; auf `main` danach **automatisches Deployment** |

Die Workspaces (npm) sind `packages/*`, `games/*` und `hub`. Abhängigkeiten werden einmal im Root
installiert.

## Entwickeln

```sh
npm install              # einmal, im Root
npm run start:shithead   # Dev-Server eines Spiels: http://localhost:8080/hostelgames/shitheadgame/
npm run start:hub        # Dev-Server der Startseite: http://localhost:8080/hostelgames/
npm run build            # alles nach _site/ (Hub + alle Spiele)
npm run serve            # _site/ ansehen: http://localhost:8080/hostelgames/
npm run check            # Übersetzungen aller Spiele prüfen
npm test                 # Tests aller Spiele (vorher je Spiel bauen, siehe dort)
```

### Mehrere Sessions gleichzeitig

Jede Aufgabe bekommt einen eigenen Branch, lokal am besten in einem eigenen Worktree mit eigenem Port
(Dev-Server und Tests lesen `PORT`, Standard 8080):

```sh
git fetch origin
git worktree add ../hg-quickstart -b claude/quickstart-farben origin/main
cd ../hg-quickstart && npm install
PORT=8081 npm run start:shithead
PORT=8082 npm run build:shithead && PORT=8082 npm test -w @hostelgames/shithead
git worktree remove ../hg-quickstart   # wenn der PR gemergt ist
```

Ohne eigenen Port würde Playwright den laufenden Server eines anderen Worktrees mitbenutzen und
dessen Stand testen. Die Regeln für Agenten (eigener Branch, Hotspot-Dateien, Core) stehen in
[`CLAUDE.md`](CLAUDE.md).

## Adressen und Builds

Jede Seite bekommt Adresse und Pfad-Präfix beim Build über Umgebungsvariablen
(`packages/core/lib/site.js`):

| Ziel | `SITE_ORIGIN` | `SITE_PATH_PREFIX` | Befehl |
| --- | --- | --- | --- |
| Vorschau GitHub Pages (Standard, `noindex`) | `https://jankraut.github.io` | `/hostelgames/` | `npm run build` |
| Hauptdomain, später | `https://hostelgames.com` | `/` | `npm run build` |
| Eigene Domain eines Spiels, später | z. B. `https://shitheadgame.de` | `/` | `npm run build -w @hostelgames/shithead` |

`npm run build` legt die Startseite nach `_site/` und jedes Spiel nach `_site/<path>/`, mit passendem
Präfix. Eine Spiel-Domain baut nur dieses Spiel (Ausgabe in `games/<slug>/_site/`); stimmt die Adresse
mit `domain` aus seiner `game.json` überein, kommt seine `.htaccess` dazu.
Alles auf `github.io` bekommt `noindex` und keine Sitemap.

## Neues Spiel anlegen

1. `games/<slug>/` anlegen, am einfachsten als Kopie der Struktur von `games/shithead/`
   (`package.json` mit Namen `@hostelgames/<slug>`, `eleventy.config.js`, `src/`, `tests/`).
2. `game.json` anlegen (Felder siehe unten), zu Beginn mit `"status": "draft"` und
   `"languages": ["en", "de"]`. Der Ordner in den URLs und auf dem Server ist die Domain ohne Endung
   (ohne Domain: `slug`).
3. In `eleventy.config.js` das Core-Plugin einbinden:
   `eleventyConfig.addPlugin(hostelgames, { site, cacheName: "<slug>" })`.
4. Im Layout erst `/assets/core/fonts.css` und `/assets/core/core.css`, dann die eigenen Styles laden,
   und `/assets/core/core.js` als Modul. Sprachmenü, Footer, Tracking per `{% include %}` aus dem Core.
5. `npm install` im Root. Die Startseite listet das Spiel automatisch (in der Vorschau auch als Entwurf).
6. Nichts in `ci.yml` nötig: Tests und Deploy erkennen das Spiel automatisch. Für ein Deploy
   `domain` in `game.json` setzen – der Ordnername ergibt sich daraus (siehe unten).

### `game.json`

Beschreibt das Spiel und ist die einzige Stelle für diese Angaben. Geprüft wird sie bei jedem Build
(`packages/core/lib/games.js`); ein Fehler nennt Datei und Feld.

| Feld | Beispiel | Bedeutung |
| --- | --- | --- |
| `slug` | `"shithead"` | Kurzname: Ordner im Repo, Paket `@hostelgames/<slug>`, Offline-Cache |
| `name`, `tagline` | `"Shithead"` | Name und eine Zeile für die Startseite |
| `domain` | `"https://shitheadgame.de"` | eigene Domain (optional); daraus der Ordner `shitheadgame` |
| `status` | `"draft"` / `"live"` | `draft`: nur in der Vorschau (GitHub Pages, mit Hinweis), nicht auf hostelgames.com, kein Deploy auf die eigene Domain |
| `languages` | `["en", "de", "fr"]` | angebotene Sprachen, `en` und `de` immer. Flagge, Name, Fallback und Reihenfolge im Menü: `packages/core/lib/languages.js` |
| `pages` | `["rules", "strategy", "quickstart", "play"]` | vorhandene Seiten, `rules` immer, `play` = Spiel gegen Bots. Muss zu den Dateien in `src/` passen (`index.njk`, `strategy.njk`, `quickstart.njk`, `play.njk`) |
| `related` | `["president"]` | ähnliche Spiele (Slugs), optional |
| `players`, `duration` | `{ "min": 3, "max": 6 }`, `"20–30 min"` | optional, für die Startseite |
| `testShards`, `deploy.environment` | `3` | nur für die CI, siehe unten |

Eine neue Sprache, die noch kein Spiel hat, kommt zuerst nach `packages/core/lib/languages.js`
(und ihre Flagge nach `packages/core/includes/flags.njk`), dann in `languages` des Spiels.

## Deployment

Ein Workflow (`.github/workflows/ci.yml`) testet und deployt:

- **Jeder Pull Request und Push:** Übersetzungen prüfen und alles bauen; Browser-Tests **nur für
  Spiele, die sich geändert haben** (`scripts/ci-plan.js`). Änderungen in `packages/`, `scripts/`,
  `.github/` oder `package*.json` zählen für alle Spiele. Die Tests laufen im Playwright-Container
  (Chromium vorinstalliert) und verteilt auf mehrere Runner (`testShards` in `game.json`).
- **Jeder Push auf `main`:** danach automatisch – nur wenn Build und Tests grün sind –
  - **jedes geänderte Spiel mit `domain`** und den **Hub** (hostelgames.com) auf ihre Domains (Hetzner, FTPS mit `lftp`;
    nur geänderte Dateien, was es im Build nicht mehr gibt, wird auch auf dem Server gelöscht),
  - die **Vorschau** (Hub + alle Spiele) auf GitHub Pages: `https://jankraut.github.io/hostelgames/`,
    immer noindex. Einmalig nötig: *Settings → Pages → Source: GitHub Actions*.
- **Von Hand** (*Actions → CI & Deploy → Run workflow*): alles testen und – auf `main` – alles deployen.

### Ordner und Zugangsdaten

Die Zugangsdaten im Environment **`hetzner-webhosting`** (Secrets `HETZNER_HOST`, `HETZNER_USER`,
`HETZNER_PASSWORD`) gelten für den Hauptordner **`hostelgames.com`** auf dem Webspace. Jede Seite
bekommt darin einen eigenen Unterordner.

**Regel: Der Ordner heißt immer wie die Domain ohne Endung** – überall gleich: als FTP-Unterordner,
auf hostelgames.com (`hostelgames.com/<ordner>/`) und in der Vorschau
(`jankraut.github.io/hostelgames/<ordner>/`). Er wird automatisch aus `domain` abgeleitet
(`folderOf` in `packages/core/lib/games.js`), von Hand gesetzt wird er nicht.

| Seite | Domain | Ordner |
| --- | --- | --- |
| Hub (`hub/hub.json`) | hostelgames.com | `hostelgames` |
| Shithead (`games/shithead/game.json`) | shitheadgame.de | `shitheadgame` |
| neues Spiel ohne Domain | – | der `slug` (wird nicht deployt) |

Die Domain zeigt im Hetzner-Panel auf ihren Unterordner. Fehlt der Ordner, wird er angelegt.
Ein Spiel kann später ein eigenes Environment mit eigenen Zugangsdaten bekommen:
`"deploy": { "environment": "kniffel-hetzner" }`. Zwei Seiten dürfen nie in denselben Ordner
deployen; `ci-plan.js` bricht dann ab.

### Tracking

Web-Analyse wird beim Build über Umgebungsvariablen eingeschaltet (`packages/core/data/tracking.js`,
Code in `packages/core/includes/tracking-*.njk`). Ohne Variablen – lokal, in den Tests und auf GitHub
Pages – steht kein Tracking-Code in den Seiten.

| Variable | Werte |
| --- | --- |
| `TRACKING_PROVIDER` | `gtm` (Google Tag Manager), `ga4` (Google Analytics direkt), `matomo` oder leer/`none` |
| `TRACKING_ID` | `GTM-…`, `G-…` bzw. die Matomo-Site-ID (Zahl) |
| `MATOMO_URL` | nur Matomo: Adresse der Matomo-Installation, `https://…` |

Für Hetzner trägt man sie unter *Settings → Environments → `hetzner-webhosting` → Environment variables*
ein (Variablen, keine Secrets – die IDs stehen ohnehin in jeder Seite). Eine falsche ID bricht den Build ab.
Das Tracking lädt ohne Einwilligungsbanner direkt beim Seitenaufruf.
