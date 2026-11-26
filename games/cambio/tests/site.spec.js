import { test, expect, pathOf, siteTests } from "@hostelgames/core/testing";
import languages from "../src/_data/languages.js";
import site from "../src/_data/site.js";

// Sections of the rules page in the order of the section navigation (without the share box).
const SECTIONS = ["setup", "values", "turn", "powers", "stacking", "cambio", "scoring", "variants", "faq"];


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

  test(`${lang.code}: all rule sections are there, each with its heading`, async ({ page }) => {
    await page.goto(pathOf(lang));
    for (const id of SECTIONS) {
      await expect(page.locator(`main section#${id} h2`).first(), `#${id}`).toBeVisible();
    }
    // Card graphics from the core macros.
    await expect(page.locator(".fan .card")).toHaveCount(4);
    await expect(page.locator("#setup .g4 .card")).toHaveCount(4);
    await expect(page.locator("#values .values li")).toHaveCount(6);
    await expect(page.locator("#powers .sp")).toHaveCount(4);
    await expect(page.locator("#faq details")).toHaveCount(8);
    // Rules only: no game against bots, no link to it.
    await expect(page.locator('a[href*="play"]')).toHaveCount(0);
  });

  test(`${lang.code}: every #link points to a section on the page`, async ({ page }) => {
    await page.goto(pathOf(lang));
    const nav = await page.locator(".secnav a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(nav).toEqual(SECTIONS.map((id) => `#${id}`));
    const targets = await page.locator('a[href^="#"]').evaluateAll((links) => links.map((a) => a.getAttribute("href").slice(1)));
    for (const id of targets) {
      await expect(page.locator(`[id="${id}"]`), `#${id}`).toHaveCount(1);
    }
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

  test(`${lang.code}: nothing is wider than the screen, even on a very narrow phone`, async ({ page }) => {
    await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 700 });
      await page.goto(pathOf(lang));
      await page.locator("#faq details").evaluateAll((all) => all.forEach((d) => (d.open = true)));
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${lang.code} at ${width}px`).toBeLessThanOrEqual(0);
    }
  });
}

// Language redirect and 404 page, the same in every game (@hostelgames/core/testing).
siteTests({ languages, site });
