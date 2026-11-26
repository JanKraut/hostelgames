// Engine of the practice quiz, the same in every game (@hostelgames/core, published as
// /assets/core/quiz.js). Markup: includes/quiz.njk. The game's own /assets/quiz.js only knows
// its rules and starts the quiz:
//
//   import { startQuiz, cardHTML, pick, RANKS, SUITS } from "./core/quiz.js";
//
//   startQuiz({
//     // New question: show it in the stage (quiz-stage.njk), return what judge needs.
//     deal: () => { …; return { top, mine } },
//     // Is the answer "yes" right? Returns [allowed, explanation] (text = quiz.* texts).
//     judge: ({ top, mine }, text) => [true, text.same],
//   });
//
// The engine handles the yes / no buttons, feedback, next question and score.

const $ = (id) => document.getElementById(id);

export const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
export const SUITS = ["♠", "♥", "♦", "♣"];

/** Random element of a list. */
export const pick = (list) => list[Math.floor(Math.random() * list.length)];

/** Fills {placeholders} of a text: fill("{a} of {b}", { a: 1, b: 2 }). */
export const fill = (template, values) => template.replace(/\{(\w+)\}/g, (_, key) => values[key]);

/** A playing card, same markup as card() in includes/card.njk. */
export function cardHTML(rank, suit) {
  const red = suit === "♥" || suit === "♦" ? " r" : "";
  return `<div class="card${red}"><div class="c">${rank}<span>${suit}</span></div><div class="pip">${suit}</div></div>`;
}

/** Starts the quiz in #practice. */
export function startQuiz({ deal, judge }) {
  const text = JSON.parse($("quiz-text").textContent);
  let current = null;
  let right = 0;
  let total = 0;

  const showScore = () => ($("score").textContent = fill(text.score, { right, total }));

  function next() {
    current = deal(text);
    $("fb").innerHTML = "";
    $("btns").hidden = false;
    $("next").hidden = true;
  }

  $("btns").addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button || !current) return;
    const [allowed, why] = judge(current, text);
    const correct = (button.dataset.a === "1") === allowed;
    total++;
    if (correct) right++;
    $("fb").innerHTML =
      `<span class="${correct ? "ok" : "ko"}">${correct ? text.right : text.wrong}</span>` +
      (allowed ? text.yes : text.no) +
      why;
    showScore();
    $("btns").hidden = true;
    $("next").hidden = false;
    $("next").focus({ preventScroll: true });
  });

  $("next").addEventListener("click", next);
  next();
  showScore();
}
