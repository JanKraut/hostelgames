# Shithead

Gehört inhaltlich zu mut-im-rucksack.de: beim Design hat Mut im Rucksack das letzte Wort.

## Besonderheiten
- `src/quickstart.njk`: Spickzettel muss auf einen Handybildschirm passen, Kopfbereich wie bei den
  Regeln.
- `src/play.njk` und `src/assets/game/`: Spiel gegen Bots – beim Umbau vorerst nicht anfassen. Bei
  Änderungen an `src/assets/game/` immer `tests/engine.spec.js` und `tests/play.spec.js` laufen lassen.
- Übungsquiz: nutzt `quiz.njk` und `assets/core/quiz.js` aus dem Core; hier liegen nur die Spielregel
  (`src/assets/quiz.js`) und die Texte `qH`, `qLead`, `qQ`, `qTop`, `qMine`, `qNext`, `quiz.*`.
- `src/.htaccess` wird nur beim Build für die eigene Domain (`shitheadgame.de`) kopiert;
  `src/assets/site.js` leitet alte deutsche `#abschnitt`-Links um.

## Begriffe
- „Four of a Kind Burn“, nicht „Vierling“ – in allen Sprachen.
