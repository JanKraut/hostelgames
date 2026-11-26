// sitemap.xml and robots.txt for search engines. Only built at the root of an indexable domain:
// - the hub (hostelgames.com): its start page in every hub language plus all pages of live games
//   hosted below hostelgames.com/<path>/ (passed via `games`),
// - live games on their own domain (e.g. shitheadgame.de): their pages from game.json in every language.
// Games without a domain of their own and the GitHub Pages preview get neither file.
//
// Games get both files from the core plugin (eleventy.js, sitemapFiles); the hub uses
// createSitemap in hub/src/sitemap.11ty.js, with its hosted games.
import { languageList } from "./languages.js";

/** Folder of each page below a language folder, as in the templates' `subpath`. */
export const SUBPATHS = { rules: "", strategy: "strategy/", quickstart: "quickstart/", play: "play/", scoresheet: "scoresheet/" };

const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const subpathsOf = (pages) =>
  Object.entries(SUBPATHS)
    .filter(([page]) => pages.includes(page))
    .map(([, sub]) => sub);

function urlEntries(pages, languages) {
  return subpathsOf(pages).flatMap((sub) => {
    const alternates = [
      ...languages.map((l) => `    <xhtml:link rel="alternate" hreflang="${l.htmlLang}" href="${escape(l.url + sub)}"/>`),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${escape(languages[0].url + sub)}"/>`,
    ].join("\n");
    return languages.map((l) => `  <url>\n    <loc>${escape(l.url + sub)}</loc>\n${alternates}\n  </url>`);
  });
}

/** Whether a site gets sitemap.xml and robots.txt (see top of this file). */
export const hasSitemap = (site) => site.indexable && (site.game ? site.ownDomain && site.game.status === "live" : site.pathPrefix === "/");

/** { "sitemap.xml": …, "robots.txt": … } of a site, or {} if it gets none. */
export function sitemapFiles(site, languages, { games = [] } = {}) {
  if (!hasSitemap(site)) return {};
  const root = site.origin + site.pathPrefix;
  const urls = [
    ...urlEntries(site.game?.pages ?? ["rules"], languages),
    ...games.flatMap((game) => urlEntries(game.pages, languageList(game.languages, `${root}${game.path}/`))),
  ];
  return {
    "sitemap.xml": `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`,
    "robots.txt": `User-agent: *\nAllow: /\n\nSitemap: ${root}sitemap.xml\n`,
  };
}

/** Eleventy template (src/sitemap.11ty.js) writing the files of sitemapFiles. */
export function createSitemap(site, languages, options = {}) {
  return class Sitemap {
    data() {
      return {
        pagination: { data: "files", size: 1, alias: "file" },
        files: Object.keys(sitemapFiles(site, languages, options)),
        permalink: (data) => `/${data.file}`,
        eleventyExcludeFromCollections: true,
      };
    }

    render({ file }) {
      return sitemapFiles(site, languages, options)[file];
    }
  };
}
