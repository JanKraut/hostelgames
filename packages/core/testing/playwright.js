// Shared Playwright helpers for the tests of every game (games/<slug>/tests/*.spec.js):
//
//   import { test, expect, pathOf, open, siteTests } from "@hostelgames/core/testing";
//   siteTests({ languages, site });                         // every game
//   siteTests({ languages, site, quiz: ["quickstart"] });   // game with the practice quiz
//
// test       Playwright's test, but every test fails if the page throws a JavaScript error
// pathOf     relative path of a language page, "./" for English, "de/" for German …
// open       opens a page of a language without being sent elsewhere by the saved language
// siteTests  the tests every game needs, driven by game.json (pages, status) – see below.
//            The game's own spec only tests what is special about the game
//            (its sections, graphics, counts, texts).
import { test as base, expect } from "@playwright/test";
import { SUBPATHS } from "../lib/sitemap.js";

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

/** Opens a page ("" = rules, "strategy/" …) of a language, with that language saved. */
export async function open(page, lang, sub = "") {
  await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
  await page.goto(pathOf(lang) + sub);
}

// Page title of each page: lang.t.seo.<key>.
const TITLES = { rules: "rulesT", strategy: "strategyT", quickstart: "quickT", scoresheet: "sheetT", play: "playT" };
// Name of each tab: lang.t.<key> (the game against bots has its own, from the menu texts).
const TABS = { rules: "pgRules", strategy: "n6", quickstart: "pgQuick", scoresheet: "pgSheet" };
// Template leftovers or texts that are missing.
const LEFTOVERS = /undefined|\[object|\{\{|\{%/;

/**
 * Tests every game needs, for every page in game.json and every language of the game:
 * title, lang, canonical, hreflang, noindex, language menu, share box and QR button,
 * no template leftovers, every #link works, no game against bots and no quiz where there is none,
 * nothing wider than a narrow phone; the tabs, fact sheet, FAQ, language redirect, 404 page and the quiz.
 *
 * @param {object} options
 * @param {object[]} options.languages  from src/_data/languages.js
 * @param {object} options.site         from src/_data/site.js (site.game is the game.json)
 * @param {string[]} [options.quiz]     pages with the practice quiz (core contract: #practice with
 *                                      #btns .yes/.no, #fb, #next, #score), e.g. ["rules", "quickstart"].
 *                                      Every game gets a quiz in the end; until then it is empty.
 * @param {string[]} [options.redirects]  English pages that send visitors to their saved language
 *                                        (default: every page of the game)
 */
export function siteTests({ languages, site, quiz = [], redirects }) {
  const game = site.game;
  const pages = game.pages.map((name) => ({ name, sub: SUBPATHS[name] }));
  // Tools (game against bots, score sheet) are their own world: no share box, no sections.
  const TOOLS = ["play", "scoresheet"];
  const content = pages.filter((p) => !TOOLS.includes(p.name));
  const hasPlay = game.pages.includes("play");
  const noindex = !site.indexable || game.status !== "live";
  for (const name of quiz) {
    if (!game.pages.includes(name)) throw new Error(`siteTests: quiz on "${name}", but game.json has no such page`);
  }

  test.describe("every page in every language", () => {
    for (const lang of languages) {
      for (const { name, sub } of pages) {
        test(`${lang.code} ${name}: head, menus, texts and links`, async ({ page }) => {
          await open(page, lang, sub);

          const title = lang.t.seo?.[TITLES[name]];
          if (title) await expect(page).toHaveTitle(title);
          await expect(page.locator("html")).toHaveAttribute("lang", lang.htmlLang);
          await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", lang.url + sub);
          // One hreflang link per language plus x-default.
          await expect(page.locator("link[rel=alternate][hreflang]")).toHaveCount(languages.length + 1);
          // Previews and drafts: never indexed.
          await expect(page.locator("meta[name=robots][content=noindex]")).toHaveCount(noindex ? 1 : 0);
          await expect(page.locator(".langmenu a[aria-current=page]")).toHaveAttribute("data-lang", lang.code);
          await expect(page.locator(`.langmenu a[data-lang="${lang.code}"]`)).toHaveAttribute("href", new RegExp(`${sub}$`));
          if (pages.length > 1) await expect(page.locator(".pagetabs a[aria-current=page]")).toHaveCount(1);

          const text = await page.locator("body").innerText();
          expect(text).not.toMatch(LEFTOVERS);
          if (TOOLS.includes(name)) return;

          // QR button at the top, share box with QR code, pointing to the page itself.
          await expect(page.locator(".qrbtn")).toBeVisible();
          await expect(page.locator("#share .qr svg")).toBeVisible();
          await expect(page.locator("#shurl")).toHaveAttribute("href", lang.url + sub);
          await expect(page.locator("#shCopy")).toBeVisible();
          // Every #link (section bar and texts) leads to an element on the page.
          const anchors = await page.locator('a[href^="#"]').evaluateAll((links) => links.map((a) => a.getAttribute("href").slice(1)));
          for (const id of new Set(anchors)) await expect(page.locator(`[id="${id}"]`), `#${id}`).toHaveCount(1);
          // Section bar: its #links lead to sections, not just any element.
          for (const href of await page.locator('.secnav a[href^="#"]').evaluateAll((links) => links.map((a) => a.getAttribute("href")))) {
            await expect(page.locator(`section${href}`), href).toHaveCount(1);
          }
          // No game against bots unless game.json has it, a quiz only where it is announced.
          if (!hasPlay) {
            await expect(page.locator('a[href*="play/"]')).toHaveCount(0);
            await expect(page.locator("#play-bots")).toHaveCount(0);
          }
          await expect(page.locator("#practice")).toHaveCount(quiz.includes(name) ? 1 : 0);
        });
      }
    }
  });

  test.describe("narrow phones", () => {
    for (const lang of languages) {
      test(`${lang.code}: nothing is wider than the screen (320 and 390 px)`, async ({ page }) => {
        for (const width of [320, 390]) {
          await page.setViewportSize({ width, height: 700 });
          // Tools (score sheet, game against bots) test their own width in every state.
          for (const { name, sub } of content) {
            await open(page, lang, sub);
            // Open answers must fit too.
            await page.locator("details").evaluateAll((all) => all.forEach((d) => (d.open = true)));
            const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
            expect(overflow, `${lang.code} ${name} at ${width}px`).toBeLessThanOrEqual(0);
          }
        }
      });
    }
  });

  if (pages.length > 1) {
    // Tabs: in the order of game.json, the game against bots last.
    const tabs = [...pages.filter((p) => p.name !== "play"), ...pages.filter((p) => p.name === "play")];

    // Address of a page, e.g. …/hostelgames/cabogame/de/strategy/ (and not just any …/strategy/).
    const at = (lang, sub) => new RegExp(`${site.pathPrefix}${lang.path.slice(1)}${sub}$`);

    test("the tabs lead to every page and back to the rules", async ({ page }) => {
      const lang = languages.find((l) => l.code === "de") ?? languages[0];
      await open(page, lang);
      for (const { sub } of [...tabs.slice(1), tabs[0]]) {
        await page.locator(".pagetabs a").nth(tabs.findIndex((p) => p.sub === sub)).click();
        await expect(page).toHaveURL(at(lang, sub));
        await expect(page.locator(".pagetabs a[aria-current=page]")).toHaveAttribute("href", at(lang, sub));
      }
    });

    test("tabs: order from game.json, full names, current tab in view on a narrow phone", async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 700 });
      const last = tabs.filter((p) => p.name !== "play").at(-1);
      for (const lang of languages) {
        await open(page, lang, last.sub);
        const links = page.locator(".pagetabs a");
        await expect(links).toHaveCount(tabs.length);
        const hrefs = await links.evaluateAll((all) => all.map((a) => a.getAttribute("href")));
        hrefs.forEach((href, i) => expect(href, lang.code).toMatch(at(lang, tabs[i].sub)));
        const names = tabs.filter((p) => p.name !== "play").map((p) => lang.t[TABS[p.name]]);
        await expect(page.locator(".pagetabs a:not(.tab-play)")).toHaveText(names);
        // No tab is cut off; the bar scrolls instead.
        const cut = await links.evaluateAll((all) => all.filter((a) => a.scrollWidth > a.clientWidth).map((a) => a.textContent));
        expect(cut, lang.code).toEqual([]);
        // The current tab is scrolled into view – also after the web font has loaded.
        await page.evaluate(() => document.fonts.ready);
        const inView = async () => {
          const box = await page.locator(".pagetabs a[aria-current=page]").boundingBox();
          return box.x >= 0 && box.x + box.width <= 320;
        };
        await expect.poll(inView, { message: lang.code }).toBe(true);
      }
    });
  }

  if (game.factsheet) {
    test.describe("fact sheet", () => {
      for (const lang of languages) {
        test(`${lang.code}: in the header of the rules page only`, async ({ page }) => {
          await open(page, lang);
          const sheet = page.locator(".hero #factsheet");
          await expect(sheet).toBeVisible();
          await expect(sheet.locator(".fs-scale")).toHaveCount(game.factsheet.scales.length);
          await expect(sheet.locator(".fs-group")).toHaveCount(2);
          await expect(sheet.locator(".fs-similar li")).toHaveCount(lang.t.info.similar.split(", ").length);
          await expect(sheet.locator(".fs-intro p")).toHaveText(lang.t.info.intro);
          for (const { sub } of pages.filter((p) => p.name !== "rules")) {
            await page.goto(pathOf(lang) + sub);
            await expect(page.locator("#factsheet"), sub).toHaveCount(0);
          }
        });
      }
    });
  }

  // The same markup in every language, so German (or English) is enough.
  test("FAQ answers open on tap", async ({ page }) => {
    const lang = languages.find((l) => l.code === "de") ?? languages[0];
    for (const { name, sub } of content) {
      await open(page, lang, sub);
      const first = page.locator("#faq details").first();
      if (!(await first.count())) continue;
      await expect(first.locator("p").first(), name).toBeHidden();
      await first.locator("summary").click();
      await expect(first.locator("p").first(), name).toBeVisible();
    }
  });

  for (const sub of redirects ?? pages.map((p) => p.sub || "./")) {
    const name = sub === "./" ? "start page" : `${sub.replace(/\/$/, "")} page`;
    test(`the English ${name} sends visitors to their saved language`, async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem("lang", "de"));
      await page.goto(sub);
      await expect(page).toHaveURL(new RegExp(`${site.pathPrefix}de/${sub === "./" ? "" : sub}$`));
    });
  }

  test("unknown addresses get the 404 page", async ({ page }) => {
    await page.goto("404.html");
    await expect(page.locator("h1")).toHaveText(languages[0].t.nfH);
  });

  if (quiz.length) quizTests({ languages, pages: pages.filter((p) => quiz.includes(p.name)) });
}

