// Animations for the game page, so you can follow what happens:
//   - played cards fly from the player to the discard pile,
//   - a picked-up pile slides to whoever takes it,
//   - a burning pile flares up and disappears,
//   - a flipped face-down card flies to the pile (and back with it, if it doesn't fit),
//   - a player who misses a turn shakes briefly.
//
// How it works: before a move, snapshot() notes where everything is. After the move
// the page is rendered in its final state, and animate() moves copies ("clones") of
// the cards from the old to the new places on top of it. The real discard pile is
// hidden meanwhile; the clones end exactly where the real cards are, so nothing jumps.
// Only the clones move, the layout of the page never changes.

const REDUCED_MOTION = matchMedia("(prefers-reduced-motion: reduce)");
const FLY = 450; // ms
const STAGGER = 70; // ms between several cards
const BURN = 750; // ms
const SLIDE = 550; // ms
const PAUSE = 250; // ms after big moments (pick-up, burn), so you notice them

const $ = (id) => document.getElementById(id);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const center = (rect) => ({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });

/** Where things are right now. Call it before the engine changes the state. */
export function snapshot(state, HUMAN) {
  const mine = new Map();
  for (const el of $("me").querySelectorAll("[data-id]")) mine.set(el.dataset.id, el.getBoundingClientRect());
  const down = new Map();
  for (const el of $("my-table").querySelectorAll('[data-zone="down"]')) down.set(Number(el.dataset.index), el.getBoundingClientRect());
  return { pile: state.pile.slice(-3), mine, down, human: HUMAN };
}

