import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../src/App";

function createCompiledApp() {
  return {
    version: "1.0.0",
    app: {
      id: "compiled-demo",
      name: "Compiled Demo"
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
                  nodeId: "compiled-text",
                  componentType: "text",
                  classList: [],
                  bindings: {},
                  props: {
                    text: "Compiled Preview Text"
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

describe("authoring-studio", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("surfaces bindability metadata and updates raw DSL through structured controls", () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText("Application Name"), {
      target: {
        value: "Store Editor"
      }
    });

    const dslEditor = screen.getByLabelText("DSL JSON") as HTMLTextAreaElement;
    expect(dslEditor.value).toContain('"name": "Store Editor"');

    fireEvent.change(screen.getByLabelText("Component Type"), {
      target: {
        value: "button"
      }
    });

    expect(screen.getByText("Bindability metadata")).toBeInTheDocument();
    expect(screen.getByText("Examples: state.customerName, state.basket.summary")).toBeInTheDocument();
  });

  it("compiles through the local compiler service and previews the compiled artifact", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        output: {
          web: {
            ir: createCompiledApp()
          }
        }
      })
    });

    render(<App />);

    fireEvent.click(screen.getAllByRole("button", { name: "Compile and Preview" })[0]);

    await waitFor(() => {
      expect(screen.getByText("Compiled successfully")).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4177/compile",
      expect.objectContaining({
        method: "POST"
      })
    );

    expect(screen.getByText("Compiled Preview Text")).toBeInTheDocument();
  });
});