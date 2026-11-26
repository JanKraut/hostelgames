// Shithead's practice quiz "Can I play this?": one card on top of the pile, one in your hand.
// Buttons, feedback, score and the card picture come from the core (/assets/core/quiz.js).

import { startQuiz, cardHTML, pick, fill, RANKS, SUITS } from "./core/quiz.js";

const $ = (id) => document.getElementById(id);
const value = (rank) => RANKS.indexOf(rank) + 2;

/** Returns [allowed, explanation] for playing `mine` on top of `top`. */
function judge({ top, mine }, text) {
  if (mine === "2") return [true, text.always2];
  if (mine === "3") return [true, text.always3];
  if (mine === "10") return [true, text.always10];
  if (top === "2") return [true, text.after2];
  if (top === "7") return value(mine) <= 7 ? [true, text.after7ok] : [false, text.after7no];
  if (mine === top) return [true, text.same];
  return value(mine) > value(top)
    ? [true, fill(text.higher, { mine, top })]
    : [false, fill(text.lower, { mine, top })];
}

function deal() {
  // 3 and 10 never stay on top of the pile, so they are not shown there.
  const question = {
    top: pick(RANKS.filter((rank) => rank !== "3" && rank !== "10")),
    mine: pick(RANKS),
  };
  $("topCard").innerHTML = cardHTML(question.top, pick(SUITS));
  $("myCard").innerHTML = cardHTML(question.mine, pick(SUITS));
  return question;
}

startQuiz({ deal, judge });
