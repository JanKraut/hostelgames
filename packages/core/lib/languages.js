// Languages of all sites: the general facts about each language (flag, name, fallback)
// live here once; a game only lists the codes it offers, in its game.json:
//
//   "languages": ["en", "de", "fr"]
//
// The menu order is the order below (English first, then by the language's own name),
// the same in every game.
//
// `fallback` is tried in order for every text a language does not define itself;
// English is always the last resort. Example: es-419 only stores what differs from es.
//
// Texts: the standard texts every site shares (share box, page names, 404, fact sheet
// labels) live once in i18n/standard/<code>.json; a site only stores its own texts and
// whatever it says differently. For every language in the chain the core text comes first,
// then the site's, so the site wins and a language never falls back to English while the
// core has the text in that language.
//
// A game's src/_data/languages.js turns its codes into the data the pages need:
//
//   import { createLanguages } from "@hostelgames/core/languages";
//   export default createLanguages(site, new URL("./i18n/", import.meta.url));
import { existsSync, readFileSync } from "node:fs";

export const DEFAULT_LANGUAGE = "en";

/** Every language a site can offer. New language: add it here (and its flag in includes/flags.njk). */
export const LANGUAGES = [
  { code: "en", flag: "🇬🇧", name: "English" },
  { code: "cs", flag: "🇨🇿", name: "Čeština" },
  { code: "da", flag: "🇩🇰", name: "Dansk" },
  { code: "de", flag: "🇩🇪", name: "Deutsch" },
  { code: "es", flag: "🇪🇸", name: "Español" },
  { code: "es-419", flag: "🌎", name: "Español (Latinoamérica)", fallback: ["es"] },
  { code: "fr", flag: "🇫🇷", name: "Français" },
  { code: "it", flag: "🇮🇹", name: "Italiano" },
  { code: "nl", flag: "🇳🇱", name: "Nederlands" },
  { code: "nb", flag: "🇳🇴", name: "Norsk" },
  { code: "pl", flag: "🇵🇱", name: "Polski" },
  { code: "pt", flag: "🇵🇹", name: "Português" },
  { code: "pt-br", flag: "🇧🇷", name: "Português (Brasil)", fallback: ["pt"] },
  { code: "fi", flag: "🇫🇮", name: "Suomi" },
  { code: "sv", flag: "🇸🇪", name: "Svenska" },
];

export const LANGUAGE_CODES = LANGUAGES.map((lang) => lang.code);

/** Folder of the standard texts, one <code>.json per language (only en and de must be complete). */
export const STANDARD_TEXTS = new URL("../i18n/standard/", import.meta.url);

/** Standard texts of one language as stored (no fallback), {} if there are none. */
export function standardTexts(code) {
  const file = new URL(`${code}.json`, STANDARD_TEXTS);
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
}

// Merges b into a; sections like `quiz` or `game` are merged text by text.
// Lists (e.g. the strategy tips) are taken whole, so they stay lists.
function merge(a, b) {
  const result = { ...a };
  for (const [key, value] of Object.entries(b)) {
    if (Array.isArray(value)) result[key] = value;
    else result[key] = value && typeof value === "object" ? merge(a[key] ?? {}, value) : value;
  }
  return result;
}

/**
 * Language metadata (without texts) in menu order, for a base URL ending in "/".
 * @param {string[]} codes   language codes, e.g. ["en", "de"]
 * @param {string} baseUrl   full base URL ending in "/", e.g. "https://hostelgames.com/kniffel/"
 */
export function languageList(codes, baseUrl) {
  return LANGUAGES.filter((lang) => codes.includes(lang.code)).map((lang) => {
    const path = lang.code === DEFAULT_LANGUAGE ? "/" : `/${lang.code}/`;
    return {
      ...lang,
      fallback: (lang.fallback ?? []).filter((code) => codes.includes(code)),
      // BCP 47 tag for <html lang> and hreflang, e.g. pt-BR
      htmlLang: lang.code.replace(/-([a-z]{2})$/, (_, region) => `-${region.toUpperCase()}`),
      path,
      url: baseUrl + path.slice(1),
    };
  });
}

/**
 * The languages of a site, in menu order, each with its texts: for English, then each
 * fallback, then the language itself, first the standard texts, then the site's own.
 * @param {object} site      from createSite(); site.game.languages are the codes
 * @param {URL} i18nDir      folder with one <code>.json per language
 */
export function createLanguages(site, i18nDir) {
  const codes = site.game?.languages ?? [DEFAULT_LANGUAGE];
  const load = (code) => JSON.parse(readFileSync(new URL(`${code}.json`, i18nDir), "utf8"));

  return languageList(codes, site.origin + site.pathPrefix).map((lang) => {
    // A fallback the site doesn't offer is skipped: English then fills the gap.
    const chain = [DEFAULT_LANGUAGE, ...lang.fallback, lang.code]
      .filter((code, i, all) => all.indexOf(code) === i);
    return {
      ...lang,
      t: chain.flatMap((code) => [standardTexts(code), load(code)]).reduce(merge, {}),
    };
  });
}
