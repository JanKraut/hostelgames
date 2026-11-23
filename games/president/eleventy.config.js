import hostelgames from "@hostelgames/core/eleventy";
import site from "./src/_data/site.js";

export default function (eleventyConfig) {
  // Shared core: design, fonts, light / dark, language menu, share box, tracking, offline.
  eleventyConfig.addPlugin(hostelgames, { site });
  eleventyConfig.addPassthroughCopy("src/assets");
}

export const config = {
  dir: { input: "src", output: "_site" },
  pathPrefix: site.pathPrefix,
};
