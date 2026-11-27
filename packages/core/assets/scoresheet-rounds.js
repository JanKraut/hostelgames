// Score sheets with rounds (published as /assets/core/scoresheet-rounds.js): one row per round,
// one column per player, the running total at the bottom. Tap a round to correct or delete it.
//
// Two builders for the rules that startSheet() (./scoresheet.js) needs:
//
//   roundsRules(config)     the general one; the game says what a round looks like (Schafkopf)
//   cardRoundsRules(config) rounds in which everyone writes down the total of their cards, the lowest
//                           score wins, optionally with a caller who risks a penalty (Cabo, Cambio)
//
// Texts: the game's `sheet` texts, standard texts of the core underneath (addRound, noRounds, saveRound,
// deleteRound, roundsDone, valueInvalid, nobody, optLimit, optPenalty, optReset, over, calledBy).
//
// roundsRules(config):
//   id, minPlayers, maxPlayers, defaultPlayers, options    as in startSheet() (./scoresheet.js)
//   lowIsBetter            the lowest total wins (default: the highest)
//   signed                 show a + before positive points (money games)
//   form(ctx, game, entry) the input for one round (entry = null for a new one):
//                          → { body: nodes for the dialog, read(): entry | { error: text } }
//   score(entry, game)     → points of every player in this round
//   totals(game, rows)     optional: running totals from rows = score() of every round
//                          (default: the sum; Cabo's "exactly 100" lives here)
//   mark(ctx, entry, i, game)   optional: text for screen readers if the cell of player i gets a small ★ mark
//   rowHint(ctx, entry, game)   optional: small line under "Round 3"
//   notice(ctx, game, totals)   optional: text above the buttons (e.g. "game is over")
//   detail(ctx, game, row)      optional: line under a name in the final score

import { el, fill, num } from "./scoresheet.js";

const MAX_HISTORY = 50;

export function roundsRules(config) {
  return (ctx) => {
    const { t } = ctx;
    const signed = (n) => (config.signed && n > 0 ? `+${n}` : num(n));
    const sumTotals = (g, rows) => g.players.map((_, i) => rows.reduce((sum, row) => sum + row[i], 0));
    const compute = (g) => {
      const rows = g.rounds.map((entry) => config.score(entry, g));
      return { rows, totals: (config.totals ?? sumTotals)(g, rows) };
    };

    /** Dialog for a new round (index null) or to correct round `index`. */
    function edit(g, index) {
      const entry = index == null ? null : g.rounds[index];
      const form = config.form(ctx, g, entry);
      const at = index ?? g.rounds.length;
      const save = (event) => {
        event.preventDefault();
        const result = form.read();
        if (result.error) return ctx.setError(result.error);
        remember(g);
        if (index == null) g.rounds.push(result);
        else g.rounds[index] = result;
        ctx.closeDialog();
        ctx.commit();
      };
      const actions = [
        el("button", { type: "submit", class: "ctabtn sheet-primary", onclick: save }, t.saveRound),
      ];
      if (index != null) {
        actions.push(el("button", {
          type: "button", class: "sheet-link sheet-clear",
          onclick: () => {
            remember(g);
            g.rounds.splice(index, 1);
            ctx.closeDialog();
            ctx.commit();
          },
        }, t.deleteRound));
      }
      ctx.openDialog({
        title: fill(t.roundRow, { round: at + 1 }),
        body: form.body,
        actions,
        restoreFocus: () => document.querySelector(index == null ? "#sheet-addround" : `[data-round="${index}"] button`),
      });
    }

    /** Remember the rounds before a change, so Undo can take it back. */
    function remember(g) {
      g.history.push(JSON.stringify(g.rounds));
      if (g.history.length > MAX_HISTORY) g.history.shift();
    }

    return {
      id: config.id,
      minPlayers: config.minPlayers,
      maxPlayers: config.maxPlayers,
      defaultPlayers: config.defaultPlayers,
      options: config.options,

      create: () => ({ rounds: [], history: [] }),
      roundNo: (g) => g.rounds.length + 1,

      undo(g) {
        g.rounds = JSON.parse(g.history.pop());
      },

      ranking(g) {
        const { totals } = compute(g);
        const rows = g.players.map((name, i) => ({
          i, name, total: totals[i],
          detail: config.detail ? config.detail(ctx, g, { i, total: totals[i] }) : fill(t.roundsDone, { n: g.rounds.length }),
        }));
        return rows.sort((a, b) => (config.lowIsBetter ? a.total - b.total : b.total - a.total));
      },

      render(g) {
        const { rows, totals } = compute(g);
        const cols = g.players.length;
        const head = el("thead", {},
          el("tr", {},
            el("th", { scope: "col", class: "sheet-label" }, el("span", { class: "sheet-vh" }, t.h1)),
            ...g.players.map((name) => el("th", { scope: "col" }, el("span", { class: "sheet-name" }, name))),
          ),
        );
        const body = g.rounds.map((entry, r) =>
          el("tr", { "data-round": String(r) },
            el("th", { scope: "row", class: "sheet-label" },
              el("button", { type: "button", class: "sheet-rowbtn", onclick: () => edit(g, r) }, fill(t.roundRow, { round: r + 1 })),
              config.rowHint && el("small", {}, config.rowHint(ctx, entry, g)),
            ),
            ...g.players.map((name, i) => {
              const mark = config.mark?.(ctx, entry, i, g);
              return el("td", {},
                el("button", {
                  type: "button", class: `sheet-cell filled${rows[r][i] === 0 ? " zero" : ""}`,
                  "aria-label": `${fill(t.roundRow, { round: r + 1 })}, ${name}: ${signed(rows[r][i])}${mark ? `, ${mark}` : ""}`,
                  onclick: () => edit(g, r),
                }, signed(rows[r][i]), mark && el("span", { class: "sheet-mark", "aria-hidden": "true" }, "★")),
              );
            }),
          ),
        );
        if (!g.rounds.length) {
          body.push(el("tr", { class: "sheet-empty" }, el("td", { colspan: String(cols + 1) }, t.noRounds)));
        }
        const total = el("tr", { class: "sheet-total" },
          el("th", { scope: "row", class: "sheet-label" }, t.total),
          ...totals.map((n) => el("td", {}, signed(n))),
        );
        const notice = config.notice?.(ctx, g, totals);
        return {
          round: fill(t.round, { round: g.rounds.length + 1 }),
          table: [head, el("tbody", {}, body, total)],
          extra: [
            notice && el("p", { class: "sheet-notice", role: "status" }, notice),
            el("button", { type: "button", class: "ctabtn sheet-primary sheet-addround", id: "sheet-addround", onclick: () => edit(g, null) }, t.addRound),
          ],
          undo: g.history.length > 0,
        };
      },
    };
  };
}

