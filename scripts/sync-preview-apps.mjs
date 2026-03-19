#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const examplesDir = path.join(repoRoot, "packages", "dsl-schema", "examples");
const buildRoot = path.join(repoRoot, "build", "examples");
const publicAppsDir = path.join(repoRoot, "apps", "web-preview", "public", "apps");
const defaultTarget = path.join(repoRoot, "apps", "web-preview", "public", "main.web.json");

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

function compileExample(exampleName, inputPath) {
  const outputDir = path.join(buildRoot, exampleName);

  run("node", [
    path.join("apps", "compiler-cli", "dist", "index.js"),
    inputPath,
    outputDir
  ]);

  return {
    outputDir,
    webIrPath: path.join(outputDir, "main.web.json")
  };
}

function readExampleTitle(inputPath, exampleName) {
  try {
    const parsed = JSON.parse(fs.readFileSync(inputPath, "utf8").replace(/^\uFEFF/, ""));
    return typeof parsed?.app?.name === "string" ? parsed.app.name : exampleName;
  } catch {
    return exampleName;
  }
}

function main() {
  fs.mkdirSync(buildRoot, { recursive: true });
  fs.mkdirSync(publicAppsDir, { recursive: true });

  run("npm", ["run", "build", "-w", "@lowcode/dsl-schema"]);
  run("npm", ["run", "build", "-w", "@lowcode/validator"]);
  run("npm", ["run", "build", "-w", "@lowcode/ir"]);
  run("npm", ["run", "build", "-w", "@lowcode/compiler"]);
  run("npm", ["run", "build", "-w", "@lowcode/compiler-cli"]);

  const exampleFiles = fs
    .readdirSync(examplesDir)
    .filter((file) => file.endsWith(".json"))
    .sort();

  const indexEntries = [];

  for (const fileName of exampleFiles) {
    const exampleName = fileName.replace(/\.json$/, "");
    const inputPath = path.join(examplesDir, fileName);
    const { webIrPath } = compileExample(exampleName, inputPath);
    const targetFileName = `${exampleName}.web.json`;
    const publicPath = path.join(publicAppsDir, targetFileName);

    fs.copyFileSync(webIrPath, publicPath);

    indexEntries.push({
      id: exampleName,
      title: readExampleTitle(inputPath, exampleName),
      path: `/apps/${targetFileName}`
    });
  }

  if (indexEntries.length > 0) {
    const defaultEntry =
      indexEntries.find((entry) => entry.id === "basic-checkout") ?? indexEntries[0];

    fs.copyFileSync(path.join(repoRoot, "apps", "web-preview", "public", defaultEntry.path.replace(/^\//, "")), defaultTarget);
  }

  fs.writeFileSync(
    path.join(publicAppsDir, "index.json"),
    JSON.stringify(indexEntries, null, 2)
  );

  console.log(`Prepared ${indexEntries.length} preview artifacts.`);
}

main();