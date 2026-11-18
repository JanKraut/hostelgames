import { test as base, expect } from "@playwright/test";
import languages from "../src/_data/languages.js";

// Every test fails if the page throws a JavaScript error.
const test = base.extend({
  page: async ({ page }, use) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await use(page);
    expect(errors, "JavaScript errors on the page").toEqual([]);
  },
});

// Relative to baseURL, e.g. "./" for English and "de/" for German.
const pathOf = (lang) => (lang.path === "/" ? "./" : lang.path.slice(1));
const byCode = Object.fromEntries(languages.map((lang) => [lang.code, lang]));

/** Opens a language page without being redirected by the start page. */
async function openLanguage(page, lang) {
  await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
  await page.goto(pathOf(lang));
}

test.describe("every language page", () => {
  for (const lang of languages) {
    test(`${lang.code} renders its own texts`, async ({ page }) => {
      await openLanguage(page, lang);

      await expect(page).toHaveTitle(lang.t.title);
      await expect(page.locator("html")).toHaveAttribute("lang", lang.htmlLang);
      await expect(page.locator("html")).toHaveAttribute("dir", lang.dir);
      await expect(page.locator("h2").first()).toHaveText(lang.t.setupH);
      await expect(page.locator("#spickzettel")).toHaveCount(0);
      await expect(page.locator(".pagetabs a[aria-current=page]")).toHaveText(lang.t.pgRules);
      await expect(page.locator(".langmenu a[aria-current=page]")).toHaveAttribute("data-lang", lang.code);

      // One hreflang link per language plus x-default, and a canonical URL.
      await expect(page.locator('link[rel=alternate][hreflang]')).toHaveCount(languages.length + 1);
      await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", lang.url);

      // No template leftovers or missing texts.
      const text = await page.locator("body").innerText();
      expect(text).not.toMatch(/undefined|\[object|\{\{|\{%|\{(mine|top|right|total)\}/);
    });

    test(`${lang.code} fits the screen width`, async ({ page }) => {
      await openLanguage(page, lang);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});

// Strategy and quick start: one page each per language, linked by the tabs at the top.
const SUBPAGES = [
  { sub: "strategy/", tab: (t) => t.n6, title: (t) => `${t.stH} · ${t.title}`, check: "#strategie .strats li" },
  { sub: "quickstart/", tab: (t) => t.pgQuick, title: (t) => `${t.pgQuick} · ${t.title}`, check: "#spickzettel dt" },
];

test.describe("strategy and quick start pages", () => {
  for (const lang of languages) {
    for (const { sub, tab, title, check } of SUBPAGES) {
      test(`${lang.code} ${sub} renders its own texts and fits the screen`, async ({ page }) => {
        await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
        await page.goto(pathOf(lang) + sub);

        await expect(page).toHaveTitle(title(lang.t));
        await expect(page.locator("html")).toHaveAttribute("lang", lang.htmlLang);
        await expect(page.locator(check).first()).toBeVisible();
        await expect(page.locator(".pagetabs a[aria-current=page]")).toHaveText(tab(lang.t));
        await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", lang.url + sub);
        await expect(page.locator(`.langmenu a[data-lang="${lang.code}"]`)).toHaveAttribute("href", new RegExp(`${sub}$`));

        const text = await page.locator("body").innerText();
        expect(text).not.toMatch(/undefined|\[object|\{\{|\{%/);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }
  }

  test("the tabs link the three pages", async ({ page }) => {
    await openLanguage(page, byCode.de);
    await page.locator(".pagetabs a", { hasText: byCode.de.t.n6 }).click();
    await expect(page).toHaveURL(/\/de\/strategy\/$/);
    await page.locator(".pagetabs a", { hasText: byCode.de.t.pgQuick }).click();
    await expect(page).toHaveURL(/\/de\/quickstart\/$/);
    await page.locator(".pagetabs a", { hasText: byCode.de.t.pgRules }).click();
    await expect(page).toHaveURL(/\/de\/$/);
  });

  test("the English quick start redirects to the saved language", async ({ page, baseURL }) => {
    await page.addInitScript(() => localStorage.setItem("lang", "de"));
    await page.goto(baseURL + "quickstart/");
    await expect(page).toHaveURL(/\/de\/quickstart\/$/);
  });

  // The page starts with the same header as the rules; scrolled to, the cheat sheet fits one screen.
  for (const [width, height] of [[360, 740], [390, 844]]) {
    test(`the quick start cheat sheet fits on one phone screen (${width} × ${height})`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await openLanguage(page, byCode.de);
      await page.goto("de/quickstart/");
      await expect(page.locator(".hero h1")).toBeVisible();
      const box = await page.locator("#spickzettel .cheat").boundingBox();
      expect(box.height).toBeLessThanOrEqual(height);
    });
  }
});

test.describe("start page redirect", () => {
  const cases = [
    ["de-DE", "de"],
    ["es-ES", "es"],
    ["es-MX", "es-419"],
    ["pt-PT", "pt"],
    ["pt-BR", "pt-br"],
    ["nb-NO", "nb"],
    ["he-IL", "he"],
    ["en-US", "en"],
    ["ja-JP", "en"],
  ];
  for (const [locale, code] of cases) {
    test(`browser language ${locale} → ${code}`, async ({ browser, baseURL }) => {
      const context = await browser.newContext({ locale });
      const page = await context.newPage();
      await page.goto(baseURL);
      await expect(page).toHaveURL(byCode[code].url.replace(/^https:\/\/[^/]+/, new URL(baseURL).origin));
      await context.close();
    });
  }

  test("a language picked in the menu wins over the browser language", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ locale: "de-DE" });
    const page = await context.newPage();
    await page.goto(baseURL);
    await expect(page).toHaveURL(/\/de\/$/);

    await page.locator(".langmenu summary").click();
    await page.locator('.langmenu a[data-lang="en"]').click();
    await expect(page).toHaveURL(baseURL);

    await page.goto(baseURL);
    await expect(page).toHaveURL(baseURL);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await context.close();
  });

  test("language codes saved by the old single-page version still work", async ({ page, baseURL }) => {
    await page.addInitScript(() => localStorage.setItem("lang", "br"));
    await page.goto(baseURL);
    await expect(page).toHaveURL(/\/pt-br\/$/);
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the rules are readable and the menu works", async ({ page }) => {
    await page.goto("de/");
    await expect(page.locator("h1")).toContainText("Shithead");
    await expect(page.locator("#sonderkarten h3").first()).toHaveText(byCode.de.t.sp2h);
    await expect(page.locator("#shurl")).toHaveText(byCode.de.url.replace("https://", ""));

    // Things that need JavaScript are hidden.
    await expect(page.locator("#ueben")).toBeHidden();
    await expect(page.locator('nav a[href="#ueben"]')).toBeHidden();
    await expect(page.locator("#shCopy")).toBeHidden();

    // The language menu is plain links.
    await page.locator(".langmenu summary").click();
    await page.locator('.langmenu a[data-lang="he"]').click();
    await expect(page).toHaveURL(/\/he\/$/);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });

  test("the start page stays English", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, locale: "de-DE" });
    const page = await context.newPage();
    await page.goto(baseURL);
    await expect(page).toHaveURL(baseURL);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await context.close();
  });
});

test.describe("practice quiz", () => {
  const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

  // The rules, written down independently from app.js.
  function allowed(top, mine) {
    if (["2", "3", "10"].includes(mine)) return true;
    if (top === "2") return true;
    if (top === "7") return RANKS.indexOf(mine) <= RANKS.indexOf("7");
    return RANKS.indexOf(mine) >= RANKS.indexOf(top);
  }

  const rankOf = async (locator) => (await locator.locator(".c").innerText()).replace(/[♠♥♦♣\s]/g, "");

  test("judges answers by the rules and counts the score", async ({ page }) => {
    // Seeded random numbers, so every run deals the same cards.
    await page.addInitScript(() => {
      let seed = 2;
      Math.random = () => {
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    });
    const lang = byCode.en;
    await openLanguage(page, lang);
    await expect(page.locator("#score")).toHaveText("0 of 0 correct");

    const seen = new Set();
    const rounds = 30;
    for (let round = 1; round <= rounds; round++) {
      const top = await rankOf(page.locator("#topCard"));
      const mine = await rankOf(page.locator("#myCard"));
      expect(["3", "10"], "3 and 10 never lie on top").not.toContain(top);
      seen.add(`top:${top}`).add(`mine:${mine}`);
      if (top === "7" && !allowed(top, mine)) seen.add("blocked by 7");

      const answer = allowed(top, mine) ? "Yes" : "No";
      await page.getByRole("button", { name: answer, exact: true }).click();
      await expect(page.locator("#fb .ok"), `${mine} on ${top}`).toHaveText(lang.t.quiz.right.trim());
      await expect(page.locator("#score")).toHaveText(`${round} of ${round} correct`);
      await page.getByRole("button", { name: lang.t.qNext }).click();
    }

    // The dealt cards covered every special rule.
    for (const must of ["top:2", "top:7", "mine:2", "mine:3", "mine:10", "blocked by 7"]) {
      expect(seen, `dealt cards should include ${must}`).toContain(must);
    }

    // A wrong answer is marked as wrong.
    const top = await rankOf(page.locator("#topCard"));
    const mine = await rankOf(page.locator("#myCard"));
    await page.getByRole("button", { name: allowed(top, mine) ? "No" : "Yes", exact: true }).click();
    await expect(page.locator("#fb .ko")).toBeVisible();
    await expect(page.locator("#score")).toHaveText(`${rounds} of ${rounds + 1} correct`);
  });

  test("feedback is in the page language", async ({ page }) => {
    await openLanguage(page, byCode.de);
    await expect(page.locator("#score")).toHaveText("0 von 0 richtig");
    await page.locator("#btns .yes").click();
    await expect(page.locator("#fb")).toContainText(/Richtig!|Nicht ganz\./);
  });
});

test.describe("share", () => {
  test("QR code and link point to the page itself", async ({ page }) => {
    const lang = byCode.de;
    await openLanguage(page, lang);
    await expect(page.locator("#shurl")).toHaveAttribute("href", lang.url);
    await expect(page.locator("#qr svg")).toBeVisible();
    await expect(page.locator("#shCopy")).toBeVisible();
  });
});

test.describe("self-contained", () => {
  for (const lang of [byCode.en, byCode.cs, byCode.he]) {
    test(`${lang.code} loads nothing from other servers and every file exists`, async ({ page, baseURL }) => {
      const origin = new URL(baseURL).origin;
      const foreign = [];
      const broken = [];
      page.on("request", (request) => {
        if (!request.url().startsWith(origin)) foreign.push(request.url());
      });
      page.on("response", (response) => {
        if (response.status() >= 400) broken.push(`${response.status()} ${response.url()}`);
      });

      await openLanguage(page, lang);
      await page.evaluate(() => document.fonts.ready);

      expect(foreign, "requests to other servers").toEqual([]);
      expect(broken, "missing files").toEqual([]);
      const failedFonts = await page.evaluate(() => [...document.fonts].filter((f) => f.status === "error").length);
      expect(failedFonts, "fonts that failed to load").toBe(0);
    });
  }

  test("icons exist", async ({ page, request }) => {
    await openLanguage(page, byCode.en);
    for (const selector of ['link[rel="icon"]', 'link[rel="apple-touch-icon"]']) {
      const href = await page.locator(selector).getAttribute("href");
      const response = await request.get(new URL(href, page.url()).href);
      expect(response.ok(), `${selector} → ${href}`).toBe(true);
    }
  });
});

test.describe("offline", () => {
  /** Waits until the service worker has cached everything and controls the page. */
  async function installed(page) {
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
      if (!navigator.serviceWorker.controller) {
        await new Promise((resolve) => navigator.serviceWorker.addEventListener("controllerchange", resolve, { once: true }));
      }
    });
  }

  async function openAndInstall(page, lang) {
    await openLanguage(page, lang);
    await installed(page);
  }

  test("after one visit the whole site works without network", async ({ page, context }) => {
    await openAndInstall(page, byCode.de);
    await context.setOffline(true);

    await page.reload();
    await expect(page.locator("h2").first()).toHaveText(byCode.de.t.setupH);
    await expect(page.locator("#qr svg")).toBeVisible();

    // Other languages were cached too, not only the visited page.
    await page.locator(".langmenu summary").click();
    await page.locator('.langmenu a[data-lang="he"]').click();
    await expect(page).toHaveURL(/\/he\/$/);
    await expect(page.locator("h2").first()).toHaveText(byCode.he.t.setupH);
    await page.evaluate(() => document.fonts.ready);
    const failedFonts = await page.evaluate(() => [...document.fonts].filter((f) => f.status === "error").length);
    expect(failedFonts, "fonts that failed to load offline").toBe(0);

    // The quiz still works.
    await page.locator("#btns .yes").click();
    await expect(page.locator("#fb span")).toBeVisible();

    // The game page works offline too.
    await page.goto("he/play/");
    await page.locator("#setup-form button[type=submit]").click();
    await expect(page.locator("#btn-ready")).toBeVisible();
  });

  test("the start page redirects offline too", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ locale: "en-US" });
    const page = await context.newPage();
    await page.goto(baseURL);
    await installed(page);
    await context.setOffline(true);
    await page.evaluate(() => localStorage.setItem("lang", "es"));
    await page.goto(baseURL);
    await expect(page).toHaveURL(/\/es\/$/);
    await expect(page.locator("h2").first()).toHaveText(byCode.es.t.setupH);
    await context.close();
  });

  test("the app can be installed: manifest and its icons exist", async ({ page, request }) => {
    await openLanguage(page, byCode.en);
    const href = await page.locator('link[rel="manifest"]').getAttribute("href");
    const manifestUrl = new URL(href, page.url()).href;
    const manifest = await (await request.get(manifestUrl)).json();
    expect(manifest.start_url).toBe("./");
    expect(manifest.display).toBe("standalone");
    for (const icon of manifest.icons) {
      const response = await request.get(new URL(icon.src, manifestUrl).href);
      expect(response.ok(), icon.src).toBe(true);
    }
  });
});
