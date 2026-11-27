// What is special about Schafkopf. Head, menus, links, share box, narrow phones, fact sheet,
// FAQ, language redirect and 404 are tested for every game in @hostelgames/core/testing.
import { test, expect, open, siteTests } from "@hostelgames/core/testing";
import { languages, site } from "@hostelgames/core/game";

siteTests({ languages, site });

// The rules page: every section in every language, in the order of the section bar.
const SECTIONS = ["setup", "trumps", "points", "games", "how-to-play", "scoring", "variants", "faq"];

for (const lang of languages) {
  const r = lang.t.rules;

  test(`${lang.code}: rules page with its header and all sections`, async ({ page }) => {
    await open(page, lang);
    await expect(page.locator(".hero h1")).toHaveText(`${r.h1} ${r.h1sub}`);
    for (const id of SECTIONS) await expect(page.locator(`section#${id}`)).toHaveCount(1);
    await expect(page.locator("#setup h2")).toHaveText(r.setupH);
    await expect(page.locator("#trumps h2")).toHaveText(r.trH);
    const nav = await page.locator(".secnav a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(nav).toEqual(SECTIONS.map((id) => `#${id}`));
    await expect(page.locator("#faq details")).toHaveCount(8);
    await expect(page.locator(".hero #factsheet .fs-cards .card")).toHaveCount(2);
  });

  test(`${lang.code}: four suits, the 14 trumps in order, card points add up to 120`, async ({ page }) => {
    await open(page, lang);
    await expect(page.locator(".suits li")).toHaveCount(4);
    const trumps = await page.locator(".trumps .card .c").evaluateAll((all) => all.map((c) => c.textContent));
    expect(trumps).toEqual([
      ...["♣", "♠", "♥", "♦"].map((s) => r.rO + s),
      ...["♣", "♠", "♥", "♦"].map((s) => r.rU + s),
      ...[r.rA, "10", r.rK, "9", "8", "7"].map((rank) => rank + "♥"),
    ]);
    await expect(page.locator(".hero .fan .card")).toHaveCount(4);
    // One card of each rank, four cards of each rank in the pack: 4 × (11 + 10 + 4 + 3 + 2) = 120.
    const points = await page.locator(".points b").allTextContents();
    expect(points.map(Number).reduce((a, b) => a + b, 0) * 4).toBe(120);
    await expect(page.locator("#games .rulecard h3")).toHaveText([r.gm_sauH, r.gm_wenzH, r.gm_soloH]);
    // Example trick: four cards, the last one (Unter) wins.
    await expect(page.locator(".trick li")).toHaveCount(4);
    await expect(page.locator(".trick li.tr-win .tr-who")).toHaveText(r.pD);
    await expect(page.locator(".tariff tbody tr")).toHaveCount(5);
  });
}

// Strategy and quick start pages.
const STRATEGY_SECTIONS = ["principle", "hand", "calling", "player", "defending", "points", "wenz-solo", "mistakes"];

for (const lang of languages) {
  const r = lang.t.rules;

  test(`${lang.code}: strategy page with example hands and all sections`, async ({ page }) => {
    const s = lang.t.strategy;
    await open(page, lang, "strategy/");
    await expect(page.locator(".hero h1")).toHaveText(s.h1);
    await expect(page.locator(".pagetabs a[aria-current=page]")).toHaveText(lang.t.pgStrategy);
    const nav = await page.locator(".secnav a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(nav).toEqual(STRATEGY_SECTIONS.map((id) => `#${id}`));
    for (const id of STRATEGY_SECTIONS) await expect(page.locator(`main section#${id} h2`)).toBeVisible();
    // Three example hands of eight cards each.
    await expect(page.locator(".hands .hand")).toHaveCount(3);
    for (const hand of await page.locator(".hand .hand-cards").all()) await expect(hand.locator(".card")).toHaveCount(8);
    await expect(page.locator("#wenz-solo .rulecard")).toHaveCount(4);
    await expect(page.locator("#mistakes .variants li")).toHaveCount(s.mistakes.length);
  });

  test(`${lang.code}: quick start page with the 14 trumps, card points and games`, async ({ page }) => {
    const k = lang.t.quick;
    await open(page, lang, "quickstart/");
    await expect(page.locator(".hero h1")).toHaveText(lang.t.h1);
    await expect(page.locator(".pagetabs a[aria-current=page]")).toHaveText(lang.t.pgQuick);
    await expect(page.locator(".cheat h2")).toHaveText(k.h);
    const trumps = await page.locator(".ch-trumps .ch-card").evaluateAll((all) => all.map((c) => c.textContent));
    expect(trumps).toEqual([
      ...["♣", "♠", "♥", "♦"].map((s) => r.rO + s),
      ...["♣", "♠", "♥", "♦"].map((s) => r.rU + s),
      ...[r.rA, "10", r.rK, "9", "8", "7"].map((rank) => rank + "♥"),
    ]);
    await expect(page.locator(".ch-vals li")).toHaveCount(6);
    await expect(page.locator(".ch-rows li")).toHaveCount(6);
    await expect(page.locator(`#next-steps a[href$="${lang.path}strategy/"]`)).toBeVisible();
  });
}

test("next steps on the quick start lead back to the rules", async ({ page }) => {
  const de = languages.find((l) => l.code === "de");
  await open(page, de, "quickstart/");
  await page.locator("#next-steps a", { hasText: de.t.quick.ctaRulesBtn }).click();
  await expect(page).toHaveURL(/\/de\/$/);
});
