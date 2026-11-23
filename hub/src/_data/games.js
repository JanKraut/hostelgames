// Every game in games/ with a game.json. On the main domain each one lives at /<slug>/.
import games from "@hostelgames/core/games";

export default games().map(({ dir, ...game }) => game);
