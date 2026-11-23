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
    await expect(page.locator(".hero h1")).toHaveText(`${lang.t.h1} ${lang.t.h1sub}`);
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

// Abschnitte der Regelseite, in der Reihenfolge der Seite.
const SECTIONS = ["setup", "how-to-play", "round-end", "swap", "variants", "faq", "share"];

for (const lang of languages) {
  test(`${lang.code}: all rule sections with headings and texts`, async ({ page }) => {
    await page.goto(pathOf(lang));
    for (const id of SECTIONS) {
      const section = page.locator(`main section#${id}`);
      await expect(section, `section #${id}`).toHaveCount(1);
      await expect(section.locator("h2").first()).not.toBeEmpty();
    }
    await expect(page.locator(".hero .goal")).toBeVisible();
    await expect(page.locator(".ranks .card")).toHaveCount(13);
    await expect(page.locator(".ladder li")).toHaveCount(5);
    await expect(page.locator(".variants li")).toHaveCount(7);
    await expect(page.locator(".faq details")).toHaveCount(8);
    // Kein Spiel gegen Bots: kein Link auf play/.
    await expect(page.locator('a[href*="play/"]')).toHaveCount(0);
  });

  test(`${lang.code}: every #link points to an existing section`, async ({ page }) => {
    await page.goto(pathOf(lang));
    const targets = await page.locator('a[href^="#"]').evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(targets.length).toBeGreaterThanOrEqual(SECTIONS.length);
    for (const href of targets) {
      await expect(page.locator(`section${href}`), href).toHaveCount(1);
    }
    // Die Abschnittsnavigation enthält jeden Abschnitt.
    const nav = await page.locator(".secnav a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(nav).toEqual(SECTIONS.map((id) => `#${id}`));
  });
}

test("no horizontal overflow, light and dark", async ({ page }) => {
  for (const theme of ["light", "dark"]) {
    await page.addInitScript((th) => localStorage.setItem("theme", th), theme);
    await page.goto("./");
    const [scroll, width] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
    expect(scroll, `${theme}: page wider than the screen`).toBeLessThanOrEqual(width);
  }
});

test("the section navigation jumps to the section", async ({ page }) => {
  await page.goto("./");
  await page.locator('.secnav a[href="#swap"]').click();
  await expect(page).toHaveURL(/#swap$/);
  await expect(page.locator("section#swap h2")).toBeInViewport();
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
