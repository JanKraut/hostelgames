// Where Kniffel is published, see @hostelgames/core/site:
//   own domain      none yet (set "domain" in game.json, then SITE_ORIGIN=<domain> SITE_PATH_PREFIX=/)
//   default         GitHub Pages preview, https://jankraut.github.io/hostelgames/kniffel/ (noindex)
import { createSite } from "@hostelgames/core/site";

export default createSite(new URL("../../game.json", import.meta.url));
