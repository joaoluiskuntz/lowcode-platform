#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const sampleDsl = path.join(
  repoRoot,
  "packages",
  "dsl-schema",
  "examples",
  "basic-checkout.json"
);

const buildDir = path.join(repoRoot, "build", "preview");
const generatedWebIr = path.join(buildDir, "main.web.json");
const previewPublicDir = path.join(repoRoot, "apps", "web-preview", "public");
const previewTarget = path.join(previewPublicDir, "main.web.json");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    cwd: repoRoot,
    ...options
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function main() {
  fs.mkdirSync(buildDir, { recursive: true });
  fs.mkdirSync(previewPublicDir, { recursive: true });

  run("npm", ["run", "build", "-w", "@lowcode/dsl-schema"]);
  run("npm", ["run", "build", "-w", "@lowcode/validator"]);
  run("npm", ["run", "build", "-w", "@lowcode/ir"]);
  run("npm", ["run", "build", "-w", "@lowcode/compiler"]);
  run("npm", ["run", "build", "-w", "@lowcode/compiler-cli"]);

  run("node", [
    path.join("apps", "compiler-cli", "dist", "index.js"),
    sampleDsl,
    buildDir
  ]);

  fs.copyFileSync(generatedWebIr, previewTarget);
  console.log(`Copied ${generatedWebIr} -> ${previewTarget}`);

  const devServer = spawn("npm", ["run", "dev", "-w", "web-preview"], {
    stdio: "inherit",
    shell: process.platform === "win32",
    cwd: repoRoot
  });

  devServer.on("exit", (code) => {
    process.exit(code ?? 0);
  });
}

main();
