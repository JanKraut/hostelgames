// The game page: settings, table, your moves and the bots' turns.
// All game rules live in engine.js, the computer players in bots.js.

import * as E from "./engine.js";
import { chooseMove, chooseSwaps } from "./bots.js";

const T = JSON.parse(document.getElementById("game-text").textContent);
const $ = (id) => document.getElementById(id);
const fill = (template, values) => template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Bots wait a moment so you can follow their moves.
const REDUCED_MOTION = matchMedia("(prefers-reduced-motion: reduce)").matches;
const BOT_DELAY = REDUCED_MOTION ? 120 : 900;

const HUMAN = 0;
const SETTINGS_KEY = "game-settings";

let state = null;
let levels = [];
let names = [];
let selected = new Set(); // ids of hand / face-up cards selected for playing
let swapPick = null; // { zone, id } during the swap phase
let hint = ""; // short-lived message for you, e.g. "doesn't fit"
let log = [];
let botsRunning = false;
let gameId = 0;

// ---------- Rendering helpers ----------

// Card names like "10♣" are always left to right, also inside Hebrew sentences
// (U+2066 / U+2069 isolate them from the surrounding text direction).
const ltr = (text) => `\u2066${text}\u2069`;
const label = (card) => `${E.rankLabel(card.rank)}${card.suit}`;
const cardsText = (cards) => ltr(cards.map(label).join(" "));

function cardHTML(card, { size = "sm", tag = "div", classes = "", attrs = "" } = {}) {
  const red = E.isRed(card) ? " r" : "";
  const rank = E.rankLabel(card.rank);
  return (
    `<${tag} class="card ${size}${red} ${classes}" ${attrs} aria-label="${label(card)}">` +
    `<span class="c">${rank}<span>${card.suit}</span></span><span class="pip">${card.suit}</span></${tag}>`
  );
}

const backHTML = (size = "sm", attrs = "", tag = "div") => `<${tag} class="card ${size} back" ${attrs}></${tag}>`;

/** Face-down cards with the face-up cards on top, as on the rules page. */
function tableHTML(player, size, { upButtons = false, downButtons = false, upPlayable = () => false, picked = null } = {}) {
  const slots = Math.max(player.up.length, player.down.length);
  let html = "";
  for (let i = 0; i < slots; i++) {
    const up = player.up[i];
    const down = player.down[i];
    html += `<div class="slot ${size}">`;
    if (down) {
      html += downButtons
        ? backHTML(size, `data-zone="down" data-index="${i}" aria-label="?"`, "button")
        : backHTML(size);
    }
    if (up) {
      const classes = [down ? "ontop" : "", upPlayable(up) ? "playable" : "", picked === up.id || selected.has(up.id) ? "selected" : ""].join(" ");
      html += upButtons
        ? cardHTML(up, { size, tag: "button", classes, attrs: `data-zone="up" data-id="${up.id}"` })
        : cardHTML(up, { size, classes });
    }
    html += "</div>";
  }
  return html;
}

// ---------- Rendering ----------

