// Online-Block (scoresheet/) von Schafkopf: Spiel eintragen, Spielwert (Schneider, Laufende, Verdopplung),
// Verteilung auf vier Spieler, Prüfung der Eingabe, Rückgängig, Endstand.
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

const group = (page, name) => page.locator("#sheet-dialog").getByRole("group", { name });

for (const lang of languages) {
  const s = lang.t.sheet;
  const P = (n) => s.playerDefault.replace("{n}", n);

  test(`${lang.code}: score sheet page with its own texts and tab`, async ({ page }) => {
    await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
    await page.goto(pathOf(lang));
    await expect(page).toHaveTitle(lang.t.seo.sheetT);
    await expect(page.locator(".hero h1")).toHaveText(s.h1);
    await expect(page.locator(".pagetabs a[aria-current=page]")).toHaveText(lang.t.pgSheet);
    // genau vier Spieler: nichts zum Hinzufügen oder Entfernen
    await expect(page.locator("#sheet-players input")).toHaveCount(4);
    await expect(page.locator("#sheet-add")).toBeHidden();
    await expect(page.locator("#sheet-players .sheet-icon")).toHaveCount(0);
    await expect(page.locator("#sheet-options input")).toHaveCount(3);
    const text = await page.locator("body").innerText();
    expect(text).not.toMatch(/undefined|\[object|\{\{|\{%|\{n\}/);
  });

  test(`${lang.code}: link from the rules page to the score sheet`, async ({ page }) => {
    await page.addInitScript((code) => localStorage.setItem("lang", code), lang.code);
    await page.goto(lang.path === "/" ? "./" : lang.path.slice(1));
    await expect(page.locator(".sheet-cta a")).toHaveAttribute("href", new RegExp(`${lang.path}scoresheet/$`));
  });

  test(`${lang.code}: game value, payout, undo and final score`, async ({ page }) => {
    await startGame(page, lang);
    await page.locator("#sheet-addround").click();
    const dialog = page.locator("#sheet-dialog");

    // Es fehlt noch etwas: Fehlermeldung, Dialog bleibt offen
    await dialog.getByRole("button", { name: s.saveRound }).click();
    await expect(page.locator("#sheet-dialog-error")).toHaveText(s.needPlayer);

    // Sauspiel: Spieler 1 mit Spieler 2, gewonnen, Schneider, drei Laufende = 1 + 1 + 3 = 5
    await group(page, s.playerQ).getByRole("button", { name: P(1) }).click();
    await dialog.getByRole("button", { name: s.saveRound }).click();
    await expect(page.locator("#sheet-dialog-error")).toHaveText(s.needPartner);
    await group(page, s.partnerQ).getByRole("button", { name: P(1) }).click();
    await dialog.getByRole("button", { name: s.saveRound }).click();
    await expect(page.locator("#sheet-dialog-error")).toHaveText(s.partnerSame);
    await group(page, s.partnerQ).getByRole("button", { name: P(2) }).click();
    await group(page, s.resultQ).getByRole("button", { name: s.won }).click();
    await group(page, s.cutQ).getByRole("button", { name: s.cutSchneider }).click();
    await dialog.locator("input[type=number]").fill("3");
    await expect(page.locator(".sheet-preview")).toHaveText(s.preview.replace("{value}", "5"));
    await dialog.getByRole("button", { name: s.saveRound }).click();
    await expect(dialog).toBeHidden();
    expect(await totals(page)).toEqual(["+5", "+5", "−5", "−5"]);

    // Solo von Spieler 3, verloren, verdoppelt (Kontra): 5 × 2 = 10, Alleinspieler zahlt 3 × 10
    await page.locator("#sheet-addround").click();
    await group(page, s.gameQ).getByRole("button", { name: s.gSolo }).click();
    await expect(dialog.locator(`[hidden] >> text=${s.partnerQ}`)).toHaveCount(1);
    await group(page, s.playerQ).getByRole("button", { name: P(3) }).click();
    await group(page, s.resultQ).getByRole("button", { name: s.lost }).click();
    await group(page, s.dblQ).getByRole("button", { name: "×2" }).click();
    await dialog.getByRole("button", { name: s.saveRound }).click();
    expect(await totals(page)).toEqual(["+15", "+15", "−35", "+5"]);

    // Rückgängig
    await page.locator("#sheet-undo").click();
    expect(await totals(page)).toEqual(["+5", "+5", "−5", "−5"]);

    // Nach dem Neuladen ist alles noch da; Endstand mit Gleichstand auf Platz 1
    await page.reload();
    expect(await totals(page)).toEqual(["+5", "+5", "−5", "−5"]);
    await page.locator("#sheet-finish").click();
    await expect(page.locator(".sheet-winner-label")).toHaveText(s.tie);
    await expect(page.locator(".sheet-winner-name")).toHaveText(`${P(1)} & ${P(2)}`);
    await expect(page.locator("#sheet-ranking li")).toHaveCount(4);
  });
}
