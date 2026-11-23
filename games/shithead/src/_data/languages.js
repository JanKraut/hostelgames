// The languages of Shithead: the codes come from game.json ("languages"),
// flag, name, fallback and menu order from @hostelgames/core/languages.
import { createLanguages } from "@hostelgames/core/languages";
import site from "./site.js";

export default createLanguages(site, new URL("./i18n/", import.meta.url));
