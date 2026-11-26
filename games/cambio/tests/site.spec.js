// What is special about Cambio. Head, menus, links, share box, narrow phones, tabs, fact sheet,
// FAQ, language redirect and 404 are tested for every game in @hostelgames/core/testing.
import { test, expect, open, siteTests } from "@hostelgames/core/testing";
import { languages, site } from "@hostelgames/core/game";

siteTests({ languages, site });

// Sections of the rules page in the order of the section navigation (without the share box).
const SECTIONS = ["setup", "values", "turn", "powers", "stacking", "cambio", "scoring", "variants", "faq"];
const STRATEGY_SECTIONS = ["principle", "memory", "powers", "stacking", "calling", "mistakes"];

for (const lang of languages) {
  test(`${lang.code}: rules page with its header, all sections and card graphics`, async ({ page }) => {
    await open(page, lang);
    await expect(page.locator(".hero h1")).toContainText(lang.t.rules.h1);
    await expect(page.locator(".hero h1 .h1-sub")).toHaveText(lang.t.rules.h1sub);
    for (const id of SECTIONS) {
      await expect(page.locator(`main section#${id} h2`).first(), `#${id}`).toBeVisible();
    }
    const nav = await page.locator(".secnav a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(nav).toEqual(SECTIONS.map((id) => `#${id}`));
    // Card graphics from the core macros.
    await expect(page.locator(".fan .card")).toHaveCount(4);
    await expect(page.locator("#setup .g4 .card")).toHaveCount(4);
    await expect(page.locator("#values .values li")).toHaveCount(6);
    await expect(page.locator("#powers .sp")).toHaveCount(4);
    await expect(page.locator("#faq details")).toHaveCount(8);
    await expect(page.locator(".hero #factsheet .fs-cards .card")).toHaveCount(2);
  });

  test(`${lang.code}: strategy page with powers, cross-stack graphic and sections`, async ({ page }) => {
    const s = lang.t.strategy;
    await open(page, lang, "strategy/");
    await expect(page.locator(".hero h1")).toHaveText(s.h1);
    const nav = await page.locator(".secnav a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(nav).toEqual(STRATEGY_SECTIONS.map((id) => `#${id}`));
    for (const id of STRATEGY_SECTIONS) await expect(page.locator(`main section#${id} h2`)).toBeVisible();
    await expect(page.locator("#powers .sp")).toHaveCount(4);
    await expect(page.locator(".crossvis .cv-step")).toHaveCount(3);
    await expect(page.locator("#mistakes .variants li")).toHaveCount(s.mistakes.length);
  });

  test(`${lang.code}: quick start page with values, powers and stacking summary`, async ({ page }) => {
    await open(page, lang, "quickstart/");
    await expect(page.locator(".hero h1")).toHaveText(lang.t.h1);
    await expect(page.locator(".cheat h2")).toHaveText(lang.t.quick.h);
    await expect(page.locator(".ch-vals li")).toHaveCount(6);
    await expect(page.locator(".ch-powers li")).toHaveCount(4);
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
