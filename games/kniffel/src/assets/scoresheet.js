// Regeln des Online-Blocks für Kniffel (Seite scoresheet/). Speicher, Ansichten, Spielerliste,
// Letzte Spiele und Dialog-Rahmen kommen aus dem Core (./core/scoresheet.js), hier steht nur,
// was Kniffel ausmacht: die 13 Felder, die Summen mit Bonus und die Eingabe je Feldart.
// Feldnamen kommen aus <script id="sheet-texts"> (extra.fields), Texte aus sheet.*.

import { startSheet } from "./core/scoresheet.js";

// ---------- Regeln ----------

// kind: "count" (Anzahl × Augenzahl), "sum" (Augensumme 5–30), "quad" (vier gleiche + fünfter Würfel),
// "fixed" (feste Punkte oder 0). hint: kurzer Hinweis unter dem Feldnamen (Text sheet.<hint>).
const FIELDS = [
  { id: "ones", part: "upper", kind: "count", n: 1 },
  { id: "twos", part: "upper", kind: "count", n: 2 },
  { id: "threes", part: "upper", kind: "count", n: 3 },
  { id: "fours", part: "upper", kind: "count", n: 4 },
  { id: "fives", part: "upper", kind: "count", n: 5 },
  { id: "sixes", part: "upper", kind: "count", n: 6 },
  { id: "three", part: "lower", kind: "sum", q: "tripleQ" },
  { id: "four", part: "lower", kind: "quad" },
  { id: "full", part: "lower", kind: "fixed", points: 25, hint: "hintFull" },
  { id: "small", part: "lower", kind: "fixed", points: 30, hint: "hintSmall" },
  { id: "large", part: "lower", kind: "fixed", points: 40, hint: "hintLarge" },
  { id: "kniffel", part: "lower", kind: "fixed", points: 50, hint: "hintKniffel" },
  { id: "chance", part: "lower", kind: "sum", hint: "hintChance" },
];
const BONUS_FROM = 63;
const BONUS = 35;

/** Summen eines Spielers: oben, Bonus, unten, gesamt, freie Felder. */
function score(scores) {
  let upper = 0;
  let lower = 0;
  let open = 0;
  for (const field of FIELDS) {
    const value = scores[field.id];
    if (typeof value !== "number") open++;
    else if (field.part === "upper") upper += value;
    else lower += value;
  }
  const bonus = upper >= BONUS_FROM ? BONUS : 0;
  return { upper, bonus, lower, total: upper + bonus + lower, open };
}

/** Wer ist dran: wer am wenigsten Felder hat, bei Gleichstand der Erste. */
function turnOf(g) {
  const filled = g.scores.map((s) => FIELDS.filter((f) => typeof s[f.id] === "number").length);
  const min = Math.min(...filled);
  return { player: min >= FIELDS.length ? -1 : filled.indexOf(min), round: Math.min(min + 1, FIELDS.length) };
}

/** Zeile eines Feldes im tbody: Abschnitt „Oberer Teil“, 6 Felder, Summe, Bonus, Abschnitt „Unterer Teil“, … */
function rowIndex(field) {
  const i = FIELDS.indexOf(field);
  return field.part === "upper" ? i + 1 : i + 4;
}

