# Asshole

Domain: assholegame.de · Ordner: assholegame · Slug: asshole · Status: draft
Ähnliches Spiel: president (gegenseitig in `related` der game.json)

## Stand
- Regelseite (src/index.njk), Strategie (src/strategy.njk) und Quickstart (src/quickstart.njk)
  geschrieben, Texte de + en. Grundregeln: 32 Karten
  (7 bis Ass, Ass hoch), gleich viele höhere Karten legen, Passen jederzeit,
  Arschloch gibt 2 höchste an den König, Vize-Arschloch 1 an den Vize-König.
- Feste Begriffe: König / Vize-König / Bürger / Vize-Arschloch / Arschloch
  (en: king / vice king / citizen / vice asshole / asshole), „drücken“ = Kartentausch.
- Kein Spiel gegen Bots (play), solange Jan es nicht ausdrücklich sagt.

## Regeln für dieses Spiel
- Nur Dateien in games/asshole/ ändern. Fehlt etwas im Core, Jan fragen.
- Layout aus dem Core: `layout: game`; Karten, Reiter, Teilen-Box,
  Sprachmenü, Footer sind Core-Includes.
- Eigene Styles nur in src/assets/styles.css.
- Live gehen: `status` in game.json auf "live" – nur wenn Jan es sagt.
