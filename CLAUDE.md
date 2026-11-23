# Hostelgames

Monorepo für Kartenspiel-Webseiten. Hauptname „hostelgames“, Hauptdomain
hostelgames.com (Hub), jedes Spiel auf eigener Domain.
Eleventy 3 + Nunjucks, npm-Workspaces, Node 22.

## Struktur
- packages/core/   gemeinsames Design (core.css), Includes, Fonts, Tracking,
                   Service Worker, check-i18n – siehe packages/core/README.md
- hub/             hostelgames.com: Startseite + Übersicht pro Spiel,
                   automatisch aus games/*/game.json
- games/<slug>/    ein Spiel: game.json, src/, tests/, eigene CLAUDE.md
- scripts/build-all.js   baut Hub + alle Spiele nach _site/

Gemeinsames gehört nach packages/core, nicht ins Spiel. Ein Spiel überschreibt
ein Core-Include nur mit einer gleichnamigen Datei in seinem _includes/.

## Befehle
- npm run build              alles bauen (Hub + alle Spiele)
- npm run build:<slug>       ein Spiel bauen
- npm run start:<slug>       Spiel lokal mit Live-Reload
- npm run check / npm test   Übersetzungen prüfen / Tests

Vor jedem Commit: check, build und Tests des betroffenen Spiels.

## URLs
- Spiel-Domain, z. B. shitheadgame.de/en/ – indexiert
- hostelgames.com/<ordner>/ – Übersichtsseite, indexiert
- jankraut.github.io/hostelgames/<ordner>/ – Vorschau, immer noindex
- Ordner/Pfad = Domain ohne Endung (shitheadgame.de → shitheadgame), überall
  gleich: Pages, hostelgames.com, FTP. Ohne Domain der slug. Standardsprache Englisch.

## Feste Entscheidungen
- Tracking nur per Env: TRACKING_PROVIDER, TRACKING_ID, MATOMO_URL;
  ohne Einwilligungsbanner. Nichts fest im Code.
- Schrift Manrope, selbst gehostet. Keine externen Fonts oder CDNs.
- Deploy automatisch bei Push auf main (nur geänderte Spiele, nach grünen
  Tests); Zugangsdaten nur als Secrets, Standard-Environment
  hetzner-webhosting. Was als geändert gilt: scripts/ci-plan.js.

## Sprachen
- Eine JSON-Datei pro Sprache, Englisch ist Referenz.
- Neue Spiele: nur de + en.
- Jede Textänderung: de UND en immer beide anpassen.
- Alle anderen Sprachen nur, wenn Jan es sagt. Bis dahin zeigt die Seite
  für fehlende Texte automatisch Englisch.
- check-i18n: streng für en/de (Fehler), andere Sprachen nur Warnung.
  Platzhalter, HTML und #Links sind in allen Sprachen Fehler.
- Bei normalen Textänderungen nur de.json und en.json öffnen.

### „Erstelle mir jetzt zu dem Spiel alle Sprachen“
1. Spiel bestimmen (genannt oder aktuelles; sonst nachfragen).
2. Fehlende Sprachen und fehlende/veraltete Texte ermitteln
   (Warnungen von `npm run check`).
3. Aus Englisch übersetzen, Deutsch als Abgleich für Sinn und Ton.
4. Feste Begriffe aus der CLAUDE.md des Spiels beibehalten.
5. Neue Sprachen in languages.js (und game.json) eintragen.
6. check (jetzt ohne Warnungen), build, Tests – dann committen.
7. Melden: neue/aktualisierte Sprachen + unsicher übersetzte Begriffe.
Gilt genauso für einzelne Sprachen („… Spanisch und Französisch“).

## Arbeitsweise
- Nur Dateien öffnen, die die Aufgabe braucht.
- Architektur-Referenz: Projekt-Dokument „hostelgames-architektur“.
