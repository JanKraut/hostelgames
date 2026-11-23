import { createRequire } from "node:module";
import { relative } from "node:path";
import hostelgames from "@hostelgames/core/eleventy";
import site from "./src/_data/site.js";

const require = createRequire(import.meta.url);

export default function (eleventyConfig) {
  // Shared core: design, fonts, light / dark, language menu, tracking, offline (service worker).
  eleventyConfig.addPlugin(hostelgames, { site, cacheName: "shithead" });

  eleventyConfig.addPassthroughCopy("src/assets");

  // Apache config for the Hetzner webspace of the game's own domain (shitheadgame.de).
  // Not needed on GitHub Pages, and wrong below hostelgames.com/shitheadgame/.
  if (site.ownDomain) eleventyConfig.addPassthroughCopy({ "src/.htaccess": ".htaccess" });

  eleventyConfig.addPassthroughCopy({ "src/manifest.webmanifest": "manifest.webmanifest" });

  // Classic favicon at the site root (16, 32, 48 px), which search engines look for.
  eleventyConfig.addPassthroughCopy({ "src/favicon.ico": "favicon.ico" });

  // QR code library (MIT) → /assets/qrcode.js
  eleventyConfig.addPassthroughCopy({ [relative(process.cwd(), require.resolve("qrcode-generator/qrcode.js"))]: "assets/qrcode.js" });
}

export const config = {
  dir: { input: "src", output: "_site" },
  pathPrefix: site.pathPrefix,
};
