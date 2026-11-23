# Hostel Games

Kartenspiele aus jedem Hostel der Welt: Regeln, Strategie, Spickzettel und Spiele gegen Bots,
mehrsprachig und offline-fähig. Ein Monorepo: alle Spiele teilen sich einen Core, damit Design und
Verhalten überall gleich sind. Pro Spiel gibt es einen Unterordner.

Später: Hauptdomain **hostelgames.com** (Startseite + jedes Spiel unter `/<spiel>/`) und zusätzlich
eine eigene Domain pro Spiel (z. B. shitheadgame.de). Beides steht noch nicht zur Verfügung;
bis dahin gibt es nur Builds und eine manuelle Vorschau auf GitHub Pages.

## Aufbau

| Pfad | Inhalt |
| --- | --- |
| `packages/core/` | **`@hostelgames/core`**: gemeinsamer Kern aller Seiten, siehe [README](packages/core/README.md) |
| `games/<slug>/` | Ein Spiel, eigene Eleventy-Seite mit `game.json`, Texten, Tests. Erstes Spiel: [`games/shithead/`](games/shithead/README.md) |
| `hub/` | Startseite von hostelgames.com, listet automatisch alle Spiele aus `games/*/game.json` |
| `scripts/build-all.js` | Baut Hub und alle Spiele in ein gemeinsames `_site/` (Aufbau wie hostelgames.com) |
| `.github/workflows/ci.yml` | Build und Tests bei jedem Push und Pull Request, **ohne Deployment** |
| `.github/workflows/deploy.yml` | Deployment, **nur manuell** (Actions → „Deploy (manual)“) |

Die Workspaces (npm) sind `packages/*`, `games/*` und `hub`. Abhängigkeiten werden einmal im Root
installiert.

## Entwickeln

```sh
npm install              # einmal, im Root
npm run start:shithead   # Dev-Server eines Spiels: http://localhost:8080/hostelgames/shithead/
npm run start:hub        # Dev-Server der Startseite: http://localhost:8080/hostelgames/
npm run build            # alles nach _site/ (Hub + alle Spiele)
npm run serve            # _site/ ansehen: http://localhost:8080/hostelgames/
npm run check            # Übersetzungen aller Spiele prüfen
npm test                 # Tests aller Spiele (vorher je Spiel bauen, siehe dort)
```

## Adressen und Builds

Jede Seite bekommt Adresse und Pfad-Präfix beim Build über Umgebungsvariablen
(`packages/core/lib/site.js`):

| Ziel | `SITE_ORIGIN` | `SITE_PATH_PREFIX` | Befehl |
| --- | --- | --- | --- |
| Vorschau GitHub Pages (Standard, `noindex`) | `https://jankraut.github.io` | `/hostelgames/` | `npm run build` |
| Hauptdomain, später | `https://hostelgames.com` | `/` | `npm run build` |
| Eigene Domain eines Spiels, später | z. B. `https://shitheadgame.de` | `/` | `npm run build -w @hostelgames/shithead` |

`npm run build` legt die Startseite nach `_site/` und jedes Spiel nach `_site/<slug>/`, mit passendem
Präfix. Eine Spiel-Domain baut nur dieses Spiel (Ausgabe in `games/<slug>/_site/`); stimmt die Adresse
mit `domain` aus seiner `game.json` überein, kommt seine `.htaccess` dazu.
Alles auf `github.io` bekommt `noindex` und keine Sitemap.

## Neues Spiel anlegen

1. `games/<slug>/` anlegen, am einfachsten als Kopie der Struktur von `games/shithead/`
   (`package.json` mit Namen `@hostelgames/<slug>`, `eleventy.config.js`, `src/`, `tests/`).
2. `game.json` mit `slug`, `name`, `tagline` und, falls schon bekannt, `domain`.
3. In `eleventy.config.js` das Core-Plugin einbinden:
   `eleventyConfig.addPlugin(hostelgames, { site, cacheName: "<slug>" })`.
4. Im Layout erst `/assets/core/fonts.css` und `/assets/core/core.css`, dann die eigenen Styles laden,
   und `/assets/core/core.js` als Modul. Sprachmenü, Footer, Tracking per `{% include %}` aus dem Core.
5. `npm install` im Root. Die Startseite listet das Spiel automatisch.
6. In `ci.yml` einen Test-Job für das Spiel ergänzen (wie `test-shithead`).

## Deployment

**Es wird nichts automatisch deployt.** `ci.yml` baut und testet nur. Deployments laufen ausschließlich
von Hand über *Actions → Deploy (manual) → Run workflow* mit einem Ziel:

- `shithead-hetzner`: baut Shithead für `https://shitheadgame.de/` und lädt es per FTPS (`lftp`) auf den
  Hetzner-Webspace. Nötig ist das Environment `hetzner-webhosting` mit den Secrets `HETZNER_HOST`,
  `HETZNER_USER`, `HETZNER_PASSWORD` und optional der Variable `HETZNER_FTP_DIR` (Zielverzeichnis relativ
  zum FTP-Login, Standard `.`). Übertragen werden nur Änderungen; was es im Build nicht mehr gibt,
  wird auch auf dem Server gelöscht – das Zielverzeichnis gehört also allein dieser Seite.
- `github-pages`: baut alles (Hub + Spiele) und veröffentlicht es als Vorschau unter
  `https://jankraut.github.io/hostelgames/`. Einmalig nötig: *Settings → Pages → Source: GitHub Actions*
  (bei privaten Repos nur mit passendem GitHub-Plan).

Ein Ziel für hostelgames.com kommt dazu, sobald die Domain bereitsteht. Automatisch deployen heißt
später: in `deploy.yml` einen `push`-Trigger ergänzen.

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