/**
 * Cabo, Cambio and the like: after a round everyone writes down the total of their cards; low is good.
 * The one who ended the round (the caller) scores 0 if nobody is lower (config.callerZero), otherwise their
 * total plus a penalty. The game ends once someone is over the limit; the lowest total wins.
 *
 * config: id, minPlayers, maxPlayers, defaultPlayers,
 *   min, max            lowest and highest total of a hand that can be entered (Cambio: negative)
 *   limit, penalty      defaults of the setup fields "game ends above" and "penalty if not the lowest"
 *   callerZero          the caller scores 0 if nobody is lower (Cabo)
 *   tieLoses            a tie with the caller counts as "someone is lower" (Cambio)
 *   reset               offer "landing exactly on the limit halves your score once" (Cabo, on by default)
 * Game texts: h1, who (question for the caller), calledBy ("{name} called Cabo" for screen readers).
 */
export function cardRoundsRules(config) {
  const { min = 0, max = 200 } = config;
  return roundsRules({
    id: config.id,
    minPlayers: config.minPlayers,
    maxPlayers: config.maxPlayers,
    defaultPlayers: config.defaultPlayers,
    lowIsBetter: true,
    options: [
      { id: "limit", type: "number", label: "optLimit", default: config.limit ?? 100, min: 20, max: 500 },
      { id: "penalty", type: "number", label: "optPenalty", default: config.penalty ?? 0, min: 0, max: 100 },
      config.reset && { id: "reset", type: "checkbox", label: "optReset", default: true },
    ].filter(Boolean),

    form({ t, el, choices }, g, entry) {
      const inputs = g.players.map((name, i) =>
        el("label", { class: "sheet-value" },
          el("span", {}, name),
          el("input", {
            type: "number", min: String(min), max: String(max), step: "1", required: true,
            inputmode: min >= 0 ? "numeric" : null,
            value: entry ? String(entry.v[i]) : "",
            "aria-label": name,
          }),
        ),
      );
      const who = choices({
        items: [{ value: -1, label: t.nobody }, ...g.players.map((name, i) => ({ value: i, label: name }))],
        value: entry ? entry.caller : -1,
        label: t.who,
      });
      return {
        body: [el("div", { class: "sheet-values" }, inputs), el("p", { class: "sheet-dialog-sub" }, t.who), who.node],
        read() {
          const v = inputs.map((label) => label.querySelector("input").value.trim());
          const n = v.map(Number);
          if (v.some((text, i) => text === "" || !Number.isInteger(n[i]) || n[i] < min || n[i] > max)) {
            return { error: fill(t.valueInvalid, { min: num(min), max }) };
          }
          return { v: n, caller: who.get() };
        },
      };
    },

    score(entry, g) {
      const out = entry.v.slice();
      const c = entry.caller;
      if (c >= 0) {
        const mine = entry.v[c];
        const lowest = entry.v.every((x, i) => i === c || (config.tieLoses ? x > mine : x >= mine));
        if (lowest) {
          if (config.callerZero) out[c] = 0;
        } else {
          out[c] = mine + (g.options.penalty ?? 0);
        }
      }
      return out;
    },

    // Landing exactly on the limit halves the score, once per player (if the table plays by that rule).
    totals(g, rows) {
      const { limit, reset } = g.options;
      const used = g.players.map(() => false);
      const run = g.players.map(() => 0);
      for (const row of rows) {
        row.forEach((points, i) => {
          run[i] += points;
          if (reset && !used[i] && run[i] === limit) {
            run[i] = Math.floor(limit / 2);
            used[i] = true;
          }
        });
      }
      return run;
    },

    mark: ({ t }, entry, i, g) => (entry.caller === i ? fill(t.calledBy, { name: g.players[i] }) : ""),

    notice({ t }, g, totals) {
      const over = g.players.filter((_, i) => totals[i] > g.options.limit);
      return over.length ? fill(t.over, { names: over.join(" & "), limit: g.options.limit }) : "";
    },
  });
}
