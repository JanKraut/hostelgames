// The game in the current folder (npm scripts of a game run in games/<slug>/):
// its site (address, game.json) and its languages with their texts.
// Used by the game config (config/eleventy.js), check-i18n and the game's tests:
//
//   import { site, languages } from "@hostelgames/core/game";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { createLanguages } from "./languages.js";
import { createSite } from "./site.js";

/** Folder of the game: GAME_DIR, else the current folder. */
export const GAME_DIR = process.env.GAME_DIR ?? process.cwd();

const gameFile = join(GAME_DIR, "game.json");
if (!existsSync(gameFile)) throw new Error(`@hostelgames/core/game: no game.json in ${GAME_DIR} (run it in games/<slug>/)`);

export const site = createSite(pathToFileURL(gameFile));
export const languages = createLanguages(site, pathToFileURL(join(GAME_DIR, "src/_data/i18n/")));
