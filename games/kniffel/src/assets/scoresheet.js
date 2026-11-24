// Online-Block für Kniffel (Seite scoresheet/). Läuft nur im Browser, ohne Server:
// Spiele liegen in localStorage unter STORE_KEY. Drei Ansichten: Neues Spiel, Block, Abrechnung.
// Texte und Feldnamen kommen aus <script id="sheet-texts"> (i18n: sheet.*, up1–up6, lb_*H).
//
// Aufbau: Regeln (FIELDS, score) · Speicher (load/save) · Ansichten (render*) · Eingabe-Dialog.
// Kandidat für den Core, sobald ein zweites Block-Spiel dazukommt.

const STORE_KEY = "hostelgames:kniffel:scoresheet";
const STORE_VERSION = 1;
const MAX_PLAYERS = 8;
const MAX_GAMES = 20;

// ---------- Regeln ----------

// kind: "count" (Anzahl × Augenzahl), "sum" (Augensumme 5–30), "fixed" (feste Punkte oder 0)
const FIELDS = [
  { id: "ones", part: "upper", kind: "count", n: 1 },
  { id: "twos", part: "upper", kind: "count", n: 2 },
  { id: "threes", part: "upper", kind: "count", n: 3 },
  { id: "fours", part: "upper", kind: "count", n: 4 },
  { id: "fives", part: "upper", kind: "count", n: 5 },
  { id: "sixes", part: "upper", kind: "count", n: 6 },
  { id: "three", part: "lower", kind: "sum" },
  { id: "four", part: "lower", kind: "sum" },
  { id: "full", part: "lower", kind: "fixed", points: 25 },
  { id: "small", part: "lower", kind: "fixed", points: 30 },
  { id: "large", part: "lower", kind: "fixed", points: 40 },
  { id: "kniffel", part: "lower", kind: "fixed", points: 50 },
  { id: "chance", part: "lower", kind: "sum" },
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

// ---------- Speicher ----------

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORE_KEY));
    if (data && data.version === STORE_VERSION && data.games) return data;
  } catch {
    // kaputter oder gesperrter Speicher: leer anfangen
  }
  return { version: STORE_VERSION, current: null, games: {} };
}

function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    // Speicher voll oder gesperrt (z. B. privater Modus): Spiel läuft trotzdem weiter
  }
}

/** Älteste beendete Spiele löschen, wenn es zu viele werden. */
function prune() {
  const ids = Object.keys(store.games).sort((a, b) => store.games[b].updatedAt.localeCompare(store.games[a].updatedAt));
  for (const id of ids.slice(MAX_GAMES)) if (id !== store.current) delete store.games[id];
}

// ---------- Hilfen ----------

const $ = (id) => document.getElementById(id);
const { t, fields: LABELS } = JSON.parse($("sheet-texts").textContent);
const fill = (text, values) => text.replace(/\{(\w+)\}/g, (all, key) => (key in values ? values[key] : all));

/** Element mit Attributen und Kindern; Text immer als Textknoten (Namen kommen vom Nutzer). */
function el(tag, attrs = {}, ...children) {
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

const now = () => new Date().toISOString();
const game = () => store.games[store.current] ?? null;

/** Platzierungen: Gleichstand teilt sich den Platz. */
function ranking(g) {
  const rows = g.players.map((name, i) => ({ name, i, ...score(g.scores[i]) })).sort((a, b) => b.total - a.total);
  rows.forEach((row, k) => (row.place = k > 0 && row.total === rows[k - 1].total ? rows[k - 1].place : k + 1));
  return rows;
}

/** Wer ist dran: wer am wenigsten Felder hat, bei Gleichstand der Erste. */
function turnOf(g) {
  const filled = g.scores.map((s) => FIELDS.filter((f) => typeof s[f.id] === "number").length);
  const min = Math.min(...filled);
  return { player: min >= FIELDS.length ? -1 : filled.indexOf(min), round: Math.min(min + 1, FIELDS.length) };
}

// ---------- Ansichten ----------

const VIEWS = ["sheet-setup", "sheet-game", "sheet-result"];
let wakeLock = null;

function show(view) {
  for (const id of VIEWS) $(id).hidden = id !== view;
  // Beim Spielen den Bildschirm anlassen, wenn der Browser das kann.
  if (view === "sheet-game" && "wakeLock" in navigator && !wakeLock) {
    navigator.wakeLock.request("screen").then((lock) => {
      wakeLock = lock;
      lock.addEventListener("release", () => (wakeLock = null));
    }).catch(() => {});
  } else if (view !== "sheet-game" && wakeLock) {
    wakeLock.release().catch(() => {});
  }
}

// Neues Spiel: Namen der Spieler, Liste der letzten Spiele
let names = [];

function renderSetup(players) {
  names = players ?? [fill(t.playerDefault, { n: 1 }), fill(t.playerDefault, { n: 2 })];
  renderPlayers();
  renderRecent();
  show("sheet-setup");
}

function renderPlayers() {
  $("sheet-players-h").textContent = fill(t.playersH, { n: names.length, max: MAX_PLAYERS });
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
        names.length > 1 &&
          el("button", {
            type: "button", class: "sheet-icon", "aria-label": t.remove, title: t.remove,
            onclick: () => { names.splice(i, 1); renderPlayers(); },
          }, icon("M18 6 6 18M6 6l12 12")),
      ),
    ),
  );
  $("sheet-add").hidden = names.length >= MAX_PLAYERS;
}

