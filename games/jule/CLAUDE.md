# Jule

Würfelspiel (`category: dice`) · Domain: noch keine · Ordner: jule · Slug: jule · Status: draft

## Stand
- Regelseite (src/index.njk) mit Texten de + en, aufgebaut wie Kniffel.
- Grundregeln: ein Würfel, reihum je ein Wurf; 1 bis 6 der Reihe nach notieren (Hinweg),
  dann 6 bis 1 streichen (Rückweg); für den Rückweg braucht es eine neue 6. Wer zuerst die 1
  streicht, gewinnt. Strafpunkte = Summe der noch fehlenden Zahlen (freiwillig).
- Stumme Jule als eigener Abschnitt (#silent): wer einen Ton macht, fängt bei der 1 neu an.
- Würfel (`dice.njk`) und Steckbrief sind von Kniffel kopiert (Core-Kandidaten).
- Nächste Schritte: ggf. Quickstart; Datei anlegen UND in `pages` der game.json eintragen,
  sonst bricht der Build ab. Domain festlegen, dann `domain` in game.json setzen.
- Kein Spiel gegen Bots (play), solange Jan es nicht ausdrücklich sagt.

## Begriffe
- Name in allen Sprachen „Jule“; Variante „Stumme Jule“ (en: Silent Jule).
- Hinweg / Rückweg (en: way there / way back).

## Regeln für dieses Spiel
- Nur Dateien in games/jule/ ändern. Fehlt etwas im Core, Jan fragen.
- Layout aus dem Core: `layout: game`; Reiter, Teilen-Box, Sprachmenü, Footer sind Core-Includes.
- Eigene Styles nur in src/assets/styles.css.
- Live gehen: `status` in game.json auf "live" – nur wenn Jan es sagt.
