#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const examplesDir = path.join(repoRoot, "packages", "dsl-schema", "examples");

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

let timer = null;
let syncing = false;
let pending = false;

function syncArtifacts() {
  if (syncing) {
    pending = true;
    return;
  }

  syncing = true;
  const result = spawnSync("node", [path.join("scripts", "sync-preview-apps.mjs")], {
    cwd: repoRoot,
    stdio: "inherit",
    shell: process.platform === "win32"
  });

  syncing = false;

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  if (pending) {
    pending = false;
    syncArtifacts();
  }
}

function scheduleSync() {
  if (timer) {
    clearTimeout(timer);
  }

  timer = setTimeout(() => {
    syncArtifacts();
  }, 250);
}

syncArtifacts();

const devServer = spawn("npm", ["run", "dev", "-w", "web-preview"], {
  cwd: repoRoot,
  stdio: "inherit",
  shell: process.platform === "win32"
});

fs.watch(examplesDir, { persistent: true }, () => {
  scheduleSync();
});

devServer.on("exit", (code) => {
  process.exit(code ?? 0);
});