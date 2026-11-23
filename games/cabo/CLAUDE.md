# Cabo

Domain: cabogame.de · Ordner: cabogame · Slug: cabo · Status: draft
Ähnliches Spiel: cambio (gegenseitig in `related` der game.json)

## Stand
- Grundgerüst: nur die Regelseite (src/index.njk) als Rahmen, Texte de + en.
- Nächste Schritte: Regeln schreiben, danach ggf. Strategie / Quickstart
  (Datei anlegen UND in `pages` der game.json eintragen, sonst bricht der Build ab).
- Ein Spiel gegen Bots (`play`) erst später; die Spiel-Engine soll mit
  cambio geteilt werden (gehört dann nach packages/core).

## Regeln für dieses Spiel
- Nur Dateien in games/cabo/ ändern. Fehlt etwas im Core, Jan fragen.
- Layout aus dem Core: `layout: game`; Karten, Reiter, Teilen-Box,
  Sprachmenü, Footer sind Core-Includes.
- Eigene Styles nur in src/assets/styles.css.
- Live gehen: `status` in game.json auf "live" – nur wenn Jan es sagt.
