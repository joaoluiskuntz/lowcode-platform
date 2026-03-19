import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../src/App";

function createBindingApp(name: string) {
  return {
    version: "1.0.0",
    app: { id: name.toLowerCase().replace(/\s+/g, "-"), name },
    theme: {
      bootstrapTheme: "default",
      primaryColor: "#0d6efd",
      borderRadius: "md"
    },
    screens: [
      {
        id: "home",
        title: "Home",
        root: {
          kind: "container",
          nodeId: "home-root",
          containerType: "row",
          classList: [],
          bindings: {},
          layout: {},
          children: [
            {
              kind: "container",
              nodeId: "home-column",
              containerType: "column",
              classList: [],
              bindings: {},
              layout: {
                span: {
                  xs: 12
                }
              },
              children: [
                {
                  kind: "component",
                  nodeId: "customer-input",
                  componentType: "input",
                  classList: [],
                  bindings: {},
                  props: {
                    label: "Customer name",
                    placeholder: "Type here",
                    stateKey: "customerName"
                  },
                  events: {}
                },
                {
                  kind: "component",
                  nodeId: "customer-text",
                  componentType: "text",
                  classList: [],
                  bindings: {
                    text: "state.customerName"
                  },
                  props: {
                    text: "Waiting for input"
                  },
                  events: {}
                },
                {
                  kind: "component",
                  nodeId: "go-basket",
                  componentType: "button",
                  classList: [],
                  bindings: {},
                  props: {
                    label: "Go to Basket",
                    variant: "primary"
                  },
                  events: {
                    onClick: [
                      {
                        type: "navigate",
                        payload: {
                          target: "basket"
                        }
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
        root: {
          kind: "container",
          nodeId: "basket-root",
          containerType: "row",
          classList: [],
          bindings: {},
          layout: {},
          children: [
            {
              kind: "container",
              nodeId: "basket-column",
              containerType: "column",
              classList: [],
              bindings: {},
              layout: {
                span: {
                  xs: 12
                }
              },
              children: [
                {
                  kind: "component",
                  nodeId: "basket-customer",
                  componentType: "text",
                  classList: [],
                  bindings: {
                    text: "state.customerName"
                  },
                  props: {
                    text: "Missing"
                  },
                  events: {}
                }
              ]
            }
          ]
        }
      }
    ]
  };
}

function createServiceApp() {
  return {
    version: "1.0.0",
    app: { id: "service-demo", name: "Service Demo" },
    theme: {
      bootstrapTheme: "default",
      primaryColor: "#0d6efd",
      borderRadius: "md"
    },
    screens: [
      {
        id: "home",
        title: "Home",
        root: {
          kind: "container",
          nodeId: "service-home-root",
          containerType: "row",
          classList: [],
          bindings: {},
          layout: {},
          children: [
            {
              kind: "container",
              nodeId: "service-home-column",
              containerType: "column",
              classList: [],
              bindings: {},
              layout: {
                span: {
                  xs: 12
                }
              },
              children: [
                {
                  kind: "component",
                  nodeId: "load-summary",
                  componentType: "button",
                  classList: [],
                  bindings: {},
                  props: {
                    label: "Load Summary",
                    variant: "primary"
                  },
                  events: {
                    onClick: [
                      {
                        type: "callService",
                        payload: {
                          service: "basketSummary",
                          resultStateKey: "basket",
                          mockResult: {
                            summary: "Loaded from preview stub"
                          },
                          onSuccess: [
                            {
                              type: "navigate",
                              payload: {
                                target: "basket"
                              }
                            }
                          ]
                        }
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
        root: {
          kind: "container",
          nodeId: "service-basket-root",
          containerType: "row",
          classList: [],
          bindings: {},
          layout: {},
          children: [
            {
              kind: "container",
              nodeId: "service-basket-column",
              containerType: "column",
              classList: [],
              bindings: {},
              layout: {
                span: {
                  xs: 12
                }
              },
              children: [
                {
                  kind: "component",
                  nodeId: "basket-summary",
                  componentType: "text",
                  classList: [],
                  bindings: {
                    text: "state.basket.summary"
                  },
                  props: {
                    text: "Missing"
                  },
                  events: {}
                }
              ]
            }
          ]
        }
      }
    ]
  };
}

function jsonResponse(payload: unknown) {
  return {
    ok: true,
    json: async () => payload
  } as Response;
}

function wasFetched(fetchMock: ReturnType<typeof vi.fn>, fragment: string): boolean {
  return fetchMock.mock.calls.some((call) => String(call[0]).includes(fragment));
}

describe("web-preview interactions", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/apps/index.json")) {
        return jsonResponse([
          { id: "alpha", title: "Alpha App", path: "/apps/alpha.web.json" },
          { id: "beta", title: "Beta App", path: "/apps/beta.web.json" },
          { id: "service", title: "Service Demo", path: "/apps/service.web.json" }
        ]);
      }

      if (url.includes("/apps/alpha.web.json")) {
        return jsonResponse(createBindingApp("Alpha App"));
      }

      if (url.includes("/apps/beta.web.json")) {
        return jsonResponse(createBindingApp("Beta App"));
      }

      if (url.includes("/apps/service.web.json")) {
        return jsonResponse(createServiceApp());
      }

      if (url.includes("/main.web.json")) {
        return jsonResponse(createBindingApp("Fallback App"));
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("alert", vi.fn());
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders a compiled screen, updates state through input bindings, and navigates", async () => {
    render(<App />);

    await waitFor(() => {
      expect(wasFetched(fetchMock, "/apps/alpha.web.json")).toBe(true);
      expect(document.body.textContent ?? "").toContain("Go to Basket");
    });

    fireEvent.change(screen.getByLabelText("Customer name"), {
      target: {
        value: "Ana"
      }
    });

    await waitFor(() => {
      expect(document.body.textContent ?? "").toContain("Ana");
    });

    fireEvent.click(screen.getByText("Go to Basket"));

    await waitFor(() => {
      expect(document.body.textContent ?? "").toContain("Basket");
      expect(document.body.textContent ?? "").toContain("Ana");
    });
  });

  it("loads the selected artifact from the query parameter and switches artifacts through the selector", async () => {
    window.history.replaceState({}, "", "/?app=beta");

    render(<App />);

    await waitFor(() => {
      expect(wasFetched(fetchMock, "/apps/beta.web.json")).toBe(true);
    });

    fireEvent.change(screen.getByLabelText("Compiled artifact"), {
      target: {
        value: "alpha"
      }
    });

    await waitFor(() => {
      expect(wasFetched(fetchMock, "/apps/alpha.web.json")).toBe(true);
      expect(window.location.search).toContain("app=alpha");
    });
  });

  it("handles callService with deterministic preview behavior and chained navigation", async () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);

    render(<App />);

    await waitFor(() => {
      expect(wasFetched(fetchMock, "/apps/alpha.web.json")).toBe(true);
    });

    fireEvent.change(screen.getByLabelText("Compiled artifact"), {
      target: {
        value: "service"
      }
    });

    await waitFor(() => {
      expect(wasFetched(fetchMock, "/apps/service.web.json")).toBe(true);
      expect(document.body.textContent ?? "").toContain("Load Summary");
    });

    fireEvent.click(screen.getByText("Load Summary"));

    await waitFor(() => {
      expect(document.body.textContent ?? "").toContain("Loaded from preview stub");
    });

    expect(infoSpy).toHaveBeenCalledWith(
      "callService handled by preview stub",
      expect.objectContaining({
        service: "basketSummary",
        mode: "mock"
      })
    );

    infoSpy.mockRestore();
  });
});