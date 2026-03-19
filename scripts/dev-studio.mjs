#!/usr/bin/env node
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const server = spawn("node", [path.join("scripts", "authoring-compile-server.mjs")], {
  cwd: repoRoot,
  stdio: "inherit",
  shell: process.platform === "win32"
});

const app = spawn("npm", ["run", "dev", "-w", "authoring-studio"], {
  cwd: repoRoot,
  stdio: "inherit",
  shell: process.platform === "win32"
});

function shutdown(code) {
  if (!server.killed) {
    server.kill();
  }

  if (!app.killed) {
    app.kill();
  }

  process.exit(code ?? 0);
}

server.on("exit", (code) => shutdown(code ?? 0));
app.on("exit", (code) => shutdown(code ?? 0));
process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));