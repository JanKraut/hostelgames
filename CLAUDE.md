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
  Regeln für Besonderheiten). Welche Dateien besonders sind, steht nur im `README.md` des Spiels.
  `game.json` ist die einzige Quelle für `category`, `domain`, `status`, `languages`, `pages` und
  `related`. Ändern sich `status` oder `domain`: Tabelle „Alle Spiele“ im Root-`README.md` anpassen.
  `related` immer gegenseitig eintragen (A nennt B, B nennt A).
- Aufbau der `CLAUDE.md` eines Spiels: Vorlage `docs/vorlage-spiel-claude.md`.
- Ordner = Domain ohne Endung (`shitheadgame.de` → `shitheadgame`, ohne Domain: `slug`).

Vor jedem Commit: `npm run check`, `npm run build:<slug>`, Tests des Spiels.

## Feste Regeln
- **Bei Arbeit an einem Spiel nur Dateien in `games/<slug>/` ändern.** Fehlt etwas im Core, Jan fragen.
- **Eigene Styles nur in `src/assets/styles.css`** (Ausnahme: Bot-Spiel in `src/assets/game/`).
- **Neue Seite:** Datei in `src/` anlegen UND in `pages` der `game.json` eintragen (sonst bricht der Build ab).
- **Live gehen:** Neue Spiele bleiben `draft`, bis Jan sie freigibt (`status` in `game.json` nur auf Wunsch von Jan ändern).
- **Kein Spiel gegen Bots (`play`, Engine, Bots), solange Jan es nicht ausdrücklich für dieses Spiel sagt** – auch nicht als Entwurf oder Vorbereitung.
- **Eigene Grafik oder Funktion eines Spiels** (z. B. Becher bei King’s Cup, Block bei Kniffel) bleibt
  im Spiel. Braucht ein zweites Spiel dasselbe, Jan vorschlagen, es in den Core zu verschieben
  (offene Punkte: `packages/core/README.md`).

## Sprachen
- Englisch ist Referenz. Jede Textänderung: `de` UND `en`, nur diese zwei öffnen.
- Andere Sprachen nur, wenn Jan es sagt (Ablauf: `docs/alle-sprachen.md`).
- Feste Begriffe unter „Begriffe“ in der `CLAUDE.md` eines Spiels gelten in allen Sprachen: Ein
  Begriff ohne Übersetzung bleibt überall gleich (nicht übersetzen). Bei Paaren `en / de` die übrigen
  Sprachen aus dem englischen Begriff übersetzen und auf allen Seiten gleich verwenden.
- Einheitliches Key-Schema in jedem Spiel: oben `h1`, `sub`, `goal`, `seo`, `info`;
  alle Texte der Regelseite unter `rules` (Navigation `nSetup`, `nPlay` … `nVar`, `nFaq`,
  Abschnitte `setupH`, `setupLead` …, Listen `var1…`, `faq1q/faq1a`; im Template
  `r = t.rules`); weitere Seiten unter `strategy`, `quick`, `sheet`; Quiz `q…`/`quiz`, 404 `nf…`.
