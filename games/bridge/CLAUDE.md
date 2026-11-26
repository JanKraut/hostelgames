# Bridge

Kartenspiel (`category: cards`) · Domain: noch keine · Ordner: bridge · Slug: bridge · Status: draft

## Stand
- Regelseite (`src/index.njk`), Strategieseite (`src/strategy.njk`) und Quickstart-Spickzettel
  (`src/quickstart.njk`) mit Texten de + en, Steckbrief im Kopfbereich.
- Grundregeln (Kontrakt- / Rubber-Bridge): 4 Spieler in 2 festen Paaren (N–S gegen O–W), 52 Karten,
  je 13 Karten. Farbrangfolge in der Reizung: ♣ < ♦ < ♥ < ♠ < SA (NT). Gebote Stufe 1–7 = Stiche
  über 6 (Buch). Alleinspieler ist, wer die Kontraktfarbe zuerst genannt hat; Partner legt als
  Dummy offen auf den Tisch. Bedienpflicht, kein Stichzwang. Rubber-Wertung: Unterfarben 20,
  Oberfarben 30, SA 40 + 30; Vollspiel ab 100 Punkten unter dem Strich (3 SA, 4 ♥/♠, 5 ♣/♦);
  Rubber nach 2 Vollspielen (+700 bei 2:0, +500 bei 2:1); Kleinschlemm 500/750, Großschlemm
  1000/1500; Faller 50/100 (ungedoppelt).
- Strategie: Figurenpunkte (A=4, K=3, D=2, B=1 = 40 FP), 8-Karten-Fit, natürliche Reizung (12+ FP
  Eröffnung, 25+ Vollspiel), Spielplan als Alleinspieler (Gewinner/Verlierer, Trumpf ziehen,
  Schnitt / Finesse mit Grafik), Gegenspiel (Ausspiel, 2. Hand niedrig / 3. Hand hoch).
- Nächste Schritte: Domain festlegen, dann `domain` in `game.json` setzen; ggf. weitere Sprachen
  auf Wunsch von Jan (`docs/alle-sprachen.md`).
- Kein Spiel gegen Bots (`play`), solange Jan es nicht ausdrücklich sagt.

## Begriffe
- Deutsche Bridge-Begriffe: Treff (♣, Kreuz), Karo (♦), Coeur (♥, Herz), Pik (♠), Sans Atout (SA),
  Reizung, Kontrakt, Alleinspieler, Dummy (Tisch), Gegenspieler, Ausspiel, Kontra/Rekontra,
  Figurenpunkte (FP), Fit, Schnitt, Teilkontrakt, Vollspiel, Kleinschlemm, Großschlemm, Rubber,
  in Gefahr, Überstiche, Faller.
- Englische Bridge-Begriffe: Clubs, Diamonds, Hearts, Spades, No Trump (NT), auction/bidding,
  contract, declarer, dummy, defenders, opening lead, double/redouble, High Card Points (HCP),
  fit, finesse, part-score, game, small slam, grand slam, rubber, vulnerable, overtricks,
  undertricks, book.
- Kartenbilder nutzen internationale Buchstaben (A, K, Q, J) wie alle anderen Spiele mit
  französischem Blatt im Repo.

## Regeln für dieses Spiel
- Nur Dateien in `games/bridge/` ändern. Fehlt etwas im Core, Jan fragen.
- Layout aus dem Core: `layout: game`; Karten, Hero, Steckbrief, Reiter, Teilen-Box, Sprachmenü,
  404-Seite, Bausteine (`blocks.njk`) und Footer sind Core-Includes.
- Eigene Styles nur in `src/assets/styles.css`.
- Live gehen: `status` in `game.json` auf `"live"` – nur wenn Jan es sagt.
