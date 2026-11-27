// Online-Block für Schafkopf (Seite scoresheet/): Rundenblock aus dem Core (./core/scoresheet-rounds.js).
// Pro Spiel wird eingetragen: Spielart, wer gespielt hat (beim Sauspiel mit Partner), gewonnen oder verloren,
// Schneider/Schwarz, Laufende und Verdopplungen (Klopfen, Kontra, Re). Daraus rechnet der Block den Spielwert und
// verteilt ihn auf die vier Spieler (Summe jedes Spiels ist 0).
//
// Tarif (Einstellung beim Start, wie auf der Regelseite): Sauspiel 1, Wenz/Solo 5, Schneider +1, Schwarz +2,
// Laufende je +1 (ab 3, im Wenz ab 2).

import { startSheet } from "./core/scoresheet.js";
import { roundsRules } from "./core/scoresheet-rounds.js";

const GAMES = ["sau", "wenz", "solo"];
const GAME_TEXT = { sau: "gSau", wenz: "gWenz", solo: "gSolo" };
const MAX_RUNNERS = { sau: 8, solo: 8, wenz: 4 };
const FROM_RUNNERS = { sau: 3, solo: 3, wenz: 2 };
const DOUBLINGS = [0, 1, 2, 3]; // ×1, ×2, ×4, ×8

/** Spielwert (ohne Verdopplung): Grundwert + Schneider/Schwarz + Laufende. */
function baseValue(entry, tariff) {
  const base = entry.game === "sau" ? tariff.sau : tariff.solo;
  const cut = entry.cut === 1 ? tariff.extra : entry.cut === 2 ? 2 * tariff.extra : 0;
  const runners = entry.runners >= FROM_RUNNERS[entry.game] ? entry.runners * tariff.extra : 0;
  return base + cut + runners;
}

const valueOf = (entry, tariff) => baseValue(entry, tariff) * 2 ** entry.dbl;

startSheet(roundsRules({
  id: "schafkopf",
  minPlayers: 4,
  maxPlayers: 4,
  defaultPlayers: 4,
  signed: true,
  options: [
    { id: "sau", type: "number", label: "optSau", default: 1, min: 1, max: 100 },
    { id: "solo", type: "number", label: "optSolo", default: 5, min: 1, max: 500 },
    { id: "extra", type: "number", label: "optExtra", default: 1, min: 0, max: 100 },
  ],

  form({ t, el, fill, choices }, g, entry) {
    const gameItem = (game) => ({ value: game, label: t[GAME_TEXT[game]], sub: String(game === "sau" ? g.options.sau : g.options.solo) });
    const people = g.players.map((name, i) => ({ value: i, label: name }));

    const game = choices({ items: GAMES.map(gameItem), value: entry?.game ?? "sau", label: t.gameQ, cls: "cols-3", onPick: () => draw() });
    const player = choices({ items: people, value: entry?.player ?? null, label: t.playerQ, cls: "cols-2", onPick: () => draw() });
    const partner = choices({ items: people, value: entry?.partner ?? null, label: t.partnerQ, cls: "cols-2", onPick: () => draw() });
    const won = choices({
      items: [{ value: true, label: t.won }, { value: false, label: t.lost }],
      value: entry ? entry.won : null, label: t.resultQ, cls: "cols-2", onPick: () => draw(),
    });
    const cut = choices({
      items: [{ value: 0, label: t.cutNone }, { value: 1, label: t.cutSchneider }, { value: 2, label: t.cutSchwarz }],
      value: entry?.cut ?? 0, label: t.cutQ, cls: "cols-3", onPick: () => draw(),
    });
    const dbl = choices({
      items: DOUBLINGS.map((n) => ({ value: n, label: `×${2 ** n}` })),
      value: entry?.dbl ?? 0, label: t.dblQ, cls: "cols-4", onPick: () => draw(),
    });
    const runners = el("input", {
      type: "number", min: "0", max: "8", step: "1", inputmode: "numeric", value: String(entry?.runners ?? 0),
      "aria-label": t.runQ, oninput: () => draw(),
    });
    const preview = el("p", { class: "sheet-preview", "aria-live": "polite" });
    const partnerBox = el("div", {}, el("p", { class: "sheet-dialog-sub" }, t.partnerQ), partner.node);

    /** Eingabe als Eintrag, oder null solange etwas fehlt. */
    function current() {
      const n = runners.value.trim() === "" ? 0 : Number(runners.value);
      if (!Number.isInteger(n) || n < 0) return null;
      return { game: game.get(), player: player.get(), partner: partner.get(), won: won.get(), cut: cut.get(), runners: n, dbl: dbl.get() };
    }

    function draw() {
      partnerBox.hidden = game.get() !== "sau";
      const e = current();
      preview.textContent = e ? fill(t.preview, { value: valueOf(e, g.options) }) : "";
    }
    draw();

    return {
      body: [
        el("p", { class: "sheet-dialog-sub" }, t.gameQ), game.node,
        el("p", { class: "sheet-dialog-sub" }, t.playerQ), player.node,
        partnerBox,
        el("p", { class: "sheet-dialog-sub" }, t.resultQ), won.node,
        el("p", { class: "sheet-dialog-sub" }, t.cutQ), cut.node,
        el("label", { class: "sheet-value" }, el("span", {}, t.runQ), runners),
        el("p", { class: "sheet-dialog-sub" }, t.dblQ), dbl.node,
        preview,
      ],
      read() {
        const e = current();
        if (!e) return { error: fill(t.runInvalid, { max: 8 }) };
        if (e.player === null) return { error: t.needPlayer };
        if (e.game === "sau") {
          if (e.partner === null) return { error: t.needPartner };
          if (e.partner === e.player) return { error: t.partnerSame };
        } else {
          e.partner = null;
        }
        if (e.won === null) return { error: t.needResult };
        if (e.runners > MAX_RUNNERS[e.game]) return { error: fill(t.runInvalid, { max: MAX_RUNNERS[e.game] }) };
        return e;
      },
    };
  },

  /** Punkte jedes Spielers in dieser Runde: Gewinner +, Verlierer −, Summe 0. */
  score(entry, g) {
    const value = valueOf(entry, g.options);
    const sign = entry.won ? 1 : -1;
    const out = g.players.map(() => -sign * value);
    if (entry.game === "sau") {
      out[entry.player] = sign * value;
      out[entry.partner] = sign * value;
    } else {
      out[entry.player] = sign * 3 * value;
    }
    return out;
  },

  rowHint: ({ t }, entry, g) => `${t[GAME_TEXT[entry.game]]} · ${g.players[entry.player]}`,
}));
