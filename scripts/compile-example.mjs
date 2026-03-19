#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const exampleName = process.argv[2];
const outputDir =
  process.argv[3] ?? path.join(repoRoot, "build", "examples", exampleName ?? "");

if (!exampleName) {
  console.error("Usage: node scripts/compile-example.mjs <example-name> [output-dir]");
  process.exit(1);
}

const inputPath = path.join(
  repoRoot,
  "packages",
  "dsl-schema",
  "examples",
  `${exampleName}.json`
);

if (!fs.existsSync(inputPath)) {
  console.error(`Example not found: ${inputPath}`);
  process.exit(2);
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: "inherit",
    shell: process.platform === "win32"
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("npm", ["run", "build", "-w", "@lowcode/dsl-schema"]);
run("npm", ["run", "build", "-w", "@lowcode/validator"]);
run("npm", ["run", "build", "-w", "@lowcode/ir"]);
run("npm", ["run", "build", "-w", "@lowcode/compiler"]);
run("npm", ["run", "build", "-w", "@lowcode/compiler-cli"]);
run("node", [path.join("apps", "compiler-cli", "dist", "index.js"), inputPath, outputDir]);