import hostelgames from "@hostelgames/core/eleventy";
import site from "./src/_data/site.js";

export default function (eleventyConfig) {
  // No service worker on the hub: each game has its own one below /<game>/.
  eleventyConfig.addPlugin(hostelgames, { site, serviceWorker: false });
  eleventyConfig.addPassthroughCopy("src/assets");
  // Classic favicon at the site root (16, 32, 48 px), which search engines look for.
  eleventyConfig.addPassthroughCopy({ "src/favicon.ico": "favicon.ico" });
}

export const config = {
  dir: { input: "src", output: "_site" },
  pathPrefix: site.pathPrefix,
};
