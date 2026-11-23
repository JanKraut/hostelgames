# President

Domain: presidentsgame.de · Ordner: presidentsgame · Slug: president · Status: draft
Ähnliches Spiel: asshole (gegenseitig in `related` der game.json)

## Stand
- Regelseite (src/index.njk) mit Texten de + en; Abschnitte setup, how-to-play,
  round-end, swap, variants, faq, share.
- Nächste Schritte: ggf. Strategie / Quickstart
  (Datei anlegen UND in `pages` der game.json eintragen, sonst bricht der Build ab).
- Kein Spiel gegen Bots (play), solange Jan es nicht ausdrücklich sagt.

## Begriffe
- Grundregeln: 3 niedrigste, 2 höchste Karte; 3♣ eröffnet die erste Runde,
  danach der Präsident; Bettler gibt 2 beste Karten, Vize-Bettler 1.
  Alles andere (Revolution, Gleiche überspringen, 2 räumt ab …) nur als Variante.
- Ränge: President / Präsident, Vice-President / Vizepräsident, Citizen / Bürger,
  Vice-Scum / Vize-Bettler, Scum / Bettler – in allen Sprachen diese Rollen

## Regeln für dieses Spiel
- Nur Dateien in games/president/ ändern. Fehlt etwas im Core, Jan fragen.
- Layout aus dem Core: `layout: game`; Karten, Reiter, Teilen-Box,
  Sprachmenü, Footer sind Core-Includes.
- Eigene Styles nur in src/assets/styles.css.
- Live gehen: `status` in game.json auf "live" – nur wenn Jan es sagt.
