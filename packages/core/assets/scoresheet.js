// Online score sheet of the core (published as /assets/core/scoresheet.js).
//
// Everything every score sheet shares: games in localStorage, the three views (new game, sheet,
// final score), the list of recent games, undo, the input dialog and the page's texts. A game only
// supplies its rules and starts the sheet from its own assets/scoresheet.js:
//
//   import { startSheet } from "./core/scoresheet.js";
//   startSheet((ctx) => ({ id: "kniffel", … }));
//
// Games with rounds (Cabo, Cambio, Schafkopf …) build their rules with roundsRules() from
// ./core/scoresheet-rounds.js instead of writing all of it themselves.
//
// The page is includes/sheet.njk. Its texts come from <script id="sheet-texts">: `t` = the game's
// `sheet` texts (core standard texts underneath), `extra` = whatever the page adds (e.g. field names).
//
// Rules: startSheet() calls the function with a context and gets back an object with
//   id                      storage key: hostelgames:<id>:scoresheet
//   minPlayers, maxPlayers, defaultPlayers
//   options                 optional setup fields: [{ id, type: "number" | "checkbox", label (text key),
//                           default, min, max }]; the values are stored as game.options
//   create(players, options)  state of a new game, merged into the game ({ scores: […] }, { rounds: [] } …)
//   render(game)            → { round: text above the sheet, table: [thead, tbody …], extra: [nodes below
//                           the table], undo: boolean }
//   undo(game)              takes the last change back (only called if render() said undo: true)
//   ranking(game)           → rows sorted best first: { i, name, total, detail }; ties share the place
//   roundNo(game)           number for "In progress · round {round}" in the list of recent games
//   openCount(game)         optional: how many entries are still empty (asks before finishing)
//
// Context (ctx): t, extra, el, fill, num, icon, choices, game(), commit(), openDialog(), closeDialog(),
// setError(). After a rule changed the game, it calls ctx.commit() (saves and draws the sheet again).

const STORE_VERSION = 1;
const MAX_GAMES = 20;

// ---------- Helpers (also used by the rules) ----------

export const $ = (id) => document.getElementById(id);

/** "Round {n}" + { n: 3 } → "Round 3"; unknown placeholders stay. */
export const fill = (text, values) => String(text).replace(/\{(\w+)\}/g, (all, key) => (key in values ? values[key] : all));

/** Whole number with a real minus sign. */
export const num = (n) => (n < 0 ? `−${-n}` : String(n));

/** Element with attributes and children; text is always a text node (names come from the user). */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === false || value == null) continue;
    if (key === "class") node.className = value;
    else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value === true ? "" : value);
  }
  for (const child of children.flat()) if (child != null && child !== false) node.append(child);
  return node;
}

/** Small round icon from one SVG path (24 × 24 grid, line style). */
export function icon(path) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  for (const [name, value] of Object.entries({
    width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
    "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true",
  })) svg.setAttribute(name, value);
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", path);
  svg.append(p);
  return svg;
}

/**
 * A row of buttons of which one is picked (single choice), for the input dialog.
 * @param {object} options
 * @param {{ value: any, label: string, sub?: string }[]} options.items
 * @param {any} [options.value]   picked value
 * @param {(value: any) => void} [options.onPick]
 * @param {string} [options.cls]  extra class of the grid, e.g. "sheet-dice" (six small buttons)
 * @param {string} [options.label]  accessible name of the group
 * @returns {{ node: HTMLElement, get(): any, set(value: any): void }}
 */
export function choices({ items, value = null, onPick, cls = "", label }) {
  let current = value;
  const buttons = items.map((item) =>
    el("button", {
      type: "button", class: "sheet-choice", "aria-pressed": "false",
      onclick: () => { set(item.value); onPick?.(item.value); },
    }, el("b", {}, item.label), item.sub != null && el("span", {}, item.sub)),
  );
  const node = el("div", { class: `sheet-choices ${cls}`.trim(), role: "group", "aria-label": label }, buttons);
  function set(next) {
    current = next;
    items.forEach((item, k) => {
      const on = item.value === current;
      buttons[k].classList.toggle("picked", on);
      buttons[k].setAttribute("aria-pressed", String(on));
    });
  }
  set(value);
  return { node, get: () => current, set };
}

// ---------- The sheet ----------

