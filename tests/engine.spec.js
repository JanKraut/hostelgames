// Rules of the game engine, tested without a browser.
import { test, expect } from "@playwright/test";
import * as E from "../src/assets/game/engine.js";
import { chooseMove, chooseSwaps } from "../src/assets/game/bots.js";

const RANK = { J: 11, Q: 12, K: 13, A: 14 };
/** "7♠" → card object */
const c = (text) => {
  const suit = text.slice(-1);
  const r = text.slice(0, -1);
  return { id: text, rank: RANK[r] ?? Number(r), suit };
};
const cards = (text) => (text ? text.split(" ").map(c) : []);

/** A running game in a given situation. Players: { hand, up, down } as "7♠ 8♥" strings. */
function game({ players, pile = "", deck = "", turn = 0 }) {
  return {
    players: players.map((p) => ({ hand: cards(p.hand), up: cards(p.up), down: cards(p.down), place: null })),
    deck: cards(deck),
    pile: cards(pile),
    burned: 0,
    turn,
    phase: "play",
    ready: players.map(() => true),
    startRank: null,
    finished: [],
  };
}

const seeded = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

test.describe("which card may be played", () => {
  const allowed = (pile, rank) => E.canPlayRank(game({ players: [{}, {}], pile }), rank);

  test("equal or higher", () => {
    expect(allowed("8♠", 8)).toBe(true);
    expect(allowed("8♠", 12)).toBe(true);
    expect(allowed("8♠", 5)).toBe(false);
    expect(allowed("", 4)).toBe(true);
  });

  test("2, 3 and 10 always", () => {
    for (const rank of [2, 3, 10]) expect(allowed("A♠", rank)).toBe(true);
  });

  test("after a 2 anything goes", () => {
    expect(allowed("K♠ 2♥", 4)).toBe(true);
  });

  test("3 is invisible: the card below counts", () => {
    expect(allowed("9♠ 3♥", 8)).toBe(false);
    expect(allowed("9♠ 3♥ 3♦", 9)).toBe(true);
    expect(allowed("3♥", 4)).toBe(true);
  });

  test("after a 7 it must be 7 or lower (or special)", () => {
    expect(allowed("7♠", 5)).toBe(true);
    expect(allowed("7♠", 7)).toBe(true);
    expect(allowed("7♠", 8)).toBe(false);
    expect(allowed("7♠", 10)).toBe(true);
    expect(allowed("7♠ 3♥", 9)).toBe(false);
  });
});

