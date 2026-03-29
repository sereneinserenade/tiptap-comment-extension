const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const packageJsonPath = path.join(__dirname, "..", "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const publishWorkflowPath = path.join(
  __dirname,
  "..",
  ".github",
  "workflows",
  "publish.yaml",
);
const publishWorkflow = fs.readFileSync(publishWorkflowPath, "utf8");

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

test("publish workflow runs from published releases", () => {
  assert.match(
    publishWorkflow,
    /\bon:\s*\n\s+release:\s*\n\s+types:\s*\n\s+- published\b/,
  );
  assert.match(publishWorkflow, /github\.event\.release\.tag_name/);
});
