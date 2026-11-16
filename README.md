# shithead-rules

**Shithead in 3 minutes** – eine mehrsprachige Kurzanleitung für das Kartenspiel Shithead.
Statische Seiten, gebaut mit [Eleventy](https://www.11ty.dev/): Jede Sprache ist eine eigene, fertig
gerenderte Seite (`/`, `/de/`, `/es/`, …), die Regeln sind also auch ohne JavaScript lesbar.
JavaScript ergänzt nur das Übungsquiz, QR-Code und Teilen-Buttons und merkt sich die gewählte Sprache.

## Entwickeln

```sh
npm install
npm start        # Dev-Server mit Live-Reload: http://localhost:8080/shithead-rules/
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
| `src/assets/` | Stylesheet und JavaScript, werden unverändert kopiert |
| `tests/site.spec.js` | Playwright-Tests: alle Sprachseiten, Weiterleitung, ohne JavaScript, Quiz, Teilen |
| `tests/serve.js` | Kleiner Server, der `_site/` unter dem Pages-Pfad ausliefert |

## Sprachen und Fallbacks

Englisch ist Standard und liegt unter `/`, jede andere Sprache unter `/<code>/`.
Eine Sprache muss nur die Texte enthalten, die sie wirklich braucht: Fehlende Texte kommen der Reihe
nach aus ihren `fallback`-Sprachen und zuletzt aus Englisch. `es-419` (Lateinamerika) enthält zum
Beispiel nur die wenigen Texte, die von `es` abweichen.

**Neue Sprache:** `src/_data/i18n/<code>.json` anlegen und eine Zeile in `src/_data/languages.js` ergänzen.

## Deployment

`.github/workflows/ci.yml` baut die Seite und führt die Tests bei jedem Pull Request und Push aus.
Nur auf `main` und nur wenn die Tests grün sind, wird sie auf GitHub Pages veröffentlicht. Schlägt ein
Test fehl, liegen Report und Screenshots als Artefakt `playwright-report` am Workflow-Lauf. Einmalig nötig: *Settings → Pages → Build and deployment → Source:
GitHub Actions*. Für eine eigene Domain `src/_data/site.js` anpassen.
