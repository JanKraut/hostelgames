// @hostelgames/core – loaded on every page of every game. Progressive enhancement:
// everything works without it. Light / dark switch, language menu (remembers the
// chosen language, closes on outside click or Escape), consent banner, page tabs and the service worker
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

// ---------- Consent banner ----------
// Only on sites with tracking (includes/tracking-body.njk). Shown until the visitor
// accepts or declines; the choice is kept for data-days days in localStorage "consent".
// "Accept" loads the tracking (window.hgTracking from tracking-head.njk). Escape only
// closes the banner for this page, like on mut-im-rucksack.de.

const consent = document.querySelector(".consent");

if (consent) {
  const stored = (() => {
    try {
      const choice = JSON.parse(localStorage.getItem("consent"));
      return choice && choice.until > Date.now() ? choice.value : null;
    } catch {
      return null;
    }
  })();

  const close = () => {
    consent.classList.remove("consent-in");
    document.removeEventListener("keydown", onKey);
    setTimeout(() => consent.remove(), 300);
  };
  const onKey = (event) => {
    if (event.key === "Escape") close();
  };

  if (!stored) {
    consent.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => consent.classList.add("consent-in")));
    document.addEventListener("keydown", onKey);
    consent.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-consent]");
      if (!button) return;
      const value = button.dataset.consent;
      try {
        localStorage.setItem("consent", JSON.stringify({ value, until: Date.now() + Number(consent.dataset.days) * 864e5 }));
      } catch {}
      if (value === "yes") window.hgTracking?.();
      close();
    });
  } else {
    consent.remove();
  }
}

// ---------- Page tabs ----------
// If the tabs don't fit (narrow phone, many pages), the bar scrolls sideways;
// show the current tab without moving the page itself. Again whenever the tab changes
// size, e.g. once the web font has loaded and made the tabs wider.

const tabBar = document.querySelector(".pagetabs ul");
const currentTab = tabBar?.querySelector("[aria-current=page]");

function showCurrentTab() {
  if (tabBar.scrollWidth <= tabBar.clientWidth) return;
  // Centre the tab in the bar; the browser stops at either end. Measured on screen,
  // so it works the same for right-to-left languages.
  const bar = tabBar.getBoundingClientRect();
  const tab = currentTab.getBoundingClientRect();
  tabBar.scrollLeft += tab.left + tab.width / 2 - (bar.left + bar.width / 2);
}

if (tabBar && currentTab) {
  showCurrentTab();
  if ("ResizeObserver" in window) new ResizeObserver(showCurrentTab).observe(currentTab, { box: "border-box" });
  else document.fonts?.ready.then(showCurrentTab);
}
