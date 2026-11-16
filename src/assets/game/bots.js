// Computer players. "easy" plays any fitting card; "normal" follows the strategies
// from the rules page.

import { SPECIAL, effectiveTop, playableRanks, source, timesSeen } from "./engine.js";

const pick = (list, random) => list[Math.floor(random() * list.length)];

/** How much a card is worth as a face-up card: specials and high cards first. */
function faceUpValue(rank) {
  if (rank === 10) return 30;
  if (rank === 2) return 29;
  if (rank === 3) return 13.5;
  return rank;
}

/** Swaps to make before the start, as [handId, upId] pairs. */
export function chooseSwaps(state, p, level) {
  if (level === "easy") return [];
  const player = state.players[p];
  // Strongest three of all six cards go face-up.
  const best = [...player.hand, ...player.up].sort((a, b) => faceUpValue(b.rank) - faceUpValue(a.rank)).slice(0, 3);
  const swaps = [];
  const up = [...player.up];
  for (const card of best) {
    if (up.includes(card)) continue;
    const weakest = up.filter((c) => !best.includes(c)).sort((a, b) => faceUpValue(a.rank) - faceUpValue(b.rank))[0];
    swaps.push([card.id, weakest.id]);
    up[up.indexOf(weakest)] = card;
  }
  return swaps;
}

const nextPlayer = (state, p) => {
  const n = state.players.length;
  for (let step = 1; step < n; step++) {
    const i = (p + step) % n;
    if (state.players[i].place === null) return i;
  }
  return p;
};

/**
 * The move a bot makes now:
 *   { type: "play", ids } | { type: "flip", index } | { type: "pickup" }
 */
export function chooseMove(state, p, level, random = Math.random) {
  const from = source(state, p);
  const player = state.players[p];

  if (from === "down") return { type: "flip", index: Math.floor(random() * player.down.length) };

  const options = playableRanks(state, p);
  if (!options.length) return { type: "pickup" };

  const cardsOf = (rank, count) => player[from].filter((c) => c.rank === rank).slice(0, count).map((c) => c.id);

  if (level === "easy") {
    const { rank, count } = pick(options, random);
    return { type: "play", ids: cardsOf(rank, 1 + Math.floor(random() * count)) };
  }

  const has = (rank) => options.find((o) => o.rank === rank);
  const normal = options.filter((o) => !SPECIAL.has(o.rank));

  // The first card of the game is fixed.
  if (state.startRank !== null) return { type: "play", ids: cardsOf(state.startRank, has(state.startRank).count) };

  // A random fitting card now and then, and always when this position was seen
  // before: keeps bots from repeating the same moves forever.
  if (random() < 0.05 || timesSeen(state) >= 2) {
    const { rank, count } = pick(options, random);
    return { type: "play", ids: cardsOf(rank, count) };
  }

  // Burn a big pile with a 10: it's gone and we play again.
  if (state.pile.length >= 6 && has(10)) return { type: "play", ids: cardsOf(10, 1) };

  // Complete four of a kind on the pile: burns it.
  const top = state.pile[state.pile.length - 1];
  if (top && !SPECIAL.has(top.rank)) {
    let same = 0;
    for (let i = state.pile.length - 1; i >= 0 && state.pile[i].rank === top.rank; i--) same++;
    const mine = has(top.rank);
    if (mine && same + mine.count >= 4) return { type: "play", ids: cardsOf(top.rank, 4 - same) };
  }

  // A 7 hurts a next player who only has high face-up cards left.
  const next = state.players[nextPlayer(state, p)];
  const nextStuck =
    next.hand.length === 0 && !state.deck.length && next.up.length && next.up.every((c) => c.rank > 7 && !SPECIAL.has(c.rank));
  if (nextStuck && has(7)) return { type: "play", ids: cardsOf(7, has(7).count) };

  // Endgame with a free pile: get rid of the highest card, it is the hardest
  // to play later and the next player has to beat it.
  const topRank = effectiveTop(state);
  if (!state.deck.length && (topRank === null || topRank === 2) && normal.length) {
    const highest = normal[normal.length - 1];
    return { type: "play", ids: cardsOf(highest.rank, highest.count) };
  }

  // Low cards first, all copies together. Save the specials.
  if (normal.length) {
    const lowest = normal[0];
    return { type: "play", ids: cardsOf(lowest.rank, lowest.count) };
  }

  // Only specials left: a 3 keeps the pressure on, then 2, then 10. One at a time.
  const order = topRank !== null && topRank >= 11 ? [3, 2, 10] : [2, 3, 10];
  for (const rank of order) if (has(rank)) return { type: "play", ids: cardsOf(rank, 1) };

  // Unreachable: options is not empty and every rank is special or normal.
  return { type: "play", ids: cardsOf(options[0].rank, 1) };
}

