// The games shown on the hub: in the preview all of them (drafts marked),
// on hostelgames.com only those with status "live". On the main domain each one lives at /<path>/.
// Each game names its section with "category" in game.json; the sections and their order
// come from "categories" in hub/hub.json, their names from categories.<key> in the i18n.
import { readFileSync } from "node:fs";
import { visibleGames } from "@hostelgames/core/games";
import site from "./site.js";

const { categories } = JSON.parse(readFileSync(new URL("../../hub.json", import.meta.url), "utf8"));

export default visibleGames(site).map(({ dir, ...game }) => {
  if (!categories.includes(game.category)) {
    throw new Error(`games/${game.slug}/game.json: "category" must be one of ${categories.join(", ")}`);
  }
  return game;
});
