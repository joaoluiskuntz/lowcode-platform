import { describe, expect, it } from "vitest";
import { validateDsl } from "../src/index";
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
              span: { xs: 12 },
              children: [
                {
                  type: "text",
                  id: "welcome-text",
                  props: {
                    text: "Welcome"
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
                  type: "card",
                  id: "basket-card",
                  props: {
                    title: "Basket",
                    body: "Ready"
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

describe("validateDsl", () => {
  it("accepts a valid DSL", () => {
    const result = validateDsl(createValidDsl());

    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it("fails schema validation for invalid app id", () => {
    const invalidDsl = cloneDsl(createValidDsl()) as unknown as {
      app: { id: string };
    };

    invalidDsl.app.id = "Invalid App Id";

    const result = validateDsl(invalidDsl);

    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.code === "SCHEMA_VALIDATION")).toBe(true);
  });

  it("fails when navigate target does not exist", () => {
    const invalidDsl = cloneDsl(createValidDsl());

    invalidDsl.screens[0].layout.children[0].children[1].events!.onClick![0] = {
      type: "navigate",
      target: "missing-screen"
    };

    const result = validateDsl(invalidDsl);

    expect(result.valid).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "NAVIGATE_TARGET_NOT_FOUND"
      })
    );
  });

  it("fails when component ids are duplicated", () => {
    const invalidDsl = cloneDsl(createValidDsl());

    invalidDsl.screens[1].layout.children[0].children[0] = {
      type: "card",
      id: "welcome-text",
      props: {
        title: "Duplicate",
        body: "This should fail"
      }
    };

    const result = validateDsl(invalidDsl);

    expect(result.valid).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "DUPLICATE_COMPONENT_ID"
      })
    );
  });
});