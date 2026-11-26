// Tests for game.json (lib/games.js) and the languages (lib/languages.js), without a browser.
// Run: npm test -w @hostelgames/core
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import games, { readGame, visibleGames } from "../lib/games.js";
import { createLanguages } from "../lib/languages.js";

const BASE = {
  slug: "kniffel",
  name: "Kniffel",
  tagline: "Test",
  category: "dice",
  status: "draft",
  languages: ["en", "de"],
  pages: ["rules"],
};

/** Writes a game folder with game.json and the given templates in src/, returns the game.json path. */
function gameDir(json, templates = ["index.njk"], texts = {}) {
  const dir = mkdtempSync(join(tmpdir(), "game-"));
  mkdirSync(join(dir, "src/_data/i18n"), { recursive: true });
  for (const file of templates) writeFileSync(join(dir, "src", file), "");
  for (const [code, content] of Object.entries(texts)) writeFileSync(join(dir, `src/_data/i18n/${code}.json`), JSON.stringify(content));
  writeFileSync(join(dir, "game.json"), JSON.stringify(json));
  return join(dir, "game.json");
}

test("a minimal draft game is valid; folder without domain is the slug", () => {
  const game = readGame(gameDir(BASE));
  assert.equal(game.path, "kniffel");
  assert.deepEqual(game.related, []);
});

test("folder = domain without its ending", () => {
  assert.equal(readGame(gameDir({ ...BASE, domain: "https://kniffelgame.de" })).path, "kniffelgame");
});

for (const [what, change, message] of [
  ["category missing", { category: undefined }, /"category"/],
  ["unknown category", { category: "board" }, /"category" must be one of cards, dice, drinking/],
  ["status missing",{ status: undefined }, /"status"/],
  ["unknown status", { status: "beta" }, /"status"/],
  ["languages as a number", { languages: 15 }, /"languages" must be a list/],
  ["unknown language", { languages: ["en", "de", "xx"] }, /unknown language "xx"/],
  ["without German", { languages: ["en"] }, /must contain "de"/],
  ["language twice", { languages: ["en", "de", "de"] }, /twice/],
  ["unknown page", { pages: ["rules", "faq"] }, /unknown page "faq"/],
  ["without rules", { pages: [] }, /must contain "rules"/],
  ["path set by hand", { path: "foo" }, /remove "path"/],
  ["bad players", { players: { min: 4, max: 2 } }, /"players"/],
  ["bad alternateName", { alternateName: "Shithead" }, /"alternateName"/],
]) {
  test(`error: ${what}`, () => {
    assert.throws(() => readGame(gameDir({ ...BASE, ...change })), message);
  });
}

test("pages and templates must agree, both ways", () => {
  assert.throws(() => readGame(gameDir({ ...BASE, pages: ["rules", "play"] })), /src\/play\.njk is missing/);
  assert.throws(() => readGame(gameDir(BASE, ["index.njk", "play.njk"])), /"pages" must contain "play"/);
  assert.ok(readGame(gameDir({ ...BASE, pages: ["rules", "play"] }, ["index.njk", "play.njk"])));
  assert.ok(readGame(gameDir({ ...BASE, pages: ["rules", "scoresheet"] }, ["index.njk", "scoresheet.njk"])));
});

test("factsheet: scales with two info texts and 0–100, two groups of 1–3 people", () => {
  const ok = { scales: [["luck", "skill", 35], ["easy", "complex", 0]], people: [1, 3] };
  assert.ok(readGame(gameDir({ ...BASE, factsheet: ok })));
  assert.ok(readGame(gameDir({ ...BASE, factsheet: { ...ok, id: "steckbrief" } })));
  assert.throws(() => readGame(gameDir({ ...BASE, factsheet: { ...ok, scales: [["luck", "skill", 120]] } })), /factsheet\.scales/);
  assert.throws(() => readGame(gameDir({ ...BASE, factsheet: { ...ok, people: [2] } })), /factsheet\.people/);
  assert.throws(() => readGame(gameDir({ ...BASE, factsheet: { ...ok, id: "Fact Sheet" } })), /factsheet\.id/);
});

test("languages: codes from game.json, menu order and flags from the core, texts with fallback", () => {
  const file = gameDir({ ...BASE, languages: ["de", "en", "es-419"] }, ["index.njk"], {
    en: { title: "Rules", more: "More" },
    de: { title: "Regeln" },
    "es-419": { title: "Reglas" },
  });
  const site = { origin: "https://example.com", pathPrefix: "/", game: readGame(file) };
  const langs = createLanguages(site, pathToFileURL(file.replace("game.json", "src/_data/i18n/")));
  assert.deepEqual(langs.map((l) => l.code), ["en", "de", "es-419"]); // core order, English first
  assert.equal(langs[1].flag, "🇩🇪");
  assert.equal(langs[1].t.title, "Regeln");
  assert.equal(langs[1].t.more, "More"); // missing text → English
  assert.deepEqual(langs[2].fallback, []); // es is not offered, so English fills the gap
  assert.equal(langs[2].htmlLang, "es-419");
  assert.equal(langs[1].url, "https://example.com/de/");
});

test("the games in this repo are valid, drafts are hidden live", () => {
  const all = games();
  assert.ok(all.some((game) => game.slug === "shithead"));
  const live = visibleGames({ indexable: true });
  assert.ok(live.every((game) => game.status === "live"));
  assert.equal(visibleGames({ indexable: false }).length, all.length);
});
