// Rules page only. Adds the practice quiz and the QR code / share buttons.
// The page is fully readable without this file.

const $ = (id) => document.getElementById(id);

// ---------- Quiz: "Can I play this?" ----------

const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const SUITS = ["♠", "♥", "♦", "♣"];
const text = JSON.parse($("quiz-text").textContent);

const value = (rank) => RANKS.indexOf(rank) + 2;
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const fill = (template, values) => template.replace(/\{(\w+)\}/g, (_, key) => values[key]);

function cardHTML(rank, suit) {
  const red = suit === "♥" || suit === "♦" ? " r" : "";
  return `<div class="card${red}"><div class="c">${rank}<span>${suit}</span></div><div class="pip">${suit}</div></div>`;
}

/** Returns [allowed, explanation] for playing `mine` on top of `top`. */
function judge(top, mine) {
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

let current = null;
let right = 0;
let total = 0;

const showScore = () => ($("score").textContent = fill(text.score, { right, total }));

function deal() {
  // 3 and 10 never stay on top of the pile, so they are not shown there.
  current = {
    top: pick(RANKS.filter((rank) => rank !== "3" && rank !== "10")),
    mine: pick(RANKS),
  };
  $("topCard").innerHTML = cardHTML(current.top, pick(SUITS));
  $("myCard").innerHTML = cardHTML(current.mine, pick(SUITS));
  $("fb").innerHTML = "";
  $("btns").hidden = false;
  $("next").hidden = true;
}

$("btns").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button || !current) return;
  const [allowed, why] = judge(current.top, current.mine);
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

$("next").addEventListener("click", deal);
deal();
showScore();

// ---------- Share ----------

const shareUrl = $("shurl").href;

if (window.qrcode) {
  const qr = qrcode(0, "M");
  qr.addData(shareUrl);
  qr.make();
  $("qr").innerHTML = qr.createSvgTag(5, 2);
}

const copyButton = $("shCopy");
const copyLabel = copyButton.textContent;

function copied() {
  copyButton.textContent = copyButton.dataset.done;
  setTimeout(() => (copyButton.textContent = copyLabel), 1800);
}

function selectUrl() {
  const range = document.createRange();
  range.selectNodeContents($("shurl"));
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareUrl);
    copied();
  } catch {
    selectUrl();
  }
}

copyButton.addEventListener("click", copyLink);

const shareButton = $("shShare");
const policy = document.permissionsPolicy || document.featurePolicy;
const canShare = !!navigator.share && !(policy?.allowsFeature && !policy.allowsFeature("web-share"));

if (canShare) {
  shareButton.hidden = false;
  shareButton.addEventListener("click", () => {
    navigator.share({ title: document.title, url: shareUrl }).catch((error) => {
      if (error?.name !== "AbortError") {
        shareButton.hidden = true;
        copyLink();
      }
    });
  });
}
