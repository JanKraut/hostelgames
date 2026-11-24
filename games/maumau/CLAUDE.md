# Mau-Mau

Kartenspiel (`category: cards`) · Domain: noch keine · Ordner: maumau · Slug: maumau · Status: draft

## Stand
- Regelseite (src/index.njk) mit Texten de + en, aufgebaut wie Asshole, mit Steckbrief wie King’s Cup.
- Grundregeln: 32 Karten, je 5 Karten, Farbe oder Wert bedienen, sonst eine Karte ziehen.
  Sonderkarten: 7 = zwei ziehen (stapelbar), 8 = aussetzen, Bube = Wünscher (passt auf alles,
  nicht auf eine offene 7). „Mau“ bei der vorletzten, „Mau-Mau“ bei der letzten Karte,
  vergessen = Strafkarte. Punkte: Bube 20, Ass 11, 10 = 10, König 4, Dame 3, 9/8/7 Augenwert.
- Nächste Schritte: ggf. Strategie / Quickstart (Datei anlegen UND in `pages` der game.json
  eintragen, sonst bricht der Build ab). Domain festlegen, dann `domain` in game.json setzen.
- Kein Spiel gegen Bots (play), solange Jan es nicht ausdrücklich sagt.

## Begriffe
- Name in allen Sprachen „Mau-Mau“; Ausrufe „Mau!“ und „Mau-Mau!“ nicht übersetzen.
- Ziehstapel / Ablagestapel (en: draw pile / discard pile), Bube = Wünscher (en: jack, make a wish).

## Regeln für dieses Spiel
- Nur Dateien in games/maumau/ ändern. Fehlt etwas im Core, Jan fragen.
- Layout aus dem Core: `layout: game`; Karten, Reiter, Teilen-Box, Sprachmenü, Footer sind Core-Includes.
- Eigene Styles nur in src/assets/styles.css.
- Live gehen: `status` in game.json auf "live" – nur wenn Jan es sagt.