/**
 * The practice quiz, the same in every game: a question, two answers, feedback in the page
 * language, the next question and the score. Whether an answer is right depends on the
 * game's rules and is tested in the game's own spec.
 */
function quizTests({ languages, pages }) {
  test.describe("practice quiz", () => {
    for (const lang of languages) {
      for (const { name, sub } of pages) {
        test(`${lang.code} ${name}: answer, feedback, next question, score`, async ({ page }) => {
          await open(page, lang, sub);
          const quiz = page.locator("#practice");
          await expect(quiz.locator("h2")).not.toBeEmpty();
          await expect(quiz.locator("#btns .yes")).toBeVisible();
          await expect(quiz.locator("#btns .no")).toBeVisible();
          await expect(quiz.locator("#next")).toBeHidden();
          const before = await quiz.locator("#score").innerText();

          await quiz.locator("#btns .yes").click();
          await expect(quiz.locator("#fb")).not.toBeEmpty();
          expect(await quiz.locator("#fb").innerText()).not.toMatch(LEFTOVERS);
          await expect(quiz.locator("#score")).not.toHaveText(before);
          await expect(quiz.locator("#next")).toBeVisible();

          await quiz.locator("#next").click();
          await expect(quiz.locator("#next")).toBeHidden();
          await expect(quiz.locator("#fb")).toBeEmpty();
          await expect(quiz.locator("#btns .yes")).toBeVisible();
        });
      }
    }
  });
}
