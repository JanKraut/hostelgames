// What is special about Mau-Mau. Head, menus, links, share box, narrow phones, tabs, fact sheet,
// FAQ, language redirect and 404 are tested for every game in @hostelgames/core/testing.
import { test, expect, open, siteTests } from "@hostelgames/core/testing";
import { languages, site } from "@hostelgames/core/game";

siteTests({ languages, site });

// The rules page: every section in every language, in the order of the section bar.
const SECTIONS = ["setup", "how-to-play", "special", "mau", "scoring", "variants", "faq"];
const STRATEGY_SECTIONS = ["principle", "hand", "specials", "wishing", "endgame", "mistakes"];

for (const lang of languages) {
  test(`${lang.code}: rules page with its header, sections, special cards and points`, async ({ page }) => {
    await open(page, lang);
    await expect(page.locator(".hero h1")).toHaveText(`${lang.t.rules.h1} ${lang.t.rules.h1sub}`);
    for (const id of SECTIONS) await expect(page.locator(`section#${id}`)).toHaveCount(1);
    await expect(page.locator("#setup h2")).toHaveText(lang.t.rules.setupH);
    await expect(page.locator("#special h2")).toHaveText(lang.t.rules.spH);
    const nav = await page.locator(".secnav a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(nav).toEqual(SECTIONS.map((id) => `#${id}`));
    // What fits on the nine of spades: three yes, one no.
    await expect(page.locator(".check .ck-yes")).toHaveCount(3);
    await expect(page.locator(".check .ck-no")).toHaveCount(1);
    // Special cards 7, 8 and jack; Mau and Mau-Mau; points for all eight ranks.
    await expect(page.locator(".rulecard h3")).toHaveText([lang.t.rules.sp7H, lang.t.rules.sp8H, lang.t.rules.spjH]);
    await expect(page.locator(".call-word")).toHaveText([lang.t.rules.mauWord1, lang.t.rules.mauWord2]);
    await expect(page.locator(".points li")).toHaveCount(8);
    await expect(page.locator("#faq details")).toHaveCount(7);
    await expect(page.locator(".hero #factsheet .fs-cards .card")).toHaveCount(2);
  });

  test(`${lang.code}: strategy page with hand example, specials and sections`, async ({ page }) => {
    const s = lang.t.strategy;
    await open(page, lang, "strategy/");
    await expect(page.locator(".hero h1")).toHaveText(s.h1);
    const nav = await page.locator(".secnav a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(nav).toEqual(STRATEGY_SECTIONS.map((id) => `#${id}`));
    for (const id of STRATEGY_SECTIONS) await expect(page.locator(`main section#${id} h2`)).toBeVisible();
    await expect(page.locator(".playex .px-cards .card")).toHaveCount(4);
    await expect(page.locator("#specials .rulecard")).toHaveCount(3);
    await expect(page.locator("#mistakes .variants li")).toHaveCount(s.mistakes.length);
  });

  test(`${lang.code}: quick start page with specials, Mau calls and points`, async ({ page }) => {
    await open(page, lang, "quickstart/");
    await expect(page.locator(".hero h1")).toHaveText(lang.t.h1);
    await expect(page.locator(".cheat h2")).toHaveText(lang.t.quick.h);
    await expect(page.locator(".ch-specials li")).toHaveCount(3);
    await expect(page.locator(".ch-rows li")).toHaveCount(2);
    await expect(page.locator(".ch-pts li")).toHaveCount(8);
    await expect(page.locator(`#next-steps a[href$="${lang.path}strategy/"]`)).toBeVisible();
  });
}

test("next steps on the quick start lead back to the rules", async ({ page }) => {
  const de = languages.find((l) => l.code === "de");
  await open(page, de, "quickstart/");
  await page.locator("#next-steps a", { hasText: de.t.quick.ctaRulesBtn }).click();
  await expect(page).toHaveURL(/\/de\/$/);
});
