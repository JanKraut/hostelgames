# @hostelgames/core

Gemeinsamer Kern aller Seiten im Monorepo (Spiele und Hub). Was hier liegt, sieht und verhält sich in
jedem Spiel gleich. Ein Spiel kann eine Include-Datei überschreiben, indem es eine gleichnamige in
seinem eigenen `_includes/` anlegt.

| Pfad | Inhalt |
| --- | --- |
| `eleventy.js` | Eleventy-Plugin, bindet alles unten ein (siehe Kommentar oben in der Datei) |
| `assets/core.css` | Gemeinsames Design: Farben (hell/dunkel), Schrift, Basis, Layout, Spielkarten, Holztisch, Kopfbereich mit Reitern, Sprachmenü mit Flaggen, Hell/Dunkel-Schalter, Footer |
| `assets/core.js` | Hell/Dunkel-Schalter, Sprachmenü (merkt sich die Sprache), registriert den Service Worker |
| `assets/sw.js` | Vorlage des Service Workers (offline), wird pro Seite mit Dateiliste und Hash gefüllt |
| `includes/` | `langmenu.njk`, `themeswitch.njk`, `flags.njk`, `footer.njk`, `tracking-head.njk`, `tracking-body.njk`, dazu für die Spiele: `card.njk` (Spielkarten-Makros), `pagenav.njk` (Reiter aus `pages` der game.json, ab zwei Seiten), `share.njk` + `sharebox.njk` (Teilen-Box mit QR-Code, Seiten mit `share: true`), `redirect.njk` (englische Startseite → gespeicherte Sprache) |
| `includes/layouts/game.njk` | Seitenrahmen für Spiele, `layout: game` (Shithead hat noch seinen eigenen `base.njk`) |
| `assets/share.js` | Teilen-Box: QR-Code (mit `qrcode-generator`, veröffentlicht als `assets/core/qrcode.js`), Link kopieren, Teilen |
| `lib/sitemap.js` | `createSitemap(site, languages)`: `sitemap.xml` und `robots.txt` aus `pages` der game.json |
| `data/fonts.js` | Schrift (Manrope, selbst gehostet), Schnitte und Zeichensätze |
| `data/tracking.js` | Tracking per Umgebungsvariablen, siehe Root-README |
| `lib/site.js` | `createSite(game.json)`: Adresse und Pfad-Präfix aus `SITE_ORIGIN` / `SITE_PATH_PREFIX` |
| `lib/games.js` | Liste aller Spiele aus `games/*/game.json`, prüft jede `game.json` (Felder: Root-README), `visibleGames(site)` blendet Entwürfe live aus |
| `lib/languages.js` | Alle Sprachen (Flagge, Name, Fallback, Menü-Reihenfolge); `createLanguages(site, i18nDir)` baut daraus die Sprachen eines Spiels |
| `test/` | Tests ohne Browser: `npm test -w @hostelgames/core` |
| `lib/fonts-css.js` | Erzeugt `fonts.css` aus den `@fontsource`-Paketen |
| `scripts/check-i18n.js` | Befehl `hostelgames-check-i18n`: prüft die Übersetzungen eines Spiels |
| `scripts/serve.js` | Befehl `hostelgames-serve <ordner> <präfix>`: kleiner Server für Tests und Vorschau |

Veröffentlicht wird alles unter `/assets/core/` jeder Seite (`core.css`, `core.js`, `share.js`,
`qrcode.js`, `fonts.css`, `fonts/`). Die Texte für Schalter und Menü (`themeSwitch`, `shH`, `foot`) kommen aus den i18n-Dateien
des jeweiligen Spiels.

Erwartete Daten einer Seite: `site` (aus `lib/site.js`), für Sprachmenü und Footer außerdem `lang`
(mit `t` = Texte) und `languages`, wie in `games/shithead/src/_data/languages.js`.
