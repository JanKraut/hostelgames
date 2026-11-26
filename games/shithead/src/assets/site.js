// Shithead only, on every page. The shared parts (light / dark switch, language menu,
// offline) are in @hostelgames/core (assets/core/core.js).

// ---------- Old section links ----------
// The section anchors used to be German (#aufbau …). Links shared before still
// land on the right section.

const OLD_ANCHORS = {
  steckbrief: "factsheet",
  aufbau: "setup",
  varianten: "variants",
  tauschen: "swap",
  ablauf: "how-to-play",
  sonderkarten: "special-cards",
  ende: "endgame",
  ueben: "practice",
  "gegen-bots": "play-bots",
  teilen: "share",
  grundprinzip: "principle",
  tausch: "swap",
  "sonderkarten-einsetzen": "using-special-cards",
  fehler: "mistakes",
  weiter: "next-steps",
  spickzettel: "cheat-sheet",
};
const oldAnchor = OLD_ANCHORS[decodeURIComponent(location.hash.slice(1))];
if (oldAnchor && document.getElementById(oldAnchor)) {
  history.replaceState(null, "", `#${oldAnchor}`);
  document.getElementById(oldAnchor).scrollIntoView();
}
