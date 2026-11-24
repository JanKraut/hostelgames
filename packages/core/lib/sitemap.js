// sitemap.xml and robots.txt for search engines, for every game. Only built where the site may
// be indexed: the GitHub Pages preview has noindex and gets neither.
// The pages come from "pages" in game.json, each in every language with all its alternates.
//
// A game's src/sitemap.11ty.js:
//
//   import { createSitemap } from "@hostelgames/core/sitemap";
//   import site from "./_data/site.js";
//   import languages from "./_data/languages.js";
//   export default createSitemap(site, languages);

/** Folder of each page below a language folder, as in the templates' `subpath`. */
export const SUBPATHS = { rules: "", strategy: "strategy/", quickstart: "quickstart/", play: "play/", scoresheet: "scoresheet/" };

const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;");

export function createSitemap(site, languages) {
  const subpaths = Object.entries(SUBPATHS)
    .filter(([page]) => (site.game?.pages ?? ["rules"]).includes(page))
    .map(([, sub]) => sub);

  return class Sitemap {
    data() {
      return {
        pagination: { data: "files", size: 1, alias: "file" },
        files: site.indexable ? ["sitemap.xml", "robots.txt"] : [],
        permalink: (data) => `/${data.file}`,
        eleventyExcludeFromCollections: true,
      };
    }

    render({ file }) {
      const root = site.origin + site.pathPrefix;
      if (file === "robots.txt") return `User-agent: *\nAllow: /\n\nSitemap: ${root}sitemap.xml\n`;

      const urls = subpaths.flatMap((sub) => {
        const alternates = [
          ...languages.map((l) => `    <xhtml:link rel="alternate" hreflang="${l.htmlLang}" href="${escape(l.url + sub)}"/>`),
          `    <xhtml:link rel="alternate" hreflang="x-default" href="${escape(languages[0].url + sub)}"/>`,
        ].join("\n");
        return languages.map((l) => `  <url>\n    <loc>${escape(l.url + sub)}</loc>\n${alternates}\n  </url>`);
      });
      return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`;
    }
  };
}
