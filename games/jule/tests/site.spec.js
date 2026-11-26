// What is special about Jule. Head, menus, links, share box, narrow phones, tabs, fact sheet,
// FAQ, language redirect and 404 are tested for every game in @hostelgames/core/testing.
import { test, expect, open, siteTests } from "@hostelgames/core/testing";
import languages from "../src/_data/languages.js";
import site from "../src/_data/site.js";

siteTests({ languages, site });

// Alle Abschnitte der Regelseite, in der Reihenfolge der Abschnittsnavigation.
const SECTIONS = ["setup", "turn", "back", "winning", "silent", "variants", "faq"];
const STRATEGY_SECTIONS = ["principle", "odds", "silent-tactics", "variants-guide", "mistakes"];

for (const lang of languages) {
  test(`${lang.code}: rules page with its header and all sections`, async ({ page }) => {
    await open(page, lang);
    await expect(page.locator(".hero h1")).toContainText(lang.t.rules.h1);
    await expect(page.locator(".hero h1 .h1-sub")).toHaveText(lang.t.rules.h1sub);
    for (const id of SECTIONS) await expect(page.locator(`main section#${id} h2`)).toBeVisible();
    const nav = await page.locator(".secnav a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(nav).toEqual(SECTIONS.map((id) => `#${id}`));
    await expect(page.locator(".faq details")).toHaveCount(6);
    await expect(page.locator(".hero #factsheet .fs-dice .die")).toHaveCount(1);
  });

  test(`${lang.code}: dice 1 to 6 in the header, example round and the sheet`, async ({ page }) => {
    await open(page, lang);
    const faces = await page.locator(".hero .throw .die").evaluateAll((all) => all.map((d) => d.dataset.n));
    expect(faces).toEqual(["1", "2", "3", "4", "5", "6"]);
    await expect(page.locator("#turn .steps li")).toHaveCount(3);
    await expect(page.locator("#turn .roll")).toHaveCount(4);
    await expect(page.locator("#turn .roll.hit")).toHaveCount(2);
    await expect(page.locator(".jsheet .js-nums").first().locator("li.done")).toHaveCount(6);
    await expect(page.locator(".jsheet li.struck")).toHaveCount(2);
    await expect(page.locator(".jsheet li.next")).toHaveText("4");
    await expect(page.locator("#silent .rules li")).toHaveCount(3);
  });

  test(`${lang.code}: strategy page with odds, dice and Silent Jule tactics`, async ({ page }) => {
    const s = lang.t.strategy;
    await open(page, lang, "strategy/");
    await expect(page.locator(".hero h1")).toHaveText(s.h1);
    const nav = await page.locator(".secnav a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(nav).toEqual(STRATEGY_SECTIONS.map((id) => `#${id}`));
    for (const id of STRATEGY_SECTIONS) await expect(page.locator(`main section#${id} h2`)).toBeVisible();
    await expect(page.locator(".odds li")).toHaveCount(s.odds.length);
    await expect(page.locator(".odds .die.open").first()).toBeVisible();
    // Every die shows as many pips as its number (open dice: none).
    const dicePips = await page.locator(".die").evaluateAll((all) => all.map((d) => [Number(d.dataset.n), d.querySelectorAll("i.p").length]));
    for (const [n, pips] of dicePips) expect(pips).toBe(n);
    await expect(page.locator("#mistakes .variants li")).toHaveCount(s.mistakes.length);
  });

  test(`${lang.code}: quick start page with way there, way back and Silent Jule`, async ({ page }) => {
    await open(page, lang, "quickstart/");
    await expect(page.locator(".hero h1")).toHaveText(lang.t.h1);
    await expect(page.locator(".cheat h2")).toHaveText(lang.t.quick.h);
    await expect(page.locator(".ch-path .die")).toHaveCount(12);
    await expect(page.locator(`#next-steps a[href$="${lang.path}strategy/"]`)).toBeVisible();
  });
}

test("next steps on the quick start lead back to the rules", async ({ page }) => {
  const de = languages.find((l) => l.code === "de");
  await open(page, de, "quickstart/");
  await page.locator("#next-steps a", { hasText: de.t.quick.ctaRulesBtn }).click();
  await expect(page).toHaveURL(/\/de\/$/);
});
