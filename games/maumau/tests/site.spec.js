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
const sections = ["setup", "how-to-play", "special", "mau", "scoring", "variants", "faq", "share"];

for (const lang of languages) {
  test(`${lang.code}: all rule sections, section bar points to them`, async ({ page }) => {
    await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
    await page.goto(pathOf(lang));
    for (const id of sections) await expect(page.locator(`section#${id}`)).toHaveCount(1);
    await expect(page.locator("#setup h2")).toHaveText(lang.t.rules.setupH);
    await expect(page.locator("#special h2")).toHaveText(lang.t.rules.spH);
    const targets = await page.locator(".secnav a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(targets).toEqual(sections.filter((id) => id !== "share").map((id) => `#${id}`));
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

const STRATEGY_SECTIONS = ["principle", "hand", "specials", "wishing", "endgame", "mistakes"];
const de = languages.find((l) => l.code === "de");

for (const lang of languages) {
  test(`${lang.code}: strategy page with hand example, specials and sections`, async ({ page }) => {
    const s = lang.t.strategy;
    await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
    await page.goto(pathOf(lang) + "strategy/");

    await expect(page).toHaveTitle(lang.t.seo.strategyT);
    await expect(page.locator("html")).toHaveAttribute("lang", lang.htmlLang);
    await expect(page.locator(".hero h1")).toHaveText(s.h1);
    await expect(page.locator(".pagetabs a[aria-current=page]")).toHaveText(lang.t.n6);
    await expect(page.locator("#factsheet")).toHaveCount(0);
    await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", lang.url + "strategy/");
    const nav = await page.locator(".secnav a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(nav).toEqual(STRATEGY_SECTIONS.map((id) => `#${id}`));
    for (const id of STRATEGY_SECTIONS) await expect(page.locator(`main section#${id} h2`)).toBeVisible();
    await expect(page.locator(".playex .px-cards .card")).toHaveCount(4);
    await expect(page.locator("#specials .rulecard")).toHaveCount(3);
    await expect(page.locator("#mistakes .variants li")).toHaveCount(s.mistakes.length);
    await expect(page.locator("#share .qr svg")).toBeVisible();
    await expect(page.locator("a[href*='play/']")).toHaveCount(0);
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/undefined|\[object|\{\{|\{%/);
  });

  test(`${lang.code}: quick start page with specials, Mau calls and points`, async ({ page }) => {
    const k = lang.t.quick;
    await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
    await page.goto(pathOf(lang) + "quickstart/");

    await expect(page).toHaveTitle(lang.t.seo.quickT);
    await expect(page.locator("html")).toHaveAttribute("lang", lang.htmlLang);
    await expect(page.locator(".hero h1")).toHaveText(lang.t.h1);
    await expect(page.locator(".pagetabs a[aria-current=page]")).toHaveText(lang.t.pgQuick);
    await expect(page.locator("#factsheet")).toHaveCount(0);
    await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", lang.url + "quickstart/");
    await expect(page.locator(".cheat h2")).toHaveText(k.h);
    await expect(page.locator(".ch-specials li")).toHaveCount(3);
    await expect(page.locator(".ch-rows li")).toHaveCount(2);
    await expect(page.locator(".ch-pts li")).toHaveCount(8);
    await expect(page.locator(`#next-steps a[href$="${lang.path}strategy/"]`)).toBeVisible();
    await expect(page.locator("#share .qr svg")).toBeVisible();
    await expect(page.locator("a[href*='play/']")).toHaveCount(0);
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/undefined|\[object|\{\{|\{%/);
  });
}

test("the tabs link rules, strategy and quickstart pages", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("lang", "de"));
  await page.goto("de/");
  await page.locator(".pagetabs a", { hasText: de.t.n6 }).click();
  await expect(page).toHaveURL(/\/de\/strategy\/$/);
  await page.locator(".pagetabs a", { hasText: de.t.pgQuick }).click();
  await expect(page).toHaveURL(/\/de\/quickstart\/$/);
  await page.locator("#next-steps a", { hasText: de.t.quick.ctaRulesBtn }).click();
  await expect(page).toHaveURL(/\/de\/$/);
});

test("no horizontal overflow, also on a phone", async ({ page }) => {
  for (const lang of languages) {
    await page.goto(pathOf(lang));
    const [scroll, width] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
    expect(scroll, `${lang.code}: page wider than the screen`).toBeLessThanOrEqual(width);
  }
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 700 });
    for (const sub of ["", "strategy/", "quickstart/"]) {
      for (const lang of [languages[0], de]) {
        await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
        await page.goto(pathOf(lang) + sub);
        const [scroll, innerWidth] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
        expect(scroll, `${lang.code} ${sub} at ${width}px`).toBeLessThanOrEqual(innerWidth);
      }
    }
  }
});

// Language redirect and 404 page, the same in every game (@hostelgames/core/testing).
siteTests({ languages, site, redirects: ["./", "strategy/", "quickstart/"] });
