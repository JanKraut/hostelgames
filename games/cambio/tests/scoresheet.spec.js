// Online-Block (scoresheet/) von Cambio: Runden eintragen, Ansager, Summen, negative Summen, Rückgängig,
// Speichern im Browser, Endstand.
import { test, expect } from "@hostelgames/core/testing";
import { languages } from "@hostelgames/core/game";

const pathOf = (lang) => `${lang.path === "/" ? "" : lang.path.slice(1)}scoresheet/`;
const totals = (page) => page.locator("#sheet-table tbody tr.sheet-total td").allInnerTexts();

async function startGame(page, lang) {
  await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
  await page.goto(pathOf(lang));
  await page.getByRole("button", { name: lang.t.sheet.start }).click();
  await expect(page.locator("#sheet-game")).toBeVisible();
}

/** Eine Runde eintragen: Summen je Spieler, Ansager (Nummer, -1 = niemand). */
async function addRound(page, lang, values, caller = -1) {
  await page.locator("#sheet-addround").click();
  const dialog = page.locator("#sheet-dialog");
  await expect(dialog).toBeVisible();
  for (let i = 0; i < values.length; i++) await dialog.locator("input").nth(i).fill(String(values[i]));
  const who = dialog.getByRole("group", { name: lang.t.sheet.who });
  await who.locator("button").nth(caller + 1).click();
  await dialog.getByRole("button", { name: lang.t.sheet.saveRound }).click();
  await expect(dialog).toBeHidden();
}

for (const lang of languages) {
  const s = lang.t.sheet;
  const P = (n) => s.playerDefault.replace("{n}", n);

  test(`${lang.code}: score sheet page with its own texts and tab`, async ({ page }) => {
    await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
    await page.goto(pathOf(lang));
    await expect(page).toHaveTitle(lang.t.seo.sheetT);
    await expect(page.locator(".hero h1")).toHaveText(s.h1);
    await expect(page.locator(".pagetabs a[aria-current=page]")).toHaveText(lang.t.pgSheet);
    await expect(page.locator("#sheet-players input")).toHaveCount(3);
    // Setup: Punktegrenze, Strafe
    await expect(page.locator("#sheet-options input")).toHaveCount(2);
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/undefined|\[object|\{\{|\{%|\{n\}/);
  });

  test(`${lang.code}: link from the rules page to the score sheet`, async ({ page }) => {
    await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
    await page.goto(lang.path === "/" ? "./" : lang.path.slice(1));
    await expect(page.locator(".sheet-cta a")).toHaveAttribute("href", new RegExp(`${lang.path}scoresheet/$`));
  });

  test(`${lang.code}: negative totals, caller without penalty, game over and final score`, async ({ page }) => {
    await startGame(page, lang);
    // Roter König zählt −1: Summen dürfen negativ sein. Ansager ohne Strafe (Standard 0): eigene Summe.
    await addRound(page, lang, [3, -1, 5], 0);
    expect(await totals(page)).toEqual(["3", "−1", "5"]);
    await addRound(page, lang, [2, 2, 2], 1);
    expect(await totals(page)).toEqual(["5", "1", "7"]);
    await expect(page.locator(".sheet-mark")).toHaveCount(2);

    await page.locator("#sheet-undo").click();
    expect(await totals(page)).toEqual(["3", "−1", "5"]);

    // Strafe einstellen: neues Spiel mit 10 Strafpunkten, Ansager mit gleicher Summe verliert
    await page.locator("#sheet-new").click();
    await page.locator("#sheet-opt-penalty").fill("10");
    await page.getByRole("button", { name: s.start }).click();
    await addRound(page, lang, [4, 4, 9], 0);
    expect(await totals(page)).toEqual(["14", "4", "9"]);

    // Über der Grenze: Hinweis, dann Endstand
    await addRound(page, lang, [90, 1, 1]);
    await expect(page.locator(".sheet-notice")).toContainText(P(1));
    await page.locator("#sheet-finish").click();
    await expect(page.locator(".sheet-winner-name")).toHaveText(P(2));
  });
}
