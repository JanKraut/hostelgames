// The games shown on the hub: in the preview all of them (drafts marked),
// on hostelgames.com only those with status "live". On the main domain each one lives at /<path>/.
import { visibleGames } from "@hostelgames/core/games";
import site from "./site.js";

export default visibleGames(site).map(({ dir, ...game }) => game);
