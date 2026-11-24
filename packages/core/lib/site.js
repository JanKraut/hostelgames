// Where a site is published, chosen at build time:
//
//   SITE_ORIGIN       e.g. https://shitheadgame.de or https://hostelgames.com
//   SITE_PATH_PREFIX  e.g. / (own domain), /shitheadgame/ (main domain), /hostelgames/shitheadgame/ (GitHub Pages)
//
// Defaults are the GitHub Pages preview of this repo: https://jankraut.github.io/hostelgames/<path>/.
// Only the game's own domain and the main domain are indexed by search engines;
// every github.io build gets noindex and no sitemap.
import { readFileSync } from "node:fs";
import { readGame, ROOT } from "./games.js";

export const PAGES_ORIGIN = "https://jankraut.github.io";
export const PAGES_PREFIX = "/hostelgames/";

// The hub (hostelgames.com): domain and languages from hub/hub.json.
const HUB = JSON.parse(readFileSync(new URL("hub/hub.json", ROOT), "utf8"));

/**
 * @param {URL|string|null} gameFile  the game's game.json, or null for the hub
 */
export function createSite(gameFile) {
  const game = gameFile ? readGame(gameFile) : null;
  const origin = (process.env.SITE_ORIGIN ?? PAGES_ORIGIN).replace(/\/$/, "");
  let pathPrefix = process.env.SITE_PATH_PREFIX ?? (game ? `${PAGES_PREFIX}${game.path}/` : PAGES_PREFIX);
  if (!pathPrefix.startsWith("/")) pathPrefix = `/${pathPrefix}`;
  if (!pathPrefix.endsWith("/")) pathPrefix += "/";
  const indexable = !origin.includes("github.io");
  // Start page of the hub, linked from the logo and footer of every game: hostelgames.com,
  // or its GitHub Pages preview when the game itself is a preview.
  const hubBase = indexable ? `${HUB.domain.replace(/\/$/, "")}/` : `${PAGES_ORIGIN}${PAGES_PREFIX}`;
  return {
    origin,
    pathPrefix,
    game,
    indexable,
    /** Hub start page in this language if the hub has it, otherwise in English. */
    hubUrl: (code) => (code && code !== "en" && HUB.languages.includes(code) ? `${hubBase}${code}/` : hubBase),
    // Built for the game's own domain (then e.g. .htaccess with its redirects is added).
    ownDomain: Boolean(game?.domain) && origin === game.domain.replace(/\/$/, "") && pathPrefix === "/",
  };
}
