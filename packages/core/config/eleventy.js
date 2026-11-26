// Eleventy config of every game. A game's eleventy.config.js is one line:
//
//   export { default, config } from "@hostelgames/core/config/eleventy";
//
// A game that needs more writes its own and calls gameConfig first:
//
//   import { gameConfig, config } from "@hostelgames/core/config/eleventy";
//   export default function (eleventyConfig) { gameConfig(eleventyConfig); … }
//   export { config };
//
// site, languages and sitemap.xml / robots.txt come from the core plugin, the game only has
// its pages, includes, texts (src/_data/i18n/) and assets (src/assets/, copied as they are).
import hostelgames from "../eleventy.js";
import { languages, site } from "../lib/game.js";

export function gameConfig(eleventyConfig) {
  // Shared core: design, fonts, light / dark, language menu, share box, tracking, offline.
  eleventyConfig.addPlugin(hostelgames, { site, languages });
  eleventyConfig.addPassthroughCopy("src/assets");
}

export default gameConfig;

export const config = {
  dir: { input: "src", output: "_site" },
  pathPrefix: site.pathPrefix,
};
