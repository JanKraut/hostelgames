// What is special about Bridge. Head, menus, links, share box, narrow phones, tabs, fact sheet,
// FAQ, language redirect and 404 are tested for every game in @hostelgames/core/testing.
import { test, expect, open, siteTests } from "@hostelgames/core/testing";
import { languages, site } from "@hostelgames/core/game";

siteTests({ languages, site });

// The rules page: every section in every language, in the order of the section bar.
const SECTIONS = ["setup", "bidding", "how-to-play", "scoring", "variants", "faq"];

for (const lang of languages) {
  const r = lang.t.rules;

  test(`${lang.code}: rules page with its header and all sections`, async ({ page }) => {
    await open(page, lang);
    await expect(page.locator(".hero h1")).toHaveText(`${r.h1} ${r.h1sub}`);
    for (const id of SECTIONS) await expect(page.locator(`section#${id}`)).toHaveCount(1);
    await expect(page.locator("#setup h2")).toHaveText(r.setupH);
    await expect(page.locator("#bidding h2")).toHaveText(r.bidH);
    const nav = await page.locator(".secnav a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(nav).toEqual(SECTIONS.map((id) => `#${id}`));
    await expect(page.locator("#faq details")).toHaveCount(8);
    await expect(page.locator(".hero #factsheet .fs-cards .card")).toHaveCount(2);
  });

  test(`${lang.code}: compass, 13-card rank order, 5 strains, example auction & trick`, async ({ page }) => {
    await open(page, lang);
    await expect(page.locator(".hero .fan .card")).toHaveCount(4);
    await expect(page.locator(".compass .seat")).toHaveCount(4);
    const ranks = await page.locator(".ranks .card .c").evaluateAll((all) => all.map((c) => c.firstChild.textContent));
    expect(ranks).toEqual(["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]);
    await expect(page.locator(".suits li")).toHaveCount(5);
    await expect(page.locator(".suits .suit")).toHaveText(["♣", "♦", "♥", "♠", r.sNtSym]);
    // Example auction ends on 4♥.
    await expect(page.locator(".auction .bid-win")).toHaveText("4♥");
    // Example trick: four cards, North ruffs with 3♥ and wins.
    await expect(page.locator(".trick li")).toHaveCount(4);
    await expect(page.locator(".trick li.tr-win .tr-who")).toHaveText(r.seatN);
    await expect(page.locator(".tariff tbody tr")).toHaveCount(7);
  });
}
