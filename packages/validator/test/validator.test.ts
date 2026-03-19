import { describe, it, expect } from "vitest";
import { validateDsl } from "../src";
import validDsl from "@lowcode/dsl-schema/examples/basic-checkout.json";

describe("validateDsl", () => {
  it("accepts valid DSL", () => {
    const result = validateDsl(validDsl);
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("rejects navigation to unknown screen", () => {
    const broken = structuredClone(validDsl);
    const button = broken.screens[0].layout.children[0].children[1];
    button.events.onClick[0].target = "missing-screen";

    const result = validateDsl(broken);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.code === "NAVIGATE_TARGET_NOT_FOUND")).toBe(true);
  });
});