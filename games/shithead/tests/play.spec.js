// The game page: every language, without JavaScript, and complete games through the UI.
import { test, expect } from "@hostelgames/core/testing";
import { languages } from "@hostelgames/core/game";

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
      await expect(page).toHaveTitle(lang.t.seo.playT);
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
  await page.locator("#play-bots a").click();
  await expect(page).toHaveURL(/\/de\/play\/$/);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("shows the header, but no game controls", async ({ page }) => {
    await page.goto("de/play/");
    await expect(page.locator("h1")).toHaveText(byCode.de.t.game.h1);
    await expect(page.locator("#setup")).toBeHidden();
    await expect(page.locator("#table")).toBeHidden();
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

const PLAYER = "<b>Jo</b>";

/**
 * Plays like a beginner: first fitting card, otherwise pick up or flip.
 * Cards in a full hand overlap, so they are tapped on their visible left strip.
 * Returns false when the game is over.
 */
async function playOneMove(page) {
  await page.waitForFunction(() => !document.getElementById("over").hidden || document.getElementById("me").classList.contains("active"));
  if (await page.locator("#over").isVisible()) return false;
  if (await page.locator("#btn-pickup:not(.off):not([disabled])").count()) {
    await page.locator("#btn-pickup").click();
  } else if (await page.locator('#my-table button[data-zone="down"]').count()) {
    await page.locator('#my-table button[data-zone="down"]').first().click();
  } else {
    await page.locator("#me button.playable").first().click({ position: { x: 8, y: 24 } });
    await page.locator("#btn-play").click();
  }
  return true;
}

for (const [bots, level, code] of [
  [1, "normal", "de"],
  [4, "easy", "pl"],
]) {
  test(`a complete game against ${bots} ${level} bot(s) (${code})`, async ({ page }) => {
    test.setTimeout(120_000);
    const lang = byCode[code];
    await openPlay(page, lang);
    await page.check(`input[name=bots][value="${bots}"]`, { force: true });
    await page.check(`input[name=level][value="${level}"]`, { force: true });
    await page.locator("input[name=player]").fill(PLAYER);
    await page.locator("#setup-form button[type=submit]").click();
    await expect(page.locator("#opponents .opp")).toHaveCount(bots);

    // Bots have typical first names of the page language, each one only once.
    const names = lang.t.game.botNames.split(/\s*,\s*/).map((pair) => pair.split("/")[0]);
    const shown = await page.locator("#opponents .oppname").allTextContents();
    expect(new Set(shown).size).toBe(bots);
    for (const name of shown) expect(names).toContain(name.trim());

    // Each bot's hand is a fan of face-down cards (3 at the start), the number only for screen readers.
    for (const fan of await page.locator("#opponents .oppfan").all()) {
      await expect(fan.locator(".fanback")).toHaveCount(3);
      await expect(fan).toHaveAttribute("aria-label", lang.t.game.handCount.replace("{n}", "3"));
    }
    await expect(page.locator("#opponents")).not.toContainText(lang.t.game.handCount.replace("{n}", "3"));

    await page.locator("#btn-ready").click();

    for (let move = 0; move < 1000; move++) {
      if (!(await playOneMove(page))) break;
    }

    await expect(page.locator("#over")).toBeVisible();
    await expect(page.locator("#over h2")).toHaveText(lang.t.game.overH);
    // In a draw (endless loop) only players who got out are ranked, maybe not you.
    const draw = (await page.locator("#over-text").textContent()) === lang.t.game.stalemate;
    // Your name appears as plain text, never as HTML.
    if (!draw) await expect(page.locator("#ranking li.you")).toContainText(PLAYER);
    await expect(page.locator("#ranking b")).toHaveCount(0);
    const ranking = await page.locator("#ranking li").count();
    if (!draw) expect(ranking).toBe(bots + 1);

    // The game counts in the statistics: one game at this level and in total.
    const g = lang.t.game;
    const levelName = level === "easy" ? g.easy : g.normal;
    const statsRow = (name) => page.locator("#over table.stats tr", { has: page.locator(`th:text-is("${name}")`) }).locator("td");
    await expect(statsRow(levelName).first()).toHaveText("1");
    await expect(statsRow(g.statsTotal).first()).toHaveText("1");

    // Play again starts a fresh game with the same settings.
    await page.locator("#btn-again").click();
    await expect(page.locator("#over")).toBeHidden();
    await expect(page.locator("#opponents .opp")).toHaveCount(bots);
    await expect(page.locator("#btn-ready")).toBeVisible();
  });
}

test.describe("statistics", () => {
  const lang = byCode.de;
  const g = lang.t.game;
  const saved = { easy: { games: 3, wins: 1, shithead: 1 }, normal: { games: 5, wins: 2, shithead: 0 } };

  test("are hidden before the first game", async ({ page }) => {
    await openPlay(page, lang);
    await expect(page.locator("#setup table.stats")).toHaveCount(0);
  });

  test("are shown from this device and can be reset", async ({ page }) => {
    await page.addInitScript((stats) => {
      if (!sessionStorage.getItem("seeded")) {
        localStorage.setItem("game-stats", JSON.stringify(stats));
        sessionStorage.setItem("seeded", "1");
      }
    }, saved);
    await openPlay(page, lang);
    const rows = page.locator("#setup table.stats tbody tr");
    await expect(rows.nth(0).locator("td")).toHaveText(["3", "1", "1"]);
    await expect(rows.nth(1).locator("td")).toHaveText(["5", "2", "0"]);
    await expect(rows.nth(2).locator("td")).toHaveText(["8", "3", "1"]);
    await expect(page.locator("#setup .statsnote")).toContainText(g.statsNote);

    // Survives a reload.
    await page.reload();
    await expect(rows.nth(2).locator("td")).toHaveText(["8", "3", "1"]);

    // Reset asks first.
    page.once("dialog", (dialog) => dialog.dismiss());
    await page.locator("#setup [data-reset-stats]").click();
    await expect(rows.nth(2).locator("td")).toHaveText(["8", "3", "1"]);
    page.once("dialog", (dialog) => {
      expect(dialog.message()).toBe(g.statsConfirm);
      dialog.accept();
    });
    await page.locator("#setup [data-reset-stats]").click();
    await expect(page.locator("#setup table.stats")).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem("game-stats"))).toBeNull();
  });
});

