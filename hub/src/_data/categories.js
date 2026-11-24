// Sections of the hub page in their order ("categories" in hub/hub.json), each with its games
// (those whose game.json names it as "category"). A category may have no games yet.
import { readFileSync } from "node:fs";
import games from "./games.js";

const { categories } = JSON.parse(readFileSync(new URL("../../hub.json", import.meta.url), "utf8"));

export default categories.map((key) => ({ key, games: games.filter((game) => game.category === key) }));
