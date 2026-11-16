import { HtmlBasePlugin } from "@11ty/eleventy";
import site from "./src/_data/site.js";
import fonts from "./src/_data/fonts.js";

export default function (eleventyConfig) {
  // Prefixes root-relative links (/de/, /assets/…) with site.pathPrefix.
  eleventyConfig.addPlugin(HtmlBasePlugin);
  eleventyConfig.addPassthroughCopy("src/assets");

  // QR code library (MIT) → /assets/qrcode.js
  eleventyConfig.addPassthroughCopy({ "node_modules/qrcode-generator/qrcode.js": "assets/qrcode.js" });

  // Font files listed in src/_data/fonts.js → /assets/fonts/
  for (const { pkg, weights, subsets } of fonts) {
    for (const subset of subsets) {
      for (const weight of weights) {
        const file = `${pkg}-${subset}-${weight}-normal.woff2`;
        eleventyConfig.addPassthroughCopy({ [`node_modules/@fontsource/${pkg}/files/${file}`]: `assets/fonts/${file}` });
      }
    }
  }
}

export const config = {
  dir: { input: "src", output: "_site" },
  pathPrefix: site.pathPrefix,
};
