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
// Exception: if package.json / package-lock.json only changed in the parts of one game
// (scripts build:<slug> / start:<slug>, workspace entries games/<slug>), only that game counts –
// so adding a new game doesn't test all the others (rootJsonSlugs).
// The hub (hostelgames.com) changes with hub/ or with any change that changes a game.
//
// Hetzner: the FTP login of "hetzner-webhosting" is the main folder "hostelgames.com";
// every site has its own subfolder in it, e.g. "shitheadgame" or "hostelgames" (hub).
//
// Settings in a game's game.json (the hub's in hub/hub.json):
//   "domain": "https://…"                 only sites with a domain are deployed
//   "testShards": 3                       split its browser tests over 3 parallel runners (default 1)
//   "deploy": {
//     "environment": "shithead-hetzner"   optional own GitHub environment with its own FTP secrets
//                                         (default "hetzner-webhosting", shared by all)
//   }
// The FTP subfolder is always the domain without its ending: shitheadgame.de → shitheadgame,
// hostelgames.com → hostelgames (folderOf in packages/core/lib/games.js).
// Two sites may never upload into the same folder of the same environment.
//
// Writes to $GITHUB_OUTPUT (or prints): games, tests, deploy (JSON), hub (true/false), playwright.
import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync } from "node:fs";
import games, { ROOT, folderOf } from "../packages/core/lib/games.js";

export const DEFAULT_ENVIRONMENT = "hetzner-webhosting";
const SHARED = [/^packages\//, /^scripts\//, /^\.github\//, /^package(-lock)?\.json$/];

function changedFiles(base, head) {
  if (!base || /^0+$/.test(base)) return null; // unknown: everything
  try {
    const files = execFileSync("git", ["diff", "--name-only", base, head || "HEAD"], { cwd: new URL(ROOT), encoding: "utf8" })
      .split("\n")
      .filter(Boolean);
    return files.flatMap((file) => {
      if (!ROOT_JSON.includes(file)) return [file];
      const slugs = rootJsonSlugs(file, gitJson(base, file), gitJson(head || "HEAD", file));
      return slugs === null ? [file] : slugs.map((slug) => (slug === "hub" ? "hub/" : `games/${slug}/`));
    });
  } catch {
    return null; // base not in history (e.g. force push): everything
  }
}

const ROOT_JSON = ["package.json", "package-lock.json"];

/** A file's JSON at a commit, or null if it doesn't exist there. */
function gitJson(commit, file) {
  try {
    return JSON.parse(execFileSync("git", ["show", `${commit}:${file}`], { cwd: new URL(ROOT), encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
  } catch {
    return null;
  }
}

/** JSON with sorted keys, so key order doesn't count as a change. */
function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

/**
 * Which sites a change of package.json or package-lock.json belongs to: a list of slugs
 * ("hub" for the hub) if only the parts of single sites changed, null if anything else changed
 * (then it counts for every game). Parts of a site:
 *   package.json        scripts "build:<slug>" and "start:<slug>"
 *   package-lock.json   packages "games/<slug>", "hub" and "node_modules/@hostelgames/<slug>"
 */
export function rootJsonSlugs(file, before, after) {
  const PARTS = {
    "package.json": ["scripts", (key) => key.match(/^(?:build|start):([a-z0-9-]+)$/)?.[1]],
    "package-lock.json": ["packages", (key) => (key === "hub" ? "hub" : key.match(/^(?:games\/|node_modules\/@hostelgames\/)([a-z0-9-]+)$/)?.[1])],
  };
  if (!before || !after || !PARTS[file]) return null;
  const [section, match] = PARTS[file];
  // @hostelgames/core is shared by every game.
  const slugOf = (key) => (match(key) === "core" ? undefined : match(key));

  const withoutSites = (json) => {
    const entries = Object.entries(json[section] ?? {}).filter(([key]) => !slugOf(key));
    return canonical({ ...json, [section]: Object.fromEntries(entries) });
  };
  if (withoutSites(before) !== withoutSites(after)) return null;

  const a = before[section] ?? {};
  const b = after[section] ?? {};
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...new Set([...keys].filter((key) => slugOf(key) && canonical(a[key]) !== canonical(b[key])).map(slugOf))];
}

export function plan({ files, all = false }) {
  const everything = all || files === null || files.some((file) => SHARED.some((re) => re.test(file)));
  const list = games();
  const changed = list.filter((game) => everything || files.some((file) => file.startsWith(`games/${game.slug}/`)));

  const hubChanged = everything || changed.length > 0 || files.some((file) => file.startsWith("hub/"));
  const hub = { ...JSON.parse(readFileSync(new URL("hub/hub.json", ROOT), "utf8")), slug: "hub" };

  // Every site with a domain, as the deploy job needs it. Games with status "draft" are only in
  // the preview (GitHub Pages) and never deployed to their own domain.
  const sites = [...list.map((game) => ({ ...game, workspace: `games/${game.slug}` })), { ...hub, workspace: "hub" }]
    .filter((site) => site.domain && site.status !== "draft")
    .map((site) => ({
      slug: site.slug,
      workspace: site.workspace,
      domain: site.domain.replace(/\/$/, ""),
      environment: site.deploy?.environment ?? DEFAULT_ENVIRONMENT,
      ftpDir: folderOf(site.domain, site.workspace),
    }));

  // Safety: with --delete, two sites in one folder would wipe each other.
  const targets = new Map();
  for (const site of sites) {
    if (!/^[A-Za-z0-9._-]+(\/[A-Za-z0-9._-]+)*$/.test(site.ftpDir) || site.ftpDir.split("/").includes("..")) {
      throw new Error(`${site.slug}: folder "${site.ftpDir}" must be a plain subfolder like "shitheadgame"`);
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
