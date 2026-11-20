// Loaded on every page. Progressive enhancement: everything works without it.
// Remembers the chosen language, closes the language menu on outside click or Escape,
// and installs the service worker that makes the site work offline.

// ---------- Offline ----------

// sw.js sits next to the pages, one folder above this script.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register(new URL("../sw.js", import.meta.url)).catch(() => {});
}

// ---------- Old section links ----------
// The section anchors used to be German (#aufbau …). Links shared before still
// land on the right section.

const OLD_ANCHORS = {
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

// ---------- Light / dark switch ----------
// Without a saved choice the page follows the system setting (CSS media query).
// The choice is applied before the page is drawn by the inline script in base.njk.

const root = document.documentElement;
const dark = matchMedia("(prefers-color-scheme: dark)");
const isDark = () => (root.dataset.theme ? root.dataset.theme === "dark" : dark.matches);

function showTheme() {
  // The switch shows the icon of the mode it switches to; it is in data-theme for CSS.
  root.dataset.theme = isDark() ? "dark" : "light";
  for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
    meta.content = isDark() ? "#171a1f" : "#f4cf71";
  }
}

const themeSwitch = document.querySelector(".themeswitch");
if (themeSwitch) {
  const saved = (() => {
    try {
      return localStorage.getItem("theme");
    } catch {
      return null;
    }
  })();
  if (!saved) {
    delete root.dataset.theme;
    dark.addEventListener("change", () => {
      delete root.dataset.theme;
      showTheme();
    });
  }
  showTheme();
  themeSwitch.addEventListener("click", () => {
    const next = isDark() ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    showTheme();
  });
}

// ---------- Language menu ----------

const menu = document.querySelector(".langmenu");

menu.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-lang]");
  if (!link) return;
  try {
    localStorage.setItem("lang", link.dataset.lang);
  } catch {}
});

// Close the menu on outside click or Escape.
document.addEventListener("click", (event) => {
  if (menu.open && !menu.contains(event.target)) menu.open = false;
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu.open) {
    menu.open = false;
    menu.querySelector("summary").focus();
  }
});
