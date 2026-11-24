// Sections of the hub page in their order (CATEGORIES in @hostelgames/core/games), each with
// its games (those whose game.json names it as "category"). A category may have no games yet.
import { CATEGORIES } from "@hostelgames/core/games";
import games from "./games.js";

export default CATEGORIES.map((key) => ({ key, games: games.filter((game) => game.category === key) }));
