// Strategy and quick start of Kniffel: sections, dice, links. Titles, tabs, share box and
// narrow phones are tested for every game in @hostelgames/core/testing (site.spec.js).
import { test, expect, open } from "@hostelgames/core/testing";
import { languages } from "@hostelgames/core/game";


// Abschnitte der Strategie-Seite, in der Reihenfolge der Abschnittsnavigation.
const STRATEGY = ["principle", "bonus", "keep", "boxes", "strike", "endgame", "mistakes"];

for (const lang of languages) {
  test(`${lang.code}: strategy page`, async ({ page }) => {
    await open(page, lang, "strategy/");
    const s = lang.t.strategy;
    await expect(page.locator(".hero h1")).toHaveText(s.h1);
    const targets = await page.locator(".secnav a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(targets).toEqual(STRATEGY.map((id) => `#${id}`));
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
  });

  test(`${lang.code}: quick start fits the essentials`, async ({ page }) => {
    await open(page, lang, "quickstart/");
    await expect(page.locator(".cheat h2")).toHaveText(lang.t.quick.h);
    await expect(page.locator(".ch-upper li")).toHaveCount(6);
    await expect(page.locator(".ch-lower li")).toHaveCount(7);
    await expect(page.locator(".ch-lower .die")).toHaveCount(35);
    await expect(page.locator(`#next-steps a[href$="${lang.path}strategy/"]`)).toBeVisible();
  });

  test(`${lang.code}: FAQ on the rules page links to the strategy`, async ({ page }) => {
    await open(page, lang, "");
    await page.locator(".faq details").last().locator("summary").click();
    await page.locator('.faq a[href="strategy/"]').click();
  });
}
