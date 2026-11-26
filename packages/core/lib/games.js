// The games of this monorepo: every folder in games/ with a game.json.
//
// game.json
//   slug     short name of the game (folder name, package @hostelgames/<slug>, offline cache)
//   path     not set by hand: the folder of the game everywhere (hostelgames.com/<path>/,
//            jankraut.github.io/hostelgames/<path>/, FTP subfolder). It is always the
//            domain without its ending (https://shitheadgame.de → shitheadgame);
//            without a domain the slug.
//   name       shown on the hub page
//   tagline    one line for the hub page
//   domain     the game's own domain, e.g. https://shitheadgame.de (optional, may not exist yet)
//   category   its section on the hub page: "cards", "dice" or "drinking" (see CATEGORIES)
//   status     "draft" while the game is being built: only in the preview (GitHub Pages),
//              not listed on hostelgames.com, not deployed to its own domain. "live" otherwise.
//   languages  codes of the languages it offers, e.g. ["en", "de"]; en and de always.
//              Flag, name and fallback of each language: lib/languages.js
//   pages      the pages it has, e.g. ["rules", "strategy", "quickstart", "play"];
//              "play" = a game against bots, "scoresheet" = an online score sheet (e.g. Kniffel).
//              Must match the files in src/ (see PAGES).
//   related    slugs of similar games, e.g. ["president"] for Arschloch (optional)
//   players    { "min": 3, "max": 6 } (optional)
//   duration   e.g. "20–30 min" (optional)
//   testShards, deploy.environment  only for CI, see scripts/ci-plan.js
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { LANGUAGE_CODES } from "./languages.js";

export const ROOT = new URL("../../../", import.meta.url);
export const GAMES_DIR = new URL("games/", ROOT);

/**
 * Folder name of a site: its domain without the ending, e.g.
 * https://shitheadgame.de → "shitheadgame", https://www.hostelgames.com → "hostelgames".
 * Returns null without a domain.
 */
export function folderOf(domain, file = "") {
  if (!domain) return null;
  let host;
  try {
    host = new URL(domain).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    throw new Error(`${file}: "domain" must be a full address like https://shitheadgame.de`);
  }
  const folder = host.split(".").slice(0, -1).join("-");
  if (!/^[a-z0-9-]+$/.test(folder)) throw new Error(`${file}: no folder name can be made from domain ${domain}`);
  return folder;
}

/** Each page a game can have and the template in its src/ that makes it. */
export const PAGES = {
  rules: "index.njk",
  strategy: "strategy.njk",
  quickstart: "quickstart.njk",
  play: "play.njk",
  scoresheet: "scoresheet.njk",
};
export const STATUSES = ["draft", "live"];
// Sections of the hub page, in this order. Names and intros: categories.<key> in the hub's i18n.
export const CATEGORIES = ["cards", "dice", "drinking"];
// Always complete in every game (see the rules in CLAUDE.md and check-i18n --strict).
const REQUIRED_LANGUAGES = ["en", "de"];

const list = (value) => Array.isArray(value) && value.every((item) => typeof item === "string");

