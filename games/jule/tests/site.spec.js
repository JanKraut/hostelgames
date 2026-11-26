import { test, expect, pathOf, siteTests } from "@hostelgames/core/testing";
import languages from "../src/_data/languages.js";
import site from "../src/_data/site.js";

for (const lang of languages) {
  test(`${lang.code}: rules page with its own texts`, async ({ page }) => {
    await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
    await page.goto(pathOf(lang));
    await expect(page).toHaveTitle(lang.t.seo.rulesT);
    await expect(page.locator("html")).toHaveAttribute("lang", lang.htmlLang);
    await expect(page.locator(".hero h1")).toContainText(lang.t.rules.h1);
    await expect(page.locator(".hero h1 .h1-sub")).toHaveText(lang.t.rules.h1sub);
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

// Alle Abschnitte der Regelseite, in der Reihenfolge der Abschnittsnavigation.
const SECTIONS = ["setup", "turn", "back", "winning", "silent", "variants", "faq", "share"];

for (const lang of languages) {
  test(`${lang.code}: all sections, and the section navigation points to them`, async ({ page }) => {
    await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
    await page.goto(pathOf(lang));
    for (const id of SECTIONS) {
      await expect(page.locator(`main section#${id} h2`)).toBeVisible();
    }
    const targets = await page.locator(".secnav a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(targets).toEqual(SECTIONS.filter((id) => id !== "share").map((id) => `#${id}`));
    // Every #link on the page (navigation and texts) leads to an existing element.
    const anchors = await page.locator('a[href^="#"]').evaluateAll((links) => links.map((a) => a.getAttribute("href").slice(1)));
    for (const id of anchors) {
      await expect(page.locator(`[id="${id}"]`), `#${id}`).toHaveCount(1);
    }
    // Rules page only: no game against bots.
    await expect(page.locator('a[href*="play"]')).toHaveCount(0);
  });

  test(`${lang.code}: fact sheet in the header`, async ({ page }) => {
    await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
    await page.goto(pathOf(lang));
    const sheet = page.locator(".hero #factsheet");
    await expect(sheet).toBeVisible();
    await expect(sheet.locator(".fs-scale")).toHaveCount(3);
    await expect(sheet.locator(".fs-group")).toHaveCount(2);
    await expect(sheet.locator(".fs-similar li")).toHaveCount(lang.t.info.similar.split(", ").length);
    await expect(sheet.locator(".fs-dice .die")).toHaveCount(1);
    await expect(sheet.locator(".fs-intro p")).toHaveText(lang.t.info.intro);
  });

  test(`${lang.code}: dice 1 to 6 in the header, example round and the sheet`, async ({ page }) => {
    await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
    await page.goto(pathOf(lang));
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

  test(`${lang.code}: FAQ answers open on tap`, async ({ page }) => {
    await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
    await page.goto(pathOf(lang));
    await expect(page.locator(".faq details")).toHaveCount(6);
    const first = page.locator(".faq details").first();
    await expect(first.locator("p")).toBeHidden();
    await first.locator("summary").click();
    await expect(first.locator("p")).toBeVisible();
  });
}

const STRATEGY_SECTIONS = ["principle", "odds", "silent-tactics", "variants-guide", "mistakes"];

for (const lang of languages) {
  test(`${lang.code}: strategy page with odds, dice and Silent Jule tactics`, async ({ page }) => {
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
    await expect(page.locator(".odds li")).toHaveCount(s.odds.length);
    await expect(page.locator(".odds .die.open").first()).toBeVisible();
    // Every die shows as many pips as its number (open dice: none).
    const dicePips = await page.locator(".die").evaluateAll((all) => all.map((d) => [Number(d.dataset.n), d.querySelectorAll("i.p").length]));
    for (const [n, pips] of dicePips) expect(pips).toBe(n);
    await expect(page.locator("#mistakes .variants li")).toHaveCount(s.mistakes.length);
    await expect(page.locator("#share .qr svg")).toBeVisible();
    await expect(page.locator('a[href*="play"]')).toHaveCount(0);
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/undefined|\[object|\{\{|\{%/);
  });

  test(`${lang.code}: quick start page with way there, way back and Silent Jule`, async ({ page }) => {
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
    await expect(page.locator(".ch-path .die")).toHaveCount(12);
    await expect(page.locator(`#next-steps a[href$="${lang.path}strategy/"]`)).toBeVisible();
    await expect(page.locator("#share .qr svg")).toBeVisible();
    await expect(page.locator('a[href*="play"]')).toHaveCount(0);
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/undefined|\[object|\{\{|\{%/);
  });
}

test("the tabs link rules, strategy and quickstart pages", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("lang", "de"));
  await page.goto("de/");
  await page.locator(".pagetabs a", { hasText: languages[1].t.n6 }).click();
  await expect(page).toHaveURL(/\/de\/strategy\/$/);
  await page.locator(".pagetabs a", { hasText: languages[1].t.pgQuick }).click();
  await expect(page).toHaveURL(/\/de\/quickstart\/$/);
  await page.locator("#next-steps a", { hasText: languages[1].t.quick.ctaRulesBtn }).click();
  await expect(page).toHaveURL(/\/de\/$/);
});

test("no horizontal overflow, even on a very narrow phone", async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 700 });
    for (const sub of ["", "strategy/", "quickstart/"]) {
      for (const lang of languages) {
        await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
        await page.goto(pathOf(lang) + sub);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, `${lang.code} ${sub} at ${width}px`).toBeLessThanOrEqual(0);
      }
    }
  }
});

// Language redirect and 404 page, the same in every game (@hostelgames/core/testing).
siteTests({ languages, site, redirects: ["./", "strategy/", "quickstart/"] });
