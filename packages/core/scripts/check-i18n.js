#!/usr/bin/env node
// Checks a game's translations before its site is built. Exits with 1 on any problem.
// Part of @hostelgames/core; every game runs it in `npm run check` (also part of its build):
//
//   hostelgames-check-i18n --dir src/_data/i18n --languages src/_data/languages.js \
//                          --templates src/index.njk,src/_includes/quiz.njk [--default en]
//
// Paths are relative to the current folder (the game's folder).
// For every language it checks that
//   - every text exists, either in the language itself or in one of its fallback
//     languages, so nothing silently shows up in the default language;
//   - there are no texts that the default language doesn't have (typos, leftovers);
//   - placeholders like {mine} and {top} match the default language;
//   - HTML tags are balanced and the same tags as in the default language are used;
//   - links to #sections point to sections that exist in one of the --templates.
// It also checks that the languages file and the JSON files match.

import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

const { values: args } = parseArgs({
  options: {
    dir: { type: "string", default: "src/_data/i18n" },
    languages: { type: "string", default: "src/_data/languages.js" },
    templates: { type: "string", default: "" },
    default: { type: "string", default: "en" },
  },
});

const DIR = pathToFileURL(resolve(args.dir) + "/");
// Pages and parts they include; #links in texts point to sections there.
const TEMPLATES = args.templates.split(",").filter(Boolean).map((path) => pathToFileURL(resolve(path)));
const DEFAULT = args.default;

// Only code and fallback are needed from the languages file.
let LANGUAGES;
try {
  ({ default: LANGUAGES } = await import(pathToFileURL(resolve(args.languages))));
} catch (error) {
  console.error(`✗ ${args.languages} could not be loaded: ${error.message}`);
  process.exit(1);
}

const problems = [];
const report = (code, key, message) => problems.push(`${code}${key ? ` › ${key}` : ""}: ${message}`);

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

const sectionIds = new Set(
  TEMPLATES.flatMap((file) => [...readFileSync(file, "utf8").matchAll(/<section id="([^"]+)"/g)].map((m) => m[1])),
);

// ---------- languages file and JSON files match ----------

const codes = LANGUAGES.map((lang) => lang.code);
for (const code of codes) if (!texts[code]) report(code, null, `listed in ${args.languages} but ${code}.json is missing in ${args.dir}`);
for (const code of files) if (!codes.includes(code)) report(code, null, `${args.dir}/${code}.json is not listed in ${args.languages}`);
for (const lang of LANGUAGES) {
  for (const fallback of lang.fallback ?? []) {
    if (!codes.includes(fallback)) report(lang.code, null, `fallback "${fallback}" is not a language`);
  }
}

// ---------- texts ----------

const english = flatten(texts[DEFAULT] ?? {});

for (const lang of LANGUAGES) {
  if (!texts[lang.code]) continue;
  const own = flatten(texts[lang.code]);
  const chain = [lang.code, ...(lang.fallback ?? [])].filter((code) => code !== DEFAULT);

  for (const key of Object.keys(own)) {
    if (!(key in english)) report(lang.code, key, `not in ${DEFAULT} (typo or leftover?)`);
  }

  if (lang.code === DEFAULT) continue;
  for (const [key, en] of Object.entries(english)) {
    const from = chain.find((code) => key in flatten(texts[code] ?? {}));
    if (!from) {
      report(lang.code, key, `missing, would show the ${DEFAULT} text`);
      continue;
    }
    if (from !== lang.code) continue; // checked with the fallback language itself
    const text = own[key];
    if (typeof text !== "string" || !text.trim()) {
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

if (problems.length) {
  console.error(`✗ ${problems.length} translation problem(s):\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(`✓ Translations OK: ${codes.length} languages, ${Object.keys(english).length} texts each.`);
