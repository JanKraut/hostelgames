# Hostelgames

Monorepo für Spiel-Webseiten (Eleventy 3, Nunjucks, npm-Workspaces, Node 22).
Hub hostelgames.com, jedes Spiel optional auf eigener Domain. Details: `README.md`.

- `packages/core/` Gemeinsames (`@hostelgames/core`): Design (`core.css`), Layout (`layout: game`),
  Konfiguration (`eleventy.config.js`, `playwright.config.js`), `site`/`languages`/Sitemap,
  Hero, Steckbrief, Karten (`card.njk`), Würfel (`dice.njk`), Bausteine (`blocks.njk`), Quiz
  (`quiz.njk`), 404-Seite, Teilen-Box, Sprachmenü, Footer, Tracking, `check-i18n` und `siteTests`.
  Gemeinsames gehört hierher, nicht ins Spiel.
- `hub/` hostelgames.com, listet `games/*/game.json`.
- `games/<slug>/` ein Spiel mit eigener `CLAUDE.md` (nur Spielregeln, feste Begriffe und
  Besonderheiten). `game.json` ist die einzige Quelle für `category`, `domain`, `status`,
  `languages`, `pages` und `related`.
- Ordner = Domain ohne Endung (`shitheadgame.de` → `shitheadgame`, ohne Domain: `slug`).

Vor jedem Commit: `npm run check`, `npm run build:<slug>`, Tests des Spiels.

## Feste Regeln
- **Bei Arbeit an einem Spiel nur Dateien in `games/<slug>/` ändern.** Fehlt etwas im Core, Jan fragen.
- **Eigene Styles nur in `src/assets/styles.css`** (Ausnahme: Bot-Spiel in `src/assets/game/`).
- **Neue Seite:** Datei in `src/` anlegen UND in `pages` der `game.json` eintragen (sonst bricht der Build ab).
- **Live gehen:** Neue Spiele bleiben `draft`, bis Jan sie freigibt (`status` in `game.json` nur auf Wunsch von Jan ändern).
- **Kein Spiel gegen Bots (`play`, Engine, Bots), solange Jan es nicht ausdrücklich für dieses Spiel sagt** – auch nicht als Entwurf oder Vorbereitung.

## Sprachen
- Englisch ist Referenz. Jede Textänderung: `de` UND `en`, nur diese zwei öffnen.
- Andere Sprachen nur, wenn Jan es sagt (Ablauf: `docs/alle-sprachen.md`).
