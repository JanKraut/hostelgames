// Tests for the hub link of a game (lib/site.js), without a browser.
// Run: npm test -w @hostelgames/core
import assert from "node:assert/strict";
import { test } from "node:test";
import { createSite } from "../lib/site.js";

const GAME = new URL("../../../games/shithead/game.json", import.meta.url);

function withEnv(env, fn) {
  const saved = { SITE_ORIGIN: process.env.SITE_ORIGIN, SITE_PATH_PREFIX: process.env.SITE_PATH_PREFIX };
  for (const [k, v] of Object.entries(env)) if (v === undefined) delete process.env[k]; else process.env[k] = v;
  try {
    return fn();
  } finally {
    for (const [k, v] of Object.entries(saved)) if (v === undefined) delete process.env[k]; else process.env[k] = v;
  }
}

test("own domain links to hostelgames.com, in the hub's languages", () => {
  const site = withEnv({ SITE_ORIGIN: "https://shitheadgame.de", SITE_PATH_PREFIX: "/" }, () => createSite(GAME));
  assert.equal(site.hubUrl("en"), "https://hostelgames.com/");
  assert.equal(site.hubUrl("de"), "https://hostelgames.com/de/");
  // A language the hub does not have falls back to the English start page.
  assert.equal(site.hubUrl("pl"), "https://hostelgames.com/");
});

test("GitHub Pages preview links to the hub preview", () => {
  const site = withEnv({ SITE_ORIGIN: undefined, SITE_PATH_PREFIX: undefined }, () => createSite(GAME));
  assert.equal(site.hubUrl("en"), "https://jankraut.github.io/hostelgames/");
  assert.equal(site.hubUrl("de"), "https://jankraut.github.io/hostelgames/de/");
});
