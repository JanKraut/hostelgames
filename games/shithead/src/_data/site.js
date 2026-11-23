// Where Shithead is published, see @hostelgames/core/site:
//   own domain      SITE_ORIGIN=https://shitheadgame.de  SITE_PATH_PREFIX=/
//   main domain     SITE_ORIGIN=https://hostelgames.com  SITE_PATH_PREFIX=/shitheadgame/
//   default         GitHub Pages preview, https://jankraut.github.io/hostelgames/shitheadgame/ (noindex)
import { createSite } from "@hostelgames/core/site";

export default createSite(new URL("../../game.json", import.meta.url));
