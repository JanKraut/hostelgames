# Ablauf: „Erstelle mir jetzt zu dem Spiel alle Sprachen“

Gilt genauso für einzelne Sprachen („… Spanisch und Französisch“).

1. Spiel bestimmen (genannt oder aktuelles; sonst nachfragen).
2. Fehlende Sprachen und fehlende/veraltete Texte ermitteln
   (Warnungen von `npm run check`).
3. Aus Englisch übersetzen, Deutsch als Abgleich für Sinn und Ton.
4. Feste Begriffe aus der CLAUDE.md des Spiels beibehalten.
5. Neue Sprachcodes in `languages` der game.json eintragen. Eine Sprache, die
   es noch in keinem Spiel gibt, zuerst in packages/core/lib/languages.js
   (Flagge in packages/core/includes/flags.njk).
6. check (jetzt ohne Warnungen), build, Tests – dann committen.
7. Melden: neue/aktualisierte Sprachen + unsicher übersetzte Begriffe.

check-i18n: streng für en/de (Fehler), andere Sprachen nur Warnung.
Platzhalter, HTML und #Links sind in allen Sprachen Fehler.
