import crypto from "node:crypto";
import { AppIr } from "@lowcode/ir";
import { stableStringify } from "./stableJson";

export interface BuildManifest {
  appId: string;
  version: string;
  generatedAt: string;
  targets: string[];
  contentHash: string;
}

export interface BuildOutput {
  manifest: BuildManifest;
  web: {
    ir: AppIr;
    entry: string;
  };
  android: {
    ir: AppIr;
    entry: string;
  };
}

export function packageBuild(ir: AppIr): BuildOutput {
  const canonicalIr = stableStringify(ir);
  const contentHash = sha256(canonicalIr);

  const manifest: BuildManifest = {
    appId: ir.app.id,
    version: ir.version,
    generatedAt: "1970-01-01T00:00:00.000Z",
    targets: ["web", "android"],
    contentHash
  };

  return {
    manifest,
    web: {
      ir,
      entry: "main.web.json"
    },
    android: {
      ir,
      entry: "main.android.json"
    }
  };
}

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}