test.describe("moves", () => {
  test("play, then draw back to 3", () => {
    const s = game({ players: [{ hand: "5♠ 5♥ 9♣" }, { hand: "K♠" }], deck: "2♣ 4♦ 6♥" });
    E.play(s, 0, ["5♠", "5♥"]);
    expect(s.pile.map((x) => x.id)).toEqual(["5♠", "5♥"]);
    expect(s.players[0].hand).toHaveLength(3);
    expect(s.deck).toHaveLength(1);
    expect(s.turn).toBe(1);
  });

  test("cards of different rank cannot be played together", () => {
    const s = game({ players: [{ hand: "5♠ 6♥" }, { hand: "K♠" }] });
    expect(() => E.play(s, 0, ["5♠", "6♥"])).toThrow();
  });

  test("a card that doesn't fit cannot be played", () => {
    const s = game({ players: [{ hand: "5♠ K♥" }, { hand: "K♠" }], pile: "9♦" });
    expect(() => E.play(s, 0, ["5♠"])).toThrow();
  });

  test("an 8 makes the next player miss a turn", () => {
    const s = game({ players: [{ hand: "8♠ 4♦" }, { hand: "K♠" }, { hand: "Q♠" }] });
    const events = E.play(s, 0, ["8♠"]);
    expect(events.filter((e) => e.type === "skip")).toEqual([{ type: "skip", player: 1 }]);
    expect(s.turn).toBe(2);
  });

  test("two 8s skip the next two players", () => {
    const s = game({ players: [{ hand: "8♠ 8♥ 4♦" }, { hand: "K♠" }, { hand: "Q♠" }, { hand: "J♠" }] });
    const events = E.play(s, 0, ["8♠", "8♥"]);
    expect(events.filter((e) => e.type === "skip").map((e) => e.player)).toEqual([1, 2]);
    expect(s.turn).toBe(3);
  });

  test("with two players: one 8 and you go again, two 8s and it is the other's turn", () => {
    const one = game({ players: [{ hand: "8♠ 4♦" }, { hand: "K♠" }] });
    E.play(one, 0, ["8♠"]);
    expect(one.turn).toBe(0);
    const two = game({ players: [{ hand: "8♠ 8♥ 4♦" }, { hand: "K♠" }] });
    E.play(two, 0, ["8♠", "8♥"]);
    expect(two.turn).toBe(1);
  });

  test("players who are out are not skipped, the next one still in the game is", () => {
    const s = game({ players: [{ hand: "8♠ 4♦" }, { hand: "K♠" }, { hand: "Q♠" }] });
    s.players[1].place = 1;
    s.finished = [1];
    E.play(s, 0, ["8♠"]);
    expect(s.turn).toBe(0);
  });

  test("the 8 itself is a normal card: equal or higher", () => {
    expect(E.canPlayRank(game({ players: [{}, {}], pile: "9♦" }), 8)).toBe(false);
    expect(E.canPlayRank(game({ players: [{}, {}], pile: "7♦" }), 8)).toBe(false);
    expect(E.canPlayRank(game({ players: [{}, {}], pile: "6♦" }), 8)).toBe(true);
  });

  test("a flipped 8 skips too", () => {
    const s = game({ players: [{ down: "8♣ 4♠" }, { hand: "K♠" }, { hand: "Q♠" }], pile: "5♦" });
    E.flip(s, 0, 0);
    expect(s.turn).toBe(2);
  });

  test("burning beats skipping: four 8s burn and you go again", () => {
    const s = game({ players: [{ hand: "8♠ 8♥ 4♦" }, { hand: "K♠" }, { hand: "Q♠" }], pile: "8♣ 8♦" });
    const events = E.play(s, 0, ["8♠", "8♥"]);
    expect(events.some((e) => e.type === "skip")).toBe(false);
    expect(s.turn).toBe(0);
  });

  test("10 burns the pile and you go again", () => {
    const s = game({ players: [{ hand: "10♠ 4♥" }, { hand: "K♠" }], pile: "A♦ K♣" });
    const events = E.play(s, 0, ["10♠"]);
    expect(s.pile).toEqual([]);
    expect(s.burned).toBe(3);
    expect(s.turn).toBe(0);
    expect(events.find((e) => e.type === "burn")).toMatchObject({ again: true });
  });

  test("four of a kind on top burns, also across players", () => {
    const s = game({ players: [{ hand: "8♠ 8♥ 4♦" }, { hand: "K♠" }], pile: "8♣ 8♦" });
    E.play(s, 0, ["8♠", "8♥"]);
    expect(s.pile).toEqual([]);
    expect(s.turn).toBe(0);
  });

  test("picking up is only allowed when nothing fits", () => {
    const s = game({ players: [{ hand: "5♠ 4♥" }, { hand: "K♠" }], pile: "Q♦ K♣" });
    E.pickUp(s, 0);
    expect(s.players[0].hand).toHaveLength(4);
    expect(s.pile).toEqual([]);
    expect(s.turn).toBe(1);

    const t = game({ players: [{ hand: "5♠ K♥" }, { hand: "K♠" }], pile: "Q♦" });
    expect(() => E.pickUp(t, 0)).toThrow();
  });

  test("with empty hand and draw pile: face-up cards first, then face-down", () => {
    const s = game({ players: [{ up: "9♠", down: "4♥" }, { hand: "K♠" }] });
    expect(E.source(s, 0)).toBe("up");
    expect(() => E.flip(s, 0, 0)).toThrow();
    E.play(s, 0, ["9♠"]);
    s.turn = 0;
    s.pile = [];
    expect(E.source(s, 0)).toBe("down");
  });

  test("a face-down card that doesn't fit goes to the hand with the pile", () => {
    const s = game({ players: [{ down: "4♥ 6♠" }, { hand: "K♠" }], pile: "9♦ J♣" });
    const [event] = E.flip(s, 0, 0);
    expect(event).toMatchObject({ type: "flip", fits: false, count: 3 });
    expect(s.players[0].hand.map((x) => x.id).sort()).toEqual(["4♥", "9♦", "J♣"]);
    expect(E.source(s, 0)).toBe("hand");
  });

  test("whoever plays their last card is out; the last one is the Shithead", () => {
    const s = game({ players: [{ down: "A♥" }, { hand: "K♠" }, { hand: "Q♠" }], pile: "5♦" });
    const events = E.flip(s, 0, 0);
    expect(events.find((e) => e.type === "out")).toMatchObject({ player: 0, place: 1 });
    expect(s.turn).toBe(1);
    expect(s.phase).toBe("play");
  });

  test("the game ends when one player is left", () => {
    const s = game({ players: [{ hand: "K♠" }, { hand: "Q♠ 4♣" }] });
    const events = E.play(s, 0, ["K♠"]);
    expect(events.at(-1)).toEqual({ type: "over", shithead: 1 });
    expect(s.phase).toBe("over");
    expect(s.players.map((p) => p.place)).toEqual([1, 2]);
  });
});

