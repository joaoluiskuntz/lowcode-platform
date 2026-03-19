import { describe, expect, it } from "vitest";
import { compileDsl, stableStringify } from "../src/index";
import type { LowCodeDsl } from "../../dsl-schema/src/index";

function createValidDsl(): LowCodeDsl {
  return {
    schemaVersion: "1.0.0",
    app: {
      id: "self-checkout-demo",
      name: "Self Checkout Demo"
    },
    theme: {
      bootstrapTheme: "default",
      primaryColor: "#0d6efd",
      borderRadius: "md"
    },
    screens: [
      {
        id: "home",
        title: "Home",
        layout: {
          type: "row",
          children: [
            {
              type: "column",
              span: { xs: 12, md: 8 },
              children: [
                {
                  type: "text",
                  id: "welcome-text",
                  props: {
                    text: ""
                  },
                  bindings: {
                    text: "state.customerName"
                  }
                },
                {
                  type: "input",
                  id: "customer-name-input",
                  props: {
                    label: "Customer name",
                    placeholder: "Type your name",
                    stateKey: "customerName"
                  }
                },
                {
                  type: "button",
                  id: "start-button",
                  props: {
                    label: "Start checkout",
                    variant: "primary"
                  },
                  events: {
                    onClick: [
                      {
                        type: "navigate",
                        target: "basket"
                      }
                    ]
                  }
                }
              ]
            },
            {
              type: "column",
              span: { xs: 12, md: 4 },
              children: [
                {
                  type: "card",
                  id: "live-card",
                  props: {
                    title: "Live preview",
                    body: ""
                  },
                  bindings: {
                    body: "state.customerName"
                  }
                }
              ]
            }
          ]
        }
      },
      {
        id: "basket",
        title: "Basket",
        layout: {
          type: "row",
          children: [
            {
              type: "column",
              span: { xs: 12 },
              children: [
                {
                  type: "text",
                  id: "basket-name",
                  props: {
                    text: ""
                  },
                  bindings: {
                    text: "state.customerName"
                  }
                }
              ]
            }
          ]
        }
      }
    ]
  };
}

function cloneDsl<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function collectComponentNodes(node: any): any[] {
  if (node.kind === "component") {
    return [node];
  }

  return (node.children ?? []).flatMap((child: any) => collectComponentNodes(child));
}

describe("compileDsl", () => {
  it("compiles a valid DSL successfully", () => {
    const result = compileDsl(createValidDsl());

    expect(result.ok).toBe(true);
    expect(result.errors).toBeUndefined();
    expect(result.output?.manifest.contentHash).toMatch(/^[a-f0-9]{64}$/);
    expect(result.output?.manifest.targets).toEqual(["web", "android"]);
  });

  it("transforms DSL nodes into IR while preserving bindings", () => {
    const result = compileDsl(createValidDsl());

    expect(result.ok).toBe(true);

    const homeScreen = result.output!.web.ir.screens.find((screen) => screen.id === "home");
    const componentNodes = collectComponentNodes(homeScreen!.root);

    expect(componentNodes).toContainEqual(
      expect.objectContaining({
        nodeId: "welcome-text",
        componentType: "text",
        bindings: {
          text: "state.customerName"
        }
      })
    );

    expect(componentNodes).toContainEqual(
      expect.objectContaining({
        nodeId: "live-card",
        componentType: "card",
        bindings: {
          body: "state.customerName"
        }
      })
    );
  });

  it("produces deterministic package output across repeated compiles", () => {
    const resultA = compileDsl(createValidDsl());
    const resultB = compileDsl(cloneDsl(createValidDsl()));

    expect(resultA.ok).toBe(true);
    expect(resultB.ok).toBe(true);
    expect(resultA.output!.manifest.contentHash).toBe(resultB.output!.manifest.contentHash);
    expect(stableStringify(resultA.output)).toBe(stableStringify(resultB.output));
  });
});