// sitemap.xml and robots.txt of hostelgames.com, from @hostelgames/core: the start page in
// every hub language (hub/hub.json) with all its alternates. Not built for the GitHub Pages preview.
// The games are not listed here: each one has its own sitemap on its own domain.
import { createSitemap } from "@hostelgames/core/sitemap";
import site from "./_data/site.js";
import languages from "./_data/languages.js";

export default createSitemap(site, languages);
