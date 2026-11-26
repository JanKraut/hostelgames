// Strategy and quick start of Bridge: own titles, sections, visuals, links, no overflow.
import { test, expect } from "@hostelgames/core/testing";
import languages from "../src/_data/languages.js";
import site from "../src/_data/site.js";

const pathOf = (lang, sub) => (lang.path === "/" ? "./" : lang.path.slice(1)) + sub;
const hrefOf = (lang, sub = "") => site.pathPrefix + (lang.path === "/" ? "" : lang.path.slice(1)) + sub;
const open = async (page, lang, sub) => {
  await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
  await page.goto(pathOf(lang, sub));
};

// Sections of the strategy page, in the order of the section bar.
const STRATEGY = ["principle", "hand-eval", "bidding-basics", "declarer-play", "defense", "mistakes", "share"];

for (const lang of languages) {
  test(`${lang.code}: strategy page`, async ({ page }) => {
    await open(page, lang, "strategy/");
    const s = lang.t.strategy;
    await expect(page).toHaveTitle(lang.t.seo.strategyT);
    await expect(page.locator(".hero h1")).toHaveText(s.h1);
    await expect(page.locator(".pagetabs a[aria-current=page]")).toHaveText(lang.t.n6);
    await expect(page.locator("#factsheet")).toHaveCount(0);
    const targets = await page.locator(".secnav a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(targets).toEqual(STRATEGY.filter((id) => id !== "share").map((id) => `#${id}`));
    for (const id of STRATEGY) await expect(page.locator(`section#${id}`)).toHaveCount(1);
    // High Card Points: 4 + 3 + 2 + 1 = 10 per suit = 40 total.
    const hcp = await page.locator(".points b").allTextContents();
    expect(hcp.map(Number).reduce((a, b) => a + b, 0) * 4).toBe(40);
    await expect(page.locator(".ladder-rows li")).toHaveCount(s.ladder.length);
    // Example hand: 4 suits summing to 13 HCP.
    const handPts = await page.locator(".hx-pts").allTextContents();
    expect(handPts.map(Number).reduce((a, b) => a + b, 0)).toBe(13);
    // Finesse diagram: Dummy, East, Declarer.
    await expect(page.locator(".fn-pos")).toHaveCount(3);
    await expect(page.locator("#mistakes .variants li")).toHaveCount(s.mistakes.length);
    await expect(page.locator(`#next-steps a[href="${hrefOf(lang, "quickstart/")}"]`)).toBeVisible();
    await expect(page.locator(`#next-steps a[href="${hrefOf(lang)}"]`)).toBeVisible();
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/undefined|\[object|\{\{|\{%/);
  });

  test(`${lang.code}: quick start cheat sheet fits the essentials`, async ({ page }) => {
    await open(page, lang, "quickstart/");
    await expect(page).toHaveTitle(lang.t.seo.quickT);
    await expect(page.locator(".hero h1")).toHaveText(lang.t.h1);
    await expect(page.locator(".pagetabs a[aria-current=page]")).toHaveText(lang.t.pgQuick);
    await expect(page.locator("#factsheet")).toHaveCount(0);
    await expect(page.locator(".cheat h2")).toHaveText(lang.t.quick.h);
    await expect(page.locator(".ch-suits li")).toHaveCount(5);
    await expect(page.locator(".ch-honors > span")).toHaveCount(4);
    await expect(page.locator(".ch-targets li")).toHaveCount(4);
    await expect(page.locator(".ch-score li")).toHaveCount(4);
    await expect(page.locator(".ch-ranks .ch-card")).toHaveCount(13);
    await expect(page.locator(`#next-steps a[href="${hrefOf(lang)}"]`)).toBeVisible();
    await expect(page.locator(`#next-steps a[href="${hrefOf(lang, "strategy/")}"]`)).toBeVisible();
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/undefined|\[object|\{\{|\{%/);
  });

  test(`${lang.code}: FAQ on the rules page links to strategy and quick start`, async ({ page }) => {
    await open(page, lang, "");
    const faq7 = page.locator("#faq details").nth(6);
    await faq7.locator("summary").click();
    await faq7.locator('a[href="strategy/"]').click();
    await expect(page).toHaveTitle(lang.t.seo.strategyT);

    await open(page, lang, "");
    await faq7.locator("summary").click();
    await faq7.locator('a[href="quickstart/"]').click();
    await expect(page).toHaveTitle(lang.t.seo.quickT);
  });
}

test("page tabs: order from game.json, full names, current tab in view on a narrow phone", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  for (const lang of languages) {
    const t = lang.t;
    await open(page, lang, "quickstart/");
    const tabs = page.locator(".pagetabs a");
    await expect(tabs).toHaveText([t.pgRules, t.n6, t.pgQuick]);
    const cut = await tabs.evaluateAll((all) => all.filter((a) => a.scrollWidth > a.clientWidth).map((a) => a.textContent));
    expect(cut, lang.code).toEqual([]);
    await page.evaluate(() => document.fonts.ready);
    const inView = async () => {
      const box = await page.locator(".pagetabs a[aria-current=page]").boundingBox();
      return box.x >= 0 && box.x + box.width <= 320;
    };
    await expect.poll(inView, { message: lang.code }).toBe(true);
  }
});

for (const sub of ["strategy/", "quickstart/"]) {
  test(`${sub} no horizontal overflow on narrow phones`, async ({ page }) => {
    for (const lang of languages) {
      await open(page, lang, sub);
      for (const width of [320, 390]) {
        await page.setViewportSize({ width, height: 700 });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, `${lang.code} ${sub} at ${width}px`).toBeLessThanOrEqual(0);
      }
    }
  });
}
