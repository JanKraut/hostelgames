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
    await expect(page.locator('meta[name=robots][content=noindex]')).toHaveCount(1);
    // Share box with QR code, and the QR button at the top.
    await expect(page.locator("#share .qr svg")).toBeVisible();
    await expect(page.locator(".qrbtn")).toBeVisible();
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/undefined|\[object|\{\{|\{%/);
  });
}

// The rules page: every section in every language, a section bar that points only
// to sections that exist, no game against bots.
const sections = ["setup", "how-to-play", "ranks", "swap", "variants", "faq", "share"];

for (const lang of languages) {
  test(`${lang.code}: all rule sections, section bar points to them`, async ({ page }) => {
    await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
    await page.goto(pathOf(lang));
    for (const id of sections) await expect(page.locator(`section#${id}`)).toHaveCount(1);
    await expect(page.locator("#setup h2")).toHaveText(lang.t.rules.setupH);
    await expect(page.locator("#swap h2")).toHaveText(lang.t.rules.swH);
    const targets = await page.locator(".secnav a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(targets).toEqual(sections.filter((id) => id !== "share").map((id) => `#${id}`));
    // Links inside the texts (e.g. in the FAQ) only point to existing sections too.
    const anchors = await page.locator("main a[href^='#']").evaluateAll((links) => links.map((a) => a.getAttribute("href").slice(1)));
    for (const id of anchors) await expect(page.locator(`[id="${id}"]`)).toHaveCount(1);
    // Card order: 8 cards from 7 to ace; ranks from king to asshole.
    await expect(page.locator(".ranks .card")).toHaveCount(8);
    await expect(page.locator(".ladder li")).toHaveCount(5);
    await expect(page.locator("#faq details")).toHaveCount(7);
    // No game against bots on this site.
    await expect(page.locator("a[href*='play/']")).toHaveCount(0);
  });
}

test("FAQ answers open on tap", async ({ page }) => {
  await page.goto("./");
  const first = page.locator("#faq details").first();
  await expect(first.locator("p")).toBeHidden();
  await first.locator("summary").click();
  await expect(first.locator("p")).toBeVisible();
});

test("no horizontal overflow, also on a phone", async ({ page }) => {
  for (const lang of languages) {
    await page.goto(pathOf(lang));
    const [scroll, width] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
    expect(scroll, `${lang.code}: page wider than the screen`).toBeLessThanOrEqual(width);
  }
});

// Language redirect and 404 page, the same in every game (@hostelgames/core/testing).
siteTests({ languages, site });
