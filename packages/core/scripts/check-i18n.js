#!/usr/bin/env node
// Checks a game's translations before its site is built. Exits with 1 on any problem.
//
// Strict languages (--strict, default "en,de") must always be complete: a missing or
// leftover text is an error. They are updated with every text change.
// All other languages are only translated on demand; for them a missing text (the
// page then shows the English one) or a leftover text is only a warning, so text
// changes go through without touching 13 files. Wrong placeholders, broken HTML and
// dead #links are errors in every language.
// Part of @hostelgames/core; every game runs it in `npm run check` (also part of its build):
//
//   hostelgames-check-i18n [--dir src/_data/i18n] [--languages <file>] [--templates a.njk,b.njk]
//                          [--default en] [--strict en,de]
//
// Paths are relative to the current folder (the game's folder). Without --languages the
// languages of the game come from its game.json (@hostelgames/core/game); without --templates
// every .njk in src/ and in the core's includes counts.
// The standard texts of the core (i18n/standard/, see lib/languages.js) count as the
// game's own: a game only stores what it says differently. They are checked in the
// core's tests, here only the game's files.
// For every language it checks that
//   - every text exists, either in the language itself or in one of its fallback
//     languages, so nothing silently shows up in the default language;
//   - there are no texts that the default language doesn't have (typos, leftovers);
//   - placeholders like {mine} and {top} match the default language;
//   - a text may only be empty ("") if it is empty in the default language too (e.g. rules.h1sub:
//     no second line under the heading);
//   - HTML tags are balanced and the same tags as in the default language are used;
//   - links to #sections point to sections that exist in one of the --templates.
// It also checks that the languages file and the JSON files match.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { standardTexts } from "../lib/languages.js";

const { values: args } = parseArgs({
  options: {
    dir: { type: "string", default: "src/_data/i18n" },
    languages: { type: "string" },
    templates: { type: "string", default: "" },
    default: { type: "string", default: "en" },
    strict: { type: "string", default: "en,de" },
  },
});

const DIR = pathToFileURL(resolve(args.dir) + "/");
// Pages and parts they include; #links in texts point to sections there.
const njkFiles = (dir) =>
  existsSync(dir)
    ? readdirSync(dir, { recursive: true, withFileTypes: true })
        .filter((e) => e.isFile() && e.name.endsWith(".njk"))
        .map((e) => join(e.parentPath, e.name))
    : [];
const templatePaths = args.templates
  ? args.templates.split(",").filter(Boolean).map((path) => resolve(path))
  : [...njkFiles(resolve("src")), ...njkFiles(new URL("../includes", import.meta.url).pathname)];
const TEMPLATES = templatePaths.map((path) => pathToFileURL(path));
const DEFAULT = args.default;
const STRICT = new Set([DEFAULT, ...args.strict.split(",").map((code) => code.trim()).filter(Boolean)]);

// Only code and fallback are needed from the languages file.
let LANGUAGES;
try {
  if (args.languages) ({ default: LANGUAGES } = await import(pathToFileURL(resolve(args.languages))));
  else ({ languages: LANGUAGES } = await import("../lib/game.js"));
} catch (error) {
  console.error(`✗ ${args.languages ?? "game.json"}: languages could not be loaded: ${error.message}`);
  process.exit(1);
}

const problems = [];
const warnings = [];
const line = (code, key, message) => `${code}${key ? ` › ${key}` : ""}: ${message}`;
const report = (code, key, message) => problems.push(line(code, key, message));
// Incomplete translations: error for strict languages, warning for all others.
const incomplete = (code, key, message) => (STRICT.has(code) ? problems : warnings).push(line(code, key, message));

const files = readdirSync(DIR).filter((name) => name.endsWith(".json")).map((name) => name.slice(0, -5));
const load = (code) => JSON.parse(readFileSync(new URL(`${code}.json`, DIR), "utf8"));
const texts = Object.fromEntries(files.map((code) => [code, load(code)]));

/** Flattens {a: "x", quiz: {b: "y"}} to {"a": "x", "quiz.b": "y"}. */
function flatten(object, prefix = "") {
  return Object.entries(object).reduce((flat, [key, value]) => {
    if (value && typeof value === "object") return { ...flat, ...flatten(value, `${prefix}${key}.`) };
    return { ...flat, [prefix + key]: value };
  }, {});
}

const placeholders = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");
const tagNames = (text) => [...text.matchAll(/<([a-z]+)\b/g)].map((m) => m[1]).sort().join(",");
const anchors = (text) => [...text.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);

/** Returns a message if opening and closing tags don't match up. */
function unbalanced(text) {
  const open = [];
  for (const [, closing, name] of text.matchAll(/<(\/?)([a-z]+)\b[^>]*>/g)) {
    if (!closing) open.push(name);
    else if (open.pop() !== name) return `closing </${name}> does not match`;
  }
  return open.length ? `<${open.join(">, <")}> not closed` : null;
}

