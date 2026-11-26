// What is special about Arschloch. Head, menus, links, share box, narrow phones, tabs,
// fact sheet, FAQ, language redirect and 404 are tested for every game in @hostelgames/core/testing.
import { test, expect, open, siteTests } from "@hostelgames/core/testing";
import languages from "../src/_data/languages.js";
import site from "../src/_data/site.js";

siteTests({ languages, site });

// The rules page: every section in every language, in the order of the section bar.
const SECTIONS = ["setup", "how-to-play", "ranks", "swap", "variants", "faq"];

for (const lang of languages) {
  test(`${lang.code}: rules page with its header, sections, card order and ranks`, async ({ page }) => {
    await open(page, lang);
    await expect(page.locator(".hero h1")).toHaveText(`${lang.t.rules.h1} ${lang.t.rules.h1sub}`);
    for (const id of SECTIONS) await expect(page.locator(`section#${id}`)).toHaveCount(1);
    await expect(page.locator("#setup h2")).toHaveText(lang.t.rules.setupH);
    await expect(page.locator("#swap h2")).toHaveText(lang.t.rules.swH);
    const nav = await page.locator(".secnav a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(nav).toEqual(SECTIONS.map((id) => `#${id}`));
    // Card order: 8 cards from 7 to ace; ranks from king to asshole.
    await expect(page.locator(".ranks .card")).toHaveCount(8);
    await expect(page.locator(".ladder li")).toHaveCount(5);
    await expect(page.locator("#faq details")).toHaveCount(7);
    await expect(page.locator(".hero #factsheet .fs-cards .card")).toHaveCount(2);
  });

  test(`${lang.code}: strategy page with its own texts, graphics and sections`, async ({ page }) => {
    const s = lang.t.strategy;
    await open(page, lang, "strategy/");
    await expect(page.locator(".hero h1")).toHaveText(s.h1);
    await expect(page.locator("#swap .strats li")).toHaveCount(s.give.length);
    await expect(page.locator(".swapex .sx-panel")).toHaveCount(2);
    await expect(page.locator(".swapex .sx-hand .card")).toHaveCount(6);
    await expect(page.locator(".swapex .sx-give .card.gold")).toHaveCount(2);
    for (const phase of s.phases) {
      await expect(page.locator(`#${phase.id} .strats li`)).toHaveCount(phase.items.length);
    }
    await expect(page.locator("#key-cards .sp")).toHaveCount(s.cards.length);
    await expect(page.locator("#mistakes .variants li")).toHaveCount(s.mistakes.length);
    const nav = await page.locator(".secnav a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(nav).toEqual(["#principle", "#swap", ...s.phases.map((p) => `#${p.id}`), "#key-cards", "#mistakes"]);
  });

  test(`${lang.code}: quick start page with cheat sheet, card order and swap`, async ({ page }) => {
    await open(page, lang, "quickstart/");
    await expect(page.locator(".hero h1")).toHaveText(lang.t.h1);
    await expect(page.locator(".cheat h2")).toHaveText(lang.t.quick.h);
    await expect(page.locator(".ch-ranks .ch-card")).toHaveCount(8);
    await expect(page.locator(".ch-rows li")).toHaveCount(3);
    await expect(page.locator(`#next-steps a[href$="${lang.path}strategy/"]`)).toBeVisible();
  });
}

test("next steps on the quick start lead back to the rules", async ({ page }) => {
  const de = languages.find((l) => l.code === "de");
  await open(page, de, "quickstart/");
  await page.locator("#next-steps a", { hasText: de.t.quick.ctaRulesBtn }).click();
  await expect(page).toHaveURL(/\/de\/$/);
});
