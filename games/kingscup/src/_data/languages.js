// The languages of King’s Cup: codes from game.json, flag, name and order from @hostelgames/core.
import { createLanguages } from "@hostelgames/core/languages";
import site from "./site.js";

export default createLanguages(site, new URL("./i18n/", import.meta.url));
