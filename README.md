# shithead-rules

**Shithead in 3 minutes** – eine mehrsprachige Kurzanleitung für das Kartenspiel Shithead.
Statische Seiten, gebaut mit [Eleventy](https://www.11ty.dev/): Jede Sprache ist eine eigene, fertig
gerenderte Seite (`/`, `/de/`, `/es/`, …), die Regeln sind also auch ohne JavaScript lesbar.
JavaScript ergänzt nur das Übungsquiz, QR-Code und Teilen-Buttons und merkt sich die gewählte Sprache.

## Entwickeln

```sh
npm install
npm start        # Dev-Server mit Live-Reload: http://localhost:8080/shithead-rules/
npm run check    # prüft die Übersetzungen (läuft auch bei jedem Build)
npm run build    # schreibt die Seite nach _site/
npm test         # Playwright-Tests gegen das gebaute _site/ (vorher npm run build)
```

Beim ersten Mal ggf. den Browser installieren: `npx playwright install chromium`.

## Aufbau

| Pfad | Inhalt |
| --- | --- |
| `src/index.njk` | Die Seitenvorlage, wird einmal pro Sprache gerendert |
| `src/_includes/card.njk` | Makros für die Spielkarten-Grafiken |
| `src/_includes/redirect.njk` | Nur Startseite: leitet auf die gemerkte bzw. Browsersprache weiter |
| `src/_data/languages.js` | Liste der Sprachen (Reihenfolge im Menü, Flagge, Fallback-Kette) |
| `src/_data/i18n/*.json` | Texte pro Sprache, inklusive Quiztexte unter `quiz` |
| `src/_data/site.js` | Öffentliche URL und Pfad-Präfix |
| `src/_data/fonts.js` | Welche Schriften, Schnitte und Zeichensätze ausgeliefert werden |
| `src/fonts.11ty.js` | Erzeugt `/assets/fonts.css` aus den `@fontsource`-Paketen |
| `src/assets/` | Stylesheet, JavaScript und Icons, werden unverändert kopiert |
| `src/sw.js` | Service Worker (Vorlage), siehe „Offline“ |
| `src/manifest.webmanifest` | Web-App-Manifest, macht die Seite installierbar |
| `scripts/check-i18n.js` | Prüft die Übersetzungen, siehe unten |
| `tests/site.spec.js` | Playwright-Tests: alle Sprachseiten, Weiterleitung, ohne JavaScript, Quiz, Teilen, Offline |
| `tests/serve.js` | Kleiner Server, der `_site/` unter dem Pages-Pfad ausliefert |

## Keine externen Ressourcen

Die Seite lädt nichts von fremden Servern (kein Google Fonts, kein CDN):

- **Schriften** kommen aus den npm-Paketen `@fontsource/atkinson-hyperlegible`, `@fontsource/archivo-black`
  und `@fontsource/rubik` (alle SIL Open Font License 1.1). Ausgeliefert werden nur die in
  `src/_data/fonts.js` gelisteten Schnitte und Zeichensätze. Dank `unicode-range` lädt der Browser
  nur, was eine Sprache wirklich braucht.
- **QR-Code** erzeugt `qrcode-generator` (MIT), kopiert nach `/assets/qrcode.js`.

Ein Test stellt sicher, dass das so bleibt.

## Offline

Nach dem ersten Besuch funktioniert die ganze Seite ohne Netz, inklusive aller Sprachen, Quiz und
QR-Code. Dafür speichert ein Service Worker alle Dateien der Seite (unter 1 MB):

- `eleventy.config.js` schreibt nach jedem Build `_site/sw.js` aus der Vorlage `src/sw.js` und
  trägt die Liste aller Dateien und einen Hash über ihren Inhalt ein. Ändert sich etwas, bekommt
  der nächste Besuch eine neue Version und der alte Speicher wird gelöscht.
- Seiten kommen zuerst aus dem Netz (Updates sind sofort da), nur offline aus dem Speicher.
  CSS, JavaScript, Schriften und Icons kommen aus dem Speicher.
- Über das Manifest lässt sich die Seite auf den Homescreen legen.

Beim Entwickeln mit `npm start` ist der Service Worker auch aktiv: Geänderte CSS- oder JS-Dateien
erscheinen deshalb erst nach einem zweiten Neuladen (oder in den DevTools „Update on reload“ aktivieren).

## Sprachen und Fallbacks

Englisch ist Standard und liegt unter `/`, jede andere Sprache unter `/<code>/`.
Eine Sprache muss nur die Texte enthalten, die sie wirklich braucht: Fehlende Texte kommen der Reihe
nach aus ihren `fallback`-Sprachen und zuletzt aus Englisch. `es-419` (Lateinamerika) enthält zum
Beispiel nur die wenigen Texte, die von `es` abweichen.

**Neue Sprache:** `src/_data/i18n/<code>.json` anlegen und eine Zeile in `src/_data/languages.js` ergänzen.

**Prüfung:** `npm run check` (Teil von `npm run build`) bricht mit einer Liste der Probleme ab, wenn
- ein Text fehlt, also weder in der Sprache selbst noch in einer ihrer Fallback-Sprachen steht und deshalb auf Englisch erscheinen würde,
- ein Text leer ist oder nicht in Englisch vorkommt (Tippfehler, Überbleibsel),
- Platzhalter wie `{mine}` oder `{top}` oder die HTML-Tags von Englisch abweichen oder Tags nicht geschlossen sind,
- ein Link auf einen `#abschnitt` zeigt, den es auf der Seite nicht gibt,
- `languages.js` und die JSON-Dateien nicht zusammenpassen.

## Deployment

`.github/workflows/ci.yml` baut die Seite und führt die Tests bei jedem Pull Request und Push aus.
Nur auf `main` und nur wenn die Tests grün sind, wird sie auf GitHub Pages veröffentlicht. Schlägt ein
Test fehl, liegen Report und Screenshots als Artefakt `playwright-report` am Workflow-Lauf. Einmalig nötig: *Settings → Pages → Build and deployment → Source:
GitHub Actions*. Für eine eigene Domain `src/_data/site.js` anpassen.
