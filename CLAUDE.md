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

## Parallele Sessions
Jan lässt oft mehrere Sessions gleichzeitig laufen. Damit es keine
Merge-Konflikte gibt:
- Jede Aufgabe auf einem eigenen Branch vom aktuellen main.
  Ein gemergter Branch ist abgeschlossen: nie darauf weiterarbeiten,
  für Nachträge neuer Branch von main (vorher `git fetch`).
- Vor dem Push und vor dem PR: `git fetch origin main` und auf
  origin/main rebasen; Konflikte selbst lösen, dann check/build/Tests.
- Nur die Dateien der eigenen Aufgabe ändern. Kein Umformatieren,
  Umsortieren oder Aufräumen fremder Stellen nebenbei.
- Hotspots, die viele Aufgaben berühren – hier besonders sparsam ändern:
  games/<slug>/src/assets/styles.css, tests/site.spec.js,
  i18n/*.json, base.njk, .github/workflows/ci.yml, package-lock.json.
- Neue i18n-Keys direkt neben verwandte Keys einfügen, nie ans Dateiende
  (dort kollidieren parallele Änderungen immer).
- packages/core, scripts/, .github/ und neue Dependencies betreffen alle
  Spiele: nur in einer eigenen Aufgabe ändern, nicht nebenbei. Läuft
  parallel eine andere Session daran, nachfragen.
- Dateien verschieben, umbenennen oder große Umbauten nur, wenn keine
  andere Session läuft (Jan fragen).
- Lokal mehrere Worktrees: jeder mit eigenem Port, z. B.
  `PORT=8081 npm run start:shithead`, `PORT=8082 npm test -w @hostelgames/shithead`.
  Sonst testet Playwright gegen den Server eines anderen Worktrees.

## Arbeitsweise
- Nur Dateien öffnen, die die Aufgabe braucht.
- Architektur-Referenz: Projekt-Dokument „hostelgames-architektur“.
