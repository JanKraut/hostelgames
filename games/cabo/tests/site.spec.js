// What is special about Cabo. Head, menus, links, share box, narrow phones, tabs, fact sheet,
// FAQ, language redirect and 404 are tested for every game in @hostelgames/core/testing.
import { test, expect, open, siteTests } from "@hostelgames/core/testing";
import { languages, site } from "@hostelgames/core/game";

siteTests({ languages, site });

// Alle Abschnitte der Regelseite, in der Reihenfolge der Abschnittsnavigation.
const SECTIONS = ["setup", "values", "turn", "powers", "cabo", "scoring", "variants", "faq"];
const STRATEGY_SECTIONS = ["principle", "memory", "drawing", "powers", "multiswap", "calling", "mistakes"];

for (const lang of languages) {
  test(`${lang.code}: rules page with its header and all sections`, async ({ page }) => {
    await open(page, lang);
    await expect(page.locator(".hero h1")).toContainText(lang.t.rules.h1);
    await expect(page.locator(".hero h1 .h1-sub")).toHaveText(lang.t.rules.h1sub);
    for (const id of SECTIONS) await expect(page.locator(`main section#${id} h2`)).toBeVisible();
    const nav = await page.locator(".secnav a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(nav).toEqual(SECTIONS.map((id) => `#${id}`));
    await expect(page.locator(".hero #factsheet .fs-cards .card")).toHaveCount(2);
  });

  test(`${lang.code}: strategy page with memory graphic, powers and sections`, async ({ page }) => {
    const s = lang.t.strategy;
    await open(page, lang, "strategy/");
    await expect(page.locator(".hero h1")).toHaveText(s.h1);
    await expect(page.locator(".pagetabs a[aria-current=page]")).toHaveText(lang.t.n6);
    const nav = await page.locator(".secnav a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(nav).toEqual(STRATEGY_SECTIONS.map((id) => `#${id}`));
    for (const id of STRATEGY_SECTIONS) await expect(page.locator(`main section#${id} h2`)).toBeVisible();
    await expect(page.locator(".memvis .mv-panel")).toHaveCount(2);
    await expect(page.locator("#powers .sp")).toHaveCount(4);
    await expect(page.locator("#mistakes .variants li")).toHaveCount(s.mistakes.length);
  });

  test(`${lang.code}: quick start page with values, powers and Cabo summary`, async ({ page }) => {
    const k = lang.t.quick;
    await open(page, lang, "quickstart/");
    await expect(page.locator(".hero h1")).toHaveText(lang.t.h1);
    await expect(page.locator(".pagetabs a[aria-current=page]")).toHaveText(lang.t.pgQuick);
    await expect(page.locator(".cheat h2")).toHaveText(k.h);
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
