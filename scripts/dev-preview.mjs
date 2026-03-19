#!/usr/bin/env node
import { spawnSync, spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

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

run("node", [path.join("scripts", "sync-preview-apps.mjs")]);

const devServer = spawn("npm", ["run", "dev", "-w", "web-preview"], {
  cwd: repoRoot,
  stdio: "inherit",
  shell: process.platform === "win32"
});

devServer.on("exit", (code) => {
  process.exit(code ?? 0);
});