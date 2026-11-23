// Shithead rules, without any user interface. Used by the game page and the tests.
//
// Rules (same as on the rules page):
//   - 52 cards, 2–5 players. Everyone gets 3 face-down, 3 face-up and 3 hand cards.
//   - Before the start, players may swap between hand and face-up cards.
//   - Whoever has the lowest card from 4 upwards in hand starts and plays it.
//   - Play a card that is equal or higher, several of the same rank together.
//     Then draw back to 3 cards while the draw pile lasts.
//   - 2 resets, 3 is invisible, after a 7 the next card must be 7 or lower,
//     an 8 (played like a normal card) makes the next player miss a turn; two 8s
//     the next two players, and so on,
//     10 burns the pile, four of a kind on top burns too. After a burn you go again.
//   - Can't play: pick up the whole pile.
//   - Hand empty and draw pile empty: play face-up cards, then face-down cards blind.
//   - Whoever runs out of cards is out. The last one is the Shithead.
//
// One addition for the computer: in rare endgames every move is forced and the
// same position comes back forever. When a position occurs for the 10th time,
// the game ends in a draw (similar to repetition in chess). Bots avoid repeating
// positions where they have a choice, so this only ends truly stuck games.

export const SUITS = ["♠", "♥", "♦", "♣"];
export const RANKS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]; // 11 = J … 14 = A
export const SPECIAL = new Set([2, 3, 10]);

const LABELS = { 11: "J", 12: "Q", 13: "K", 14: "A" };
export const rankLabel = (rank) => LABELS[rank] ?? String(rank);
export const isRed = (card) => card.suit === "♥" || card.suit === "♦";

export function newDeck() {
  const deck = [];
  for (const suit of SUITS) for (const rank of RANKS) deck.push({ id: `${rank}${suit}`, rank, suit });
  return deck;
}

