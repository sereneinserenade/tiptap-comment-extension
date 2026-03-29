const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const packageJsonPath = path.join(__dirname, "..", "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

test("peer dependencies support TipTap 2 and 3", () => {
  assert.equal(
    packageJson.peerDependencies["@tiptap/core"],
    "^2.0.0 || ^3.0.0",
  );
  assert.equal(
    packageJson.peerDependencies["@tiptap/pm"],
    "^2.0.0 || ^3.0.0",
  );
});
