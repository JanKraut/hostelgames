#!/usr/bin/env node
// Decides what CI tests and deploys, from the files changed between two commits.
// Used by .github/workflows/ci.yml (job "plan"); can be run locally too:
//
//   BASE=origin/main HEAD=HEAD node scripts/ci-plan.js
//
//   BASE / HEAD   commits to compare. Empty or all zeros (new branch): everything counts as changed.
//   ALL=true      treat everything as changed (manual run of the workflow).
//
// A game counts as changed if a file in games/<slug>/ changed. A change in shared code
// (packages/, scripts/, .github/, package.json, package-lock.json) counts for every game.
// The hub (hostelgames.com) changes with hub/ or with any change that changes a game.
//
// Optional settings in a game's game.json:
//   "testShards": 3                      split its browser tests over 3 parallel runners (default 1)
//   "deploy": {
//     "environment": "shithead-hetzner", GitHub environment with the FTP secrets
//                                        (default "hetzner-webhosting", shared by all games)
//     "ftpDirVar": "HETZNER_FTP_DIR"     environment variable with the target folder
//                                        (default HETZNER_FTP_DIR_<SLUG>, e.g. HETZNER_FTP_DIR_SHITHEAD)
//   }
// Only games with a "domain" are deployed. Two games may never upload into the same folder
// variable of the same environment.
//
// Writes to $GITHUB_OUTPUT (or prints): games, tests, deploy (JSON), hub (true/false), playwright.
import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync } from "node:fs";
import games, { ROOT } from "../packages/core/lib/games.js";

export const DEFAULT_ENVIRONMENT = "hetzner-webhosting";
const SHARED = [/^packages\//, /^scripts\//, /^\.github\//, /^package(-lock)?\.json$/];

function changedFiles(base, head) {
  if (!base || /^0+$/.test(base)) return null; // unknown: everything
  try {
    return execFileSync("git", ["diff", "--name-only", base, head || "HEAD"], { cwd: new URL(ROOT), encoding: "utf8" })
      .split("\n")
      .filter(Boolean);
  } catch {
    return null; // base not in history (e.g. force push): everything
  }
}

export function plan({ files, all = false }) {
  const everything = all || files === null || files.some((file) => SHARED.some((re) => re.test(file)));
  const list = games();
  const changed = list.filter((game) => everything || files.some((file) => file.startsWith(`games/${game.slug}/`)));

  const deploy = changed
    .filter((game) => game.domain)
    .map((game) => ({
      slug: game.slug,
      domain: game.domain.replace(/\/$/, ""),
      environment: game.deploy?.environment ?? DEFAULT_ENVIRONMENT,
      ftpDirVar: game.deploy?.ftpDirVar ?? `HETZNER_FTP_DIR_${game.slug.toUpperCase().replace(/-/g, "_")}`,
    }));

  // Safety: with --delete, two games in one folder would wipe each other.
  const targets = new Map();
  for (const game of list.filter((g) => g.domain)) {
    const key = `${game.deploy?.environment ?? DEFAULT_ENVIRONMENT}/${game.deploy?.ftpDirVar ?? `HETZNER_FTP_DIR_${game.slug.toUpperCase().replace(/-/g, "_")}`}`;
    if (targets.has(key)) throw new Error(`games ${targets.get(key)} and ${game.slug} would deploy into the same folder (${key})`);
    targets.set(key, game.slug);
  }

  const tests = changed.flatMap((game) => {
    const total = Math.max(1, Number(game.testShards ?? 1));
    return Array.from({ length: total }, (_, i) => ({ slug: game.slug, shard: `${i + 1}/${total}` }));
  });

  return {
    games: changed.map((game) => game.slug),
    tests,
    deploy,
    hub: everything || changed.length > 0 || files.some((file) => file.startsWith("hub/")),
  };
}

function playwrightVersion() {
  const lock = JSON.parse(readFileSync(new URL("package-lock.json", ROOT), "utf8"));
  return lock.packages["node_modules/@playwright/test"]?.version ?? "";
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const files = changedFiles(process.env.BASE, process.env.HEAD);
  const result = plan({ files, all: process.env.ALL === "true" });
  const output = {
    games: JSON.stringify(result.games),
    tests: JSON.stringify(result.tests),
    deploy: JSON.stringify(result.deploy),
    hub: String(result.hub),
    playwright: playwrightVersion(),
  };
  console.log(files === null ? "Changed: everything" : `Changed files: ${files.length}`);
  for (const [key, value] of Object.entries(output)) console.log(`${key}=${value}`);
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, Object.entries(output).map(([k, v]) => `${k}=${v}\n`).join(""));
  }
}
