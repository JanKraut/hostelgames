// sitemap.xml and robots.txt for search engines. Only built where the site may be
// indexed: the GitHub Pages copy has noindex (see base.njk) and gets neither.
import site from "./_data/site.js";
import languages from "./_data/languages.js";

const indexable = !site.origin.includes("github.io");

// Pages below each language folder, as in the templates' `subpath`.
const SUBPATHS = ["", "strategy/", "quickstart/", "play/"];

const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;");

export default class {
  data() {
    return {
      pagination: { data: "files", size: 1, alias: "file" },
      files: indexable ? ["sitemap.xml", "robots.txt"] : [],
      permalink: (data) => `/${data.file}`,
      eleventyExcludeFromCollections: true,
    };
  }

  render({ file }) {
    const root = site.origin + site.pathPrefix;
    if (file === "robots.txt") return `User-agent: *\nAllow: /\n\nSitemap: ${root}sitemap.xml\n`;

    const urls = SUBPATHS.flatMap((sub) => {
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
}