startSheet((ctx) => {
  const { t, extra, el, fill } = ctx;
  const LABELS = extra.fields;

  function setValue(g, player, fieldId, value) {
    const prev = g.scores[player][fieldId];
    if (prev === value) return;
    g.history.push({ player, field: fieldId, prev: typeof prev === "number" ? prev : null });
    if (g.history.length > 200) g.history.shift();
    if (value === null) delete g.scores[player][fieldId];
    else g.scores[player][fieldId] = value;
    ctx.commit();
  }

  // Eingabe für ein Feld: Inhalt je nach Feldart (Augenzahl, Summe, Viererpasch, feste Punkte).
  function ask(g, player, field) {
    if (g.status === "finished") return;
    const value = g.scores[player][field.id];
    const has = typeof value === "number";
    const choose = (v) => () => { ctx.closeDialog(); setValue(g, player, field.id, v); };
    const strike = el("button", { type: "button", class: "sheet-btn", onclick: choose(0) }, t.strike);
    const actions = [];
    let question;
    let body = [];

    if (field.kind === "count") {
      question = fill(t.upperQ, { n: field.n });
      body = el("div", { class: "sheet-choices" },
        [0, 1, 2, 3, 4, 5].map((k) =>
          el("button", {
            type: "button", class: `sheet-choice${has && value === k * field.n ? " picked" : ""}`, onclick: choose(k * field.n),
            "aria-label": fill(t.countPoints, { k, points: k * field.n }),
          },
            el("b", {}, `${k} ×`),
            el("span", {}, fill(t.points, { n: k * field.n })),
          ),
        ),
      );
    } else if (field.kind === "quad") {
      // Viererpasch: welche Zahl viermal, dazu der fünfte Würfel → Summe 4 × a + b
      question = t.quadQ;
      let four = null;
      let fifth = null;
      const total = el("p", { class: "sheet-quad-total", "aria-live": "polite" });
      const row = (pick) =>
        el("div", { class: "sheet-choices sheet-dice" },
          [1, 2, 3, 4, 5, 6].map((n) =>
            el("button", { type: "button", class: "sheet-choice", "aria-pressed": "false", onclick: (event) => pick(n, event.currentTarget) },
              el("b", {}, String(n)),
            ),
          ),
        );
      const mark = (button) => {
        for (const b of button.parentElement.children) {
          b.classList.toggle("picked", b === button);
          b.setAttribute("aria-pressed", String(b === button));
        }
        total.textContent = four && fifth ? fill(t.quadTotal, { four, fifth, n: 4 * four + fifth }) : "";
        ctx.setError("");
      };
      body = [
        el("p", { class: "sheet-dialog-sub" }, t.quadFour),
        row((n, b) => { four = n; mark(b); }),
        el("p", { class: "sheet-dialog-sub" }, t.quadFifth),
        row((n, b) => { fifth = n; mark(b); }),
        total,
      ];
      actions.push(
        strike,
        el("button", {
          type: "submit", class: "ctabtn sheet-primary",
          onclick: (event) => {
            event.preventDefault();
            if (!four || !fifth) return ctx.setError(t.quadMissing);
            choose(4 * four + fifth)();
          },
        }, t.enter),
      );
    } else if (field.kind === "sum") {
      question = t[field.q ?? "sumQ"];
      const input = el("input", {
        type: "number", inputmode: "numeric", min: "5", max: "30", step: "1", id: "sheet-sum",
        value: has && value > 0 ? String(value) : "", "aria-label": LABELS[field.id],
      });
      body = el("div", { class: "sheet-sum-input" }, input);
      actions.push(
        strike,
        el("button", {
          type: "submit", class: "ctabtn sheet-primary",
          onclick: (event) => {
            event.preventDefault();
            const n = Number(input.value);
            if (!Number.isInteger(n) || n < 5 || n > 30) {
              ctx.setError(t.sumInvalid);
              input.focus();
              return;
            }
            choose(n)();
          },
        }, t.enter),
      );
    } else {
      question = t.fixedQ;
      actions.push(
        strike,
        el("button", { type: "button", class: "ctabtn sheet-primary", onclick: choose(field.points) }, fill(t.got, { points: field.points })),
      );
    }
    if (has) actions.push(el("button", { type: "button", class: "sheet-link sheet-clear", onclick: choose(null) }, t.clear));

    ctx.openDialog({
      kicker: g.players[player],
      title: LABELS[field.id],
      question,
      body,
      actions,
      restoreFocus: () => document.querySelector(`#sheet-table tbody tr:nth-child(${rowIndex(field) + 1}) td:nth-child(${player + 2}) button`),
    });
  }

  return {
    id: "kniffel",
    minPlayers: 1,
    maxPlayers: 8,
    defaultPlayers: 2,

    create: (players) => ({ scores: players.map(() => ({})), history: [] }),
    roundNo: (g) => turnOf(g).round,
    openCount: (g) => g.scores.reduce((n, s) => n + score(s).open, 0),

    undo(g) {
      const last = g.history.pop();
      if (!last) return;
      if (last.prev === null) delete g.scores[last.player][last.field];
      else g.scores[last.player][last.field] = last.prev;
    },

    /** Platzierungen, bester zuerst. */
    ranking(g) {
      return g.players
        .map((name, i) => ({ name, i, ...score(g.scores[i]) }))
        .sort((a, b) => b.total - a.total)
        .map((r) => ({ ...r, detail: fill(t.breakdown, { upper: r.upper, bonus: r.bonus, lower: r.lower }) }));
    },

    // Block: eine Spalte pro Spieler
    render(g) {
      const turn = turnOf(g);
      const sums = g.scores.map(score);

      const head = el("thead", {},
        el("tr", {},
          el("th", { scope: "col", class: "sheet-label" }, el("span", { class: "sheet-vh" }, t.h1)),
          ...g.players.map((name, i) =>
            el("th", { scope: "col", class: i === turn.player ? "turn" : "" },
              el("span", { class: "sheet-name" }, name),
              i === turn.player && el("span", { class: "sheet-turn" }, t.turn),
            ),
          ),
        ),
      );

      const cols = g.players.length;
      const section = (label) => el("tr", { class: "sheet-section" }, el("th", { colspan: String(cols + 1), scope: "colgroup" }, label));
      const fieldRow = (field) =>
        el("tr", {},
          el("th", { scope: "row", class: "sheet-label" }, LABELS[field.id], field.hint && el("small", {}, t[field.hint])),
          ...g.players.map((name, i) => {
            const value = g.scores[i][field.id];
            const filled = typeof value === "number";
            const struck = filled && value === 0;
            return el("td", {},
              el("button", {
                type: "button",
                class: `sheet-cell${filled ? " filled" : ""}${struck ? " struck" : ""}${!filled && i === turn.player ? " next" : ""}`,
                "aria-label": `${fill(t.cellLabel, { field: LABELS[field.id], name })}${filled ? `: ${value}` : ""}`,
                onclick: () => ask(g, i, field),
              }, filled ? String(value) : ""),
            );
          }),
        );
      const sumRow = (label, values, cls) =>
        el("tr", { class: cls }, el("th", { scope: "row", class: "sheet-label" }, label), ...values.map((v) => el("td", {}, v)));

      const bonusRow = el("tr", { class: "sheet-sum sheet-bonus" },
        el("th", { scope: "row", class: "sheet-label" }, t.bonus, el("small", {}, t.bonusHint)),
        ...sums.map((s, i) => {
          const upperDone = FIELDS.filter((f) => f.part === "upper").every((f) => typeof g.scores[i][f.id] === "number");
          if (s.bonus) return el("td", {}, String(s.bonus));
          if (upperDone) return el("td", {}, "0");
          return el("td", {}, el("span", { class: "sheet-chip" }, fill(t.bonusLeft, { n: BONUS_FROM - s.upper })));
        }),
      );

      return {
        round: turn.player < 0 ? t.allDone : fill(t.round, { round: turn.round }),
        table: [
          head,
          el("tbody", {},
            section(t.upper),
            FIELDS.filter((f) => f.part === "upper").map(fieldRow),
            sumRow(t.upperSum, sums.map((s) => String(s.upper)), "sheet-sum"),
            bonusRow,
            section(t.lower),
            FIELDS.filter((f) => f.part === "lower").map(fieldRow),
            sumRow(t.lowerSum, sums.map((s) => String(s.lower)), "sheet-sum"),
            sumRow(t.total, sums.map((s) => String(s.total)), "sheet-total"),
          ),
        ],
        undo: g.history.length > 0,
      };
    },
  };
});
