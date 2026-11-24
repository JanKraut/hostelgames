# Schafkopf

Kartenspiel (`category: cards`) · Domain: noch keine · Ordner: schafkopf · Slug: schafkopf · Status: draft

## Stand
- Regelseite (src/index.njk) mit Texten de + en, aufgebaut wie Asshole, mit Steckbrief wie King’s Cup.
- Grundregeln: 4 Spieler, 32 Karten, je 8 (zweimal vier). Sauspiel: 14 Trümpfe (4 Ober, 4 Unter,
  6 Herz), Farben Sau-10-K-9-8-7. Augen: Sau 11, 10 = 10, K 4, O 3, U 2 = 120; 61 gewinnt.
  Spielarten Sauspiel < Wenz < Solo. Bedienpflicht, kein Stichzwang. Tarif 1 / 5, Schneider +1,
  Schwarz +2, Laufende ab 3 (Wenz ab 2) je +1.
- Karten mit französischen Farben aus dem Core: ♣ Eichel, ♠ Gras, ♥ Herz, ♦ Schellen; Rang-Buchstaben
  aus `rules.rO/rU/rK/rA` (de: O, U, K, A – en: Q, J, K, A). Bayerische Kartenbilder gibt es im Core
  (noch) nicht.
- Nächste Schritte: ggf. Strategie / Quickstart (Datei anlegen UND in `pages` der game.json
  eintragen, sonst bricht der Build ab). Domain festlegen, dann `domain` in game.json setzen.
- Kein Spiel gegen Bots (play), solange Jan es nicht ausdrücklich sagt.

## Begriffe
- Bayerische Begriffe auch im Englischen beibehalten: Ober, Unter, Sau, Sauspiel, Wenz, Solo,
  Schneider, Schwarz, Laufende, Vorhand, Ramsch, Kontra/Re, Eichel, Gras, Herz, Schellen.
- Kartenpunkte heißen auf Deutsch „Augen“ (en: card points).

## Regeln für dieses Spiel
- Nur Dateien in games/schafkopf/ ändern. Fehlt etwas im Core, Jan fragen.
- Layout aus dem Core: `layout: game`; Karten, Reiter, Teilen-Box, Sprachmenü, Footer sind Core-Includes.
- Eigene Styles nur in src/assets/styles.css.
- Live gehen: `status` in game.json auf "live" – nur wenn Jan es sagt.
