// Tests for sitemap.xml and robots.txt (lib/sitemap.js), without a browser.
// Run: npm test -w @hostelgames/core
import assert from "node:assert/strict";
import { test } from "node:test";
import { visibleGames } from "../lib/games.js";
import { languageList } from "../lib/languages.js";
import { createSite } from "../lib/site.js";
import { createSitemap } from "../lib/sitemap.js";

const SHITHEAD = new URL("../../../games/shithead/game.json", import.meta.url);
const KNIFFEL = new URL("../../../games/kniffel/game.json", import.meta.url);
const ASSHOLE = new URL("../../../games/asshole/game.json", import.meta.url);

function withEnv(env, fn) {
  const saved = { SITE_ORIGIN: process.env.SITE_ORIGIN, SITE_PATH_PREFIX: process.env.SITE_PATH_PREFIX };
  for (const [k, v] of Object.entries(env)) if (v === undefined) delete process.env[k]; else process.env[k] = v;
  try {
    return fn();
  } finally {
    for (const [k, v] of Object.entries(saved)) if (v === undefined) delete process.env[k]; else process.env[k] = v;
  }
}

test("hub on hostelgames.com includes its own pages and live games without own domain", () => {
  const site = withEnv({ SITE_ORIGIN: "https://hostelgames.com", SITE_PATH_PREFIX: "/" }, () => createSite(null));
  const languages = languageList(["en", "de"], site.origin + site.pathPrefix);
  const hostedGames = visibleGames(site).filter((game) => !game.domain);
  const Sitemap = createSitemap(site, languages, { games: hostedGames });
  const instance = new Sitemap();

  assert.deepEqual(instance.data().files, ["sitemap.xml", "robots.txt"]);

  const robots = instance.render({ file: "robots.txt" });
  assert.equal(robots, "User-agent: *\nAllow: /\n\nSitemap: https://hostelgames.com/sitemap.xml\n");

  const xml = instance.render({ file: "sitemap.xml" });
  // Hub start pages
  assert.match(xml, /<loc>https:\/\/hostelgames\.com\/<\/loc>/);
  assert.match(xml, /<loc>https:\/\/hostelgames\.com\/de\/<\/loc>/);
  // Hosted live game (Kniffel): all pages and languages (including BCP 47 hreflang)
  assert.match(xml, /<loc>https:\/\/hostelgames\.com\/kniffel\/<\/loc>/);
  assert.match(xml, /<loc>https:\/\/hostelgames\.com\/kniffel\/de\/scoresheet\/<\/loc>/);
  assert.match(xml, /<xhtml:link rel="alternate" hreflang="pt-BR" href="https:\/\/hostelgames\.com\/kniffel\/pt-br\/strategy\/"\/>/);
  assert.match(xml, /<xhtml:link rel="alternate" hreflang="x-default" href="https:\/\/hostelgames\.com\/kniffel\/scoresheet\/"\/>/);
  // Games with their own domain or still draft must not be in the hub sitemap
  assert.doesNotMatch(xml, /shithead/);
  assert.doesNotMatch(xml, /kingscup/);
  assert.doesNotMatch(xml, /maumau/);
  assert.doesNotMatch(xml, /asshole/);

  const expectedCount = languages.length + hostedGames.reduce((sum, g) => sum + g.pages.length * g.languages.length, 0);
  assert.equal((xml.match(/<url>/g) ?? []).length, expectedCount);
});

test("live game with own domain gets its own sitemap.xml and robots.txt", () => {
  const site = withEnv({ SITE_ORIGIN: "https://shitheadgame.de", SITE_PATH_PREFIX: "/" }, () => createSite(SHITHEAD));
  const languages = languageList(site.game.languages, site.origin + site.pathPrefix);
  const Sitemap = createSitemap(site, languages);
  const instance = new Sitemap();

  assert.deepEqual(instance.data().files, ["sitemap.xml", "robots.txt"]);
  assert.equal(instance.render({ file: "robots.txt" }), "User-agent: *\nAllow: /\n\nSitemap: https://shitheadgame.de/sitemap.xml\n");

  const xml = instance.render({ file: "sitemap.xml" });
  assert.match(xml, /<loc>https:\/\/shitheadgame\.de\/<\/loc>/);
  assert.match(xml, /<loc>https:\/\/shitheadgame\.de\/de\/play\/<\/loc>/);
  assert.equal((xml.match(/<url>/g) ?? []).length, site.game.pages.length * site.game.languages.length);
});

test("live game without own domain (below hostelgames.com) gets neither sitemap.xml nor robots.txt", () => {
  const site = withEnv({ SITE_ORIGIN: "https://hostelgames.com", SITE_PATH_PREFIX: "/kniffel/" }, () => createSite(KNIFFEL));
  const languages = languageList(site.game.languages, site.origin + site.pathPrefix);
  const Sitemap = createSitemap(site, languages);
  assert.deepEqual(new Sitemap().data().files, []);
});

test("draft game with own domain gets neither sitemap.xml nor robots.txt", () => {
  const site = withEnv({ SITE_ORIGIN: "https://assholegame.de", SITE_PATH_PREFIX: "/" }, () => createSite(ASSHOLE));
  const languages = languageList(site.game.languages, site.origin + site.pathPrefix);
  const Sitemap = createSitemap(site, languages);
  assert.deepEqual(new Sitemap().data().files, []);
});

test("GitHub Pages preview gets neither sitemap.xml nor robots.txt", () => {
  const hubSite = withEnv({ SITE_ORIGIN: undefined, SITE_PATH_PREFIX: undefined }, () => createSite(null));
  const hubLangs = languageList(["en", "de"], hubSite.origin + hubSite.pathPrefix);
  assert.deepEqual(new (createSitemap(hubSite, hubLangs, { games: visibleGames(hubSite) }))().data().files, []);

  const gameSite = withEnv({ SITE_ORIGIN: undefined, SITE_PATH_PREFIX: undefined }, () => createSite(SHITHEAD));
  const gameLangs = languageList(gameSite.game.languages, gameSite.origin + gameSite.pathPrefix);
  assert.deepEqual(new (createSitemap(gameSite, gameLangs))().data().files, []);
});
