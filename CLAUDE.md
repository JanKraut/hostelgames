# Hostelgames

Monorepo für Kartenspiel-Webseiten (Eleventy 3, Nunjucks, npm-Workspaces, Node 22).
Hub hostelgames.com, jedes Spiel auf eigener Domain. Details: README.md.

- `packages/core/` Gemeinsames (Design, Includes, Layout, Tracking, check-i18n).
  Gemeinsames gehört hierher, nicht ins Spiel.
- `hub/` hostelgames.com, listet `games/*/game.json`.
- `games/<slug>/` ein Spiel mit eigener CLAUDE.md. `game.json` ist die Quelle für
  status, languages, pages, related. Neue Spiele `draft`, bis Jan sie freigibt.
- Ordner = Domain ohne Endung (shitheadgame.de → shitheadgame), überall gleich.

Vor jedem Commit: `npm run check`, `npm run build:<slug>`, Tests des Spiels.

## Feste Regeln
- **Kein Spiel gegen Bots (`play`, Engine, Bots), solange Jan es nicht
  ausdrücklich für dieses Spiel sagt** – auch nicht als Entwurf oder Vorbereitung.
- Tracking nur per Env (TRACKING_PROVIDER, TRACKING_ID, MATOMO_URL), kein Banner.
- Schrift Manrope selbst gehostet, keine externen Fonts/CDNs.
- Zugangsdaten nur als GitHub-Secrets. Deploy macht die CI (scripts/ci-plan.js).

## Sprachen
- Englisch ist Referenz. Jede Textänderung: de UND en, nur diese zwei öffnen.
- Andere Sprachen nur, wenn Jan es sagt (Ablauf: docs/alle-sprachen.md).

## Parallele Sessions
- Eigener Branch vom aktuellen main; nie auf einem gemergten Branch weiter.
  Vor dem PR auf origin/main rebasen, dann check/build/Tests.
- Nur Dateien der eigenen Aufgabe ändern, nichts nebenbei umformatieren.
- Neue i18n-Keys neben verwandte Keys, nie ans Dateiende.
- packages/core, scripts/, .github/, Dependencies: nur als eigene Aufgabe.
  Verschieben/große Umbauten nur, wenn keine andere Session läuft.
- Lokal mehrere Worktrees: eigener PORT pro Worktree (`PORT=8081 npm test -w …`).
