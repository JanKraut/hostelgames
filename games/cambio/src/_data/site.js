// Where Cambio is published, see @hostelgames/core/site:
//   own domain      SITE_ORIGIN=https://cambiogame.de  SITE_PATH_PREFIX=/
//   default         GitHub Pages preview, https://jankraut.github.io/hostelgames/cambiogame/ (noindex)
import { createSite } from "@hostelgames/core/site";

export default createSite(new URL("../../game.json", import.meta.url));