/** Plays the animations for the events of one move. Resolves when they are done. */
export async function animate(before, events, { cardHTML }) {
  if (REDUCED_MOTION.matches || !events.some((e) => ["play", "flip", "pickup", "burn", "skip"].includes(e.type))) return;

  const layer = $("fx");
  const pileEl = $("pile");
  const pileRect = pileEl.getBoundingClientRect();
  const cw = $("deck").firstElementChild.getBoundingClientRect().width;
  const slotPos = (i) => ({ left: pileRect.left + i * 0.25 * cw, top: pileRect.top + pileRect.height - cw * 1.4 });

  const clone = (html, pos) => {
    const tpl = document.createElement("template");
    tpl.innerHTML = html.trim();
    const el = tpl.content.firstElementChild;
    el.classList.add("fxcard");
    el.style.left = `${pos.left}px`;
    el.style.top = `${pos.top}px`;
    layer.append(el);
    return el;
  };

  const sourceRect = (event) => {
    if (event.player === before.human) {
      if (event.type === "flip") return before.down.get(event.index);
      return null; // per card, see below
    }
    return document.querySelector(`.opp[data-player="${event.player}"]`)?.getBoundingClientRect();
  };
  const targetRect = (player) =>
    player === before.human ? $("my-hand").getBoundingClientRect() : document.querySelector(`.opp[data-player="${player}"]`)?.getBoundingClientRect();

  // The visible top of the discard pile, as clones. At most three cards show.
  let pile = before.pile.map((card, i) => ({ card, el: clone(cardHTML(card), slotPos(i)) }));
  pileEl.style.visibility = "hidden";

  /** Moves the visible pile cards to their slots after new cards were added. */
  const relayout = () => {
    const shown = pile.slice(-3);
    for (const item of pile.slice(0, -3)) item.el.remove();
    pile = shown;
    pile.forEach((item, i) => {
      const pos = slotPos(i);
      const from = item.el.getBoundingClientRect();
      item.el.style.left = `${pos.left}px`;
      item.el.style.top = `${pos.top}px`;
      const dx = from.left - pos.left;
      if (Math.abs(dx) > 1) item.el.animate([{ transform: `translateX(${dx}px)` }, { transform: "none" }], { duration: FLY, easing: "ease-out" });
    });
  };

  /** Cards fly from a player to the top of the pile. */
  const flyIn = async (event, cards) => {
    const fromBox = sourceRect(event);
    const added = cards.slice(-3).map((card) => ({ card, el: clone(cardHTML(card), slotPos(0)) }));
    pile.push(...added);
    relayout();
    await Promise.all(
      added.map((item, k) => {
        const to = item.el.getBoundingClientRect();
        const fromRect = fromBox ?? before.mine.get(item.card.id) ?? to;
        const a = center(fromRect);
        const b = center(to);
        const scale = fromBox && event.player !== before.human ? 0.55 : 1;
        return item.el.animate(
          [
            { transform: `translate(${a.x - b.x}px, ${a.y - b.y}px) scale(${scale})`, opacity: 0.6 },
            { transform: "none", opacity: 1 },
          ],
          { duration: FLY, delay: k * STAGGER, easing: "cubic-bezier(.2,.8,.2,1)", fill: "backwards" },
        ).finished;
      }),
    );
  };

  /** The whole pile slides to the player who takes it. */
  const slideAway = async (player) => {
    const target = targetRect(player);
    if (!target) return;
    const b = center(target);
    await Promise.all(
      pile.map((item, k) => {
        const a = center(item.el.getBoundingClientRect());
        return item.el.animate(
          [
            { transform: "none", opacity: 1 },
            { transform: `translate(${b.x - a.x}px, ${b.y - a.y}px) scale(0.5)`, opacity: 0 },
          ],
          { duration: SLIDE, delay: k * 40, easing: "ease-in", fill: "forwards" },
        ).finished;
      }),
    );
    for (const item of pile) item.el.remove();
    pile = [];
  };

  /** The pile flares up and disappears. */
  const burn = async () => {
    const flame = clone(`<div class="fxflame" aria-hidden="true">🔥</div>`, {
      left: pileRect.left + pileRect.width / 2 - 24,
      top: pileRect.top + pileRect.height / 2 - 28,
    });
    const flare = { duration: BURN, easing: "ease-in", fill: "forwards" };
    await Promise.all([
      ...pile.map(
        (item) =>
          item.el.animate(
            [
              { transform: "none", opacity: 1, filter: "none" },
              { transform: "translateY(-6px) scale(1.04)", opacity: 1, filter: "brightness(1.4) sepia(1) saturate(4) hue-rotate(-20deg)", offset: 0.4 },
              { transform: "translateY(-22px) scale(0.9)", opacity: 0, filter: "brightness(2) sepia(1) saturate(6) hue-rotate(-20deg)" },
            ],
            flare,
          ).finished,
      ),
      flame.animate(
        [
          { transform: "scale(0.4)", opacity: 0 },
          { transform: "scale(1.3)", opacity: 1, offset: 0.4 },
          { transform: "translateY(-18px) scale(1.6)", opacity: 0 },
        ],
        flare,
      ).finished,
    ]);
    flame.remove();
    for (const item of pile) item.el.remove();
    pile = [];
  };

  /** A player who misses a turn shakes and shows ⏭. */
  const skip = (player) => {
    const box = player === before.human ? $("me") : document.querySelector(`.opp[data-player="${player}"]`);
    if (!box) return wait(0);
    box.classList.remove("skipped");
    void box.offsetWidth; // restart the CSS animation
    box.classList.add("skipped");
    setTimeout(() => box.classList.remove("skipped"), 900);
    return wait(350);
  };

  try {
    for (const event of events) {
      if (event.type === "play") await flyIn(event, event.cards);
      else if (event.type === "flip") {
        await flyIn(event, [event.card]);
        if (!event.fits) {
          await wait(250);
          await slideAway(event.player);
        }
      } else if (event.type === "pickup") {
        await slideAway(event.player);
        await wait(PAUSE);
      } else if (event.type === "burn") {
        await burn();
        await wait(PAUSE);
      }
      else if (event.type === "skip") await skip(event.player);
    }
  } finally {
    layer.replaceChildren();
    pileEl.style.visibility = "";
  }
}
