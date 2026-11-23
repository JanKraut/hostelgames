# Shithead

Domain: shitheadgame.de · Slug: shithead · 15 Sprachen
Gehört inhaltlich zu mut-im-rucksack.de: beim Design hat Mut im Rucksack
das letzte Wort.

## Seiten (src/)
- index.njk       Regeln (ausführlich)
- strategy.njk    Strategie
- quickstart.njk  Spickzettel, muss auf einen Handybildschirm passen;
                  Kopfbereich wie bei den Regeln
- play.njk        Spiel gegen Bots (assets/game/); beim Umbau vorerst
                  nicht anfassen

## Begriffe
- „Four of a Kind Burn“, nicht „Vierling“ – in allen Sprachen

## Texte
- src/_data/i18n/<lang>.json, Referenz en.json; Sprachliste und
  Fallbacks (es-419 → es, pt-br → pt) in src/_data/languages.js
- check-i18n prüft auch index.njk, specials.njk, quiz.njk
- Jan liefert neue Texte meist auf Deutsch, einen nach dem anderen
  → de + en anpassen, die übrigen 13 Sprachen nicht

## Besonderheiten
- .htaccess nur für die eigene Domain (shitheadgame.de)
- Tests: engine.spec.js (Spielregeln), play.spec.js (Bot-Spiel),
  site.spec.js (Seiten). Bei Änderungen an assets/game/ immer
  engine- und play-Tests laufen lassen.
