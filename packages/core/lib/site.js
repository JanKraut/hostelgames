// Where a site is published, chosen at build time:
//
//   SITE_ORIGIN       e.g. https://shitheadgame.de or https://hostelgames.com
//   SITE_PATH_PREFIX  e.g. / (own domain), /shithead/ (main domain), /hostelgames/shithead/ (GitHub Pages)
//
// Defaults are the GitHub Pages preview of this repo: https://jankraut.github.io/hostelgames/<slug>/.
// Only the game's own domain and the main domain are indexed by search engines;
// every github.io build gets noindex and no sitemap.
import { readGame } from "./games.js";

export const PAGES_ORIGIN = "https://jankraut.github.io";
export const PAGES_PREFIX = "/hostelgames/";

/**
 * @param {URL|string|null} gameFile  the game's game.json, or null for the hub
 */
export function createSite(gameFile) {
  const game = gameFile ? readGame(gameFile) : null;
  const origin = (process.env.SITE_ORIGIN ?? PAGES_ORIGIN).replace(/\/$/, "");
  let pathPrefix = process.env.SITE_PATH_PREFIX ?? (game ? `${PAGES_PREFIX}${game.slug}/` : PAGES_PREFIX);
  if (!pathPrefix.startsWith("/")) pathPrefix = `/${pathPrefix}`;
  if (!pathPrefix.endsWith("/")) pathPrefix += "/";
  return {
    origin,
    pathPrefix,
    game,
    indexable: !origin.includes("github.io"),
    // Built for the game's own domain (then e.g. .htaccess with its redirects is added).
    ownDomain: Boolean(game?.domain) && origin === game.domain.replace(/\/$/, "") && pathPrefix === "/",
  };
}
