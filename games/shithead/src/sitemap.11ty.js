// sitemap.xml and robots.txt, from @hostelgames/core (pages from game.json).
import { createSitemap } from "@hostelgames/core/sitemap";
import site from "./_data/site.js";
import languages from "./_data/languages.js";

export default createSitemap(site, languages);
