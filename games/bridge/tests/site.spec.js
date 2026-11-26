import { test, expect, pathOf, siteTests } from "@hostelgames/core/testing";
import languages from "../src/_data/languages.js";
import site from "../src/_data/site.js";

for (const lang of languages) {
  test(`${lang.code}: rules page with its own texts`, async ({ page }) => {
    await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
    await page.goto(pathOf(lang));
    await expect(page).toHaveTitle(lang.t.seo.rulesT);
    await expect(page.locator("html")).toHaveAttribute("lang", lang.htmlLang);
    await expect(page.locator(".hero h1")).toHaveText(`${lang.t.rules.h1} ${lang.t.rules.h1sub}`);
    await expect(page.locator(".langmenu a[aria-current=page]")).toHaveAttribute("data-lang", lang.code);
    await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", lang.url);
    await expect(page.locator("link[rel=alternate][hreflang]")).toHaveCount(languages.length + 1);
    // Draft and preview: never indexed.
    await expect(page.locator("meta[name=robots][content=noindex]")).toHaveCount(1);
    // Share box with QR code, and the QR button at the top.
    await expect(page.locator("#share .qr svg")).toBeVisible();
    await expect(page.locator(".qrbtn")).toBeVisible();
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/undefined|\[object|\{\{|\{%/);
  });
}

// The rules page: every section in every language, a section bar that points only
// to sections that exist, no game against bots.
const sections = ["setup", "bidding", "how-to-play", "scoring", "variants", "faq", "share"];

for (const lang of languages) {
  const r = lang.t.rules;

  test(`${lang.code}: all rule sections, section bar points to them`, async ({ page }) => {
    await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
    await page.goto(pathOf(lang));
    for (const id of sections) await expect(page.locator(`section#${id}`)).toHaveCount(1);
    await expect(page.locator("#setup h2")).toHaveText(r.setupH);
    await expect(page.locator("#bidding h2")).toHaveText(r.bidH);
    const targets = await page.locator(".secnav a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(targets).toEqual(sections.filter((id) => id !== "share").map((id) => `#${id}`));
    // Links inside the texts (e.g. in the FAQ) only point to existing elements too.
    const anchors = await page.locator("main a[href^='#']").evaluateAll((links) => links.map((a) => a.getAttribute("href").slice(1)));
    for (const id of anchors) await expect(page.locator(`[id="${id}"]`)).toHaveCount(1);
    await expect(page.locator("#faq details")).toHaveCount(8);
    // No game against bots on this site.
    await expect(page.locator("a[href*='play/']")).toHaveCount(0);
  });

  test(`${lang.code}: compass, 13-card rank order, 5 strains, example auction & trick`, async ({ page }) => {
    await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
    await page.goto(pathOf(lang));
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

  test(`${lang.code}: fact sheet in the header`, async ({ page }) => {
    await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
    await page.goto(pathOf(lang));
    const sheet = page.locator(".hero #factsheet");
    await expect(sheet).toBeVisible();
    await expect(sheet.locator(".fs-scale")).toHaveCount(3);
    await expect(sheet.locator(".fs-group")).toHaveCount(2);
    await expect(sheet.locator(".fs-similar li")).toHaveCount(lang.t.info.similar.split(", ").length);
    await expect(sheet.locator(".fs-cards .card")).toHaveCount(2);
    await expect(sheet.locator(".fs-intro p")).toHaveText(lang.t.info.intro);
  });
}

test("FAQ answers open on tap", async ({ page }) => {
  await page.goto("./");
  const first = page.locator("#faq details").first();
  await expect(first.locator("p")).toBeHidden();
  await first.locator("summary").click();
  await expect(first.locator("p")).toBeVisible();
});

test("no horizontal overflow, also on narrow phones", async ({ page }) => {
  for (const lang of languages) {
    await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
    await page.goto(pathOf(lang));
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 700 });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${lang.code}: rules page wider than ${width}px`).toBeLessThanOrEqual(0);
    }
  }
});

// Language redirect (on all English entry pages) and 404 page (@hostelgames/core/testing).
siteTests({ languages, site, redirects: ["./", "strategy/", "quickstart/"] });
