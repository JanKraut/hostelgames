// @hostelgames/core – loaded on every page of every game. Progressive enhancement:
// everything works without it. Light / dark switch, language menu (remembers the
// chosen language, closes on outside click or Escape), page tabs and the service worker
// that makes the site work offline.

// ---------- Offline ----------

// sw.js sits at the root of the site, two folders above this script (assets/core/).
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register(new URL("../../sw.js", import.meta.url)).catch(() => {});
}

// ---------- Light / dark switch ----------
// Without a saved choice the page follows the system setting (CSS media query).
// The choice is applied before the page is drawn by the inline script in base.njk.

const root = document.documentElement;
// Colours of the browser bar, taken from the <meta name="theme-color"> tags of the page.
const themeMetas = [...document.querySelectorAll('meta[name="theme-color"]')];
const THEME_LIGHT = themeMetas.find((m) => m.media.includes("light"))?.content ?? "#f4cf71";
const THEME_DARK = themeMetas.find((m) => m.media.includes("dark"))?.content ?? "#171a1f";
const dark = matchMedia("(prefers-color-scheme: dark)");
const isDark = () => (root.dataset.theme ? root.dataset.theme === "dark" : dark.matches);

function showTheme() {
  // The switch shows the icon of the mode it switches to; it is in data-theme for CSS.
  root.dataset.theme = isDark() ? "dark" : "light";
  for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
    meta.content = isDark() ? THEME_DARK : THEME_LIGHT;
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

// Pages without a language menu (e.g. the hub) simply skip this.
if (menu) {
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
}

// ---------- Page tabs ----------
// If the tabs don't fit (narrow phone, many pages), the bar scrolls sideways;
// show the current tab without moving the page itself.

const tabBar = document.querySelector(".pagetabs ul");
const currentTab = tabBar?.querySelector("[aria-current=page]");
if (tabBar && currentTab && tabBar.scrollWidth > tabBar.clientWidth) {
  const tab = currentTab.parentElement;
  const rtl = getComputedStyle(tabBar).direction === "rtl";
  const start = rtl ? tabBar.clientWidth - tab.offsetLeft - tab.offsetWidth : tab.offsetLeft;
  const left = start - (tabBar.clientWidth - tab.offsetWidth) / 2;
  tabBar.scrollLeft = rtl ? -left : left;
}