export function startSheet(createRules) {
  const { t, extra = {} } = JSON.parse($("sheet-texts").textContent);
  let store = { version: STORE_VERSION, current: null, games: {} };
  const now = () => new Date().toISOString();
  const game = () => store.games[store.current] ?? null;

  const dialog = $("sheet-dialog");
  let returnFocus = null;

  const ctx = {
    t, extra, el, fill, num, icon, choices, game,
    /** A rule changed the game: remember the time, save, draw the sheet again. */
    commit() {
      game().updatedAt = now();
      save();
      renderGame();
    },
    /**
     * Opens the input dialog.
     * @param {object} options  kicker (small line above), title, question, body (nodes), actions (buttons),
     *   focus (node to focus, default: first input or picked button), restoreFocus (→ node to focus after closing)
     */
    openDialog({ kicker = "", title, question = "", body = [], actions = [], focus, restoreFocus }) {
      $("sheet-dialog-player").textContent = kicker;
      $("sheet-dialog-h").textContent = title;
      $("sheet-dialog-q").textContent = question;
      $("sheet-dialog-error").textContent = "";
      $("sheet-dialog-body").replaceChildren(...[body].flat());
      $("sheet-dialog-actions").replaceChildren(...actions);
      returnFocus = restoreFocus ?? null;
      dialog.showModal();
      (focus ?? $("sheet-dialog-body").querySelector("input") ?? $("sheet-dialog-body").querySelector(".picked"))?.focus();
    },
    closeDialog() {
      dialog.close();
    },
    setError(text) {
      $("sheet-dialog-error").textContent = text;
    },
  };
  const rules = createRules(ctx);
  const STORE_KEY = `hostelgames:${rules.id}:scoresheet`;

  // ---------- Storage ----------

  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(STORE_KEY));
      if (data && data.version === STORE_VERSION && data.games) return data;
    } catch {
      // broken or blocked storage: start empty
    }
    return { version: STORE_VERSION, current: null, games: {} };
  }

  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
    } catch {
      // storage full or blocked (e.g. private mode): the game goes on anyway
    }
  }

  /** Delete the oldest games when there are too many. */
  function prune() {
    const ids = Object.keys(store.games).sort((a, b) => store.games[b].updatedAt.localeCompare(store.games[a].updatedAt));
    for (const id of ids.slice(MAX_GAMES)) if (id !== store.current) delete store.games[id];
  }

  /** Places: a tie shares the place. */
  function ranked(g) {
    const rows = rules.ranking(g);
    rows.forEach((row, k) => (row.place = k > 0 && row.total === rows[k - 1].total ? rows[k - 1].place : k + 1));
    return rows;
  }

  // ---------- Views ----------

  const VIEWS = ["sheet-setup", "sheet-game", "sheet-result"];
  let wakeLock = null;

  function show(view) {
    for (const id of VIEWS) $(id).hidden = id !== view;
    // Keep the screen on while playing, if the browser can.
    if (view === "sheet-game" && "wakeLock" in navigator && !wakeLock) {
      navigator.wakeLock.request("screen").then((lock) => {
        wakeLock = lock;
        lock.addEventListener("release", () => (wakeLock = null));
      }).catch(() => {});
    } else if (view !== "sheet-game" && wakeLock) {
      wakeLock.release().catch(() => {});
    }
  }

  // New game: names of the players, setup options, list of the last games
  let names = [];
  const fixedPlayers = () => rules.minPlayers === rules.maxPlayers;

  function renderSetup(players, values) {
    const count = rules.defaultPlayers ?? rules.minPlayers ?? 2;
    names = players ?? Array.from({ length: count }, (_, i) => fill(t.playerDefault, { n: i + 1 }));
    renderPlayers();
    renderOptions(values);
    renderRecent();
    show("sheet-setup");
  }

  function renderPlayers() {
    $("sheet-players-h").textContent = fixedPlayers() ? t.playersFixedH : fill(t.playersH, { n: names.length, max: rules.maxPlayers });
    $("sheet-players").replaceChildren(
      ...names.map((name, i) =>
        el("li", {},
          el("span", { class: "sheet-num", "aria-hidden": "true" }, String(i + 1)),
          el("input", {
            type: "text", value: name, maxlength: "20", required: true, autocomplete: "off",
            "aria-label": fill(t.playerLabel, { n: i + 1 }),
            oninput: (event) => (names[i] = event.target.value),
            onfocus: (event) => event.target.select(),
          }),
          names.length > rules.minPlayers &&
            el("button", {
              type: "button", class: "sheet-icon", "aria-label": t.remove, title: t.remove,
              onclick: () => { names.splice(i, 1); renderPlayers(); },
            }, icon("M18 6 6 18M6 6l12 12")),
        ),
      ),
    );
    $("sheet-add").hidden = names.length >= rules.maxPlayers;
  }

  function renderOptions(values = {}) {
    $("sheet-options").hidden = !rules.options?.length;
    $("sheet-options").replaceChildren(
      ...(rules.options ?? []).map((option) => {
        const value = values[option.id] ?? option.default;
        const id = `sheet-opt-${option.id}`;
        if (option.type === "checkbox") {
          return el("label", { class: "sheet-option sheet-option-check", for: id },
            el("input", { type: "checkbox", id, checked: value ? true : false }),
            el("span", {}, t[option.label]),
          );
        }
        return el("label", { class: "sheet-option", for: id },
          el("span", {}, t[option.label]),
          el("input", { type: "number", id, value: String(value), min: option.min, max: option.max, step: "1", inputmode: "numeric", required: true }),
        );
      }),
    );
  }

  /** Values of the setup options, numbers clamped to their range. */
  function readOptions() {
    const values = {};
    for (const option of rules.options ?? []) {
      const input = $(`sheet-opt-${option.id}`);
      if (option.type === "checkbox") values[option.id] = input.checked;
      else {
        const n = Math.round(Number(input.value));
        values[option.id] = Number.isFinite(n) && input.value !== "" ? Math.min(option.max ?? n, Math.max(option.min ?? n, n)) : option.default;
      }
    }
    return values;
  }

  function renderRecent() {
    const list = Object.entries(store.games).sort(([, a], [, b]) => b.updatedAt.localeCompare(a.updatedAt));
    $("sheet-recent").hidden = list.length === 0;
    $("sheet-recent-list").replaceChildren(
      ...list.map(([id, g]) => {
        const done = g.status === "finished";
        const top = ranked(g)[0];
        const info = done ? fill(t.finished, { name: top.name, points: num(top.total) }) : fill(t.running, { round: rules.roundNo(g) });
        return el("li", { class: done ? "" : "running" },
          el("div", { class: "sheet-recent-text" },
            el("b", {}, g.players.join(", ")),
            el("span", {}, info),
          ),
          el("button", { type: "button", class: "sheet-link", onclick: () => open(id) }, done ? t.view : t.resume),
          el("button", {
            type: "button", class: "sheet-icon", "aria-label": t.delete, title: t.delete,
            onclick: () => {
              if (!confirm(t.deleteConfirm)) return;
              delete store.games[id];
              if (store.current === id) store.current = null;
              save();
              renderRecent();
            },
          }, icon("M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3")),
        );
      }),
    );
  }

  function open(id) {
    store.current = id;
    save();
    if (store.games[id].status === "finished") renderResult();
    else renderGame();
  }

  function start(players, options) {
    const id = `g${Date.now().toString(36)}`;
    store.games[id] = { createdAt: now(), updatedAt: now(), status: "running", players, options, ...rules.create(players, options) };
    store.current = id;
    prune();
    save();
    renderGame();
  }

  function renderGame() {
    const g = game();
    if (!g) return renderSetup();
    const view = rules.render(g);
    $("sheet-round").textContent = view.round;
    $("sheet-table").replaceChildren(...view.table);
    $("sheet-table").style.setProperty("--cols", g.players.length);
    $("sheet-extra").replaceChildren(...(view.extra ?? []));
    $("sheet-undo").disabled = !view.undo;
    show("sheet-game");
  }

  // Final score: ranking with details
  function renderResult() {
    const g = game();
    if (!g) return renderSetup();
    const rows = ranked(g);
    const winners = rows.filter((r) => r.place === 1);
    $("sheet-winner").replaceChildren(
      el("span", { class: "sheet-winner-label" }, winners.length > 1 ? t.tie : t.winner),
      el("span", { class: "sheet-winner-name" }, winners.map((w) => w.name).join(" & ")),
      el("span", { class: "sheet-winner-points" }, fill(t.points, { n: num(winners[0].total) })),
    );
    $("sheet-ranking").replaceChildren(
      ...rows.map((r) =>
        el("li", { class: r.place === 1 ? "first" : "" },
          el("span", { class: "sheet-place", "aria-hidden": "true" }, String(r.place)),
          el("div", {},
            el("b", {}, r.name),
            r.detail && el("span", {}, r.detail),
          ),
          el("span", { class: "sheet-points" }, num(r.total)),
        ),
      ),
    );
    show("sheet-result");
    $("sheet-result-h").focus({ preventScroll: true });
    window.scrollTo({ top: $("sheet").offsetTop - 16 });
  }

  function finish() {
    const g = game();
    const empty = rules.openCount?.(g) ?? 0;
    if (empty > 0 && !confirm(fill(t.finishOpen, { n: empty }))) return;
    g.status = "finished";
    g.updatedAt = now();
    save();
    renderResult();
  }

  // ---------- Dialog ----------

  $("sheet-dialog-cancel").addEventListener("click", () => dialog.close());
  // A click on the dimmed edge closes the dialog.
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => {
    returnFocus?.()?.focus();
    returnFocus = null;
  });

  // ---------- Start ----------

  store = load();

  $("sheet-add").addEventListener("click", () => {
    if (names.length >= rules.maxPlayers) return;
    names.push(fill(t.playerDefault, { n: names.length + 1 }));
    renderPlayers();
    $("sheet-players").querySelector("li:last-child input").focus();
  });
  $("sheet-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const players = names.map((n, i) => n.trim() || fill(t.playerDefault, { n: i + 1 }));
    start(players, readOptions());
    window.scrollTo({ top: $("sheet").offsetTop - 16 });
  });
  $("sheet-undo").addEventListener("click", () => {
    rules.undo(game());
    ctx.commit();
  });
  $("sheet-finish").addEventListener("click", finish);
  $("sheet-new").addEventListener("click", () => renderSetup(game()?.players, game()?.options));
  $("sheet-again").addEventListener("click", () => start(game().players, game().options));
  $("sheet-back").addEventListener("click", () => {
    const g = game();
    g.status = "running";
    save();
    renderGame();
  });
  $("sheet-all").addEventListener("click", () => renderSetup(game()?.players, game()?.options));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && !$("sheet-game").hidden) show("sheet-game");
  });

  // Continue a running game, otherwise "New game".
  if (game()?.status === "running") renderGame();
  else renderSetup();
}
