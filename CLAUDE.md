# Hostelgames

Monorepo für Kartenspiel-Webseiten (Eleventy 3, Nunjucks, npm-Workspaces, Node 22).
Hub hostelgames.com, jedes Spiel auf eigener Domain. Details: README.md.

- `packages/core/` Gemeinsames (Design, Includes, Layout, Tracking, check-i18n).
  Gemeinsames gehört hierher, nicht ins Spiel.
- `hub/` hostelgames.com, listet `games/*/game.json`
- `games/<slug>/` ein Spiel mit eigener CLAUDE.md. `game.json` ist die Quelle für
  status, languages, pages, related. Neue Spiele `draft`, bis Jan sie freigibt
- Ordner = Domain ohne Endung (shitheadgame.de → shitheadgame)

Vor jedem Commit: `npm run check`, `npm run build:<slug>`, Tests des Spiels.

## Feste Regeln
- **Kein Spiel gegen Bots (`play`, Engine, Bots), solange Jan es nicht
  ausdrücklich für dieses Spiel sagt** – auch nicht als Entwurf oder Vorbereitung.

## Sprachen
- Englisch ist Referenz. Jede Textänderung: de UND en, nur diese zwei öffnen.
- Andere Sprachen nur, wenn Jan es sagt (Ablauf: docs/alle-sprachen.md).

## Parallele Sessions
- Eigener Branch vom aktuellen main; nie auf einem gemergten Branch weiter.
  Vor dem PR auf origin/main rebasen, dann check/build/Tests.
- Nur Dateien der eigenen Aufgabe ändern, nichts nebenbei umformatieren.
- Neue i18n-Keys neben verwandte Keys, nie ans Dateiende.
