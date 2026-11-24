import { test as base, expect } from "@playwright/test";
import languages from "../src/_data/languages.js";

// Online-Block (scoresheet/): Spieler anlegen, eintragen, Summen und Bonus, Rückgängig,
// Speichern im Browser, Abrechnung. Jeder Test scheitert bei einem JavaScript-Fehler.
const test = base.extend({
  page: async ({ page }, use) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await use(page);
    expect(errors, "JavaScript errors on the page").toEqual([]);
  },
});

const pathOf = (lang) => `${lang.path === "/" ? "" : lang.path.slice(1)}scoresheet/`;
// Zeilen im tbody: 0 Abschnitt oben, 1–6 Einser–Sechser, 7 Summe oben, 8 Bonus,
// 9 Abschnitt unten, 10–16 Dreierpasch–Chance, 17 Summe unten, 18 Gesamt
const ROW = { ones: 1, twos: 2, threes: 3, fours: 4, fives: 5, sixes: 6, upperSum: 7, bonus: 8, three: 10, four: 11, full: 12, small: 13, kniffel: 15, chance: 16, lowerSum: 17, total: 18 };
const cell = (page, row, player) => page.locator("#sheet-table tbody tr").nth(row).locator("td").nth(player);

async function startGame(page, lang, names) {
  await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
  await page.goto(pathOf(lang));
  const inputs = page.locator("#sheet-players input");
  for (let i = 0; i < names.length; i++) {
    if (i >= 2) await page.click("#sheet-add");
    await inputs.nth(i).fill(names[i]);
  }
  await page.getByRole("button", { name: lang.t.sheet.start }).click();
  await expect(page.locator("#sheet-game")).toBeVisible();
}

/** Feld antippen und im Dialog einen Knopf wählen (Text) oder eine Summe eintragen (Zahl). */
async function enter(page, row, player, choice) {
  await cell(page, row, player).locator("button").click();
  const dialog = page.locator("#sheet-dialog");
  await expect(dialog).toBeVisible();
  if (typeof choice === "number") {
    await dialog.locator("input").fill(String(choice));
    await dialog.locator("button[type=submit]").click();
  } else {
    await dialog.locator("button", { hasText: choice }).first().click();
  }
  await expect(dialog).toBeHidden();
}