function render() {
  if (!state) return;
  const myTurn = state.phase === "play" && state.turn === HUMAN && !E.isOut(state, HUMAN);
  const from = E.source(state, HUMAN);
  const playable = new Set(myTurn ? E.playableRanks(state, HUMAN).map((o) => o.rank) : []);

  // Opponents
  $("opponents").innerHTML = state.players
    .map((player, i) => {
      if (i === HUMAN) return "";
      const classes = ["opp", state.phase === "play" && state.turn === i ? "active" : "", player.place ? "done" : ""].join(" ");
      const place = player.place ? ` · ${player.place}.` : "";
      return (
        `<div class="${classes}"><div class="oppname">${names[i]}${place}</div>` +
        `<div class="opptable">${tableHTML(player, "xs")}</div>` +
        `<div class="opphand${player.hand.length ? "" : " empty"}">${backHTML("xs")}<span>${fill(T.handCount, { n: player.hand.length })}</span></div></div>`
      );
    })
    .join("");

  // Draw pile, discard pile, burned cards
  $("deck").innerHTML = state.deck.length
    ? `<div class="deckstack">${backHTML("sm")}<span class="count">${state.deck.length}</span></div>`
    : `<div class="card sm emptyslot"></div>`;
  const top = state.pile.slice(-3);
  $("pile").innerHTML = top.length
    ? top.map((card) => cardHTML(card)).join("") + `<span class="count">${state.pile.length}</span>`
    : `<div class="card sm emptyslot"></div>`;
  $("burned").textContent = state.burned ? fill(T.burned, { n: state.burned }) : "";
  const effective = E.effectiveTop(state);
  const topIsThree = state.pile.length && state.pile[state.pile.length - 1].rank === 3;
  $("invisible").textContent = topIsThree && effective !== null ? fill(T.invisible, { cards: E.rankLabel(effective) }) : "";

  // Your table and hand
  const me = state.players[HUMAN];
  const swapping = state.phase === "swap";
  $("my-table").innerHTML = tableHTML(me, "sm", {
    upButtons: swapping || (myTurn && from === "up"),
    downButtons: myTurn && from === "down",
    upPlayable: (card) => myTurn && from === "up" && playable.has(card.rank),
    picked: swapPick?.zone === "up" ? swapPick.id : null,
  });
  $("me").classList.toggle("active", myTurn);
  const hand = [...me.hand].sort((a, b) => a.rank - b.rank || a.suit.localeCompare(b.suit));
  $("my-hand").innerHTML = hand
    .map((card) => {
      const classes = [
        myTurn && from === "hand" && playable.has(card.rank) ? "playable" : "",
        myTurn && from === "hand" && !playable.has(card.rank) ? "dim" : "",
        selected.has(card.id) || (swapPick?.zone === "hand" && swapPick.id === card.id) ? "selected" : "",
      ].join(" ");
      return cardHTML(card, { tag: "button", classes, attrs: `data-zone="hand" data-id="${card.id}"` });
    })
    .join("");

  // Buttons
  $("btn-ready").hidden = !swapping;
  $("btn-play").hidden = !(myTurn && (from === "hand" || from === "up"));
  $("btn-play").disabled = selected.size === 0;
  $("btn-pickup").hidden = !(myTurn && from !== "down");
  $("btn-pickup").disabled = playable.size > 0;

  // Messages
  $("status").textContent = hint || statusText(myTurn, from, playable);
  $("log").innerHTML = log.map((line) => `<li>${line}</li>`).join("");
}

function statusText(myTurn, from, playable) {
  if (state.phase === "swap") return T.swapHint;
  if (!myTurn) return "";
  if (from === "down") return T.yourTurnDown;
  if (!playable.size) return T.noFit;
  if (state.startRank !== null) return fill(T.youStart, { rank: E.rankLabel(state.startRank) });
  if (from === "up") return T.yourTurnUp;
  const top = E.effectiveTop(state);
  if (top === 7) return T.yourTurnSeven;
  if (top === null || top === 2) return T.yourTurnAny;
  return T.yourTurn;
}

// ---------- Events → messages ----------

function describe(event) {
  const you = event.player === HUMAN;
  const name = names[event.player];
  switch (event.type) {
    case "start":
      return event.rank === null ? "" : you ? fill(T.youStart, { rank: E.rankLabel(event.rank) }) : fill(T.starts, { name, rank: E.rankLabel(event.rank) });
    case "play":
      return fill(T.played, { name, cards: cardsText(event.cards) });
    case "burn":
      return !event.again ? T.burnOut : you ? T.youBurn : fill(T.burn, { name });
    case "pickup":
      return fill(you ? T.youPickedUp : T.pickedUp, { name, n: event.count });
    case "flip":
      if (event.fits) return fill(you ? T.youFlipOk : T.flipOk, { name, cards: ltr(label(event.card)) });
      return fill(you ? T.youFlipFail : T.flipFail, { name, cards: ltr(label(event.card)) });
    case "stalemate":
      return T.stalemate;
    case "out":
      return you ? fill(T.won, { place: event.place, total: state.players.length }) : fill(T.out, { name, place: event.place });
    default:
      return "";
  }
}

function handle(events) {
  for (const event of events) {
    const line = describe(event);
    if (line) log = [line, ...log].slice(0, 4);
  }
  selected = new Set();
  hint = "";
  render();
  if (state.phase === "over") showOver();
  else if (state.phase === "play" && state.turn !== HUMAN) runBots();
}

// ---------- Bots ----------

