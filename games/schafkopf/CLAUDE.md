# Schafkopf

Kartenspiel (`category: cards`) · Domain: noch keine · Ordner: schafkopf · Slug: schafkopf · Status: draft · Sprachen: 2 (en, de)

## Stand
- Regelseite (`src/index.njk`) mit Texten `de` + `en`.
- Grundregeln: 4 Spieler, 32 Karten, je 8 (zweimal vier). Sauspiel: 14 Trümpfe (4 Ober, 4 Unter,
  6 Herz), Farben Sau-10-K-9-8-7. Augen: Sau 11, 10 = 10, K 4, O 3, U 2 = 120; 61 gewinnt.
  Spielarten Sauspiel < Wenz < Solo. Bedienpflicht, kein Stichzwang. Tarif 1 / 5, Schneider +1,
  Schwarz +2, Laufende ab 3 (Wenz ab 2) je +1.
- Karten mit französischen Farben aus dem Core: ♣ Eichel, ♠ Gras, ♥ Herz, ♦ Schellen;
  Rang-Buchstaben aus `rules.rO`/`rU`/`rK`/`rA` (de: O, U, K, A – en: Q, J, K, A). Bayerische
  Kartenbilder gibt es im Core (noch) nicht.
- Nächste Schritte: ggf. Strategie / Quickstart (Datei anlegen UND in `pages` der `game.json`
  eintragen, sonst bricht der Build ab); Domain festlegen, dann `domain` in `game.json` setzen.

## Begriffe
- Bayerische Begriffe auch im Englischen beibehalten: Ober, Unter, Sau, Sauspiel, Wenz, Solo,
  Schneider, Schwarz, Laufende, Vorhand, Ramsch, Kontra/Re, Eichel, Gras, Herz, Schellen.
- Kartenpunkte heißen auf Deutsch „Augen“ (en: card points).

## Regeln für dieses Spiel
- Nur Dateien in `games/schafkopf/` ändern. Fehlt etwas im Core, Jan fragen.
- Core-Basis: `layout: game`, Konfiguration (`eleventy.config.js`, `playwright.config.js`),
  `site`/`languages`/Sitemap, Hero, Steckbrief, Karten (`card.njk`), Bausteine (`blocks.njk`),
  404-Seite, Teilen-Box, Sprachmenü, Footer und `siteTests` kommen aus `@hostelgames/core`.
- Eigene Styles nur in `src/assets/styles.css`.
- Live gehen: `status` in `game.json` auf `"live"` – nur wenn Jan es sagt.
- Kein Spiel gegen Bots (`play`), solange Jan es nicht ausdrücklich sagt.
