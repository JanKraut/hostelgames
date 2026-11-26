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

1. `games/<slug>/` anlegen, am einfachsten als Kopie eines Grundgerüsts wie `games/cabo/`
   (`package.json` mit Namen `@hostelgames/<slug>`, `eleventy.config.js`, `playwright.config.js`,
   `src/`, `tests/`) und darin Namen, Domain und Texte ersetzen. `eleventy.config.js` und
   `playwright.config.js` sind je eine Zeile, die die Konfiguration aus dem Core übernimmt.
   Adresse (`site`), Sprachen (`languages`), Sitemap und `robots.txt` erzeugt der Core aus der
   `game.json`; in `src/_data/` liegen nur die Texte (`i18n/`).
2. `game.json` anlegen (Felder siehe unten), zu Beginn mit `"status": "draft"` und
   `"languages": ["en", "de"]`. Der Ordner in den URLs und auf dem Server ist die Domain ohne Endung
   (ohne Domain: `slug`).
3. Seiten nutzen das Layout aus dem Core (`layout: game`). Es lädt `core.css` und danach die eigene
   `src/assets/styles.css`. Sprachmenü, Seitenreiter, Spielkarten (`card.njk`), Teilen-Box
   (`share.njk`, mit `share: true`), Footer und Tracking kommen per `{% include %}` aus dem Core.
   Den Kopf baut der Core: `{% include "hero.njk" %}` (Texte wie bei Shithead: `rules.h1`,
   `rules.h1sub` – leer = keine zweite Zeile –, `sub`, `goal`; Kurzanleitung `h1`; andere Seiten
   `<seite>.h1`, `<seite>.sub`). Das Bild darin kommt aus `src/_includes/hero-art.njk` des Spiels.
   Die 404-Seite kommt ebenfalls aus dem Core, das Spiel ändert nur die Texte (`nf…`).
   Abschnittsnavigation, Schritte, Varianten und FAQ: Makros aus `blocks.njk`
   (`{{ faq(t) }}` zeigt `faqH`, `faq1q`/`faq1a` … bis zum letzten vorhandenen Text).
   Tests: `import { test, expect, siteTests } from "@hostelgames/core/testing"`,
   `import { languages, site } from "@hostelgames/core/game"` und `siteTests({ languages, site })` für alles, was jedes Spiel braucht (mit Quiz:
   `quiz: ["rules", "quickstart"]`); die eigene Spec testet nur, was das Spiel besonders macht.
   Standardtexte (Teilen-Box, Seitennamen, 404, Hell/Dunkel, Steckbrief-Beschriftungen) kommen aus
   `packages/core/i18n/standard/`; in die Texte des Spiels gehört nur, was es anders sagt.
4. Im Root `build:<slug>` und `start:<slug>` in `package.json` ergänzen und `npm install`. Die Startseite listet das Spiel automatisch (in der Vorschau auch als Entwurf).
5. Nichts in `ci.yml` nötig: Tests und Deploy erkennen das Spiel automatisch. Für ein Deploy
   `domain` in `game.json` setzen – der Ordnername ergibt sich daraus (siehe unten).

### `game.json`

Beschreibt das Spiel und ist die einzige Stelle für diese Angaben. Geprüft wird sie bei jedem Build
(`packages/core/lib/games.js`); ein Fehler nennt Datei und Feld.

| Feld | Beispiel | Bedeutung |
| --- | --- | --- |
| `slug` | `"shithead"` | Kurzname: Ordner im Repo, Paket `@hostelgames/<slug>`, Offline-Cache |
| `name`, `tagline` | `"Shithead"` | Name und eine Zeile für die Startseite |
| `domain` | `"https://shitheadgame.de"` | eigene Domain (optional); daraus der Ordner `shitheadgame` |
| `category` | `"cards"` / `"dice"` / `"drinking"` | Abschnitt auf der Startseite (Kartenspiele, Würfelspiele, Trinkspiele); Liste und Reihenfolge: `CATEGORIES` in `packages/core/lib/games.js` |
| `status` | `"draft"` / `"live"` | `draft`: nur in der Vorschau (GitHub Pages, mit Hinweis), nicht auf hostelgames.com, kein Deploy auf die eigene Domain |
| `languages` | `["en", "de", "fr"]` | angebotene Sprachen, `en` und `de` immer. Flagge, Name, Fallback und Reihenfolge im Menü: `packages/core/lib/languages.js` |
| `pages` | `["rules", "strategy", "quickstart", "play"]` | vorhandene Seiten, `rules` immer, `play` = Spiel gegen Bots. Die Reihenfolge ist auch die der Reiter oben auf der Seite. Muss zu den Dateien in `src/` passen (`index.njk`, `strategy.njk`, `quickstart.njk`, `play.njk`) |
| `related` | `["president"]` | ähnliche Spiele (Slugs), optional |
| `players`, `duration` | `{ "min": 3, "max": 6 }`, `"20–30 min"` | optional, für die Startseite |
| `factsheet` | `{ "scales": [["luck", "skill", 35], ["easy", "complex", 20], ["kids", "adults", 15]], "people": [2, 3] }` | optional: Steckbrief im Kopf der Regelseite (`packages/core/includes/factsheet.njk`). `scales`: zwei Texte aus `info` und ein Wert 0–100; `people`: Personen im Symbol der beiden Spielergruppen (1–3); `id`: Anker (Standard `factsheet`) |
| `testShards`, `deploy.environment` | `3` | nur für die CI, siehe unten |

Eine neue Sprache, die noch kein Spiel hat, kommt zuerst nach `packages/core/lib/languages.js`
(und ihre Flagge nach `packages/core/includes/flags.njk`), dann in `languages` des Spiels.

## Deployment

Ein Workflow (`.github/workflows/ci.yml`) testet und deployt:

- **Jeder Pull Request und Push:** Übersetzungen prüfen und alles bauen; Browser-Tests **nur für
  Spiele, die sich geändert haben** (`scripts/ci-plan.js`). Änderungen in `packages/`, `scripts/`,
  `.github/` oder `package*.json` zählen für alle Spiele – außer `package*.json` ändert sich nur bei
  einem Spiel (Scripts `build:<slug>` / `start:<slug>`, Workspace `games/<slug>`, z. B. beim Anlegen
  eines neuen Spiels): dann zählt nur dieses. Die Tests laufen im Playwright-Container
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
| Spiel ohne Domain, `live` (z. B. Kniffel) | hostelgames.com/`<slug>`/ | `hostelgames/<slug>` (mit dem Hub) |
| Spiel ohne Domain, `draft` | – | der `slug` (wird nicht deployt) |

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
Ist Tracking an, zeigt jede Seite unten links den Einwilligungsbanner von mut-im-rucksack.de
(„Akzeptieren“ / „Ablehnen“, Text und Links in `packages/core/data/legal.js`). Das Tracking lädt erst
nach „Akzeptieren“; die Wahl gilt 31 Tage (localStorage `consent`). Ohne Tracking gibt es keinen Banner.

### Impressum und Datenschutz

Der Footer jeder Seite verlinkt Impressum und Datenschutzerklärung von mut-im-rucksack.de
(`packages/core/data/legal.js`, Texte de/en, alle anderen Sprachen zeigen Englisch).
