import { test as base, expect } from "@playwright/test";
import languages from "../src/_data/languages.js";
import site from "../src/_data/site.js";

// Every test fails if the page throws a JavaScript error.
const test = base.extend({
  page: async ({ page }, use) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await use(page);
    expect(errors, "JavaScript errors on the page").toEqual([]);
  },
});

const pathOf = (lang) => (lang.path === "/" ? "./" : lang.path.slice(1));

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
const sections = ["setup", "how-to-play", "special", "mau", "scoring", "variants", "faq", "share"];

for (const lang of languages) {
  test(`${lang.code}: all rule sections, section bar points to them`, async ({ page }) => {
    await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
    await page.goto(pathOf(lang));
    for (const id of sections) await expect(page.locator(`section#${id}`)).toHaveCount(1);
    await expect(page.locator("#setup h2")).toHaveText(lang.t.rules.setupH);
    await expect(page.locator("#special h2")).toHaveText(lang.t.rules.spH);
    const targets = await page.locator(".secnav a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(targets).toEqual(sections.map((id) => `#${id}`));
    // Links inside the texts (e.g. in the FAQ) only point to existing elements too.
    const anchors = await page.locator("main a[href^='#']").evaluateAll((links) => links.map((a) => a.getAttribute("href").slice(1)));
    for (const id of anchors) await expect(page.locator(`[id="${id}"]`)).toHaveCount(1);
    // What fits on the nine of spades: three yes, one no.
    await expect(page.locator(".check .ck-yes")).toHaveCount(3);
    await expect(page.locator(".check .ck-no")).toHaveCount(1);
    // Special cards 7, 8 and jack; Mau and Mau-Mau; points for all eight ranks.
    await expect(page.locator(".rulecard h3")).toHaveText([lang.t.rules.sp7H, lang.t.rules.sp8H, lang.t.rules.spjH]);
    await expect(page.locator(".call-word")).toHaveText([lang.t.rules.mauWord1, lang.t.rules.mauWord2]);
    await expect(page.locator(".points li")).toHaveCount(8);
    await expect(page.locator("#faq details")).toHaveCount(7);
    // No game against bots on this site.
    await expect(page.locator("a[href*='play/']")).toHaveCount(0);
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

test("no horizontal overflow, also on a phone", async ({ page }) => {
  for (const lang of languages) {
    await page.goto(pathOf(lang));
    const [scroll, width] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
    expect(scroll, `${lang.code}: page wider than the screen`).toBeLessThanOrEqual(width);
  }
});

test("the English start page sends visitors to their saved language", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("lang", "de"));
  await page.goto("./");
  await expect(page).toHaveURL(new RegExp(`${site.pathPrefix}de/$`));
});

test("unknown addresses get the 404 page", async ({ page }) => {
  await page.goto("404.html");
  await expect(page.locator("h1")).toHaveText(languages[0].t.nfH);
});
