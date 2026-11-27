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
| `includes/` | `sitehead.njk` (Kopf jeder Seite: Menü „Alle Spiele“, QR-Button, Hell/Dunkel, Sprachmenü; bei Spielen Name, Anhänger und Links zu den Seiten aus `pages` der game.json), `gamelogo.njk`, `langmenu.njk`, `themeswitch.njk`, `flags.njk`, `footer.njk` (mit Impressum/Datenschutz), `tracking-head.njk`, `tracking-body.njk` (Einwilligungsbanner), dazu für die Spiele: `card.njk` (Spielkarten-Makros), `share.njk` + `sharebox.njk` (Teilen-Box mit QR-Code, Seiten mit `share: true`), `redirect.njk` (englische Startseite → gespeicherte Sprache), `hero.njk` (Kopf jeder Spielseite: Titel, Einleitung, Bild aus `hero-art.njk` des Spiels, Ziel, auf der Regelseite der Steckbrief), `factsheet.njk` (Steckbrief, gesteuert über `factsheet` in der game.json; Teile `factsheet-players.njk`, `factsheet-gear.njk`, `factsheet-art.njk` kann ein Spiel ersetzen), `quiz.njk` (Übungsquiz: Rahmen mit Frage, Ja/Nein, Rückmeldung, Punktestand; Bild der Frage aus `quiz-stage.njk`, Standard zwei Karten „liegt oben“/„deine Karte“, ein Spiel kann es ersetzen), `dice.njk` (Würfel-Makros), `blocks.njk` (Makros `secnav`, `steps`, `variants`, `faq`: Abschnittsnavigation, nummerierte Schritte, Varianten, FAQ; Listen enden mit dem letzten vorhandenen Text) |
| `pages/404.njk` | 404-Seite jedes Spiels (fügt das Plugin als `/404.html` hinzu; Texte `nf…`, Bild aus `notfound-art.njk` des Spiels; Layout über die Option `notFoundLayout`) |
| `includes/layouts/game.njk` | Seitenrahmen für alle Spiele (`layout: game`); erkennt optionale Dateien automatisch (`favicon.ico`, `apple-touch-icon.png`, `manifest.webmanifest`, `og-image.png`, `site.js`, `.htaccess`) |
| `assets/quiz.js` | Ablauf des Übungsquiz (veröffentlicht als `assets/core/quiz.js`): Buttons, Rückmeldung, nächste Frage, Punktestand, dazu `cardHTML`, `pick`, `fill`, `RANKS`, `SUITS`. Das Spiel liefert in seinem `assets/quiz.js` nur `deal` (neue Frage) und `judge` (richtig?) und ruft `startQuiz({ deal, judge })` auf, Beispiel: Shithead |
| `assets/share.js` | Auf jeder Seite: QR-Popup oben, Teilen-Box: QR-Code (mit `qrcode-generator`, veröffentlicht als `assets/core/qrcode.js`), Link kopieren, Teilen |
| `lib/sitemap.js` | `sitemap.xml` und `robots.txt` nur für den Hub (inkl. Live-Spiele ohne eigene Domain, `createSitemap` in `hub/src/sitemap.11ty.js`) und Live-Spiele mit eigener Domain (fügt das Plugin selbst hinzu) |
| `lib/game.js` | `@hostelgames/core/game`: `site` und `languages` des Spiels im aktuellen Ordner (aus `game.json` und `src/_data/i18n/`), für Konfiguration, check-i18n und Tests |
| `config/eleventy.js`, `config/playwright.js` | Konfiguration jedes Spiels; `eleventy.config.js` und `playwright.config.js` eines Spiels sind je eine Zeile (`export … from "@hostelgames/core/config/…"`). Braucht ein Spiel mehr, schreibt es eine eigene und ruft `gameConfig` auf |
| `data/fonts.js` | Schrift (Manrope, selbst gehostet), Schnitte und Zeichensätze |
| `data/tracking.js` | Tracking per Umgebungsvariablen, siehe Root-README |
| `data/legal.js` | Links zu Impressum und Datenschutz (mut-im-rucksack.de), Texte des Einwilligungsbanners |
| `lib/nav.js` | Texte (`i18n/<sprache>.json`, Rest Englisch) und Ziele des Menüs „Alle Spiele“; `POPULAR` (Liste „Beliebt“), `SEARCH` (Suche ein-/ausschalten, Grundgerüst ist da) |
| `i18n/` | Texte des Kopfes und Menüs, eine Datei pro Sprache (es-419 und pt-br nur Abweichungen), in allen Sprachen vollständig |
| `i18n/standard/` | Standardtexte aller Seiten: Teilen-Box (`sh…`), Seitennamen (`pgLabel`, `pgRules`, `pgStrategy`, `pgQuick`, `pgSheet`), `navLabel`, Hell/Dunkel (`themeSwitch`), 404 (`nf…`), Quiz (`qYes`, `qNo`, `quiz.right`, `quiz.wrong`, `quiz.yes`, `quiz.no`, `quiz.score`), Beschriftungen des Steckbriefs (`info.…`). `createLanguages` legt sie unter die Texte der Seite, die Seite gewinnt. de und en vollständig, andere Sprachen bei Bedarf (sonst Englisch) |
| `lib/site.js` | `createSite(game.json)`: Adresse und Pfad-Präfix aus `SITE_ORIGIN` / `SITE_PATH_PREFIX` |
| `lib/games.js` | Liste aller Spiele aus `games/*/game.json`, prüft jede `game.json` (Felder: Root-README), `visibleGames(site)` blendet Entwürfe live aus |
| `lib/languages.js` | Alle Sprachen (Flagge, Name, Fallback, Menü-Reihenfolge); `createLanguages(site, i18nDir)` baut daraus die Sprachen eines Spiels |
| `test/` | Tests ohne Browser: `npm test -w @hostelgames/core` |
| `testing/playwright.js` | `@hostelgames/core/testing` für die Playwright-Tests der Spiele: `test` (scheitert bei JavaScript-Fehlern), `pathOf`, `open`, `siteTests({ languages, site, quiz })` – alles, was jedes Spiel braucht, gesteuert über `game.json` (Kopf, Menüs, Teilen-Box, #-Links, schmale Handys, Reiter, Steckbrief, FAQ, Sprach-Weiterleitung, 404) und das Übungsquiz auf den Seiten in `quiz` |
| `lib/fonts-css.js` | Erzeugt `fonts.css` aus den `@fontsource`-Paketen |
| `scripts/check-i18n.js` | Befehl `hostelgames-check-i18n`: prüft die Übersetzungen eines Spiels |
| `scripts/serve.js` | Befehl `hostelgames-serve <ordner> <präfix>`: kleiner Server für Tests und Vorschau |

Veröffentlicht wird alles unter `/assets/core/` jeder Seite (`core.css`, `core.js`, `share.js`,
`quiz.js`, `qrcode.js`, `fonts.css`, `fonts/`). Die Texte für Schalter, Teilen-Box, Quiz und
Seitenreiter kommen aus `i18n/standard/`; ein Spiel kann jeden davon in seinen eigenen i18n-Dateien
überschreiben (z. B. `shH`). `foot` (Zeile über dem Footer) hat nur ein Spiel, das eine eigene will.

Erwartete Daten einer Seite: `site` (aus `lib/site.js`), für Sprachmenü und Footer außerdem `lang`
(mit `t` = Texte) und `languages`; bei Spielen setzt das Plugin `site` und `languages` als globale
Daten (aus `lib/game.js`).

## Spielkarten und Würfel

- Karten (`card.njk`) haben französische Farben (♣ ♠ ♥ ♦) und internationale Buchstaben
  (A, K, Q, J) – in allen Spielen gleich, auch wenn die Texte deutsche Namen nutzen (Bube, Dame …).
  Ein Spiel mit anderen Rangnamen setzt nur die Buchstaben über seine Texte (z. B. Schafkopf
  `rules.rO`/`rU`).
- Würfel (`dice.njk`) zeigen 1–6 Augen.

## Offene Punkte

Was ein einzelnes Spiel selbst gebaut hat und in den Core kommt, sobald ein zweites Spiel es braucht:

- **Bayerische Kartenbilder** (Eichel, Gras, Herz, Schellen; Ober, Unter, Sau) gibt es noch nicht.
  Schafkopf nutzt deshalb die französischen Farben.
- **Online-Spielblock** (Kniffel, `games/kniffel/src/assets/scoresheet.js` + Styles): beim zweiten
  Spiel mit Block Logik und Styles hierher verschieben.
- **Becher** (King’s Cup, Makro `cup()` in `games/kingscup/src/_includes/ring.njk`): beim zweiten
  Trinkspiel hierher verschieben.

## Keine externen Ressourcen

Die Seiten laden nichts von fremden Servern (kein Google Fonts, kein CDN):

- **Schriften** kommen aus dem npm-Paket `@fontsource/manrope` (SIL Open Font License 1.1).
  Ausgeliefert werden nur die in `data/fonts.js` gelisteten Schnitte und Zeichensätze; dank
  `unicode-range` lädt der Browser nur, was eine Sprache wirklich braucht.
- **QR-Code** erzeugt `qrcode-generator` (MIT), veröffentlicht als `/assets/core/qrcode.js`.

Einzige Ausnahme ist ein Tracking, falls es beim Build über Umgebungsvariablen eingeschaltet wird
(siehe [Root-README](../../README.md#tracking)).

## Offline

Nach dem ersten Besuch funktionieren die Spielseiten auch ohne Netz (inklusive aller Sprachen,
Quiz und QR-Code):

- Das Eleventy-Plugin schreibt nach jedem Build `_site/sw.js` aus der Vorlage `assets/sw.js` und
  trägt die Liste aller gebauten Dateien sowie einen Hash über deren Inhalt ein. Ändert sich etwas,
  bekommt der nächste Besuch eine neue Cache-Version und der alte Speicher wird gelöscht.
- HTML-Seiten kommen zuerst aus dem Netz (Updates sind sofort da) und nur offline aus dem Cache;
  CSS, JavaScript, Schriften und Icons kommen aus dem Cache.
- Beim Entwickeln mit `npm start` ist der Service Worker ebenfalls aktiv: geänderte CSS- oder
  JS-Dateien erscheinen deshalb ggf. erst nach einem zweiten Neuladen (oder in den DevTools
  „Update on reload“ aktivieren).

## Sprachen und Fallbacks

Englisch ist Standard und liegt unter `/`, jede andere Sprache unter `/<code>/`. Eine Sprache muss
nur die Texte enthalten, die sie wirklich braucht: fehlende Texte kommen der Reihe nach aus ihren
`fallback`-Sprachen (`lib/languages.js`) und zuletzt aus Englisch (`es-419` enthält z. B. nur die
Abweichungen von `es`).

**Neue Sprache:** `src/_data/i18n/<code>.json` anlegen und den Code in `languages` der `game.json`
eintragen (Ablauf: [`docs/alle-sprachen.md`](../../docs/alle-sprachen.md)).

**Prüfung:** `npm run check` (Teil von `npm run build`, Befehl `hostelgames-check-i18n`) prüft
automatisch alle `.njk`-Dateien in `src/` und im Core. Streng für `en` und `de` (Fehler bei
fehlenden oder überzähligen Texten), für weitere Sprachen als Warnung. Platzhalter (`{mine}` …),
unbalancierte/abweichende HTML-Tags, tote `#abschnitt`-Links und Abweichungen zwischen `game.json`
und den JSON-Dateien sind in allen Sprachen Fehler.
