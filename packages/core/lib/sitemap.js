// sitemap.xml and robots.txt for search engines. Only built at the root of an indexable domain:
// - the hub (hostelgames.com): its start page in every hub language plus all pages of live games
//   hosted below hostelgames.com/<path>/ (passed via `games`),
// - live games on their own domain (e.g. shitheadgame.de): their pages from game.json in every language.
// Games without a domain of their own and the GitHub Pages preview get neither file.
//
// A game's src/sitemap.11ty.js:
//
//   import { createSitemap } from "@hostelgames/core/sitemap";
//   import site from "./_data/site.js";
//   import languages from "./_data/languages.js";
//   export default createSitemap(site, languages);
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

export function createSitemap(site, languages, { games = [] } = {}) {
  const enabled = site.indexable && (site.game ? site.ownDomain && site.game.status === "live" : site.pathPrefix === "/");

  return class Sitemap {
    data() {
      return {
        pagination: { data: "files", size: 1, alias: "file" },
        files: enabled ? ["sitemap.xml", "robots.txt"] : [],
        permalink: (data) => `/${data.file}`,
        eleventyExcludeFromCollections: true,
      };
    }

    render({ file }) {
      const root = site.origin + site.pathPrefix;
      if (file === "robots.txt") {
        return `User-agent: *\nAllow: /\n\nSitemap: ${root}sitemap.xml\n`;
      }

      const urls = [
        ...urlEntries(site.game?.pages ?? ["rules"], languages),
        ...games.flatMap((game) => urlEntries(game.pages, languageList(game.languages, `${root}${game.path}/`))),
      ];
      return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`;
    }
  };
}