test.describe("names", () => {
  for (const lang of languages) {
    test(`${lang.code}: four bot names, each with an alternative that is not taken`, () => {
      const pairs = lang.t.game.botNames.split(/\s*,\s*/).map((pair) => pair.split("/").map((n) => n.trim()));
      expect(pairs).toHaveLength(4);
      const all = pairs.flat();
      for (const pair of pairs) expect(pair).toHaveLength(2);
      expect(new Set(all).size, "all eight names differ").toBe(8);
    });
  }

  const opponents = async (page, lang, player) => {
    await openPlay(page, lang);
    await page.check('input[name=bots][value="4"]', { force: true });
    await page.locator("input[name=player]").fill(player);
    await page.locator("#setup-form button[type=submit]").click();
    return (await page.locator("#opponents .oppname").allTextContents()).map((n) => n.trim()).sort();
  };

  test("a bot with your name uses its alternative", async ({ page }) => {
    expect(await opponents(page, byCode.de, "Lukas")).toEqual(["Anna", "Jonas", "Lena", "Max"]);
  });

  test("names match regardless of case and accents", async ({ page }) => {
    expect(await opponents(page, byCode.es, "lucia")).toEqual(["Carmen", "Javier", "Marta", "Pablo"]);
  });

  test("without a name you are 'you', and your name is remembered", async ({ page }) => {
    await openPlay(page, byCode.de);
    await expect(page.locator("input[name=player]")).toHaveAttribute("placeholder", byCode.de.t.game.you);
    await page.locator("input[name=player]").fill("Kim");
    await page.locator("#setup-form button[type=submit]").click();
    await page.reload();
    await expect(page.locator("input[name=player]")).toHaveValue("Kim");
  });
});

test.describe("layout during a game", () => {
  // Where every area of the table is; must stay the same for the whole game.
  const areas = (page) =>
    page.evaluate(() => {
      const result = {};
      for (const selector of [".topbar", "#opponents", ".center", ".status", "#me", "#my-hand", ".controls", "#btn-play", "#btn-pickup"]) {
        const box = document.querySelector(selector).getBoundingClientRect();
        result[selector] = [box.x, box.y, box.width, box.height].map(Math.round).join(",");
      }
      return { result, scroll: document.documentElement.scrollHeight - window.innerHeight };
    });

  for (const [name, viewport] of [
    ["smallest phone", { width: 320, height: 568 }],
    ["tablet", { width: 768, height: 1024 }],
  ]) {
    test(`fits on one screen and nothing moves (${name}, 4 bots)`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.setViewportSize(viewport);
      await openPlay(page, byCode.de);
      await page.check('input[name=bots][value="4"]', { force: true });
      await page.locator("#setup-form button[type=submit]").click();

      const start = await areas(page);
      expect(start.scroll, "page scrolls").toBeLessThanOrEqual(0);
      await page.locator("#btn-ready").click();

      for (let move = 0; move < 25; move++) {
        if (!(await playOneMove(page))) break;
        const now = await areas(page);
        expect(now.scroll, `page scrolls after move ${move}`).toBeLessThanOrEqual(0);
        expect(now.result, `layout moved after move ${move}`).toEqual(start.result);
      }
    });
  }
});

test.describe("animations", () => {
  test.use({ reducedMotion: "no-preference" });

  test("cards fly and the table is clean again after every move", async ({ page }) => {
    test.setTimeout(120_000);
    await openPlay(page, byCode.de);
    await page.check('input[name=bots][value="1"]', { force: true });
    await page.locator("#setup-form button[type=submit]").click();
    await page.locator("#btn-ready").click();

    let sawFlyingCards = false;
    for (let move = 0; move < 12; move++) {
      // While a bot moves, copies of the cards fly over the table …
      for (let t = 0; t < 100 && !(await page.locator("#me.active").count()); t++) {
        if (await page.locator("#over").isVisible()) return;
        if (await page.locator("#fx .fxcard").count()) sawFlyingCards = true;
        await page.waitForTimeout(30);
      }
      // … and when it is your turn, they are gone and the pile is visible again.
      await expect(page.locator("#fx > *")).toHaveCount(0);
      await expect(page.locator("#pile")).toBeVisible();
      if (!(await playOneMove(page))) return;
    }
    expect(sawFlyingCards).toBe(true);
  });
});
