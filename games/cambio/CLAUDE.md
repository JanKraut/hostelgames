# Cambio

Domain: cambiogame.de · Ordner: cambiogame · Slug: cambio · Status: draft
Ähnliches Spiel: cabo (gegenseitig in `related` der game.json)

## Stand
- Regelseite (src/index.njk) mit allen Abschnitten, Texte de + en.
- Nächste Schritte: ggf. Strategie / Quickstart
  (Datei anlegen UND in `pages` der game.json eintragen, sonst bricht der Build ab).
- Kein Spiel gegen Bots (play), solange Jan es nicht ausdrücklich sagt.

## Regeln für dieses Spiel
- Nur Dateien in games/cambio/ ändern. Fehlt etwas im Core, Jan fragen.
- Layout aus dem Core: `layout: game`; Karten, Reiter, Teilen-Box,
  Sprachmenü, Footer sind Core-Includes.
- Eigene Styles nur in src/assets/styles.css.
- Live gehen: `status` in game.json auf "live" – nur wenn Jan es sagt.