// Sections: <section id="…"> and the section macros of blocks.njk:
// {{ faq(t) }}, {{ variants(t, "id") }}, {{ mistakes(s) }}, {{ nextSteps([…], "id") }}.
const sectionIds = new Set(
  TEMPLATES.flatMap((file) => {
    const text = readFileSync(file, "utf8");
    return [
      ...[...text.matchAll(/<section id="([^"]+)"/g)].map((m) => m[1]),
      ...[...text.matchAll(/\{\{\s*(faq|variants|mistakes)\(\s*[\w.]+\s*(?:,\s*"([^"]+)")?\s*\)/g)].map((m) => m[2] ?? m[1]),
      ...[...text.matchAll(/\{\{\s*nextSteps\((?:(?!\}\})[\s\S])*?(?:,\s*"([^"]+)")?\s*\)\s*\}\}/g)].map((m) => m[1] ?? "next-steps"),
    ];
  }),
);

// ---------- languages file and JSON files match ----------

const codes = LANGUAGES.map((lang) => lang.code);
for (const code of codes) if (!texts[code]) report(code, null, `listed in ${args.languages ?? "game.json"} but ${code}.json is missing in ${args.dir}`);
for (const code of files) if (!codes.includes(code)) report(code, null, `${args.dir}/${code}.json is not listed in ${args.languages ?? "game.json"}`);
for (const lang of LANGUAGES) {
  for (const fallback of lang.fallback ?? []) {
    if (!codes.includes(fallback)) report(lang.code, null, `fallback "${fallback}" is not a language`);
  }
}

// ---------- texts ----------

// Texts of the 404 page (nf…): the page is English only, so other languages don't need them.
const englishOnly = (key) => /^nf[A-Z]/.test(key);

const english = { ...flatten(standardTexts(DEFAULT)), ...flatten(texts[DEFAULT] ?? {}) };
const standard = Object.fromEntries(codes.map((code) => [code, flatten(standardTexts(code))]));

for (const lang of LANGUAGES) {
  if (!texts[lang.code]) continue;
  const own = flatten(texts[lang.code]);
  const chain = [lang.code, ...(lang.fallback ?? [])].filter((code) => code !== DEFAULT);

  for (const key of Object.keys(own)) {
    if (!(key in english)) incomplete(lang.code, key, `not in ${DEFAULT} (typo or leftover?)`);
  }

  if (lang.code === DEFAULT) continue;
  for (const [key, en] of Object.entries(english)) {
    const from = chain.find((code) => key in flatten(texts[code] ?? {}) || key in (standard[code] ?? {}));
    if (!from) {
      if (englishOnly(key)) continue;
      incomplete(lang.code, key, `missing, shows the ${DEFAULT} text`);
      continue;
    }
    if (from !== lang.code || !(key in own)) continue; // checked with the fallback language or in the core
    const text = own[key];
    if (typeof text !== "string" || (!text.trim() && en.trim())) {
      report(lang.code, key, "empty");
      continue;
    }
    if (placeholders(text) !== placeholders(en)) {
      report(lang.code, key, `placeholders {${placeholders(text)}} differ from ${DEFAULT} {${placeholders(en)}}`);
    }
    if (tagNames(text) !== tagNames(en)) {
      report(lang.code, key, `HTML tags [${tagNames(text)}] differ from ${DEFAULT} [${tagNames(en)}]`);
    }
  }
}

for (const [code, own] of Object.entries(texts)) {
  for (const [key, text] of Object.entries(flatten(own))) {
    if (typeof text !== "string") continue;
    const tags = unbalanced(text);
    if (tags) report(code, key, tags);
    for (const id of anchors(text)) {
      if (!sectionIds.has(id)) report(code, key, `link to #${id}, but there is no such section`);
    }
  }
}

for (const code of STRICT) if (!codes.includes(code)) report(code, null, `strict language is not listed in ${args.languages ?? "game.json"}`);

if (warnings.length) {
  const byLanguage = Object.groupBy(warnings, (warning) => warning.split(" ")[0].replace(":", ""));
  const summary = Object.entries(byLanguage).map(([code, list]) => `${code} ${list.length}`).join(", ");
  console.warn(`⚠ ${warnings.length} text(s) still to translate on demand (${summary}):\n  ${warnings.join("\n  ")}`);
}
if (problems.length) {
  console.error(`✗ ${problems.length} translation problem(s):\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(`✓ Translations OK: ${codes.length} languages, ${Object.keys(english).length} texts each; complete: ${[...STRICT].join(", ")}.`);
