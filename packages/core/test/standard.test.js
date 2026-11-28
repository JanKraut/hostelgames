// Tests for the standard texts (i18n/standard/) and how they are merged with a site's texts.
// Run: npm test -w @hostelgames/core
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import { createLanguages, LANGUAGES, STANDARD_TEXTS, standardTexts } from "../lib/languages.js";

/** Flattens {a: "x", info: {b: "y"}} to {"a": "x", "info.b": "y"}. */
const flatten = (object, prefix = "") =>
  Object.entries(object).reduce(
    (flat, [key, value]) => (value && typeof value === "object" ? { ...flat, ...flatten(value, `${prefix}${key}.`) } : { ...flat, [prefix + key]: value }),
    {},
  );

test("standard texts: en and de complete, other languages only known texts, regional variants only what differs", () => {
  const english = flatten(standardTexts("en"));
  const keys = Object.keys(english).sort();
  assert.ok(keys.includes("shBtn") && keys.includes("info.luck"));
  assert.deepEqual(Object.keys(flatten(standardTexts("de"))).sort(), keys);

  const codes = LANGUAGES.map((lang) => lang.code);
  for (const file of readdirSync(STANDARD_TEXTS)) assert.ok(codes.includes(file.replace(/\.json$/, "")), `unknown language ${file}`);

  const placeholders = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");
  for (const { code, fallback = [] } of LANGUAGES) {
    const own = flatten(standardTexts(code));
    for (const [key, value] of Object.entries(own)) {
      assert.ok(key in english, `${code}: unknown text ${key}`);
      assert.ok(typeof value === "string" && value.trim(), `${code} › ${key}: empty`);
      assert.equal(placeholders(value), placeholders(english[key]), `${code} › ${key}: placeholders differ from en`);
      for (const base of fallback) assert.notEqual(value, flatten(standardTexts(base))[key], `${code} › ${key}: same as ${base}`);
    }
  }
});

test("a site gets the standard texts in its language, its own texts win", () => {
  const dir = mkdtempSync(join(tmpdir(), "standard-"));
  mkdirSync(join(dir, "i18n"));
  writeFileSync(join(dir, "i18n/en.json"), JSON.stringify({ title: "Rules", shH: "Share this guide", info: { timeN: "10" } }));
  writeFileSync(join(dir, "i18n/de.json"), JSON.stringify({ title: "Regeln" }));
  const site = { origin: "https://example.com", pathPrefix: "/", game: { languages: ["en", "de"] } };
  const [en, de] = createLanguages(site, pathToFileURL(join(dir, "i18n/")));

  assert.equal(en.t.shBtn, standardTexts("en").shBtn);
  assert.equal(en.t.shH, "Share this guide"); // the site's own text wins
  assert.equal(en.t.info.luck, standardTexts("en").info.luck); // sections are merged text by text
  assert.equal(en.t.info.timeN, "10");
  // German: the core's German text, not the site's English one
  assert.equal(de.t.shBtn, standardTexts("de").shBtn);
  assert.equal(de.t.shH, standardTexts("de").shH);
  assert.equal(de.t.title, "Regeln");
});