function renderRecent() {
  const list = Object.entries(store.games).sort(([, a], [, b]) => b.updatedAt.localeCompare(a.updatedAt));
  $("sheet-recent").hidden = list.length === 0;
  $("sheet-recent-list").replaceChildren(
    ...list.map(([id, g]) => {
      const done = g.status === "finished";
      const top = ranking(g)[0];
      const info = done ? fill(t.finished, { name: top.name, points: top.total }) : fill(t.running, { round: turnOf(g).round });
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

function icon(path) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "18");
  svg.setAttribute("height", "18");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", path);
  svg.append(p);
  return svg;
}

function open(id) {
  store.current = id;
  save();
  if (store.games[id].status === "finished") renderResult();
  else renderGame();
}

function start(players) {
  const id = `g${Date.now().toString(36)}`;
  store.games[id] = { createdAt: now(), updatedAt: now(), status: "running", players, scores: players.map(() => ({})), history: [] };
  store.current = id;
  prune();
  save();
  renderGame();
}

// Block: eine Spalte pro Spieler
function renderGame() {
  const g = game();
  if (!g) return renderSetup();
  const turn = turnOf(g);
  $("sheet-round").textContent = turn.player < 0 ? t.allDone : fill(t.round, { round: turn.round });
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
      el("th", { scope: "row", class: "sheet-label" }, LABELS[field.id]),
      ...g.players.map((name, i) => {
        const value = g.scores[i][field.id];
        const filled = typeof value === "number";
        const struck = filled && value === 0;
        return el("td", {},
          el("button", {
            type: "button",
            class: `sheet-cell${filled ? " filled" : ""}${struck ? " struck" : ""}${!filled && i === turn.player ? " next" : ""}`,
            "aria-label": `${fill(t.cellLabel, { field: LABELS[field.id], name })}${filled ? `: ${value}` : ""}`,
            onclick: () => ask(i, field),
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

  $("sheet-table").replaceChildren(
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
  );
  $("sheet-table").style.setProperty("--cols", cols);
  $("sheet-undo").disabled = g.history.length === 0;
  show("sheet-game");
}

function setValue(player, fieldId, value) {
  const g = game();
  const prev = g.scores[player][fieldId];
  if (prev === value) return;
  g.history.push({ player, field: fieldId, prev: typeof prev === "number" ? prev : null });
  if (g.history.length > 200) g.history.shift();
  if (value === null) delete g.scores[player][fieldId];
  else g.scores[player][fieldId] = value;
  g.updatedAt = now();
  save();
  renderGame();
}

function undo() {
  const g = game();
  const last = g.history.pop();
  if (!last) return;
  if (last.prev === null) delete g.scores[last.player][last.field];
  else g.scores[last.player][last.field] = last.prev;
  g.updatedAt = now();
  save();
  renderGame();
}

// Abrechnung: Rangliste mit Aufschlüsselung
function renderResult() {
  const g = game();
  if (!g) return renderSetup();
  const rows = ranking(g);
  const winners = rows.filter((r) => r.place === 1);
  $("sheet-winner").replaceChildren(
    el("span", { class: "sheet-winner-label" }, winners.length > 1 ? t.tie : t.winner),
    el("span", { class: "sheet-winner-name" }, winners.map((w) => w.name).join(" & ")),
    el("span", { class: "sheet-winner-points" }, fill(t.points, { n: winners[0].total })),
  );
  $("sheet-ranking").replaceChildren(
    ...rows.map((r) =>
      el("li", { class: r.place === 1 ? "first" : "" },
        el("span", { class: "sheet-place", "aria-hidden": "true" }, String(r.place)),
        el("div", {},
          el("b", {}, r.name),
          el("span", {}, fill(t.breakdown, { upper: r.upper, bonus: r.bonus, lower: r.lower })),
        ),
        el("span", { class: "sheet-points" }, String(r.total)),
      ),
    ),
  );
  show("sheet-result");
  $("sheet-result-h").focus({ preventScroll: true });
  window.scrollTo({ top: $("sheet").offsetTop - 16 });
}

function finish() {
  const g = game();
  const open = g.scores.reduce((n, s) => n + score(s).open, 0);
  if (open > 0 && !confirm(fill(t.finishOpen, { n: open }))) return;
  g.status = "finished";
  g.updatedAt = now();
  save();
  renderResult();
}

// ---------- Eingabe-Dialog ----------

const dialog = $("sheet-dialog");
let asking = null;

function ask(player, field) {
  const g = game();
  if (g.status === "finished") return;
  asking = { player, field };
  const value = g.scores[player][field.id];
  const has = typeof value === "number";
  $("sheet-dialog-player").textContent = g.players[player];
  $("sheet-dialog-h").textContent = LABELS[field.id];
  $("sheet-dialog-error").textContent = "";
  const body = $("sheet-dialog-body");
  const actions = [];
  const choose = (v) => () => { dialog.close(); setValue(player, field.id, v); };

  if (field.kind === "count") {
    $("sheet-dialog-q").textContent = fill(t.upperQ, { n: field.n });
    body.replaceChildren(
      el("div", { class: "sheet-choices" },
        [0, 1, 2, 3, 4, 5].map((k) =>
          el("button", { type: "button", class: `sheet-choice${has && value === k * field.n ? " picked" : ""}`, onclick: choose(k * field.n) },
            el("b", {}, String(k * field.n)),
            el("span", {}, k === 0 ? t.none : `${k} ×`),
          ),
        ),
      ),
    );
  } else if (field.kind === "sum") {
    $("sheet-dialog-q").textContent = t.sumQ;
    const input = el("input", {
      type: "number", inputmode: "numeric", min: "5", max: "30", step: "1", id: "sheet-sum",
      value: has && value > 0 ? String(value) : "", "aria-label": t.sumQ,
    });
    body.replaceChildren(el("div", { class: "sheet-sum-input" }, input));
    actions.push(
      el("button", { type: "button", class: "sheet-btn", onclick: choose(0) }, t.strike),
      el("button", {
        type: "submit", class: "ctabtn sheet-primary",
        onclick: (event) => {
          event.preventDefault();
          const n = Number(input.value);
          if (!Number.isInteger(n) || n < 5 || n > 30) {
            $("sheet-dialog-error").textContent = t.sumInvalid;
            input.focus();
            return;
          }
          choose(n)();
        },
      }, t.enter),
    );
  } else {
    $("sheet-dialog-q").textContent = t.fixedQ;
    body.replaceChildren();
    actions.push(
      el("button", { type: "button", class: "sheet-btn", onclick: choose(0) }, t.strike),
      el("button", { type: "button", class: "ctabtn sheet-primary", onclick: choose(field.points) }, fill(t.got, { points: field.points })),
    );
  }
  if (has) actions.push(el("button", { type: "button", class: "sheet-link sheet-clear", onclick: choose(null) }, t.clear));
  $("sheet-dialog-actions").replaceChildren(...actions);
  dialog.showModal();
  const focus = body.querySelector("input") ?? body.querySelector(".picked") ?? null;
  if (focus) focus.focus();
}

$("sheet-dialog-cancel").addEventListener("click", () => dialog.close());
// Klick auf den abgedunkelten Rand schließt den Dialog.
dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
dialog.addEventListener("close", () => {
  if (asking) document.querySelector(`#sheet-table tbody tr:nth-child(${rowIndex(asking.field) + 1}) td:nth-child(${asking.player + 2}) button`)?.focus();
  asking = null;
});

/** Zeile eines Feldes im tbody: Abschnitt „Oberer Teil“, 6 Felder, Summe, Bonus, Abschnitt „Unterer Teil“, … */
function rowIndex(field) {
  const i = FIELDS.indexOf(field);
  return field.part === "upper" ? i + 1 : i + 4;
}

// ---------- Start ----------

const store = load();

$("sheet-add").addEventListener("click", () => {
  if (names.length >= MAX_PLAYERS) return;
  names.push(fill(t.playerDefault, { n: names.length + 1 }));
  renderPlayers();
  $("sheet-players").querySelector("li:last-child input").focus();
});
$("sheet-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const players = names.map((n, i) => n.trim() || fill(t.playerDefault, { n: i + 1 }));
  start(players);
  window.scrollTo({ top: $("sheet").offsetTop - 16 });
});
$("sheet-undo").addEventListener("click", undo);
$("sheet-finish").addEventListener("click", finish);
$("sheet-new").addEventListener("click", () => renderSetup(game()?.players));
$("sheet-again").addEventListener("click", () => start(game().players));
$("sheet-back").addEventListener("click", () => {
  const g = game();
  g.status = "running";
  save();
  renderGame();
});
$("sheet-all").addEventListener("click", () => renderSetup(game()?.players));
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && !$("sheet-game").hidden) show("sheet-game");
});

// Laufendes Spiel fortsetzen, sonst „Neues Spiel“.
if (game()?.status === "running") renderGame();
else renderSetup();
