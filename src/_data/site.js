// Where the site is published. Defaults are for GitHub Pages; the Hetzner
// deploy sets SITE_ORIGIN and SITE_PATH_PREFIX (see .github/workflows/ci.yml).
export default {
  origin: process.env.SITE_ORIGIN ?? "https://jankraut.github.io",
  pathPrefix: process.env.SITE_PATH_PREFIX ?? "/shitheadgame/",
};
