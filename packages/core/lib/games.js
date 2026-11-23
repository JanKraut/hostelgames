// The games of this monorepo: every folder in games/ with a game.json.
//
// game.json
//   slug     short name of the game (folder name, package @hostelgames/<slug>, offline cache)
//   name     shown on the hub page
//   tagline  one line for the hub page
//   domain   the game's own domain, e.g. https://shitheadgame.de (optional, may not exist yet)
//
// Its folder (game.path) is not set by hand: it is always the domain without its ending,
// e.g. https://shitheadgame.de → "shitheadgame" (without a domain: the slug). The same folder is used
// in the URL (hostelgames.com/<path>/, jankraut.github.io/hostelgames/<path>/) and on the FTP server.
import { existsSync, readdirSync, readFileSync } from "node:fs";

export const ROOT = new URL("../../../", import.meta.url);
export const GAMES_DIR = new URL("games/", ROOT);

/** The folder of a site: its domain without the ending ("https://www.shitheadgame.de" → "shitheadgame"). */
export function folderOf(domain) {
  const labels = new URL(domain).hostname.replace(/^www\./, "").split(".");
  if (labels.length < 2) throw new Error(`"${domain}" is not a domain like https://example.com`);
  return labels.slice(0, -1).join("-");
}

export function readGame(file) {
  const game = JSON.parse(readFileSync(file, "utf8"));
  if (!/^[a-z0-9-]+$/.test(game.slug ?? "")) throw new Error(`${file}: "slug" must be lowercase letters, digits and dashes`);
  if ("path" in game || game.deploy?.ftpDir) {
    throw new Error(`${file}: no "path" or "deploy.ftpDir" – the folder is always the domain without its ending`);
  }
  game.path = game.domain ? folderOf(game.domain) : game.slug;
  if (!/^[a-z0-9-]+$/.test(game.path)) throw new Error(`${file}: folder "${game.path}" (from domain) must be lowercase letters, digits and dashes`);
  return game;
}

export default function games() {
  return readdirSync(GAMES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(new URL(`${entry.name}/game.json`, GAMES_DIR)))
    .map((entry) => ({ ...readGame(new URL(`${entry.name}/game.json`, GAMES_DIR)), dir: new URL(`${entry.name}/`, GAMES_DIR) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
