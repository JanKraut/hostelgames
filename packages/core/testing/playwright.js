// Shared Playwright helpers for the tests of every game (games/<slug>/tests/*.spec.js):
//
//   import { test, expect, pathOf, siteTests } from "@hostelgames/core/testing";
//   siteTests({ languages, site });
//
// test     Playwright's test, but every test fails if the page throws a JavaScript error
// pathOf   relative path of a language page, "./" for English, "de/" for German …
// siteTests  the tests every game needs (language redirect, 404 page)
import { test as base, expect } from "@playwright/test";

export { expect };

// Every test fails if the page throws a JavaScript error.
export const test = base.extend({
  page: async ({ page }, use) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await use(page);
    expect(errors, "JavaScript errors on the page").toEqual([]);
  },
});

/** Relative to baseURL, e.g. "./" for English and "de/" for German. */
export const pathOf = (lang) => (lang.path === "/" ? "./" : lang.path.slice(1));

/**
 * Tests every game needs.
 * @param {object} options
 * @param {object[]} options.languages  from src/_data/languages.js
 * @param {object} options.site         from src/_data/site.js
 * @param {string[]} [options.redirects]  English pages that send visitors to their saved language
 *                                        ("./" = start page, e.g. "strategy/")
 */
export function siteTests({ languages, site, redirects = ["./"] }) {
  for (const path of redirects) {
    const name = path === "./" ? "start page" : `${path.replace(/\/$/, "")} page`;
    test(`the English ${name} sends visitors to their saved language`, async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem("lang", "de"));
      await page.goto(path);
      await expect(page).toHaveURL(new RegExp(`${site.pathPrefix}de/${path === "./" ? "" : path}$`));
    });
  }

  test("unknown addresses get the 404 page", async ({ page }) => {
    await page.goto("404.html");
    await expect(page.locator("h1")).toHaveText(languages[0].t.nfH);
  });
}
