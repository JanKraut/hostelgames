// sitemap.xml and robots.txt of hostelgames.com, from @hostelgames/core: the start page in
// every hub language (hub/hub.json) plus all pages of live games running below
// hostelgames.com/<path>/ (games without a domain of their own). Not built for the GitHub Pages preview.
// Games with a domain of their own (e.g. shitheadgame.de) have their sitemap on their own domain.
import { createSitemap } from "@hostelgames/core/sitemap";
import { visibleGames } from "@hostelgames/core/games";
import site from "./_data/site.js";
import languages from "./_data/languages.js";

const hostedGames = visibleGames(site).filter((game) => !game.domain);

export default createSitemap(site, languages, { games: hostedGames });
