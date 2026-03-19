#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { compileDsl, stableStringify } from "@lowcode/compiler";

function main(): void {
  const inputPath = process.argv[2];
  const outputDir = process.argv[3] ?? "./build";

  if (!inputPath) {
    console.error("Usage: compiler-cli <input.json> [output-dir]");
    process.exit(1);
  }

  const raw = fs.readFileSync(inputPath, "utf-8");
  const dsl = JSON.parse(raw);

  const result = compileDsl(dsl);

  if (!result.ok) {
    console.error("Compilation failed:");
    for (const err of result.errors ?? []) {
      console.error(`- [${err.code}] ${err.path}: ${err.message}`);
    }
    process.exit(2);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  fs.writeFileSync(
    path.join(outputDir, "manifest.json"),
    stableStringify(result.output!.manifest)
  );

  fs.writeFileSync(
    path.join(outputDir, "main.web.json"),
    stableStringify(result.output!.web.ir)
  );

  fs.writeFileSync(
    path.join(outputDir, "main.android.json"),
    stableStringify(result.output!.android.ir)
  );

  console.log(`Build completed in ${outputDir}`);
}

main();