for (const lang of languages) {
  const s = lang.t.sheet;

  test(`${lang.code}: score sheet page with its own texts and tab`, async ({ page }) => {
    await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
    await page.goto(pathOf(lang));
    await expect(page).toHaveTitle(lang.t.seo.sheetT);
    await expect(page.locator(".hero h1")).toHaveText(s.h1);
    await expect(page.locator(".pagetabs a[aria-current=page]")).toHaveText(lang.t.pgSheet);
    await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", `${lang.url}scoresheet/`);
    await expect(page.locator("#sheet-players input")).toHaveCount(2);
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/undefined|\[object|\{\{|\{%|\{n\}/);
  });

  test(`${lang.code}: rules page links to the score sheet`, async ({ page }) => {
    await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
    await page.goto(lang.path === "/" ? "./" : lang.path.slice(1));
    await page.locator(".sheet-cta a").click();
    await expect(page.locator("#sheet-setup")).toBeVisible();
  });
}

const [en] = languages;
const s = en.t.sheet;

test("totals, bonus, strike and undo", async ({ page }) => {
  await startGame(page, en, ["Jan", "Lea"]);
  await expect(page.locator("#sheet-table thead th.turn")).toContainText("Jan");

  // Jan: 3 × 3, 3 × 5, 4 × 6 → 9 + 15 + 24 = 48, noch 15 bis zum Bonus
  await enter(page, ROW.threes, 0, "3 ×");
  await enter(page, ROW.fives, 0, "3 ×");
  await enter(page, ROW.sixes, 0, "4 ×");
  await expect(cell(page, ROW.upperSum, 0)).toHaveText("48");
  await expect(cell(page, ROW.bonus, 0)).toHaveText(s.bonusLeft.replace("{n}", "15"));
  // Lea ist dran, sobald Jan mehr Felder hat
  await expect(page.locator("#sheet-table thead th.turn")).toContainText("Lea");

  // 63 erreicht: Bonus 35
  await enter(page, ROW.ones, 0, "3 ×");
  await enter(page, ROW.fours, 0, "3 ×");
  await expect(cell(page, ROW.upperSum, 0)).toHaveText("63");
  await expect(cell(page, ROW.bonus, 0)).toHaveText("35");

  // Unten: Summe, feste Punkte, streichen
  await enter(page, ROW.three, 0, 22);
  await enter(page, ROW.full, 0, s.got.replace("{points}", "25"));
  await enter(page, ROW.kniffel, 0, s.strike);
  await expect(cell(page, ROW.kniffel, 0)).toHaveText("0");
  await expect(cell(page, ROW.lowerSum, 0)).toHaveText("47");
  await expect(cell(page, ROW.total, 0)).toHaveText(String(63 + 35 + 47));

  // Ungültige Summe wird abgelehnt
  await cell(page, ROW.chance, 1).locator("button").click();
  await page.locator("#sheet-dialog input").fill("31");
  await page.locator("#sheet-dialog button[type=submit]").click();
  await expect(page.locator("#sheet-dialog-error")).toHaveText(s.sumInvalid);
  await page.locator("#sheet-dialog-cancel").click();

  // Rückgängig nimmt den letzten Eintrag zurück
  await page.click("#sheet-undo");
  await expect(cell(page, ROW.kniffel, 0)).toHaveText("");
  await expect(cell(page, ROW.total, 0)).toHaveText(String(63 + 35 + 47));
});

test("upper section: the number of dice is multiplied by the face", async ({ page }) => {
  await startGame(page, en, ["Jan"]);
  // 4 × Zweier = 8 Punkte (nicht 4)
  await enter(page, ROW.twos, 0, "4 ×");
  await expect(cell(page, ROW.twos, 0)).toHaveText("8");
  await expect(cell(page, ROW.upperSum, 0)).toHaveText("8");
});

test("four of a kind: pick the number and the fifth die", async ({ page }) => {
  await startGame(page, en, ["Jan"]);
  await cell(page, ROW.four, 0).locator("button").click();
  const dialog = page.locator("#sheet-dialog");
  // Ohne Auswahl kein Eintrag
  await dialog.locator("button[type=submit]").click();
  await expect(page.locator("#sheet-dialog-error")).toHaveText(s.quadMissing);
  await dialog.locator(".sheet-dice").nth(0).getByRole("button", { name: "5", exact: true }).click();
  await dialog.locator(".sheet-dice").nth(1).getByRole("button", { name: "2", exact: true }).click();
  await expect(dialog.locator(".sheet-quad-total")).toHaveText(s.quadTotal.replace("{four}", "5").replace("{fifth}", "2").replace("{n}", "22"));
  await dialog.locator("button[type=submit]").click();
  await expect(cell(page, ROW.four, 0)).toHaveText("22");
});

test("short hints under the lower boxes, not under the two of-a-kind boxes", async ({ page }) => {
  await startGame(page, en, ["Jan"]);
  const label = (row) => page.locator("#sheet-table tbody tr").nth(row).locator("th small");
  await expect(label(ROW.small)).toHaveText(s.hintSmall);
  await expect(label(ROW.full)).toHaveText(s.hintFull);
  await expect(label(ROW.chance)).toHaveText(s.hintChance);
  await expect(label(ROW.three)).toHaveCount(0);
  await expect(label(ROW.four)).toHaveCount(0);
});

test("the game is kept in the browser and can be resumed", async ({ page }) => {
  await startGame(page, en, ["Jan", "Lea", "Tom"]);
  await enter(page, ROW.sixes, 2, "3 ×");
  await page.reload();
  await expect(page.locator("#sheet-game")).toBeVisible();
  await expect(cell(page, ROW.sixes, 2)).toHaveText("18");
  // Über „Neues Spiel“ steht es in der Liste der letzten Spiele
  await page.click("#sheet-new");
  await expect(page.locator("#sheet-recent-list li")).toHaveCount(1);
  await expect(page.locator("#sheet-recent-list li")).toContainText("Jan, Lea, Tom");
  await page.locator("#sheet-recent-list li").getByRole("button", { name: s.resume }).click();
  await expect(cell(page, ROW.sixes, 2)).toHaveText("18");
});

test("final score: ranking and winner", async ({ page }) => {
  await startGame(page, en, ["Jan", "Lea"]);
  await enter(page, ROW.chance, 0, 20);
  await enter(page, ROW.chance, 1, 27);
  page.once("dialog", (d) => d.accept());
  await page.click("#sheet-finish");
  await expect(page.locator("#sheet-result")).toBeVisible();
  await expect(page.locator(".sheet-winner-name")).toHaveText("Lea");
  await expect(page.locator("#sheet-ranking li")).toHaveCount(2);
  await expect(page.locator("#sheet-ranking li").first()).toContainText("27");
  // Nach dem Neuladen bleibt die Abrechnung, „Zurück zum Block“ öffnet das Spiel wieder
  await page.reload();
  await expect(page.locator("#sheet-setup")).toBeVisible();
  await expect(page.locator("#sheet-recent-list li")).toContainText(s.finished.replace("{name}", "Lea").replace("{points}", "27"));
});

test("up to 8 players", async ({ page }) => {
  await page.goto(pathOf(en));
  for (let i = 0; i < 10; i++) if (await page.locator("#sheet-add").isVisible()) await page.click("#sheet-add");
  await expect(page.locator("#sheet-players input")).toHaveCount(8);
  await expect(page.locator("#sheet-add")).toBeHidden();
});

test("no horizontal page overflow on a narrow phone, even with 8 players", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto(pathOf(en));
  for (let i = 0; i < 6; i++) await page.click("#sheet-add");
  await page.getByRole("button", { name: s.start }).click();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
