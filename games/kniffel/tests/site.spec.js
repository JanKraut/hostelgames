// What is special about Kniffel. Head, menus, links, share box, narrow phones, tabs, fact sheet,
// FAQ, language redirect and 404 are tested for every game in @hostelgames/core/testing.
import { test, expect, open, siteTests } from "@hostelgames/core/testing";
import { languages, site } from "@hostelgames/core/game";

siteTests({ languages, site });

// Alle Abschnitte der Regelseite, in der Reihenfolge der Abschnittsnavigation.
const SECTIONS = ["setup", "turn", "upper", "lower", "scoring", "variants", "faq"];

for (const lang of languages) {
  test(`${lang.code}: rules page with its header and all sections`, async ({ page }) => {
    await open(page, lang);
    await expect(page.locator(".hero h1")).toContainText(lang.t.rules.h1);
    await expect(page.locator(".hero h1 .h1-sub")).toHaveText(lang.t.rules.h1sub);
    for (const id of SECTIONS) await expect(page.locator(`main section#${id} h2`)).toBeVisible();
    const nav = await page.locator(".secnav a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(nav).toEqual(SECTIONS.map((id) => `#${id}`));
    await expect(page.locator(".hero #factsheet .fs-dice .die")).toHaveCount(5);
  });

  test(`${lang.code}: dice show the right number of pips`, async ({ page }) => {
    await open(page, lang);
    await expect(page.locator(".upper li")).toHaveCount(6);
    await expect(page.locator(".boxes .box")).toHaveCount(7);
    const dice = await page.locator(".die").evaluateAll((all) => all.map((d) => [Number(d.dataset.n), d.querySelectorAll("i.p").length]));
    expect(dice.length).toBeGreaterThan(20);
    for (const [n, pips] of dice) expect(pips).toBe(n);
  });
}
