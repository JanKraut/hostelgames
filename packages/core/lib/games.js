// The games of this monorepo: every folder in games/ with a game.json.
//
// game.json
//   slug     folder name and path on the main domain (hostelgames.com/<slug>/)
//   name     shown on the hub page
//   tagline  one line for the hub page
//   domain   the game's own domain, e.g. https://shitheadgame.de (optional, may not exist yet)
import { existsSync, readdirSync, readFileSync } from "node:fs";

export const ROOT = new URL("../../../", import.meta.url);
export const GAMES_DIR = new URL("games/", ROOT);

export function readGame(file) {
  const game = JSON.parse(readFileSync(file, "utf8"));
  if (!/^[a-z0-9-]+$/.test(game.slug ?? "")) throw new Error(`${file}: "slug" must be lowercase letters, digits and dashes`);
  return game;
}

export default function games() {
  return readdirSync(GAMES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(new URL(`${entry.name}/game.json`, GAMES_DIR)))
    .map((entry) => ({ ...readGame(new URL(`${entry.name}/game.json`, GAMES_DIR)), dir: new URL(`${entry.name}/`, GAMES_DIR) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
