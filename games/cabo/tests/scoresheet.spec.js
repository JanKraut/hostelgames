// Online-Block (scoresheet/) von Cabo: Runden eintragen, Ansager, Summen, die Strafe, genau 100, Rückgängig,
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
    // Setup: Punktegrenze, Strafe, die 100-Punkte-Regel
    await expect(page.locator("#sheet-options input")).toHaveCount(3);
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/undefined|\[object|\{\{|\{%|\{n\}/);
  });

  test(`${lang.code}: link from the rules page to the score sheet`, async ({ page }) => {
    await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
    await page.goto(lang.path === "/" ? "./" : lang.path.slice(1));
    await expect(page.locator(".sheet-cta a")).toHaveAttribute("href", new RegExp(`${lang.path}scoresheet/$`));
  });

  test(`${lang.code}: rounds, caller penalty, exactly 100, undo and final score`, async ({ page }) => {
    await startGame(page, lang);
    await expect(page.locator("#sheet-table tbody tr.sheet-empty")).toBeVisible();

    // Ansager hat die niedrigste Summe: 0 Punkte, die anderen schreiben ihre Summe.
    await addRound(page, lang, [6, 12, 8], 0);
    expect(await totals(page)).toEqual(["0", "12", "8"]);
    // Ansager ist nicht der Niedrigste: seine Summe plus 10.
    await addRound(page, lang, [20, 5, 9], 0);
    expect(await totals(page)).toEqual(["30", "17", "17"]);
    // Genau 100: Punktestand fällt auf 50 (einmal pro Spieler).
    await addRound(page, lang, [70, 0, 0]);
    expect(await totals(page)).toEqual(["50", "17", "17"]);
    await expect(page.locator(".sheet-notice")).toHaveCount(0);
    await expect(page.locator(".sheet-mark")).toHaveCount(2);

    // Rückgängig nimmt die letzte Änderung zurück
    await page.locator("#sheet-undo").click();
    expect(await totals(page)).toEqual(["30", "17", "17"]);

    // Über der Grenze: Hinweis, Spiel zu Ende
    await addRound(page, lang, [80, 1, 2]);
    expect(await totals(page)).toEqual(["110", "18", "19"]);
    await expect(page.locator(".sheet-notice")).toContainText(P(1));

    // Runde korrigieren: antippen, Wert ändern
    await page.locator('[data-round="2"] button').first().click();
    await page.locator("#sheet-dialog input").first().fill("10");
    await page.getByRole("button", { name: s.saveRound }).click();
    expect(await totals(page)).toEqual(["40", "18", "19"]);

    // Speichern im Browser: nach dem Neuladen ist alles noch da
    await page.reload();
    await expect(page.locator("#sheet-game")).toBeVisible();
    expect(await totals(page)).toEqual(["40", "18", "19"]);

    // Endstand: wer am wenigsten hat, gewinnt
    await page.locator("#sheet-finish").click();
    await expect(page.locator("#sheet-result")).toBeVisible();
    await expect(page.locator(".sheet-winner-name")).toHaveText(P(2));
    await expect(page.locator("#sheet-ranking li")).toHaveCount(3);
  });

  test(`${lang.code}: input is checked`, async ({ page }) => {
    await startGame(page, lang);
    await page.locator("#sheet-addround").click();
    await page.locator("#sheet-dialog input").nth(0).fill("5");
    await page.getByRole("button", { name: s.saveRound }).click();
    await expect(page.locator("#sheet-dialog-error")).not.toBeEmpty();
    await expect(page.locator("#sheet-dialog")).toBeVisible();
  });
}
