// The games of this monorepo: every folder in games/ with a game.json.
//
// game.json
//   slug     short name of the game (folder name, package @hostelgames/<slug>, offline cache)
//   path     not set by hand: the folder of the game everywhere (hostelgames.com/<path>/,
//            jankraut.github.io/hostelgames/<path>/, FTP subfolder). It is always the
//            domain without its ending (https://shitheadgame.de → shitheadgame);
//            without a domain the slug.
//   name     shown on the hub page
//   tagline  one line for the hub page
//   domain   the game's own domain, e.g. https://shitheadgame.de (optional, may not exist yet)
import { existsSync, readdirSync, readFileSync } from "node:fs";

export const ROOT = new URL("../../../", import.meta.url);
export const GAMES_DIR = new URL("games/", ROOT);

/**
 * Folder name of a site: its domain without the ending, e.g.
 * https://shitheadgame.de → "shitheadgame", https://www.hostelgames.com → "hostelgames".
 * Returns null without a domain.
 */
export function folderOf(domain, file = "") {
  if (!domain) return null;
  let host;
  try {
    host = new URL(domain).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    throw new Error(`${file}: "domain" must be a full address like https://shitheadgame.de`);
  }
  const folder = host.split(".").slice(0, -1).join("-");
  if (!/^[a-z0-9-]+$/.test(folder)) throw new Error(`${file}: no folder name can be made from domain ${domain}`);
  return folder;
}

export function readGame(file) {
  const game = JSON.parse(readFileSync(file, "utf8"));
  if (!/^[a-z0-9-]+$/.test(game.slug ?? "")) throw new Error(`${file}: "slug" must be lowercase letters, digits and dashes`);
  if ("path" in game) throw new Error(`${file}: remove "path" – the folder is always the domain without its ending`);
  game.path = folderOf(game.domain, file) ?? game.slug;
  return game;
}

export default function games() {
  return readdirSync(GAMES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(new URL(`${entry.name}/game.json`, GAMES_DIR)))
    .map((entry) => ({ ...readGame(new URL(`${entry.name}/game.json`, GAMES_DIR)), dir: new URL(`${entry.name}/`, GAMES_DIR) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