test.describe("endless loops", () => {
  // Found by simulation: every move is forced and the same cards go round forever.
  test("a forced loop ends in a draw", () => {
    const s = game({
      players: [
        { hand: "7♦ 3♦", up: "K♦", down: "4♠ 5♠ 6♠" },
        { hand: "A♠", up: "K♠", down: "4♥ 5♥ 6♥" },
      ],
      turn: 1,
    });
    let moves = 0;
    while (s.phase === "play" && moves < 500) {
      const p = s.turn;
      const m = chooseMove(s, p, "normal", () => 0.5);
      if (m.type === "play") E.play(s, p, m.ids);
      else if (m.type === "flip") E.flip(s, p, m.index);
      else E.pickUp(s, p);
      moves++;
    }
    expect(s.phase).toBe("over");
    expect(s.stalemate).toBe(true);
    expect(moves).toBeLessThan(100);
  });
});

test.describe("start of the game", () => {
  test("lowest card from 4 upwards starts and must be played first", () => {
    const s = E.createGame({ players: 3, random: seeded(7) });
    s.players[0].hand = cards("9♠ 9♥ K♣");
    s.players[1].hand = cards("2♠ 5♥ A♣");
    s.players[2].hand = cards("4♠ 3♥ 8♣");
    for (const p of [0, 1, 2]) E.setReady(s, p);
    expect(s.turn).toBe(2);
    expect(s.startRank).toBe(4);
    expect(E.canPlayRank(s, 8)).toBe(false);
    E.play(s, 2, ["4♠"]);
    expect(s.startRank).toBe(null);
  });

  test("swapping only before the start", () => {
    const s = E.createGame({ players: 2, random: seeded(3) });
    const [h, u] = [s.players[0].hand[0], s.players[0].up[0]];
    E.swap(s, 0, h.id, u.id);
    expect(s.players[0].up[0]).toBe(h);
    E.setReady(s, 0);
    E.setReady(s, 1);
    expect(() => E.swap(s, 0, u.id, h.id)).toThrow();
  });
});

test.describe("bots", () => {
  test("a normal bot puts its strongest cards face-up", () => {
    const s = E.createGame({ players: 2, random: seeded(1) });
    s.players[1].hand = cards("10♠ A♥ 4♣");
    s.players[1].up = cards("5♠ 2♦ 6♣");
    for (const [h, u] of chooseSwaps(s, 1, "normal")) E.swap(s, 1, h, u);
    expect(s.players[1].up.map((x) => x.rank).sort((a, b) => a - b)).toEqual([2, 10, 14]);
  });

  test("a normal bot plays low cards first and saves its specials", () => {
    const s = game({ players: [{ hand: "K♠" }, { hand: "10♠ 2♥ 6♣ 6♦ Q♠" }], pile: "5♦", turn: 1 });
    expect(chooseMove(s, 1, "normal")).toEqual({ type: "play", ids: ["6♣", "6♦"] });
  });

  for (const level of ["easy", "normal"]) {
    test(`${level}: 1,000 complete games, cards never get lost`, () => {
      const random = seeded(level === "easy" ? 11 : 12);
      let draws = 0;
      for (let g = 0; g < 1000; g++) {
        const n = 2 + (g % 4);
        const s = E.createGame({ players: n, random });
        for (let p = 0; p < n; p++) {
          for (const [h, u] of chooseSwaps(s, p, level)) E.swap(s, p, h, u);
          E.setReady(s, p);
        }
        let moves = 0;
        while (s.phase === "play") {
          const p = s.turn;
          const m = chooseMove(s, p, level, random);
          if (m.type === "play") E.play(s, p, m.ids);
          else if (m.type === "flip") E.flip(s, p, m.index);
          else E.pickUp(s, p);
          // Plain checks: expect() for every single move would be slow.
          if (E.countCards(s) !== 52) throw new Error(`Game ${g}: ${E.countCards(s)} cards instead of 52`);
          if (++moves > 10000) throw new Error(`Game ${g} does not end`);
        }
        // A draw (endless loop) ends the game before everyone is out; it must stay rare.
        if (s.stalemate) draws++;
        else if (s.finished.length !== n) throw new Error(`Game ${g}: not everyone finished`);
      }
      expect(draws, "draws").toBeLessThan(10);
    });
  }

  test("normal bots beat easy bots most of the time", () => {
    const random = seeded(99);
    let normalWins = 0;
    const games = 400;
    for (let g = 0; g < games; g++) {
      const s = E.createGame({ players: 2, random });
      const levels = g % 2 ? ["easy", "normal"] : ["normal", "easy"];
      for (let p = 0; p < 2; p++) {
        for (const [h, u] of chooseSwaps(s, p, levels[p])) E.swap(s, p, h, u);
        E.setReady(s, p);
      }
      while (s.phase === "play") {
        const p = s.turn;
        const m = chooseMove(s, p, levels[p], random);
        if (m.type === "play") E.play(s, p, m.ids);
        else if (m.type === "flip") E.flip(s, p, m.index);
        else E.pickUp(s, p);
      }
      if (levels[s.finished[0]] === "normal") normalWins++;
    }
    expect(normalWins / games).toBeGreaterThan(0.7);
  });
});
