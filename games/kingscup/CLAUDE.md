# King’s Cup

Trinkspiel (`category: drinking`) · Domain: noch keine · Ordner: kingscup · Slug: kingscup · Status: draft

## Stand
- Regelseite (src/index.njk) mit Texten de + en, aufgebaut wie Kniffel.
- Steckbrief im Kopfbereich (src/_includes/factsheet.njk, Texte unter `info`), mit Karten
  und Becher statt Würfeln. Styles wie bei Kniffel, als Core-Kandidat markiert.
- Karten kommen aus dem Core (`card.njk`); Kartenring und Becher (`ring.njk`) nur hier.
- Abschnitt „Verantwortungsvoll spielen“ (#safe) bleibt immer drin.
- Nächste Schritte: ggf. Quickstart (Spickzettel A–K fürs Handy); Datei anlegen UND in
  `pages` der game.json eintragen, sonst bricht der Build ab.
- Domain festlegen, dann `domain` in game.json setzen (Ordner = Domain ohne Endung).
- Kein Spiel gegen Bots (play), solange Jan es nicht ausdrücklich sagt.

## Begriffe
- Name in allen Sprachen „King’s Cup“; „Ring of Fire“ und „Circle of Death“ als andere Namen.
- Feste Namen der Karten en / de: A Waterfall / Wasserfall, 2 You / Du, 3 Me / Ich,
  4 Floor / Boden, 5 Guys / Jungs, 6 Girls / Mädels, 7 Heaven / Himmel, 8 Mate / Partner,
  9 Rhyme / Reim, 10 Categories / Kategorien, J Rule / Regel, Q Question Master / Fragemeister,
  K King’s Cup.
- Trinken wird in Schlucken angegeben, nie in Shots oder Mengen.

## Regeln für dieses Spiel
- Nur Dateien in games/kingscup/ ändern. Fehlt etwas im Core, Jan fragen.
- Layout aus dem Core: `layout: game`; Reiter, Teilen-Box, Sprachmenü, Footer sind Core-Includes.
- Eigene Styles nur in src/assets/styles.css.
- Live gehen: `status` in game.json auf "live" – nur wenn Jan es sagt.
