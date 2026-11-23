#!/usr/bin/env node
// Builds everything into one folder, laid out like the main domain:
//
//   _site/              hub (start page, list of games)
//   _site/<path>/       each game in games/ (path from its game.json)
//
//   SITE_ORIGIN       default https://jankraut.github.io (GitHub Pages preview, noindex)
//   SITE_PATH_PREFIX  default /hostelgames/ – for hostelgames.com use SITE_ORIGIN=https://hostelgames.com SITE_PATH_PREFIX=/
//
// A game on its own domain is built on its own instead, e.g.
//   SITE_ORIGIN=https://shitheadgame.de SITE_PATH_PREFIX=/ npm run build -w @hostelgames/shithead
import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import games, { ROOT } from "../packages/core/lib/games.js";
import { PAGES_PREFIX } from "../packages/core/lib/site.js";

const root = fileURLToPath(ROOT);
// Eleventy is installed once for all workspaces, in the root node_modules.
const ELEVENTY = join(root, "node_modules/@11ty/eleventy/cmd.cjs");
const OUT = join(root, "_site");

let prefix = process.env.SITE_PATH_PREFIX ?? PAGES_PREFIX;
if (!prefix.startsWith("/")) prefix = `/${prefix}`;
if (!prefix.endsWith("/")) prefix += "/";

function run(label, cwd, args, env = {}) {
  console.log(`\n▶ ${label}`);
  const result = spawnSync(args[0], args.slice(1), { cwd, stdio: "inherit", env: { ...process.env, ...env } });
  if (result.status !== 0) {
    console.error(`✗ ${label} failed`);
    process.exit(result.status ?? 1);
  }
}

rmSync(OUT, { recursive: true, force: true });

run(`hub → ${prefix}`, join(root, "hub"), [process.execPath, ELEVENTY, "--quiet", `--output=${OUT}`], { SITE_PATH_PREFIX: prefix });

for (const game of games()) {
  const dir = fileURLToPath(game.dir);
  const gamePrefix = `${prefix}${game.path}/`;
  run(`${game.slug}: check`, dir, ["npm", "run", "--silent", "check"]);
  run(`${game.slug} → ${gamePrefix}`, dir, [process.execPath, ELEVENTY, "--quiet", `--output=${join(OUT, game.path)}`], { SITE_PATH_PREFIX: gamePrefix });
}

console.log(`\n✓ Built ${games().length} game(s) and the hub into _site/ (path prefix ${prefix})`);
