// The game page: every language, without JavaScript, and complete games through the UI.
import { test as base, expect } from "@playwright/test";
import languages from "../src/_data/languages.js";

const test = base.extend({
  page: async ({ page }, use) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await use(page);
    expect(errors, "JavaScript errors on the page").toEqual([]);
  },
});

const byCode = Object.fromEntries(languages.map((lang) => [lang.code, lang]));
const playPath = (lang) => (lang.path === "/" ? "play/" : `${lang.code}/play/`);

async function openPlay(page, lang) {
  await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
  await page.goto(playPath(lang));
}

// Bots move quickly with reduced motion.
test.use({ reducedMotion: "reduce" });

test.describe("game page in every language", () => {
  for (const lang of languages) {
    test(`${lang.code}`, async ({ page }) => {
      await openPlay(page, lang);
      await expect(page).toHaveTitle(lang.t.game.title);
      await expect(page.locator("html")).toHaveAttribute("lang", lang.htmlLang);
      await expect(page.locator("h1")).toHaveText(lang.t.game.h1);
      await expect(page.locator("#setup h2")).toHaveText(lang.t.game.setupH);
      await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", `${lang.url}play/`);
      // The language menu stays on the game page.
      await expect(page.locator('.langmenu a[data-lang="de"]')).toHaveAttribute("href", /\/de\/play\/$/);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});

test("the rules page links to the game", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("lang", "de"));
  await page.goto("de/");
  await page.locator("#gegen-bots a").click();
  await expect(page).toHaveURL(/\/de\/play\/$/);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("explains that the game needs JavaScript", async ({ page }) => {
    await page.goto("de/play/");
    await expect(page.locator(".nojs-only")).toHaveText(byCode.de.t.game.noJs);
    await expect(page.locator("#setup")).toBeHidden();
  });
});

test("swapping before the start", async ({ page }) => {
  await openPlay(page, byCode.en);
  await page.locator("#setup-form button[type=submit]").click();
  const hand = page.locator("#my-hand button").first();
  const up = page.locator('#my-table button[data-zone="up"]').first();
  const handCard = await hand.getAttribute("data-id");
  const upCard = await up.getAttribute("data-id");
  await hand.click();
  await up.click();
  await expect(page.locator(`#my-table button[data-id="${handCard}"]`)).toBeVisible();
  await expect(page.locator(`#my-hand button[data-id="${upCard}"]`)).toBeVisible();
});

for (const [bots, level, code] of [
  [1, "normal", "de"],
  [4, "easy", "he"],
]) {
  test(`a complete game against ${bots} ${level} bot(s) (${code})`, async ({ page }) => {
    test.setTimeout(120_000);
    const lang = byCode[code];
    await openPlay(page, lang);
    await page.check(`input[name=bots][value="${bots}"]`, { force: true });
    await page.check(`input[name=level][value="${level}"]`, { force: true });
    await page.locator("#setup-form button[type=submit]").click();
    await expect(page.locator("#opponents .opp")).toHaveCount(bots);
    await page.locator("#btn-ready").click();

    // Play like a beginner: first fitting card, otherwise pick up or flip.
    for (let move = 0; move < 1000; move++) {
      await page.waitForFunction(() => !document.getElementById("over").hidden || document.getElementById("me").classList.contains("active"));
      if (await page.locator("#over").isVisible()) break;
      if (await page.locator("#btn-pickup:not([hidden]):not([disabled])").count()) {
        await page.locator("#btn-pickup").click();
      } else if (await page.locator('#my-table button[data-zone="down"]').count()) {
        await page.locator('#my-table button[data-zone="down"]').first().click();
      } else {
        await page.locator("#me button.playable").first().click();
        await page.locator("#btn-play").click();
      }
    }

    await expect(page.locator("#over")).toBeVisible();
    await expect(page.locator("#over h2")).toHaveText(lang.t.game.overH);
    const ranking = await page.locator("#ranking li").count();
    const draw = (await page.locator("#over-text").textContent()) === lang.t.game.stalemate;
    if (!draw) expect(ranking).toBe(bots + 1);

    // Play again starts a fresh game with the same settings.
    await page.locator("#btn-again").click();
    await expect(page.locator("#over")).toBeHidden();
    await expect(page.locator("#opponents .opp")).toHaveCount(bots);
    await expect(page.locator("#btn-ready")).toBeVisible();
  });
}