/** Reads and checks one game.json. Throws with a message naming the file and the field. */
export function readGame(file) {
  const game = JSON.parse(readFileSync(file, "utf8"));
  const fail = (message) => {
    throw new Error(`${file}: ${message}`);
  };
  if (!/^[a-z0-9-]+$/.test(game.slug ?? "")) fail(`"slug" must be lowercase letters, digits and dashes`);
  if ("path" in game) fail(`remove "path" – the folder is always the domain without its ending`);
  game.path = folderOf(game.domain, file) ?? game.slug;

  if (!CATEGORIES.includes(game.category)) fail(`"category" must be one of ${CATEGORIES.join(", ")}`);
  if (!STATUSES.includes(game.status)) fail(`"status" must be one of ${STATUSES.join(", ")}`);

  if (!list(game.languages)) fail(`"languages" must be a list of language codes, e.g. ["en", "de"]`);
  for (const code of game.languages) {
    if (!LANGUAGE_CODES.includes(code)) fail(`unknown language "${code}" – add it to packages/core/lib/languages.js first`);
  }
  for (const code of REQUIRED_LANGUAGES) if (!game.languages.includes(code)) fail(`"languages" must contain "${code}"`);
  if (new Set(game.languages).size !== game.languages.length) fail(`"languages" lists a code twice`);

  if (!list(game.pages)) fail(`"pages" must be a list, e.g. ["rules", "strategy", "quickstart"]`);
  for (const page of game.pages) if (!(page in PAGES)) fail(`unknown page "${page}" – known: ${Object.keys(PAGES).join(", ")}`);
  if (!game.pages.includes("rules")) fail(`"pages" must contain "rules"`);
  // pages and the templates in src/ must agree, so "pages" can be relied on (hub, monitoring).
  const src = new URL("src/", file instanceof URL ? file : pathToFileURL(file));
  for (const [page, template] of Object.entries(PAGES)) {
    const exists = existsSync(new URL(template, src));
    if (game.pages.includes(page) && !exists) fail(`"pages" contains "${page}" but src/${template} is missing`);
    if (!game.pages.includes(page) && exists) fail(`src/${template} exists, so "pages" must contain "${page}"`);
  }

  game.related ??= [];
  if (!list(game.related)) fail(`"related" must be a list of game slugs`);
  if (game.players !== undefined) {
    const { min, max } = game.players;
    if (!Number.isInteger(min) || !Number.isInteger(max) || min < 1 || max < min) fail(`"players" must be { "min": 2, "max": 6 }`);
  }
  if (game.duration !== undefined && typeof game.duration !== "string") fail(`"duration" must be text, e.g. "20–30 min"`);
  if (game.factsheet !== undefined) {
    const { scales, people, id } = game.factsheet;
    const scale = (s) => Array.isArray(s) && s.length === 3 && typeof s[0] === "string" && typeof s[1] === "string" && Number.isFinite(s[2]) && s[2] >= 0 && s[2] <= 100;
    if (!Array.isArray(scales) || !scales.length || !scales.every(scale)) fail(`"factsheet.scales" must be a list like [["luck", "skill", 35], …] (two info texts, 0–100)`);
    if (!Array.isArray(people) || people.length !== 2 || !people.every((n) => [1, 2, 3].includes(n))) fail(`"factsheet.people" must be two numbers 1–3, e.g. [2, 3]`);
    if (id !== undefined && !/^[a-z][a-z0-9-]*$/.test(id)) fail(`"factsheet.id" must be lowercase letters, digits and dashes`);
  }
  if (game.alternateName !== undefined && !list(game.alternateName)) fail(`"alternateName" must be a list of names`);
  return game;
}

/** All games, sorted by name. Also checks what only makes sense across games (related, unique folders). */
export default function games() {
  const all = readdirSync(GAMES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(new URL(`${entry.name}/game.json`, GAMES_DIR)))
    .map((entry) => ({ ...readGame(new URL(`${entry.name}/game.json`, GAMES_DIR)), dir: new URL(`${entry.name}/`, GAMES_DIR) }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const slugs = new Set(all.map((game) => game.slug));
  const folders = new Map();
  for (const game of all) {
    for (const slug of game.related) {
      if (!slugs.has(slug)) throw new Error(`games/${game.slug}/game.json: "related" names "${slug}", but there is no games/${slug}/`);
      if (slug === game.slug) throw new Error(`games/${game.slug}/game.json: a game can't be related to itself`);
    }
    if (folders.has(game.path)) throw new Error(`games/${folders.get(game.path)} and games/${game.slug} would both use the folder "${game.path}"`);
    folders.set(game.path, game.slug);
  }
  return all;
}

/** Games shown on a site: in the preview all of them, live only those with status "live". */
export const visibleGames = (site) => games().filter((game) => !site.indexable || game.status === "live");
