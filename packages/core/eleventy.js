// Eleventy plugin of @hostelgames/core. Every site in this repo (each game, the hub)
// adds it first in its eleventy.config.js:
//
//   import hostelgames from "@hostelgames/core/eleventy";
//   eleventyConfig.addPlugin(hostelgames, { site, cacheName: "shithead" });
//
// It provides
//   - root-relative links (/de/, /assets/…) prefixed with site.pathPrefix (HtmlBasePlugin)
//   - assets/core/: core.css (shared design), core.js (light / dark, language menu, offline),
//     fonts.css and the self-hosted font files listed in data/fonts.js
//   - global data: tracking (data/tracking.js), fonts, coreFonts (files to preload),
//     assetVersion (appended as ?v=… to CSS and JS, changes with every change of a file)
//   - the shared includes in includes/ (language menu, flags, footer, tracking);
//     a site's own _includes win if a file has the same name
//   - the service worker (assets/sw.js) with the list and a hash of all built files,
//     unless serviceWorker: false
//   - the dev server port from PORT (default 8080), so parallel worktrees can each run one
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { HtmlBasePlugin } from "@11ty/eleventy";
import fonts from "./data/fonts.js";
import tracking from "./data/tracking.js";
import { fontFiles, fontsCss } from "./lib/fonts-css.js";

const CORE = dirname(fileURLToPath(import.meta.url));
const CORE_ASSETS = join(CORE, "assets");
const INCLUDES = join(CORE, "includes");
// Files of assets/ that are published as they are; sw.js is a template.
const PUBLISHED = ["core.css", "core.js"];

/** Hash over the contents of every file in the given folders. */
function hashFiles(dirs) {
  const hash = createHash("sha256");
  for (const dir of dirs.filter((d) => existsSync(d))) {
    for (const entry of readdirSync(dir, { recursive: true, withFileTypes: true }).filter((e) => e.isFile()).sort((a, b) => join(a.parentPath, a.name).localeCompare(join(b.parentPath, b.name)))) {
      const file = join(entry.parentPath, entry.name);
      hash.update(relative(dir, file)).update(readFileSync(file));
    }
  }
  return hash.digest("hex");
}

export default function hostelgamesCore(eleventyConfig, options = {}) {
  const { site, assets = "src/assets", serviceWorker = true } = options;
  if (!site) throw new Error("@hostelgames/core: pass { site } (from @hostelgames/core/site)");
  const cacheName = options.cacheName ?? site.game?.slug ?? "hostelgames";

  // npm start: PORT=8081 npm start – one dev server per worktree.
  eleventyConfig.setServerOptions({ port: Number(process.env.PORT ?? 8080) });
  eleventyConfig.addPlugin(HtmlBasePlugin);

  // ---------- Assets ----------
  for (const file of PUBLISHED) {
    eleventyConfig.addPassthroughCopy({ [relative(process.cwd(), join(CORE_ASSETS, file))]: `assets/core/${file}` });
  }
  for (const [file, source] of fontFiles(fonts)) {
    eleventyConfig.addPassthroughCopy({ [relative(process.cwd(), source)]: `assets/core/fonts/${file}` });
  }
  eleventyConfig.addWatchTarget(CORE_ASSETS);
  eleventyConfig.addWatchTarget(INCLUDES);

  // ---------- Global data ----------
  eleventyConfig.addGlobalData("tracking", tracking);
  eleventyConfig.addGlobalData("fonts", fonts);
  // The two files every page needs first (body text and headings), fetched right away.
  eleventyConfig.addGlobalData("coreFonts", ["manrope-latin-400-normal.woff2", "manrope-latin-800-normal.woff2"]);
  eleventyConfig.addGlobalData("assetVersion", hashFiles([CORE_ASSETS, assets]).slice(0, 10));

  // ---------- Shared includes ----------
  // Nunjucks looks in the site's own _includes first, then in core/includes.
  eleventyConfig.on("eleventy.engine.njk", ({ environment }) => {
    for (const loader of environment.loaders) {
      if (Array.isArray(loader.searchPaths) && !loader.searchPaths.includes(INCLUDES)) loader.searchPaths.push(INCLUDES);
    }
  });

  // ---------- After the build ----------
  eleventyConfig.on("eleventy.after", ({ directories }) => {
    // directories.output also follows --output on the command line (the old `dir` does not).
    const output = directories.output;
    // fonts.css, from the @font-face rules of @fontsource
    mkdirSync(join(output, "assets/core"), { recursive: true });
    writeFileSync(join(output, "assets/core/fonts.css"), fontsCss(fonts));

    if (!serviceWorker) return;
    // Service worker with the list of all files and a hash over their contents,
    // so every deploy with changes gets a fresh cache.
    const files = readdirSync(output, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name !== "sw.js" && entry.name !== ".htaccess")
      .map((entry) => relative(output, join(entry.parentPath, entry.name)).split("\\").join("/"))
      .sort();
    const hash = createHash("sha256");
    for (const file of files) hash.update(file).update(readFileSync(join(output, file)));
    // Pages are cached under their folder URL ("de/"), not ".../index.html".
    const urls = files.map((file) => file.replace(/(^|\/)index\.html$/, "$1") || "./");
    const sw = readFileSync(join(CORE_ASSETS, "sw.js"), "utf8")
      .replace("__NAME__", cacheName)
      .replace("__VERSION__", hash.digest("hex").slice(0, 12))
      .replace("__FILES__", JSON.stringify(urls, null, 2));
    writeFileSync(join(output, "sw.js"), sw);
  });
}

export { CORE, INCLUDES };
