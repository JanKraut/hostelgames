# @hostelgames/core

Gemeinsamer Kern aller Seiten im Monorepo (Spiele und Hub). Was hier liegt, sieht und verhält sich in
jedem Spiel gleich. Ein Spiel kann eine Include-Datei überschreiben, indem es eine gleichnamige in
seinem eigenen `_includes/` anlegt.

| Pfad | Inhalt |
| --- | --- |
| `eleventy.js` | Eleventy-Plugin, bindet alles unten ein (siehe Kommentar oben in der Datei) |
| `assets/core.css` | Gemeinsames Design: Farben (hell/dunkel), Schrift, Basis, Layout, Spielkarten, Holztisch, Kopfbereich mit Reitern, Sprachmenü mit Flaggen, Hell/Dunkel-Schalter, Footer; am Ende die Bausteine der Spielseiten (Kartenfächer, Ziel, Abschnittsnavigation, Schritte, Entscheidung, FAQ, Steckbrief …). Ein Spiel ändert sie in seiner `styles.css` |
| `assets/core.js` | Hell/Dunkel-Schalter, Menüs der Kopfzeile (Sprache merkt es sich), zufälliges Spiel, registriert den Service Worker |
| `assets/sw.js` | Vorlage des Service Workers (offline), wird pro Seite mit Dateiliste und Hash gefüllt |
| `includes/` | `sitehead.njk` (Kopf jeder Seite: Menü „Alle Spiele“, QR-Button, Hell/Dunkel, Sprachmenü; bei Spielen Name, Anhänger und Links zu den Seiten aus `pages` der game.json), `gamelogo.njk`, `langmenu.njk`, `themeswitch.njk`, `flags.njk`, `footer.njk` (mit Impressum/Datenschutz), `tracking-head.njk`, `tracking-body.njk` (Einwilligungsbanner), dazu für die Spiele: `card.njk` (Spielkarten-Makros), `share.njk` + `sharebox.njk` (Teilen-Box mit QR-Code, Seiten mit `share: true`), `redirect.njk` (englische Startseite → gespeicherte Sprache), `hero.njk` (Kopf jeder Spielseite: Titel, Einleitung, Bild aus `hero-art.njk` des Spiels, Ziel, auf der Regelseite der Steckbrief), `factsheet.njk` (Steckbrief, gesteuert über `factsheet` in der game.json; Teile `factsheet-players.njk`, `factsheet-gear.njk`, `factsheet-art.njk` kann ein Spiel ersetzen), `dice.njk` (Würfel-Makros), `blocks.njk` (Makros `secnav`, `steps`, `variants`, `faq`: Abschnittsnavigation, nummerierte Schritte, Varianten, FAQ; Listen enden mit dem letzten vorhandenen Text) |
| `pages/404.njk` | 404-Seite jedes Spiels (fügt das Plugin als `/404.html` hinzu; Texte `nf…`, Bild aus `notfound-art.njk` des Spiels; Layout über die Option `notFoundLayout`) |
| `includes/layouts/game.njk` | Seitenrahmen für alle Spiele (`layout: game`); erkennt optionale Dateien automatisch (`favicon.ico`, `apple-touch-icon.png`, `manifest.webmanifest`, `og-image.png`, `site.js`, `.htaccess`) |
| `assets/share.js` | Auf jeder Seite: QR-Popup oben, Teilen-Box: QR-Code (mit `qrcode-generator`, veröffentlicht als `assets/core/qrcode.js`), Link kopieren, Teilen |
| `lib/sitemap.js` | `createSitemap(site, languages, { games })`: `sitemap.xml` und `robots.txt` nur für den Hub (inkl. Live-Spiele ohne eigene Domain) und Live-Spiele mit eigener Domain |
| `data/fonts.js` | Schrift (Manrope, selbst gehostet), Schnitte und Zeichensätze |
| `data/tracking.js` | Tracking per Umgebungsvariablen, siehe Root-README |
| `data/legal.js` | Links zu Impressum und Datenschutz (mut-im-rucksack.de), Texte des Einwilligungsbanners |
| `lib/nav.js` | Texte (`i18n/<sprache>.json`, Rest Englisch) und Ziele des Menüs „Alle Spiele“; `POPULAR` (Liste „Beliebt“), `SEARCH` (Suche ein-/ausschalten, Grundgerüst ist da) |
| `i18n/` | Texte des Kopfes und Menüs, eine Datei pro Sprache (es-419 und pt-br nur Abweichungen), in allen Sprachen vollständig |
| `i18n/standard/` | Standardtexte aller Seiten: Teilen-Box (`sh…`), Seitennamen (`pgLabel`, `pgRules`, `n6`, `pgQuick`, `pgSheet`), `navLabel`, Hell/Dunkel (`themeSwitch`), 404 (`nf…`), Beschriftungen des Steckbriefs (`info.…`). `createLanguages` legt sie unter die Texte der Seite, die Seite gewinnt. de und en vollständig, andere Sprachen bei Bedarf (sonst Englisch) |
| `lib/site.js` | `createSite(game.json)`: Adresse und Pfad-Präfix aus `SITE_ORIGIN` / `SITE_PATH_PREFIX` |
| `lib/games.js` | Liste aller Spiele aus `games/*/game.json`, prüft jede `game.json` (Felder: Root-README), `visibleGames(site)` blendet Entwürfe live aus |
| `lib/languages.js` | Alle Sprachen (Flagge, Name, Fallback, Menü-Reihenfolge); `createLanguages(site, i18nDir)` baut daraus die Sprachen eines Spiels |
| `test/` | Tests ohne Browser: `npm test -w @hostelgames/core` |
| `testing/playwright.js` | `@hostelgames/core/testing` für die Playwright-Tests der Spiele: `test` (scheitert bei JavaScript-Fehlern), `pathOf`, `open`, `siteTests({ languages, site, quiz })` – alles, was jedes Spiel braucht, gesteuert über `game.json` (Kopf, Menüs, Teilen-Box, #-Links, schmale Handys, Reiter, Steckbrief, FAQ, Sprach-Weiterleitung, 404) und das Übungsquiz auf den Seiten in `quiz` |
| `lib/fonts-css.js` | Erzeugt `fonts.css` aus den `@fontsource`-Paketen |
| `scripts/check-i18n.js` | Befehl `hostelgames-check-i18n`: prüft die Übersetzungen eines Spiels |
| `scripts/serve.js` | Befehl `hostelgames-serve <ordner> <präfix>`: kleiner Server für Tests und Vorschau |

Veröffentlicht wird alles unter `/assets/core/` jeder Seite (`core.css`, `core.js`, `share.js`,
`qrcode.js`, `fonts.css`, `fonts/`). Die Texte für Schalter, Teilen-Box und Seitenreiter kommen aus
`i18n/standard/`; ein Spiel kann jeden davon in seinen eigenen i18n-Dateien überschreiben (z. B. `shH`).
`foot` (Zeile über dem Footer) hat nur ein Spiel, das eine eigene will.

Erwartete Daten einer Seite: `site` (aus `lib/site.js`), für Sprachmenü und Footer außerdem `lang`
(mit `t` = Texte) und `languages`, wie in `games/shithead/src/_data/languages.js`.
