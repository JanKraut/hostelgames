# Vorlage: `games/<slug>/CLAUDE.md`

Die `CLAUDE.md` eines Spiels enthält nur, was Claude für **dieses** Spiel wissen muss. Alles, was für
alle Spiele gilt, steht in der Root-`CLAUDE.md`; welche Dateien besonders sind, steht im `README.md`
des Spiels; Status, Sprachen, Seiten und ähnliche Spiele stehen in der `game.json`.

Nur Abschnitte anlegen, die etwas enthalten. Reihenfolge immer so:

```markdown
# <Name>

## Spielregeln
- Kurzfassung der Regeln, nach denen die Seiten geschrieben sind (Karten, Ablauf, Wertung).
- Was nur Variante ist und nicht in die Grundregeln gehört.

## Besonderheiten
- Regeln für die Arbeit am Spiel, z. B. „bleibt immer drin“, „bei Änderungen neu rechnen“,
  „nicht anfassen“. Dateien nicht aufzählen, sondern aufs `README.md` verweisen.

## Begriffe
- Feste Begriffe, die überall gleich verwendet werden.
- Ohne Übersetzung = in allen Sprachen gleich: „Four of a Kind Burn“.
- Paare `en / de`: draw pile / Ziehstapel. Andere Sprachen werden aus dem Englischen übersetzt.
```

Nicht hinein:
- Status, Domain, Sprachen, Seiten, ähnliche Spiele (`game.json`)
- Dateilisten (`README.md` des Spiels)
- Regeln für alle Spiele oder den Core (Root-`CLAUDE.md`, `packages/core/README.md`)
