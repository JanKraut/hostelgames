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
    await expect(page.locator(".hero h1")).toHaveText(lang.t.h1);
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

test("the English start page sends visitors to their saved language", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("lang", "de"));
  await page.goto("./");
  await expect(page).toHaveURL(new RegExp(`${site.pathPrefix}de/$`));
});

test("unknown addresses get the 404 page", async ({ page }) => {
  await page.goto("404.html");
  await expect(page.locator("h1")).toHaveText(languages[0].t.nfH);
});
