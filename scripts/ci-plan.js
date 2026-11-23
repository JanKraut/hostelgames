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
// Hetzner: the FTP login of "hetzner-webhosting" is the main folder "hostelgames.com";
// every site has its own subfolder in it, e.g. "shitheadgame" or "hostelgames" (hub).
//
// Settings in a game's game.json (the hub's in hub/hub.json):
//   "domain": "https://…"                 only sites with a domain are deployed
//   "testShards": 3                       split its browser tests over 3 parallel runners (default 1)
//   "deploy": {
//     "ftpDir": "shitheadgame",          subfolder on the FTP login (default: the slug)
//     "environment": "shithead-hetzner"   optional own GitHub environment with its own FTP secrets
//                                         (default "hetzner-webhosting", shared by all)
//   }
// Two sites may never upload into the same folder of the same environment.
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

  const hubChanged = everything || changed.length > 0 || files.some((file) => file.startsWith("hub/"));
  const hub = { ...JSON.parse(readFileSync(new URL("hub/hub.json", ROOT), "utf8")), slug: "hub" };

  // Every site with a domain, as the deploy job needs it.
  const sites = [...list.map((game) => ({ ...game, workspace: `games/${game.slug}` })), { ...hub, workspace: "hub" }]
    .filter((site) => site.domain)
    .map((site) => ({
      slug: site.slug,
      workspace: site.workspace,
      domain: site.domain.replace(/\/$/, ""),
      environment: site.deploy?.environment ?? DEFAULT_ENVIRONMENT,
      ftpDir: (site.deploy?.ftpDir ?? site.slug).replace(/^\/+|\/+$/g, ""),
    }));

  // Safety: with --delete, two sites in one folder would wipe each other.
  const targets = new Map();
  for (const site of sites) {
    if (!/^[A-Za-z0-9._-]+(\/[A-Za-z0-9._-]+)*$/.test(site.ftpDir) || site.ftpDir.split("/").includes("..")) {
      throw new Error(`${site.slug}: deploy.ftpDir "${site.ftpDir}" must be a subfolder like "shitheadgame"`);
    }
    const key = `${site.environment}/${site.ftpDir}`;
    if (targets.has(key)) throw new Error(`${targets.get(key)} and ${site.slug} would deploy into the same folder (${key})`);
    targets.set(key, site.slug);
  }
  const deploy = sites.filter((site) => (site.slug === "hub" ? hubChanged : changed.some((game) => game.slug === site.slug)));

  const tests = changed.flatMap((game) => {
    const total = Math.max(1, Number(game.testShards ?? 1));
    return Array.from({ length: total }, (_, i) => ({ slug: game.slug, shard: `${i + 1}/${total}` }));
  });

  return {
    games: changed.map((game) => game.slug),
    tests,
    deploy,
    hub: hubChanged,
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
