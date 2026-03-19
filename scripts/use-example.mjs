#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const exampleName = process.argv[2];

if (!exampleName) {
  console.error("Usage: node scripts/use-example.mjs <example-name>");
  process.exit(1);
}

const outputDir = path.join(repoRoot, "build", "examples", exampleName);
const sourcePath = path.join(outputDir, "main.web.json");
const targetPath = path.join(repoRoot, "apps", "web-preview", "public", "main.web.json");

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

run("node", [path.join("scripts", "compile-example.mjs"), exampleName, outputDir]);

fs.mkdirSync(path.dirname(targetPath), { recursive: true });
fs.copyFileSync(sourcePath, targetPath);
console.log(`Loaded example ${exampleName} into ${targetPath}`);