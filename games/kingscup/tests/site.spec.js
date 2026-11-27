// What is special about King's Cup. Head, menus, links, share box, narrow phones, fact sheet,
// FAQ, language redirect and 404 are tested for every game in @hostelgames/core/testing.
import { test, expect, open, siteTests } from "@hostelgames/core/testing";
import { languages, site } from "@hostelgames/core/game";

siteTests({ languages, site });

// Alle Abschnitte der Regelseite, in der Reihenfolge der Abschnittsnavigation.
const SECTIONS = ["setup", "turn", "cards", "kings", "safe", "variants", "faq"];

for (const lang of languages) {
  test(`${lang.code}: rules page with its header and all sections`, async ({ page }) => {
    await open(page, lang);
    await expect(page.locator(".hero h1")).toContainText(lang.t.rules.h1);
    await expect(page.locator(".hero h1 .h1-sub")).toHaveText(lang.t.rules.h1sub);
    for (const id of SECTIONS) await expect(page.locator(`main section#${id} h2`)).toBeVisible();
    const nav = await page.locator(".secnav a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(nav).toEqual(SECTIONS.map((id) => `#${id}`));
    const sheet = page.locator(".hero #factsheet");
    await expect(sheet.locator(".fs-cards .card")).toHaveCount(2);
    await expect(sheet.locator(".fs-cup")).toBeVisible();
  });

  test(`${lang.code}: ring in the header, all thirteen cards and the four Kings`, async ({ page }) => {
    await open(page, lang);
    await expect(page.locator(".hero .ring .ring-card")).toHaveCount(14);
    await expect(page.locator(".hero .ring .ring-cup")).toBeVisible();
    const ranks = await page.locator(".rulecards .rulecard .card .c").evaluateAll((all) => all.map((c) => c.firstChild.textContent));
    expect(ranks).toEqual(["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]);
    await expect(page.locator(".rulecard h3")).toHaveText([
      lang.t.rules.c_aH, lang.t.rules.c_2H, lang.t.rules.c_3H, lang.t.rules.c_4H, lang.t.rules.c_5H, lang.t.rules.c_6H, lang.t.rules.c_7H,
      lang.t.rules.c_8H, lang.t.rules.c_9H, lang.t.rules.c_10H, lang.t.rules.c_jH, lang.t.rules.c_qH, lang.t.rules.c_kH,
    ]);
    await expect(page.locator(".kings li")).toHaveCount(4);
    await expect(page.locator(".kings li.last .card.gold")).toHaveCount(1);
  });

  test(`${lang.code}: play responsibly is always there`, async ({ page }) => {
    await open(page, lang);
    await expect(page.locator("#safe li")).toHaveCount(5);
  });
}