async function runBots() {
  if (botsRunning) return;
  botsRunning = true;
  const id = gameId;
  while (state.phase === "play" && state.turn !== HUMAN) {
    // Once you are out, the bots play the rest at once.
    if (!E.isOut(state, HUMAN)) {
      render();
      await sleep(BOT_DELAY);
      if (id !== gameId) return; // a new game was started meanwhile
    }
    const p = state.turn;
    const move = chooseMove(state, p, levels[p]);
    const events =
      move.type === "play" ? E.play(state, p, move.ids) : move.type === "flip" ? E.flip(state, p, move.index) : E.pickUp(state, p);
    for (const event of events) {
      const line = describe(event);
      if (line) log = [line, ...log].slice(0, 4);
    }
  }
  botsRunning = false;
  render();
  if (state.phase === "over") showOver();
}

// ---------- Your moves ----------

$("me").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-zone]");
  if (!button || !state) return;
  const { zone, id, index } = button.dataset;

  if (state.phase === "swap") {
    if (zone === "down") return;
    if (!swapPick || swapPick.zone === zone) {
      swapPick = swapPick?.id === id ? null : { zone, id };
    } else {
      const handId = zone === "hand" ? id : swapPick.id;
      const upId = zone === "up" ? id : swapPick.id;
      E.swap(state, HUMAN, handId, upId);
      swapPick = null;
    }
    render();
    return;
  }

  if (state.phase !== "play" || state.turn !== HUMAN) return;

  if (zone === "down") {
    handle(E.flip(state, HUMAN, Number(index)));
    return;
  }

  if (zone !== E.source(state, HUMAN)) return;
  const card = state.players[HUMAN][zone].find((c) => c.id === id);
  if (!E.canPlayRank(state, card.rank)) {
    hint = fill(T.notThis, { cards: ltr(label(card)) });
    selected = new Set();
    render();
    return;
  }
  hint = "";
  if (selected.has(id)) {
    // Tapping a selected card again plays the selection.
    handle(E.play(state, HUMAN, [...selected]));
    return;
  }
  const selectedRank = [...selected].map((sid) => state.players[HUMAN][zone].find((c) => c.id === sid)?.rank)[0];
  if (selectedRank !== card.rank) selected = new Set();
  selected.add(id);
  render();
});

$("btn-play").addEventListener("click", () => {
  if (selected.size) handle(E.play(state, HUMAN, [...selected]));
});

$("btn-pickup").addEventListener("click", () => handle(E.pickUp(state, HUMAN)));

$("btn-ready").addEventListener("click", () => {
  swapPick = null;
  handle(E.setReady(state, HUMAN));
});

// ---------- Game start and end ----------

function newGame({ bots, level }) {
  gameId++;
  botsRunning = false;
  state = E.createGame({ players: bots + 1 });
  levels = [null, ...Array(bots).fill(level)];
  names = [T.you, ...Array.from({ length: bots }, (_, i) => fill(T.bot, { n: i + 1 }))];
  selected = new Set();
  swapPick = null;
  hint = "";
  log = [];
  // The bots swap right away and wait for you.
  for (let p = 1; p <= bots; p++) {
    for (const [handId, upId] of chooseSwaps(state, p, level)) E.swap(state, p, handId, upId);
    E.setReady(state, p);
  }
  $("setup").hidden = true;
  $("over").hidden = true;
  $("table").hidden = false;
  render();
  $("table").scrollIntoView({ block: "start" });
}

function showOver() {
  const me = state.players[HUMAN];
  const total = state.players.length;
  $("over-text").textContent = state.stalemate ? T.stalemate : me.place === total ? T.lost : fill(T.won, { place: me.place, total });
  // In a draw only the players who got out have a place.
  $("ranking").innerHTML = state.finished
    .map((p, i) => `<li${p === HUMAN ? ' class="you"' : ""}>${names[p]}${i === total - 1 ? ` – ${T.shithead}` : ""}</li>`)
    .join("");
  $("over").hidden = false;
  $("over").scrollIntoView({ block: "nearest" });
}

function readSettings() {
  const form = $("setup-form");
  return { bots: Number(form.bots.value), level: form.level.value };
}

$("setup-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const settings = readSettings();
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
  newGame(settings);
});

$("btn-again").addEventListener("click", () => newGame(readSettings()));

$("btn-settings").addEventListener("click", () => {
  gameId++;
  state = null;
  $("over").hidden = true;
  $("table").hidden = true;
  $("setup").hidden = false;
});

// Restore the last settings.
try {
  const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
  if (saved) {
    const form = $("setup-form");
    form.bots.value = String(saved.bots);
    form.level.value = saved.level;
  }
} catch {}
