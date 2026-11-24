import { test as base, expect } from "@playwright/test";
import languages from "../src/_data/languages.js";
import site from "../src/_data/site.js";

// Every test fails if the page throws a JavaScript error.
const test = base.extend({
  page: async ({ page }, use) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await use(page);
    expect(errors, "JavaScript errors on the page").toEqual([]);
  },
});

const pathOf = (lang) => (lang.path === "/" ? "./" : lang.path.slice(1));

for (const lang of languages) {
  test(`${lang.code}: rules page with its own texts`, async ({ page }) => {
    await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
    await page.goto(pathOf(lang));
    await expect(page).toHaveTitle(lang.t.seo.rulesT);
    await expect(page.locator("html")).toHaveAttribute("lang", lang.htmlLang);
    await expect(page.locator(".hero h1")).toHaveText(`${lang.t.h1} ${lang.t.h1sub}`);
    await expect(page.locator(".pagetabs a[aria-current=page]")).toHaveText(lang.t.pgRules);
    await expect(page.locator(".langmenu a[aria-current=page]")).toHaveAttribute("data-lang", lang.code);
    await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", lang.url);
    await expect(page.locator("link[rel=alternate][hreflang]")).toHaveCount(languages.length + 1);
    // Draft and preview: never indexed.
    await expect(page.locator('meta[name=robots][content=noindex]')).toHaveCount(1);
    // Share box with QR code, and the QR button at the top.
    await expect(page.locator("#share .qr svg")).toBeVisible();
    await expect(page.locator(".qrbtn")).toBeVisible();
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/undefined|\[object|\{\{|\{%/);
  });
}

// Abschnitte der Regelseite, in der Reihenfolge der Seite.
const SECTIONS = ["setup", "how-to-play", "round-end", "swap", "variants", "faq", "share"];

for (const lang of languages) {
  test(`${lang.code}: all rule sections with headings and texts`, async ({ page }) => {
    await page.goto(pathOf(lang));
    for (const id of SECTIONS) {
      const section = page.locator(`main section#${id}`);
      await expect(section, `section #${id}`).toHaveCount(1);
      await expect(section.locator("h2").first()).not.toBeEmpty();
    }
    await expect(page.locator(".hero .goal")).toBeVisible();
    await expect(page.locator(".ranks .card")).toHaveCount(13);
    await expect(page.locator(".ladder li")).toHaveCount(5);
    await expect(page.locator(".variants li")).toHaveCount(7);
    await expect(page.locator(".faq details")).toHaveCount(8);
    // Kein Spiel gegen Bots: kein Link auf play/.
    await expect(page.locator('a[href*="play/"]')).toHaveCount(0);
  });

  test(`${lang.code}: every #link points to an existing section`, async ({ page }) => {
    await page.goto(pathOf(lang));
    const targets = await page.locator('a[href^="#"]').evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(targets.length).toBeGreaterThanOrEqual(SECTIONS.length);
    for (const href of targets) {
      await expect(page.locator(`section${href}`), href).toHaveCount(1);
    }
    // Die Abschnittsnavigation enthält jeden Abschnitt.
    const nav = await page.locator(".secnav a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(nav).toEqual(SECTIONS.map((id) => `#${id}`));
  });
}

// Strategieseite: pro Sprache, über die Reiter im Kopf erreichbar.
for (const lang of languages) {
  test(`${lang.code}: strategy page with its own texts, graphics and sections`, async ({ page }) => {
    const s = lang.t.strategy;
    await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
    await page.goto(pathOf(lang) + "strategy/");

    await expect(page).toHaveTitle(lang.t.seo.strategyT);
    await expect(page.locator("html")).toHaveAttribute("lang", lang.htmlLang);
    await expect(page.locator(".hero h1")).toHaveText(s.h1);
    await expect(page.locator(".hero > .wrap > p").first()).toHaveText(s.sub);
    await expect(page.locator(".hero .fan .card")).toHaveCount(4);
    await expect(page.locator(".hero .goal")).toBeVisible();
    await expect(page.locator(".pagetabs a[aria-current=page]")).toHaveText(lang.t.n6);
    await expect(page.locator(`.langmenu a[data-lang="${lang.code}"]`)).toHaveAttribute("href", /strategy\/$/);
    await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", lang.url + "strategy/");
    await expect(page.locator("link[rel=alternate][hreflang]")).toHaveCount(languages.length + 1);
    await expect(page.locator('meta[name=robots][content=noindex]')).toHaveCount(1);
    await expect(page.locator("#share .qr svg")).toBeVisible();
    await expect(page.locator(".qrbtn")).toBeVisible();

    await expect(page.locator("#principle h2")).toHaveText(s.principleH);
    await expect(page.locator("#swap .strats li")).toHaveCount(s.give.length);
    await expect(page.locator("#swap .notup")).toBeVisible();
    await expect(page.locator(".swapex .sx-panel")).toHaveCount(2);
    await expect(page.locator(".swapex .sx-hand .card")).toHaveCount(6);
    await expect(page.locator(".swapex .sx-give .card.gold")).toHaveCount(2);
    await expect(page.locator(".swapex .sx-mini .card")).toHaveCount(3);
    for (const phase of s.phases) {
      await expect(page.locator(`#${phase.id} .strats li`)).toHaveCount(phase.items.length);
    }
    await expect(page.locator("#key-cards .sp")).toHaveCount(s.cards.length);
    await expect(page.locator("#mistakes .variants li")).toHaveCount(s.mistakes.length);
    await expect(page.locator("#next-steps .cta a")).toHaveText(`${s.ctaRulesBtn} →`);

    const expectedNav = ["#principle", "#swap", ...s.phases.map((p) => `#${p.id}`), "#key-cards", "#mistakes", "#share"];
    const nav = await page.locator(".secnav a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(nav).toEqual(expectedNav);
    for (const href of nav) {
      await expect(page.locator(`section${href}`), href).toHaveCount(1);
    }

    // Kein Spiel gegen Bots: kein Link auf play/.
    await expect(page.locator('a[href*="play/"]')).toHaveCount(0);

    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/undefined|\[object|\{\{|\{%/);
  });
}

test("the tabs link rules and strategy pages", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("lang", "de"));
  await page.goto("de/");
  await page.locator(".pagetabs a", { hasText: languages[1].t.n6 }).click();
  await expect(page).toHaveURL(/\/de\/strategy\/$/);
  await page.locator("#next-steps a", { hasText: languages[1].t.strategy.ctaRulesBtn }).click();
  await expect(page).toHaveURL(/\/de\/$/);
});

test("no horizontal overflow, light and dark", async ({ page }) => {
  for (const sub of ["./", "strategy/"]) {
    for (const theme of ["light", "dark"]) {
      await page.addInitScript((th) => localStorage.setItem("theme", th), theme);
      await page.goto(sub);
      const [scroll, width] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
      expect(scroll, `${sub} (${theme}): page wider than the screen`).toBeLessThanOrEqual(width);
    }
  }
});

test("the section navigation jumps to the section", async ({ page }) => {
  await page.goto("./");
  await page.locator('.secnav a[href="#swap"]').click();
  await expect(page).toHaveURL(/#swap$/);
  await expect(page.locator("section#swap h2")).toBeInViewport();
});

test("the English start page sends visitors to their saved language", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("lang", "de"));
  await page.goto("./");
  await expect(page).toHaveURL(new RegExp(`${site.pathPrefix}de/$`));
});

test("the English strategy page sends visitors to their saved language", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("lang", "de"));
  await page.goto("strategy/");
  await expect(page).toHaveURL(new RegExp(`${site.pathPrefix}de/strategy/$`));
});

test("unknown addresses get the 404 page", async ({ page }) => {
  await page.goto("404.html");
  await expect(page.locator("h1")).toHaveText(languages[0].t.nfH);
});
