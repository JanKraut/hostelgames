// What is special about President. Head, menus, links, share box, narrow phones, tabs, fact sheet,
// FAQ, language redirect and 404 are tested for every game in @hostelgames/core/testing.
import { test, expect, open, siteTests } from "@hostelgames/core/testing";
import { languages, site } from "@hostelgames/core/game";

siteTests({ languages, site });

// Abschnitte der Regelseite, in der Reihenfolge der Seite.
const SECTIONS = ["setup", "how-to-play", "round-end", "swap", "variants", "faq"];

for (const lang of languages) {
  test(`${lang.code}: rules page with its header, all sections, card order and ranks`, async ({ page }) => {
    await open(page, lang);
    await expect(page.locator(".hero h1")).toHaveText(`${lang.t.rules.h1} ${lang.t.rules.h1sub}`);
    for (const id of SECTIONS) {
      const section = page.locator(`main section#${id}`);
      await expect(section, `section #${id}`).toHaveCount(1);
      await expect(section.locator("h2").first()).not.toBeEmpty();
    }
    const nav = await page.locator(".secnav a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(nav).toEqual(SECTIONS.map((id) => `#${id}`));
    // Every #link on this page points to a section (not just any element).
    const targets = await page.locator('a[href^="#"]').evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    for (const href of targets) await expect(page.locator(`section${href}`), href).toHaveCount(1);
    await expect(page.locator(".hero .goal")).toBeVisible();
    await expect(page.locator(".ranks .card")).toHaveCount(13);
    await expect(page.locator(".ladder li")).toHaveCount(5);
    await expect(page.locator(".variants li")).toHaveCount(7);
    await expect(page.locator(".faq details")).toHaveCount(8);
    await expect(page.locator(".hero #factsheet .fs-cards .card")).toHaveCount(2);
  });

  test(`${lang.code}: strategy page with its own texts, graphics and sections`, async ({ page }) => {
    const s = lang.t.strategy;
    await open(page, lang, "strategy/");
    await expect(page.locator(".hero h1")).toHaveText(s.h1);
    await expect(page.locator(".hero > .wrap > p").first()).toHaveText(s.sub);
    await expect(page.locator(".hero .fan .card")).toHaveCount(4);
    await expect(page.locator(".hero .goal")).toBeVisible();

    await expect(page.locator("#principle h2")).toHaveText(s.principleH);
    await expect(page.locator("#swap .strats li")).toHaveCount(s.give.length);
    await expect(page.locator("#swap .notup")).toBeVisible();
    await expect(page.locator(".swapex .sx-panel")).toHaveCount(2);
    await expect(page.locator(".swapex .sx-hand .card")).toHaveCount(6);
    await expect(page.locator(".swapex .sx-give .card.gold")).toHaveCount(2);
    await expect(page.locator(".swapex .sx-mini .card")).toHaveCount(3);
    for (const phase of s.phases) {
      await expect(page.locator(`#${phase.id} .strats li`)).toHaveCount(phase.items.length);
    }
    await expect(page.locator("#key-cards .sp")).toHaveCount(s.cards.length);
    await expect(page.locator("#mistakes .variants li")).toHaveCount(s.mistakes.length);
    await expect(page.locator("#next-steps .cta a")).toHaveText(`${s.ctaRulesBtn} →`);

    const nav = await page.locator(".secnav a").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(nav).toEqual(["#principle", "#swap", ...s.phases.map((p) => `#${p.id}`), "#key-cards", "#mistakes"]);
  });

  test(`${lang.code}: quick start page with cheat sheet, card order and swap`, async ({ page }) => {
    await open(page, lang, "quickstart/");
    await expect(page.locator(".hero h1")).toHaveText(lang.t.h1);
    await expect(page.locator(".cheat h2")).toHaveText(lang.t.quick.h);
    await expect(page.locator(".ch-ranks .ch-card")).toHaveCount(13);
    await expect(page.locator(".ch-rows li")).toHaveCount(3);
    await expect(page.locator(`#next-steps a[href$="${lang.path}strategy/"]`)).toBeVisible();
  });
}

test("next steps on the quick start lead back to the rules", async ({ page }) => {
  const de = languages.find((l) => l.code === "de");
  await open(page, de, "quickstart/");
  await page.locator("#next-steps a", { hasText: de.t.quick.ctaRulesBtn }).click();
  await expect(page).toHaveURL(/\/de\/$/);
});

test("no horizontal overflow in the dark theme either", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("theme", "dark"));
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 700 });
    for (const sub of ["./", "strategy/", "quickstart/"]) {
      await page.goto(sub);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${sub} (dark) at ${width}px`).toBeLessThanOrEqual(0);
    }
  }
});

test("the section navigation jumps to the section", async ({ page }) => {
  await page.goto("./");
  await page.locator('.secnav a[href="#swap"]').click();
  await expect(page).toHaveURL(/#swap$/);
  await expect(page.locator("section#swap h2")).toBeInViewport();
});
