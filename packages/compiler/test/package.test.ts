import { describe, it, expect } from "vitest";
import validDsl from "@lowcode/dsl-schema/examples/basic-checkout.json";
import { compileDsl } from "../src";

describe("compileDsl", () => {
  it("produces deterministic output", () => {
    const first = compileDsl(validDsl);
    const second = compileDsl(validDsl);

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(first.output?.manifest.contentHash).toBe(second.output?.manifest.contentHash);
  });
});