// Strategy and quick start of Kniffel: own titles, sections, dice, links, no overflow.
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

const pathOf = (lang, sub) => (lang.path === "/" ? "./" : lang.path.slice(1)) + sub;
const open = async (page, lang, sub) => {
  await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
  await page.goto(pathOf(lang, sub));
};

// Abschnitte der Strategie-Seite, in der Reihenfolge der Abschnittsnavigation.
const STRATEGY = ["principle", "bonus", "keep", "boxes", "strike", "endgame", "mistakes", "share"];

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
    // Plus-minus example and odds table.
    await expect(page.locator(".par-rows li")).toHaveCount(6);
    await expect(page.locator(".odds li")).toHaveCount(s.odds.length);
    await expect(page.locator(".odds .die.open").first()).toBeVisible();
    await expect(page.locator(".strike-order li")).toHaveCount(s.strike.length);
    // Every die shows as many pips as its number (open dice: none).
    const dice = await page.locator(".die").evaluateAll((all) => all.map((d) => [Number(d.dataset.n), d.querySelectorAll("i.p").length]));
    for (const [n, pips] of dice) expect(pips).toBe(n);
    await expect(page.locator(`#next-steps a[href$="${lang.path}scoresheet/"]`)).toBeVisible();
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/undefined|\[object|\{\{|\{%/);
  });

  test(`${lang.code}: quick start fits the essentials`, async ({ page }) => {
    await open(page, lang, "quickstart/");
    await expect(page).toHaveTitle(lang.t.seo.quickT);
    await expect(page.locator(".pagetabs a[aria-current=page]")).toHaveText(lang.t.pgQuick);
    await expect(page.locator(".cheat h2")).toHaveText(lang.t.quick.h);
    await expect(page.locator(".ch-upper li")).toHaveCount(6);
    await expect(page.locator(".ch-lower li")).toHaveCount(7);
    await expect(page.locator(".ch-lower .die")).toHaveCount(35);
    await expect(page.locator(`#next-steps a[href$="${lang.path}strategy/"]`)).toBeVisible();
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/undefined|\[object|\{\{|\{%/);
  });

  test(`${lang.code}: FAQ on the rules page links to the strategy`, async ({ page }) => {
    await open(page, lang, "");
    await page.locator(".faq details").last().locator("summary").click();
    await page.locator('.faq a[href="strategy/"]').click();
    await expect(page).toHaveTitle(lang.t.seo.strategyT);
  });
}

test("page tabs: order from game.json, full names, current tab in view on a narrow phone", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  for (const lang of languages) {
    const t = lang.t;
    await open(page, lang, "strategy/");
    const tabs = page.locator(".pagetabs a");
    await expect(tabs).toHaveText([t.pgRules, t.pgQuick, t.pgSheet, t.n6]);
    // No tab is cut off; the bar scrolls instead.
    const cut = await tabs.evaluateAll((all) => all.filter((a) => a.scrollWidth > a.clientWidth).map((a) => a.textContent));
    expect(cut, lang.code).toEqual([]);
    // The current tab (strategy, the last one) is scrolled into view – also after the web font has loaded.
    await page.evaluate(() => document.fonts.ready);
    const inView = async () => {
      const box = await page.locator(".pagetabs a[aria-current=page]").boundingBox();
      return box.x >= 0 && box.x + box.width <= 320;
    };
    await expect.poll(inView, { message: lang.code }).toBe(true);
  }
});

test("strategy and quick start: no horizontal overflow on narrow phones", async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 700 });
    for (const lang of languages) {
      for (const sub of ["strategy/", "quickstart/"]) {
        await open(page, lang, sub);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, `${lang.code} ${sub} at ${width}px`).toBeLessThanOrEqual(0);
      }
    }
  }
});
