// Tests for the header menu (lib/nav.js, i18n/), without a browser.
// Run: npm test -w @hostelgames/core
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import games from "../lib/games.js";
import { createNav, navTexts, POPULAR } from "../lib/nav.js";
import { LANGUAGES } from "../lib/languages.js";
import { createSite } from "../lib/site.js";

const GAME = new URL("../../../games/shithead/game.json", import.meta.url);
const KNIFFEL = new URL("../../../games/kniffel/game.json", import.meta.url);
const read = (code) => JSON.parse(readFileSync(new URL(`../i18n/${code}.json`, import.meta.url), "utf8"));

function withEnv(env, fn) {
  const saved = { SITE_ORIGIN: process.env.SITE_ORIGIN, SITE_PATH_PREFIX: process.env.SITE_PATH_PREFIX };
  for (const [k, v] of Object.entries(env)) if (v === undefined) delete process.env[k]; else process.env[k] = v;
  try {
    return fn();
  } finally {
    for (const [k, v] of Object.entries(saved)) if (v === undefined) delete process.env[k]; else process.env[k] = v;
  }
}

test("header texts: every language complete, regional variants only store what differs", () => {
  const keys = Object.keys(read("en")).sort();
  for (const { code, fallback } of LANGUAGES) {
    const own = read(code);
    for (const value of Object.values(own)) assert.ok(value.trim(), code);
    for (const key of Object.keys(own)) assert.ok(keys.includes(key), `${code}: unknown key ${key}`);
    if (!fallback) assert.deepEqual(Object.keys(own).sort(), keys, code);
  }
  assert.equal(navTexts("de").navAll, "Alle Spiele");
  assert.equal(navTexts("es-419").navAll, "Todos los juegos");
  assert.equal(navTexts("es-419").navPlay, "Jugar en línea");
});

test("every game under Popular exists", () => {
  const slugs = games().map((game) => game.slug);
  for (const slug of POPULAR) assert.ok(slugs.includes(slug), slug);
});

test("own domain: links to other live games and to hostelgames.com, drafts left out", () => {
  const site = withEnv({ SITE_ORIGIN: "https://shitheadgame.de", SITE_PATH_PREFIX: "/" }, () => createSite(GAME));
  const all = [
    { slug: "shithead", name: "Shithead", path: "shitheadgame", domain: "https://shitheadgame.de", languages: ["en", "de"], pages: ["rules", "play"] },
    { slug: "kniffel", name: "Kniffel", path: "kniffel", languages: ["en", "de"], pages: ["rules", "scoresheet"] },
    { slug: "cabo", name: "Cabo", path: "cabogame", domain: "https://cabogame.de", languages: ["en"], pages: ["rules"] },
  ];
  const links = createNav(site, all).links("de");
  assert.equal(links.hub, "https://hostelgames.com/de/");
  assert.equal(links.categories[1].href, "https://hostelgames.com/de/#dice");
  // Overview pages come later: for now the hub.
  assert.equal(links.play, "https://hostelgames.com/de/");
  assert.equal(links.sheets, "https://hostelgames.com/de/");
  // Cabo has no German page: its English one.
  assert.deepEqual(links.popular, [
    { name: "Shithead", href: "https://shitheadgame.de/de/", current: true },
    { name: "Cabo", href: "https://cabogame.de/", current: false },
  ]);
  assert.deepEqual(links.random, ["https://hostelgames.com/kniffel/de/", "https://cabogame.de/"]);
});

test("live: only games with status live are linked", () => {
  const site = withEnv({ SITE_ORIGIN: "https://hostelgames.com", SITE_PATH_PREFIX: "/kniffel/" }, () => createSite(KNIFFEL));
  const live = games().filter((game) => game.status === "live").map((game) => game.name);
  for (const { name } of createNav(site).links("en").popular) assert.ok(live.includes(name), name);
});

test("preview: every game, on GitHub Pages", () => {
  const site = withEnv({ SITE_ORIGIN: undefined, SITE_PATH_PREFIX: undefined }, () => createSite(KNIFFEL));
  const all = [
    { slug: "a", name: "A", path: "a", languages: ["en"], pages: ["rules", "play"] },
    { slug: "b", name: "B", path: "b", languages: ["en"], pages: ["rules", "play"] },
  ];
  const links = createNav(site, all).links("en");
  assert.equal(links.play, "https://jankraut.github.io/hostelgames/");
  assert.deepEqual(links.random, ["https://jankraut.github.io/hostelgames/a/", "https://jankraut.github.io/hostelgames/b/"]);
});
