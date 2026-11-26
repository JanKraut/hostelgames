# Mau-Mau

Kartenspiel (`category: cards`) · Domain: noch keine · Ordner: maumau · Slug: maumau · Status: draft · Sprachen: 15 (Regeln 15, Strategie/Quickstart en + de)

## Stand
- Regelseite (`src/index.njk`) in 15 Sprachen; Strategie (`src/strategy.njk`) und Quickstart
  (`src/quickstart.njk`) bisher in `de` + `en` (übrige Sprachen zeigen dort Englisch).
- Grundregeln: 32 Karten, je 5 Karten, Farbe oder Wert bedienen, sonst eine Karte ziehen.
  Sonderkarten: 7 = zwei ziehen (stapelbar), 8 = aussetzen, Bube = Wünscher (passt auf alles,
  nicht auf eine offene 7). „Mau“ bei der vorletzten, „Mau-Mau“ bei der letzten Karte,
  vergessen = Strafkarte. Punkte: Bube 20, Ass 11, 10 = 10, König 4, Dame 3, 9/8/7 Augenwert.
- Nächste Schritte: Domain festlegen, dann `domain` in `game.json` setzen; ggf. Strategie und
  Quickstart in alle 15 Sprachen übersetzen (erst wenn Jan es sagt).

## Begriffe
- Name in allen Sprachen „Mau-Mau“; Ausrufe „Mau!“ und „Mau-Mau!“ nicht übersetzen.
- Ziehstapel / Ablagestapel (en: draw pile / discard pile), Bube = Wünscher (en: jack, make a wish).

## Regeln für dieses Spiel
- Nur Dateien in `games/maumau/` ändern. Fehlt etwas im Core, Jan fragen.
- Core-Basis: `layout: game`, Konfiguration (`eleventy.config.js`, `playwright.config.js`),
  `site`/`languages`/Sitemap, Hero, Steckbrief, Karten (`card.njk`), Bausteine (`blocks.njk`),
  404-Seite, Teilen-Box, Sprachmenü, Footer und `siteTests` kommen aus `@hostelgames/core`.
- Eigene Styles nur in `src/assets/styles.css`.
- Live gehen: `status` in `game.json` auf `"live"` – nur wenn Jan es sagt.
- Kein Spiel gegen Bots (`play`), solange Jan es nicht ausdrücklich sagt.
