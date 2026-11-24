// Tests for scripts/ci-plan.js: which changes of package.json / package-lock.json belong to
// a single game. Run: node --test scripts/
import assert from "node:assert/strict";
import { test } from "node:test";
import { plan, rootJsonSlugs } from "./ci-plan.js";

const PKG = {
  name: "hostelgames",
  workspaces: ["packages/*", "games/*", "hub"],
  scripts: { build: "node scripts/build-all.js", "build:cabo": "x", "start:cabo": "x", "start:hub": "x" },
};
const LOCK = {
  name: "hostelgames",
  lockfileVersion: 3,
  packages: {
    "": { workspaces: ["packages/*", "games/*", "hub"] },
    "games/cabo": { name: "@hostelgames/cabo", devDependencies: { "@playwright/test": "1.63.0" } },
    "packages/core": { name: "@hostelgames/core" },
    hub: { name: "@hostelgames/hub" },
    "node_modules/@hostelgames/cabo": { resolved: "games/cabo", link: true },
    "node_modules/@hostelgames/core": { resolved: "packages/core", link: true },
    "node_modules/@playwright/test": { version: "1.63.0" },
  },
};
const clone = (json) => structuredClone(json);

test("package.json: new build / start scripts belong to their game", () => {
  const after = clone(PKG);
  after.scripts["build:kniffel"] = "x";
  after.scripts["start:kniffel"] = "x";
  assert.deepEqual(rootJsonSlugs("package.json", PKG, after), ["kniffel"]);
});

test("package.json: any other change counts for everything", () => {
  const after = clone(PKG);
  after.scripts.build = "something else";
  assert.equal(rootJsonSlugs("package.json", PKG, after), null);
  const deps = clone(PKG);
  deps.devDependencies = { prettier: "3" };
  assert.equal(rootJsonSlugs("package.json", PKG, deps), null);
});

test("package-lock.json: a new workspace belongs to its game", () => {
  const after = clone(LOCK);
  after.packages["games/kniffel"] = { name: "@hostelgames/kniffel" };
  after.packages["node_modules/@hostelgames/kniffel"] = { resolved: "games/kniffel", link: true };
  assert.deepEqual(rootJsonSlugs("package-lock.json", LOCK, after), ["kniffel"]);
});

test("package-lock.json: the hub's own entry belongs to the hub", () => {
  const after = clone(LOCK);
  after.packages.hub = { name: "@hostelgames/hub", version: "2" };
  assert.deepEqual(rootJsonSlugs("package-lock.json", LOCK, after), ["hub"]);
});

test("package-lock.json: a new dependency version or a change of core counts for everything", () => {
  const playwright = clone(LOCK);
  playwright.packages["node_modules/@playwright/test"].version = "1.64.0";
  playwright.packages["games/cabo"].devDependencies["@playwright/test"] = "1.64.0";
  assert.equal(rootJsonSlugs("package-lock.json", LOCK, playwright), null);
  const core = clone(LOCK);
  core.packages["node_modules/@hostelgames/core"].link = false;
  assert.equal(rootJsonSlugs("package-lock.json", LOCK, core), null);
});

test("missing file before or after, or another file: everything", () => {
  assert.equal(rootJsonSlugs("package.json", null, PKG), null);
  assert.equal(rootJsonSlugs("package.json", PKG, null), null);
  assert.equal(rootJsonSlugs("tsconfig.json", PKG, PKG), null);
});

test("plan: only the changed game is tested", () => {
  const result = plan({ files: ["games/cabo/src/index.njk"] });
  assert.deepEqual(result.games, ["cabo"]);
  assert.equal(result.hub, true);
  assert.equal(plan({ files: ["packages/core/assets/core.css"] }).games.length > 1, true);
});
