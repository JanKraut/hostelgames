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
// A game's src/_data/languages.js turns its codes into the data the pages need:
//
//   import { createLanguages } from "@hostelgames/core/languages";
//   export default createLanguages(site, new URL("./i18n/", import.meta.url));
import { readFileSync } from "node:fs";

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
 * The languages of a site, in menu order, each with its texts (English <- fallbacks <- own).
 * @param {object} site      from createSite(); site.game.languages are the codes
 * @param {URL} i18nDir      folder with one <code>.json per language
 */
export function createLanguages(site, i18nDir) {
  const codes = site.game?.languages ?? [DEFAULT_LANGUAGE];
  const load = (code) => JSON.parse(readFileSync(new URL(`${code}.json`, i18nDir), "utf8"));

  return LANGUAGES.filter((lang) => codes.includes(lang.code)).map((lang) => {
    // A fallback the site doesn't offer is skipped: English then fills the gap.
    const chain = [DEFAULT_LANGUAGE, ...(lang.fallback ?? []).filter((code) => codes.includes(code)), lang.code]
      .filter((code, i, all) => all.indexOf(code) === i);
    const path = lang.code === DEFAULT_LANGUAGE ? "/" : `/${lang.code}/`;
    return {
      ...lang,
      fallback: (lang.fallback ?? []).filter((code) => codes.includes(code)),
      // BCP 47 tag for <html lang> and hreflang, e.g. pt-BR
      htmlLang: lang.code.replace(/-([a-z]{2})$/, (_, region) => `-${region.toUpperCase()}`),
      path,
      url: site.origin + site.pathPrefix + path.slice(1),
      t: chain.map(load).reduce(merge),
    };
  });
}
