// Strategy and quick start of Bridge: sections, visuals, links. Titles, tabs, share box and
// narrow phones are tested for every game in @hostelgames/core/testing (site.spec.js).
import { test, expect, open } from "@hostelgames/core/testing";
import languages from "../src/_data/languages.js";
import site from "../src/_data/site.js";

const hrefOf = (lang, sub = "") => site.pathPrefix + (lang.path === "/" ? "" : lang.path.slice(1)) + sub;

// Sections of the strategy page, in the order of the section bar.
const STRATEGY = ["principle", "hand-eval", "bidding-basics", "declarer-play", "defense", "mistakes"];

for (const lang of languages) {
  test(`${lang.code}: strategy page`, async ({ page }) => {
    await open(page, lang, "strategy/");
    const s = lang.t.strategy;
    await expect(page.locator(".hero h1")).toHaveText(s.h1);
    const targets = await page.locator(".secnav a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(targets).toEqual(STRATEGY.map((id) => `#${id}`));
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
  });

  test(`${lang.code}: quick start cheat sheet fits the essentials`, async ({ page }) => {
    await open(page, lang, "quickstart/");
    await expect(page.locator(".hero h1")).toHaveText(lang.t.h1);
    await expect(page.locator(".cheat h2")).toHaveText(lang.t.quick.h);
    await expect(page.locator(".ch-suits li")).toHaveCount(5);
    await expect(page.locator(".ch-honors > span")).toHaveCount(4);
    await expect(page.locator(".ch-targets li")).toHaveCount(4);
    await expect(page.locator(".ch-score li")).toHaveCount(4);
    await expect(page.locator(".ch-ranks .ch-card")).toHaveCount(13);
    await expect(page.locator(`#next-steps a[href="${hrefOf(lang)}"]`)).toBeVisible();
    await expect(page.locator(`#next-steps a[href="${hrefOf(lang, "strategy/")}"]`)).toBeVisible();
  });

  test(`${lang.code}: FAQ on the rules page links to strategy and quick start`, async ({ page }) => {
    await open(page, lang, "");
    const faq7 = page.locator("#faq details").nth(6);
    await faq7.locator("summary").click();
    await faq7.locator('a[href="strategy/"]').click();

    await open(page, lang, "");
    await faq7.locator("summary").click();
    await faq7.locator('a[href="quickstart/"]').click();
  });
}
