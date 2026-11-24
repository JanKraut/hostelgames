// sitemap.xml and robots.txt of hostelgames.com, from @hostelgames/core: the start page in
// every hub language (hub/hub.json) with all its alternates. Not built for the GitHub Pages preview.
// Live games without a domain of their own are at hostelgames.com/<path>/ with their own
// sitemap.xml, listed in robots.txt. Every other game has its sitemap on its own domain.
import { createSitemap } from "@hostelgames/core/sitemap";
import { visibleGames } from "@hostelgames/core/games";
import site from "./_data/site.js";
import languages from "./_data/languages.js";

const sitemaps = visibleGames(site)
  .filter((game) => !game.domain)
  .map((game) => `${site.origin}${site.pathPrefix}${game.path}/sitemap.xml`);

export default createSitemap(site, languages, { sitemaps });
