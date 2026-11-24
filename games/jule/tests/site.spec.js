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
    await expect(page.locator(".hero h1")).toContainText(lang.t.h1);
    await expect(page.locator(".hero h1 .h1-sub")).toHaveText(lang.t.h1sub);
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
    await expect(page.locator('a[href*="play"]:not(.navpanel a)')).toHaveCount(0);
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

test("no horizontal overflow, even on a very narrow phone", async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 700 });
    for (const lang of languages) {
      await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
      await page.goto(pathOf(lang));
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${lang.code} at ${width}px`).toBeLessThanOrEqual(0);
    }
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
