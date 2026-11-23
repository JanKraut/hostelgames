// The languages of the hub: codes from hub/hub.json ("languages"), flag, name and order
// from @hostelgames/core. English at /, every other language at /<code>/.
import { readFileSync } from "node:fs";
import { createLanguages } from "@hostelgames/core/languages";
import site from "./site.js";

const hub = JSON.parse(readFileSync(new URL("../../hub.json", import.meta.url), "utf8"));

export default createLanguages({ ...site, game: { languages: hub.languages } }, new URL("./i18n/", import.meta.url));
