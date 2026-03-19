import { describe, it, expect } from "vitest";
import validDsl from "@lowcode/dsl-schema/examples/basic-checkout.json";
import { transformDslToIr } from "../src/transform";

describe("transformDslToIr", () => {
  it("transforms DSL into normalized IR", () => {
    const ir = transformDslToIr(validDsl);

    expect(ir.app.id).toBe("self-checkout-demo");
    expect(ir.screens).toHaveLength(2);
    expect(ir.screens[0].root.kind).toBe("container");
  });
});