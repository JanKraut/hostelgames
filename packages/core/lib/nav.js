// Header of every site (includes/sitehead.njk): texts and links of the menu "All games".
//
//   import { createNav } from "@hostelgames/core/nav";   (the core plugin does this)
//   nav.t("de")      texts of the header in that language (i18n/<code>.json; what a language
//                    doesn't have comes from its fallback, e.g. es for es-419, then English)
//   nav.links("de")  where each menu entry points, for a page in that language
//
// Every entry gets its own overview page on hostelgames.com later; until then they point to the
// hub start page (categories to its sections). Links to other games only name games the site may show: in the preview (GitHub Pages)
// all of them, live only those with status "live" (see visibleGames).
import { readFileSync } from "node:fs";
import { CATEGORIES, visibleGames } from "./games.js";
import { DEFAULT_LANGUAGE, LANGUAGES } from "./languages.js";
import { PAGES_ORIGIN, PAGES_PREFIX } from "./site.js";

/** The search in the header: markup and texts are there, switched on once it works. */
export const SEARCH = false;

/** Games under "Popular", in this order (slugs from games/). */
export const POPULAR = ["shithead", "cabo", "cambio", "kingscup", "president"];

const I18N = new URL("../i18n/", import.meta.url);
const load = (code) => {
  try {
    return JSON.parse(readFileSync(new URL(`${code}.json`, I18N), "utf8"));
  } catch {
    return {};
  }
};
const english = load(DEFAULT_LANGUAGE);

/** Header texts of a language: English <- its fallbacks <- its own (like lib/languages.js). */
export function navTexts(code) {
  const fallback = LANGUAGES.find((lang) => lang.code === code)?.fallback ?? [];
  return [...fallback, code].filter((c) => c !== DEFAULT_LANGUAGE).reduce((texts, c) => ({ ...texts, ...load(c) }), { ...english });
}

/**
 * @param {object} site  from createSite()
 * @param {object[]} [all]  the games (default: visibleGames(site)); for tests
 */
export function createNav(site, all = visibleGames(site)) {
  const hubBase = site.hubUrl();

  /** Start page of a game (absolute URL), in the given language if the game has it. */
  function gameUrl(game, code) {
    let base;
    if (game.slug === site.game?.slug) base = site.origin + site.pathPrefix;
    else if (!site.indexable) base = `${PAGES_ORIGIN}${PAGES_PREFIX}${game.path}/`;
    else base = game.domain ? `${game.domain.replace(/\/$/, "")}/` : `${hubBase}${game.path}/`;
    return code && code !== DEFAULT_LANGUAGE && game.languages.includes(code) ? `${base}${code}/` : base;
  }

  return {
    search: SEARCH,
    t: navTexts,
    gameUrl,
    links(code) {
      const hub = site.hubUrl(code);
      const others = all.filter((game) => game.slug !== site.game?.slug);
      return {
        hub,
        az: hub,
        find: hub,
        players: hub,
        random: others.map((game) => gameUrl(game, code)),
        categories: CATEGORIES.map((key) => ({ key, href: `${hub}#${key}` })),
        noGear: hub,
        play: hub,
        sheets: hub,
        popular: POPULAR.map((slug) => all.find((game) => game.slug === slug))
          .filter(Boolean)
          .map((game) => ({ name: game.name, href: gameUrl(game, code), current: game.slug === site.game?.slug })),
      };
    },
  };
}