function shuffle(cards, random) {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

/** Starts a new game. Player 0 is the human, the others are bots. */
export function createGame({ players = 2, random = Math.random } = {}) {
  if (players < 2 || players > 5) throw new Error("2–5 players");
  const deck = shuffle(newDeck(), random);
  const seats = Array.from({ length: players }, () => ({
    down: deck.splice(0, 3),
    up: deck.splice(0, 3),
    hand: deck.splice(0, 3),
    place: null,
  }));
  return {
    players: seats,
    deck,
    pile: [],
    burned: 0,
    turn: 0,
    phase: "swap", // swap → play → over
    ready: seats.map(() => false),
    startRank: null, // the first play must be this rank
    finished: [], // player indexes in the order they went out
    stalemate: false,
    seen: new Map(), // position → how often it occurred
  };
}

// ---------- Questions ----------

/** The rank that counts on the pile: 3s are invisible. null = anything goes. */
export function effectiveTop(state) {
  for (let i = state.pile.length - 1; i >= 0; i--) {
    if (state.pile[i].rank !== 3) return state.pile[i].rank;
  }
  return null;
}

/** May a card of this rank be played on the current pile? */
export function canPlayRank(state, rank) {
  if (state.startRank !== null) return rank === state.startRank;
  if (SPECIAL.has(rank)) return true;
  const top = effectiveTop(state);
  if (top === null || top === 2) return true;
  if (top === 7) return rank <= 7;
  return rank >= top;
}

/** Where the player plays from right now: "hand", "up", "down" or null when out. */
export function source(state, p) {
  const player = state.players[p];
  if (player.hand.length) return "hand";
  if (state.deck.length) return "hand"; // only happens mid-turn; hands are refilled right away
  if (player.up.length) return "up";
  if (player.down.length) return "down";
  return null;
}

/** Ranks the player could play now from their current source, with how many cards of each. */
export function playableRanks(state, p) {
  const from = source(state, p);
  if (from !== "hand" && from !== "up") return [];
  const counts = new Map();
  for (const card of state.players[p][from]) counts.set(card.rank, (counts.get(card.rank) ?? 0) + 1);
  return [...counts].filter(([rank]) => canPlayRank(state, rank)).map(([rank, count]) => ({ rank, count })).sort((a, b) => a.rank - b.rank);
}

export const isOut = (state, p) => state.players[p].place !== null;
export const activePlayers = (state) => state.players.map((_, i) => i).filter((i) => !isOut(state, i));

// ---------- Swap phase ----------

/** Swaps a hand card with a face-up card (before the game starts). */
export function swap(state, p, handId, upId) {
  if (state.phase !== "swap") throw new Error("Swapping is only allowed before the start");
  const player = state.players[p];
  const h = player.hand.findIndex((c) => c.id === handId);
  const u = player.up.findIndex((c) => c.id === upId);
  if (h < 0 || u < 0) throw new Error("No such cards");
  [player.hand[h], player.up[u]] = [player.up[u], player.hand[h]];
}

/** Marks a player as ready. When everyone is ready, the game starts. Returns events. */
export function setReady(state, p) {
  state.ready[p] = true;
  if (!state.ready.every(Boolean)) return [];
  state.phase = "play";
  // Lowest rank from 4 upwards that someone holds; the first player in seat order with it starts.
  for (const rank of RANKS.filter((r) => r >= 4)) {
    const starter = state.players.findIndex((pl) => pl.hand.some((c) => c.rank === rank));
    if (starter >= 0) {
      state.turn = starter;
      state.startRank = rank;
      return [{ type: "start", player: starter, rank }];
    }
  }
  state.turn = 0;
  return [{ type: "start", player: 0, rank: null }];
}

// ---------- Moves ----------

function refill(state, p) {
  const hand = state.players[p].hand;
  while (hand.length < 3 && state.deck.length) hand.push(state.deck.pop());
}

function burnsPile(state) {
  const pile = state.pile;
  if (pile.length && pile[pile.length - 1].rank === 10) return true;
  if (pile.length < 4) return false;
  const rank = pile[pile.length - 1].rank;
  return pile.slice(-4).every((c) => c.rank === rank);
}

function cardsLeft(player) {
  return player.hand.length + player.up.length + player.down.length;
}

/** After a play: burn, refill, check out, move the turn on (skipping one player per 8). */
function afterPlay(state, p, events, played) {
  const eights = played.filter((card) => card.rank === 8).length;
  const burn = burnsPile(state);
  if (burn) {
    state.burned += state.pile.length;
    state.pile = [];
  }
  refill(state, p);
  const player = state.players[p];
  if (cardsLeft(player) === 0) {
    player.place = state.finished.length + 1;
    state.finished.push(p);
    events.push({ type: "out", player: p, place: player.place });
    if (burn) events.push({ type: "burn", player: p, again: false });
    nextTurn(state, p, burn ? 0 : eights, events);
  } else if (burn) {
    // Same player goes again; a burn beats the 8s.
    events.push({ type: "burn", player: p, again: true });
  } else {
    nextTurn(state, p, eights, events);
  }
  checkOver(state, events);
  return events;
}

/** Gives the turn to the next player still in the game, skipping `skips` players (8s). */
function nextTurn(state, from, skips = 0, events = []) {
  const n = state.players.length;
  const next = (i) => {
    for (let step = 1; step <= n; step++) {
      const j = (i + step) % n;
      if (!isOut(state, j)) return j;
    }
    return i;
  };
  state.turn = next(from);
  if (activePlayers(state).length < 2) return;
  for (let k = 0; k < skips; k++) {
    events.push({ type: "skip", player: state.turn });
    state.turn = next(state.turn);
  }
}

function checkOver(state, events) {
  const left = activePlayers(state);
  if (left.length === 1 && state.phase === "play") {
    const last = left[0];
    state.players[last].place = state.players.length;
    state.finished.push(last);
    state.phase = "over";
    events.push({ type: "over", shithead: last });
  }
}

function assertTurn(state, p) {
  if (state.phase !== "play") throw new Error("The game is not running");
  if (state.turn !== p) throw new Error("Not your turn");
}

/** Plays cards (by id) of one rank from the player's current source. Returns events. */
export function play(state, p, ids) {
  assertTurn(state, p);
  const from = source(state, p);
  if (from !== "hand" && from !== "up") throw new Error(`Cannot play from ${from}`);
  const player = state.players[p];
  const cards = ids.map((id) => player[from].find((c) => c.id === id));
  if (!cards.length || cards.some((c) => !c)) throw new Error("No such cards");
  if (new Set(ids).size !== ids.length) throw new Error("Duplicate cards");
  const rank = cards[0].rank;
  if (cards.some((c) => c.rank !== rank)) throw new Error("All cards must have the same rank");
  if (!canPlayRank(state, rank)) throw new Error("This card cannot be played");

  player[from] = player[from].filter((c) => !ids.includes(c.id));
  state.pile.push(...cards);
  state.startRank = null;
  return remember(state, afterPlay(state, p, [{ type: "play", player: p, cards, from }], cards));
}

/** Picks up the whole pile. Only allowed when nothing can be played. Returns events. */
export function pickUp(state, p) {
  assertTurn(state, p);
  if (playableRanks(state, p).length) throw new Error("You can play, so you may not pick up");
  if (source(state, p) === "down") throw new Error("Flip a face-down card instead");
  const count = state.pile.length;
  state.players[p].hand.push(...state.pile);
  state.pile = [];
  nextTurn(state, p);
  return remember(state, [{ type: "pickup", player: p, count }]);
}

/** Flips a face-down card (by position). Plays it if it fits, else picks up the pile with it. */
export function flip(state, p, index) {
  assertTurn(state, p);
  if (source(state, p) !== "down") throw new Error("Face-down cards come last");
  const player = state.players[p];
  const [card] = player.down.splice(index, 1);
  if (!card) throw new Error("No such card");
  if (canPlayRank(state, card.rank)) {
    state.pile.push(card);
    state.startRank = null;
    return remember(state, afterPlay(state, p, [{ type: "flip", player: p, card, index, fits: true }], [card]));
  }
  const count = state.pile.length + 1;
  player.hand.push(...state.pile, card);
  state.pile = [];
  nextTurn(state, p);
  return remember(state, [{ type: "flip", player: p, card, index, fits: false, count }]);
}

const ids = (cards) => cards.map((c) => c.id);

function positionKey(state) {
  return JSON.stringify([
    state.turn,
    ids(state.pile),
    state.deck.length,
    state.players.map((pl) => [ids(pl.hand).sort(), ids(pl.up), ids(pl.down)]),
  ]);
}

/** How often the current position has occurred so far, counting now (bots use it to avoid loops). */
export function timesSeen(state) {
  return state.seen?.get(positionKey(state)) ?? 0;
}

/** Ends the game in a draw when the same position occurs for the 10th time. */
function remember(state, events) {
  if (state.phase !== "play") return events;
  const key = positionKey(state);
  state.seen ??= new Map();
  const times = (state.seen.get(key) ?? 0) + 1;
  state.seen.set(key, times);
  if (times >= 10) {
    state.phase = "over";
    state.stalemate = true;
    events.push({ type: "stalemate" });
  }
  return events;
}

/** Total number of cards in the game; always 52. Handy for tests. */
export function countCards(state) {
  return (
    state.deck.length +
    state.pile.length +
    state.burned +
    state.players.reduce((sum, pl) => sum + pl.hand.length + pl.up.length + pl.down.length, 0)
  );
}
