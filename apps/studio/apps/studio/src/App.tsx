import React, { useEffect, useMemo, useState } from "react";
import type {
  ActionDsl,
  ColumnNodeDsl,
  ComponentNodeDsl,
  LayoutNodeDsl,
  LowCodeDsl,
  RowNodeDsl,
  ScreenDsl
} from "@lowcode/dsl-schema";
import { compileDsl } from "@lowcode/compiler";

type ComponentType = ComponentNodeDsl["type"];
type ThemeRadius = NonNullable<LowCodeDsl["theme"]>["borderRadius"];
type BootstrapTheme = "bootstrap" | "bootstrap-dark" | "flatly" | "minty" | "pulse" | "sketchy";
type JsonView = "dsl" | "webIr" | "androidIr" | "manifest" | "xml";

type StudioSelection =
  | { kind: "screen"; screenId: string }
  | { kind: "node"; screenId: string; nodeId: string }
  | null;

type PaletteItem = {
  key: string;
  label: string;
  description: string;
  create: () => LayoutNodeDsl;
};

type ExportBundle = {
  dsl: string;
  xml: string;
  webIr: string;
  androidIr: string;
  manifest: string;
  compileErrors: string[];
};

const COMPONENT_LIBRARY: PaletteItem[] = [
  {
    key: "row",
    label: "Row",
    description: "Bootstrap row container",
    create: () => ({ type: "row", id: createId("row"), children: [] })
  },
  {
    key: "column",
    label: "Column",
    description: "Bootstrap responsive column",
    create: () => ({
      type: "column",
      id: createId("column"),
      span: { xs: 12, md: 6 },
      children: []
    })
  },
  {
    key: "text",
    label: "Text",
    description: "Text, headings, labels",
    create: () => ({
      type: "text",
      id: createId("text"),
      props: { text: "Scan your item", as: "h2", className: "fw-bold" }
    })
  },
  {
    key: "button",
    label: "Button",
    description: "Primary or secondary action",
    create: () => ({
      type: "button",
      id: createId("button"),
      props: { label: "Continue", variant: "primary", size: "lg" },
      events: { onClick: [] }
    })
  },
  {
    key: "input",
    label: "Input",
    description: "Text or barcode entry",
    create: () => ({
      type: "input",
      id: createId("input"),
      props: { label: "Barcode", placeholder: "Scan or type code", inputType: "text" },
      events: { onChange: [] }
    })
  },
  {
    key: "image",
    label: "Image",
    description: "Product or brand image",
    create: () => ({
      type: "image",
      id: createId("image"),
      props: {
        src: "https://via.placeholder.com/320x180?text=Self+Checkout",
        alt: "Self checkout illustration"
      }
    })
  },
  {
    key: "card",
    label: "Card",
    description: "Bootstrap card wrapper",
    create: () => ({
      type: "card",
      id: createId("card"),
      props: { title: "Order summary", body: "3 items | Total $18.44" }
    })
  },
  {
    key: "list",
    label: "List",
    description: "List group for basket lines",
    create: () => ({
      type: "list",
      id: createId("list"),
      props: { items: ["Milk - $4.00", "Bread - $3.50", "Fruit - $10.94"] }
    })
  }
];

const STARTER_APP: LowCodeDsl = {
  schemaVersion: "1.0.0",
  app: {
    id: "self-checkout-studio-demo",
    name: "Self Checkout Demo"
  },
  theme: {
    bootstrapTheme: "bootstrap",
    primaryColor: "#0d6efd",
    borderRadius: "md"
  },
  screens: [
    {
      id: "welcome",
      title: "Welcome",
      layout: {
        type: "row",
        id: createId("row"),
        classList: ["g-3", "align-items-center"],
        children: [
          {
            type: "column",
            id: createId("column"),
            span: { xs: 12, md: 7 },
            children: [
              {
                type: "text",
                id: createId("text"),
                props: { text: "Welcome to quick checkout", as: "h1", className: "display-5 fw-bold" }
              },
              {
                type: "text",
                id: createId("text"),
                props: {
                  text: "Create and preview your kiosk experience visually, then compile it for web and Android.",
                  as: "p",
                  className: "lead text-secondary"
                }
              },
              {
                type: "button",
                id: createId("button"),
                props: { label: "Start scanning", variant: "primary", size: "lg" },
                events: { onClick: [{ type: "navigate", target: "basket" }] }
              }
            ]
          },
          {
            type: "column",
            id: createId("column"),
            span: { xs: 12, md: 5 },
            children: [
              {
                type: "card",
                id: createId("card"),
                props: { title: "Store mode", body: "Touch-first UX, barcode capture, basket summary and payment handoff." }
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
        id: createId("row"),
        classList: ["g-3"],
        children: [
          {
            type: "column",
            id: createId("column"),
            span: { xs: 12, lg: 8 },
            children: [
              {
                type: "input",
                id: createId("input"),
                props: { label: "Item barcode", placeholder: "Read scanner or type barcode", inputType: "text" }
              },
              {
                type: "list",
                id: createId("list"),
                props: { items: ["Coffee beans - $8.99", "Orange juice - $4.50", "Granola - $4.95"] }
              }
            ]
          },
          {
            type: "column",
            id: createId("column"),
            span: { xs: 12, lg: 4 },
            children: [
              {
                type: "card",
                id: createId("card"),
                props: { title: "Total", body: "$18.44" }
              },
              {
                type: "button",
                id: createId("button"),
                props: { label: "Proceed to payment", variant: "success", size: "lg" },
                events: { onClick: [{ type: "showMessage", message: "Payment connector not yet configured" }] }
              }
            ]
          }
        ]
      }
    }
  ]
};

const themeOptions: BootstrapTheme[] = ["bootstrap", "bootstrap-dark", "flatly", "minty", "pulse", "sketchy"];
const radiusOptions: ThemeRadius[] = ["none", "sm", "md", "lg", "xl"];
const componentTypes: ComponentType[] = ["text", "button", "image", "input", "card", "list"];

export function App(): React.ReactElement {
  const [dsl, setDsl] = useState<LowCodeDsl>(() => structuredClone(STARTER_APP));
  const [selectedScreenId, setSelectedScreenId] = useState<string>(STARTER_APP.screens[0].id);
  const [selection, setSelection] = useState<StudioSelection>({ kind: "screen", screenId: STARTER_APP.screens[0].id });
  const [jsonView, setJsonView] = useState<JsonView>("dsl");
  const [toast, setToast] = useState<string>("");

  const selectedScreen = useMemo(
    () => dsl.screens.find((screen) => screen.id === selectedScreenId) ?? dsl.screens[0],
    [dsl.screens, selectedScreenId]
  );

  const exportBundle = useMemo<ExportBundle>(() => {
    const compiled = compileDsl(dsl);
    if (!compiled.ok) {
      return {
        dsl: JSON.stringify(dsl, null, 2),
        xml: dslToXml(dsl),
        webIr: "",
        androidIr: "",
        manifest: "",
        compileErrors: (compiled.errors ?? []).map((error) => `[${error.code}] ${error.path} ${error.message}`)
      };
    }

    return {
      dsl: JSON.stringify(dsl, null, 2),
      xml: dslToXml(dsl),
      webIr: JSON.stringify(compiled.output?.web.ir ?? {}, null, 2),
      androidIr: JSON.stringify(compiled.output?.android.ir ?? {}, null, 2),
      manifest: JSON.stringify(compiled.output?.manifest ?? {}, null, 2),
      compileErrors: []
    };
  }, [dsl]);

  const selectedNode = useMemo(() => {
    if (!selectedScreen || selection?.kind !== "node") return null;
    return findNode(selectedScreen.layout, selection.nodeId);
  }, [selectedScreen, selection]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const updateDsl = (updater: (current: LowCodeDsl) => LowCodeDsl): void => {
    setDsl((current) => updater(structuredClone(current)));
  };

  const addScreen = (): void => {
    const id = createSlug(`screen-${dsl.screens.length + 1}`);
    const newScreen: ScreenDsl = {
      id,
      title: `Screen ${dsl.screens.length + 1}`,
      layout: { type: "row", id: createId("row"), classList: ["g-3"], children: [] }
    };
    updateDsl((current) => {
      current.screens.push(newScreen);
      return current;
    });
    setSelectedScreenId(id);
    setSelection({ kind: "screen", screenId: id });
    setToast(`Screen '${id}' added`);
  };

  const addNodeToSelectedScreen = (factory: () => LayoutNodeDsl): void => {
    if (!selectedScreen) return;
    const newNode = factory();
    updateDsl((current) => {
      const screen = current.screens.find((item) => item.id === selectedScreen.id);
      if (!screen) return current;
      if (selection?.kind === "node") {
        screen.layout = appendToNode(screen.layout, selection.nodeId, newNode);
      } else {
        screen.layout = appendToRoot(screen.layout, newNode);
      }
      return current;
    });
    setSelection({ kind: "node", screenId: selectedScreen.id, nodeId: getNodeId(newNode) });
  };

  const removeSelectedNode = (): void => {
    if (!selectedScreen || selection?.kind !== "node") return;
    updateDsl((current) => {
      const screen = current.screens.find((item) => item.id === selectedScreen.id);
      if (!screen) return current;
      screen.layout = removeNode(screen.layout, selection.nodeId) ?? screen.layout;
      return current;
    });
    setSelection({ kind: "screen", screenId: selectedScreen.id });
  };

  const moveSelectedNode = (direction: "up" | "down"): void => {
    if (!selectedScreen || selection?.kind !== "node") return;
    updateDsl((current) => {
      const screen = current.screens.find((item) => item.id === selectedScreen.id);
      if (!screen) return current;
      screen.layout = moveNode(screen.layout, selection.nodeId, direction);
      return current;
    });
  };

  const duplicateSelectedNode = (): void => {
    if (!selectedScreen || selection?.kind !== "node") return;
    const original = findNode(selectedScreen.layout, selection.nodeId);
    if (!original) return;
    const duplicated = regenerateIds(structuredClone(original));
    updateDsl((current) => {
      const screen = current.screens.find((item) => item.id === selectedScreen.id);
      if (!screen) return current;
      screen.layout = insertSiblingAfter(screen.layout, selection.nodeId, duplicated);
      return current;
    });
    setSelection({ kind: "node", screenId: selectedScreen.id, nodeId: getNodeId(duplicated) });
  };

  const updateAppMeta = (field: "id" | "name", value: string): void => {
    updateDsl((current) => {
      current.app[field] = field === "id" ? createSlug(value) : value;
      return current;
    });
  };

  const updateTheme = <K extends keyof NonNullable<LowCodeDsl["theme"]>>(field: K, value: NonNullable<LowCodeDsl["theme"]>[K]): void => {
    updateDsl((current) => {
      current.theme = current.theme ?? { bootstrapTheme: "bootstrap", primaryColor: "#0d6efd", borderRadius: "md" };
      current.theme[field] = value;
      return current;
    });
  };

  const updateScreen = (field: keyof Pick<ScreenDsl, "id" | "title">, value: string): void => {
    if (!selectedScreen) return;
    updateDsl((current) => {
      const screen = current.screens.find((item) => item.id === selectedScreen.id);
      if (!screen) return current;
      (screen[field] as string) = field === "id" ? createSlug(value) : value;
      return current;
    });
    if (field === "id") {
      const nextId = createSlug(value);
      setSelectedScreenId(nextId);
      setSelection({ kind: "screen", screenId: nextId });
    }
  };

  const updateSelectedNode = (updater: (node: LayoutNodeDsl) => void): void => {
    if (!selectedScreen || selection?.kind !== "node") return;
    updateDsl((current) => {
      const screen = current.screens.find((item) => item.id === selectedScreen.id);
      if (!screen) return current;
      screen.layout = patchNode(screen.layout, selection.nodeId, updater);
      return current;
    });
  };

  const download = (content: string, filename: string, contentType: string): void => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const currentJson =
    jsonView === "dsl"
      ? exportBundle.dsl
      : jsonView === "webIr"
        ? exportBundle.webIr
        : jsonView === "androidIr"
          ? exportBundle.androidIr
          : jsonView === "manifest"
            ? exportBundle.manifest
            : exportBundle.xml;

  return (
    <div className="studio-shell">
      <header className="navbar navbar-expand-lg bg-dark border-bottom border-secondary-subtle px-3 py-2 sticky-top studio-topbar">
        <div className="container-fluid gap-3">
          <span className="navbar-brand text-white fw-semibold mb-0">Low-Code Studio</span>
          <span className="badge text-bg-primary">Self-checkout</span>
          <div className="ms-auto d-flex gap-2 flex-wrap">
            <button className="btn btn-outline-light btn-sm" onClick={() => download(exportBundle.dsl, `${dsl.app.id}.json`, "application/json")}>
              Export JSON DSL
            </button>
            <button className="btn btn-outline-light btn-sm" onClick={() => download(exportBundle.xml, `${dsl.app.id}.xml`, "application/xml")}>
              Export XML
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => download(currentJson, `${dsl.app.id}-${jsonView}.${jsonView === "xml" ? "xml" : "json"}`, "text/plain")}>
              Download current view
            </button>
          </div>
        </div>
      </header>

      <div className="studio-grid">
        <aside className="studio-panel border-end bg-body-tertiary p-3 overflow-auto">
          <PanelTitle title="Project" subtitle="Business-friendly settings" />
          <Field label="Application ID">
            <input className="form-control" value={dsl.app.id} onChange={(event) => updateAppMeta("id", event.target.value)} />
          </Field>
          <Field label="Application name">
            <input className="form-control" value={dsl.app.name} onChange={(event) => updateAppMeta("name", event.target.value)} />
          </Field>
          <Field label="Bootstrap theme">
            <select
              className="form-select"
              value={dsl.theme?.bootstrapTheme ?? "bootstrap"}
              onChange={(event) => updateTheme("bootstrapTheme", event.target.value as BootstrapTheme)}
            >
              {themeOptions.map((theme) => (
                <option key={theme} value={theme}>
                  {theme}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Primary color">
            <input type="color" className="form-control form-control-color" value={dsl.theme?.primaryColor ?? "#0d6efd"} onChange={(event) => updateTheme("primaryColor", event.target.value)} />
          </Field>
          <Field label="Radius scale">
            <select className="form-select" value={dsl.theme?.borderRadius ?? "md"} onChange={(event) => updateTheme("borderRadius", event.target.value as ThemeRadius)}>
              {radiusOptions.map((radius) => (
                <option key={radius} value={radius}>
                  {radius}
                </option>
              ))}
            </select>
          </Field>

          <hr />
          <div className="d-flex justify-content-between align-items-center mb-2">
            <PanelTitle title="Screens" subtitle="Navigation targets" compact />
            <button className="btn btn-sm btn-primary" onClick={addScreen}>Add</button>
          </div>
          <div className="list-group mb-4">
            {dsl.screens.map((screen) => (
              <button
                key={screen.id}
                className={`list-group-item list-group-item-action ${selectedScreenId === screen.id ? "active" : ""}`}
                onClick={() => {
                  setSelectedScreenId(screen.id);
                  setSelection({ kind: "screen", screenId: screen.id });
                }}
              >
                <div className="fw-semibold">{screen.title}</div>
                <div className="small opacity-75">{screen.id}</div>
              </button>
            ))}
          </div>

          <PanelTitle title="Palette" subtitle="Drop on root or selected container" />
          <div className="row g-2">
            {COMPONENT_LIBRARY.map((item) => (
              <div className="col-12" key={item.key}>
                <button className="btn btn-outline-secondary w-100 text-start" onClick={() => addNodeToSelectedScreen(item.create)}>
                  <div className="fw-semibold">{item.label}</div>
                  <div className="small text-body-secondary">{item.description}</div>
                </button>
              </div>
            ))}
          </div>
        </aside>

        <main className="studio-canvas-wrap bg-light-subtle">
          <div className="studio-canvas-toolbar d-flex justify-content-between align-items-center px-3 py-2 border-bottom bg-white">
            <div>
              <div className="fw-semibold">Canvas</div>
              <div className="text-secondary small">{selectedScreen?.title ?? "No screen selected"}</div>
            </div>
            <div className="btn-group btn-group-sm">
              <button className="btn btn-outline-secondary" disabled={selection?.kind !== "node"} onClick={() => moveSelectedNode("up")}>Up</button>
              <button className="btn btn-outline-secondary" disabled={selection?.kind !== "node"} onClick={() => moveSelectedNode("down")}>Down</button>
              <button className="btn btn-outline-secondary" disabled={selection?.kind !== "node"} onClick={duplicateSelectedNode}>Duplicate</button>
              <button className="btn btn-outline-danger" disabled={selection?.kind !== "node"} onClick={removeSelectedNode}>Delete</button>
            </div>
          </div>

          <div className="studio-canvas p-3">
            {selectedScreen ? (
              <div className="phone-frame mx-auto shadow-sm">
                <div className="phone-screen p-3" style={cssVarsFromTheme(dsl.theme)}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">{selectedScreen.title}</h5>
                    <span className="badge text-bg-secondary">{selectedScreen.id}</span>
                  </div>
                  {renderEditorNode(selectedScreen.layout, selectedScreen.id, selection, setSelection)}
                </div>
              </div>
            ) : (
              <div className="alert alert-warning m-3">No screen selected.</div>
            )}
          </div>
        </main>

        <aside className="studio-panel border-start bg-body p-3 overflow-auto">
          <PanelTitle title="Properties" subtitle="Selected screen or node" />
          {selectedScreen && selection?.kind === "screen" && (
            <>
              <Field label="Screen ID">
                <input className="form-control" value={selectedScreen.id} onChange={(event) => updateScreen("id", event.target.value)} />
              </Field>
              <Field label="Screen title">
                <input className="form-control" value={selectedScreen.title} onChange={(event) => updateScreen("title", event.target.value)} />
              </Field>
            </>
          )}

          {selectedNode ? (
            <NodeInspector
              node={selectedNode}
              screens={dsl.screens}
              onChange={(updater) => updateSelectedNode(updater)}
            />
          ) : !selectedScreen || selection?.kind !== "screen" ? (
            <div className="alert alert-info">Select a node to edit its props, classes and actions.</div>
          ) : null}

          <hr />
          <div className="d-flex justify-content-between align-items-center mb-2">
            <PanelTitle title="Generated output" subtitle="Compiler-aligned artifacts" compact />
            <select className="form-select form-select-sm w-auto" value={jsonView} onChange={(event) => setJsonView(event.target.value as JsonView)}>
              <option value="dsl">DSL</option>
              <option value="xml">XML</option>
              <option value="manifest">Manifest</option>
              <option value="webIr">Web IR</option>
              <option value="androidIr">Android IR</option>
            </select>
          </div>
          {exportBundle.compileErrors.length > 0 && (
            <div className="alert alert-danger small">
              {exportBundle.compileErrors.map((error) => (
                <div key={error}>{error}</div>
              ))}
            </div>
          )}
          <pre className="output-box small">{currentJson || "No output generated"}</pre>
        </aside>
      </div>

      {toast && <div className="studio-toast alert alert-success shadow-sm">{toast}</div>}
    </div>
  );
}

function PanelTitle({ title, subtitle, compact = false }: { title: string; subtitle: string; compact?: boolean }): React.ReactElement {
  return (
    <div className={compact ? "" : "mb-3"}>
      <div className="fw-semibold">{title}</div>
      <div className="text-secondary small">{subtitle}</div>
    </div>
  );
}

function Field({ label, children }: React.PropsWithChildren<{ label: string }>): React.ReactElement {
  return (
    <label className="d-block mb-3">
      <div className="small text-secondary mb-1">{label}</div>
      {children}
    </label>
  );
}

function NodeInspector({
  node,
  screens,
  onChange
}: {
  node: LayoutNodeDsl;
  screens: ScreenDsl[];
  onChange: (updater: (node: LayoutNodeDsl) => void) => void;
}): React.ReactElement {
  const classes = node.classList?.join(" ") ?? "";

  return (
    <>
      <div className="badge text-bg-secondary mb-3">{node.type}</div>
      <Field label="Node ID">
        <input
          className="form-control"
          value={getNodeId(node)}
          onChange={(event) => onChange((current) => setNodeId(current, event.target.value))}
        />
      </Field>
      <Field label="Bootstrap classes">
        <input
          className="form-control"
          value={classes}
          onChange={(event) => onChange((current) => { current.classList = event.target.value.split(" ").map((item) => item.trim()).filter(Boolean); })}
        />
      </Field>

      {node.type === "column" && (
        <>
          {(["xs", "sm", "md", "lg", "xl"] as const).map((key) => (
            <Field key={key} label={`Column span ${key.toUpperCase()}`}>
              <input
                type="number"
                min={1}
                max={12}
                className="form-control"
                value={node.span[key] ?? ""}
                onChange={(event) => onChange((current) => {
                  if (current.type !== "column") return;
                  current.span[key] = Number(event.target.value || 12);
                })}
              />
            </Field>
          ))}
        </>
      )}

      {node.type !== "row" && node.type !== "column" && (
        <>
          <Field label="Component type">
            <select
              className="form-select"
              value={node.type}
              onChange={(event) => onChange((current) => {
                if (current.type === "row" || current.type === "column") return;
                current.type = event.target.value as ComponentType;
              })}
            >
              {componentTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </Field>
          <Field label="Props JSON">
            <textarea
              className="form-control font-monospace"
              rows={10}
              value={JSON.stringify(node.props ?? {}, null, 2)}
              onChange={(event) => onChange((current) => {
                if (current.type === "row" || current.type === "column") return;
                current.props = safeParseJson(event.target.value, current.props);
              })}
            />
          </Field>
          <Field label="onClick actions JSON">
            <textarea
              className="form-control font-monospace"
              rows={6}
              value={JSON.stringify(node.events?.onClick ?? [], null, 2)}
              onChange={(event) => onChange((current) => {
                if (current.type === "row" || current.type === "column") return;
                current.events = current.events ?? {};
                current.events.onClick = safeParseJson<ActionDsl[]>(event.target.value, current.events.onClick ?? []);
              })}
            />
          </Field>
          <Field label="Quick navigation target">
            <select
              className="form-select"
              value={node.events?.onClick?.find((item) => item.type === "navigate")?.target ?? ""}
              onChange={(event) => onChange((current) => {
                if (current.type === "row" || current.type === "column") return;
                current.events = current.events ?? {};
                current.events.onClick = event.target.value
                  ? [{ type: "navigate", target: event.target.value }]
                  : [];
              })}
            >
              <option value="">No navigation</option>
              {screens.map((screen) => (
                <option key={screen.id} value={screen.id}>{screen.title}</option>
              ))}
            </select>
          </Field>
        </>
      )}
    </>
  );
}

function renderEditorNode(
  node: LayoutNodeDsl,
  screenId: string,
  selection: StudioSelection,
  setSelection: React.Dispatch<React.SetStateAction<StudioSelection>>
): React.ReactElement {
  const selected = selection?.kind === "node" && selection.nodeId === getNodeId(node);
  const commonProps = {
    className: `editor-node ${selected ? "selected" : ""}`,
    onClick: (event: React.MouseEvent) => {
      event.stopPropagation();
      setSelection({ kind: "node", screenId, nodeId: getNodeId(node) });
    }
  };

  if (node.type === "row") {
    return (
      <div {...commonProps}>
        <div className={`row ${joinClasses(node.classList) || "g-3"}`}>
          {node.children.length > 0 ? node.children.map((child) => renderEditorNode(child, screenId, selection, setSelection)) : <EmptySlot label="Row" />}
        </div>
      </div>
    );
  }

  if (node.type === "column") {
    return (
      <div {...commonProps} className={`editor-node ${selected ? "selected" : ""} ${columnClasses(node.span)}`}>
        <div className={`column-canvas ${joinClasses(node.classList)}`}>
          {node.children.length > 0 ? node.children.map((child) => renderEditorNode(child, screenId, selection, setSelection)) : <EmptySlot label="Column" />}
        </div>
      </div>
    );
  }

  return (
    <div {...commonProps}>
      {renderComponent(node)}
    </div>
  );
}

function renderComponent(node: ComponentNodeDsl): React.ReactElement {
  const props = node.props ?? {};
  const className = [props.className as string | undefined, joinClasses(node.classList)].filter(Boolean).join(" ");

  switch (node.type) {
    case "text": {
      const Tag = (props.as as keyof JSX.IntrinsicElements | undefined) ?? "p";
      return <Tag className={className}>{String(props.text ?? "Text")}</Tag>;
    }
    case "button":
      return (
        <button type="button" className={`btn btn-${String(props.variant ?? "primary")} btn-${String(props.size ?? "md")} ${className}`.trim()}>
          {String(props.label ?? "Button")}
        </button>
      );
    case "image":
      return <img src={String(props.src ?? "https://via.placeholder.com/320x180") } alt={String(props.alt ?? "Image") } className={`img-fluid rounded ${className}`.trim()} />;
    case "input":
      return (
        <div className={className}>
          <label className="form-label">{String(props.label ?? "Input")}</label>
          <input className="form-control" type={String(props.inputType ?? "text")} placeholder={String(props.placeholder ?? "Type here")} />
        </div>
      );
    case "card":
      return (
        <div className={`card ${className}`.trim()}>
          <div className="card-body">
            <h5 className="card-title">{String(props.title ?? "Card title")}</h5>
            <p className="card-text mb-0">{String(props.body ?? "Card body")}</p>
          </div>
        </div>
      );
    case "list":
      return (
        <ul className={`list-group ${className}`.trim()}>
          {Array.isArray(props.items) && props.items.length > 0 ? (
            props.items.map((item, index) => (
              <li key={`${node.id}-${index}`} className="list-group-item">{String(item)}</li>
            ))
          ) : (
            <li className="list-group-item">List item</li>
          )}
        </ul>
      );
    default:
      return <div className="alert alert-warning mb-0">Unsupported component</div>;
  }
}

function EmptySlot({ label }: { label: string }): React.ReactElement {
  return <div className="empty-slot">Empty {label}</div>;
}

function appendToRoot(root: LayoutNodeDsl, node: LayoutNodeDsl): LayoutNodeDsl {
  if (root.type === "row" || root.type === "column") {
    root.children.push(node);
    return root;
  }
  return { type: "row", id: createId("row"), classList: ["g-3"], children: [root, node] };
}

function appendToNode(root: LayoutNodeDsl, targetNodeId: string, child: LayoutNodeDsl): LayoutNodeDsl {
  return patchNode(root, targetNodeId, (node) => {
    if (node.type === "row" || node.type === "column") {
      node.children.push(child);
    }
  });
}

function patchNode(root: LayoutNodeDsl, targetNodeId: string, updater: (node: LayoutNodeDsl) => void): LayoutNodeDsl {
  if (getNodeId(root) === targetNodeId) {
    updater(root);
    return root;
  }
  if (root.type === "row" || root.type === "column") {
    root.children = root.children.map((child) => patchNode(child, targetNodeId, updater));
  }
  return root;
}

function removeNode(root: LayoutNodeDsl, targetNodeId: string): LayoutNodeDsl | null {
  if (getNodeId(root) === targetNodeId) return null;
  if (root.type === "row" || root.type === "column") {
    root.children = root.children
      .map((child) => removeNode(child, targetNodeId))
      .filter((child): child is LayoutNodeDsl => Boolean(child));
  }
  return root;
}

function insertSiblingAfter(root: LayoutNodeDsl, targetNodeId: string, sibling: LayoutNodeDsl): LayoutNodeDsl {
  if (root.type === "row" || root.type === "column") {
    const nextChildren: LayoutNodeDsl[] = [];
    for (const child of root.children) {
      nextChildren.push(insertSiblingAfter(child, targetNodeId, sibling));
      if (getNodeId(child) === targetNodeId) nextChildren.push(sibling);
    }
    root.children = nextChildren;
  }
  return root;
}

function moveNode(root: LayoutNodeDsl, targetNodeId: string, direction: "up" | "down"): LayoutNodeDsl {
  if (root.type === "row" || root.type === "column") {
    const index = root.children.findIndex((child) => getNodeId(child) === targetNodeId);
    if (index >= 0) {
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (nextIndex >= 0 && nextIndex < root.children.length) {
        const clone = [...root.children];
        [clone[index], clone[nextIndex]] = [clone[nextIndex], clone[index]];
        root.children = clone;
      }
      return root;
    }
    root.children = root.children.map((child) => moveNode(child, targetNodeId, direction));
  }
  return root;
}

function findNode(root: LayoutNodeDsl, nodeId: string): LayoutNodeDsl | null {
  if (getNodeId(root) === nodeId) return root;
  if (root.type === "row" || root.type === "column") {
    for (const child of root.children) {
      const found = findNode(child, nodeId);
      if (found) return found;
    }
  }
  return null;
}

function regenerateIds(node: LayoutNodeDsl): LayoutNodeDsl {
  setNodeId(node, createId(node.type));
  if (node.type === "row" || node.type === "column") {
    node.children = node.children.map((child) => regenerateIds(child));
  }
  return node;
}

function setNodeId(node: LayoutNodeDsl, value: string): void {
  if (node.type === "row" || node.type === "column") {
    node.id = createSlug(value);
    return;
  }
  node.id = createSlug(value);
}

function getNodeId(node: LayoutNodeDsl): string {
  return createSlug((node as { id?: string }).id ?? `${node.type}-node`);
}

function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function createSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "node";
}

function joinClasses(classList?: string[]): string {
  return (classList ?? []).join(" ");
}

function columnClasses(span: Partial<Record<"xs" | "sm" | "md" | "lg" | "xl", number>>): string {
  return [
    span.xs ? `col-${span.xs}` : "col-12",
    span.sm ? `col-sm-${span.sm}` : "",
    span.md ? `col-md-${span.md}` : "",
    span.lg ? `col-lg-${span.lg}` : "",
    span.xl ? `col-xl-${span.xl}` : ""
  ]
    .filter(Boolean)
    .join(" ");
}

function safeParseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function cssVarsFromTheme(theme: LowCodeDsl["theme"]): React.CSSProperties {
  const radiusMap: Record<ThemeRadius, string> = {
    none: "0",
    sm: ".25rem",
    md: ".5rem",
    lg: ".75rem",
    xl: "1rem"
  };
  return {
    ["--studio-primary" as string]: theme?.primaryColor ?? "#0d6efd",
    ["--studio-radius" as string]: radiusMap[theme?.borderRadius ?? "md"]
  };
}

function dslToXml(dsl: LowCodeDsl): string {
  const theme = dsl.theme ?? { bootstrapTheme: "bootstrap", primaryColor: "#0d6efd", borderRadius: "md" };
  const lines: string[] = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<lowcode-app schemaVersion="${escapeXml(dsl.schemaVersion)}">`,
    `  <app id="${escapeXml(dsl.app.id)}" name="${escapeXml(dsl.app.name)}" />`,
    `  <theme bootstrapTheme="${escapeXml(theme.bootstrapTheme ?? "bootstrap")}" primaryColor="${escapeXml(theme.primaryColor ?? "#0d6efd")}" borderRadius="${escapeXml(theme.borderRadius ?? "md")}" />`,
    `  <screens>`
  ];

  for (const screen of dsl.screens) {
    lines.push(`    <screen id="${escapeXml(screen.id)}" title="${escapeXml(screen.title)}">`);
    lines.push(...nodeToXml(screen.layout, 3));
    lines.push(`    </screen>`);
  }

  lines.push(`  </screens>`);
  lines.push(`</lowcode-app>`);
  return lines.join("\n");
}

function nodeToXml(node: LayoutNodeDsl, level: number): string[] {
  const pad = "  ".repeat(level);
  const attrs = `id="${escapeXml(getNodeId(node))}" classList="${escapeXml(joinClasses(node.classList))}"`;

  if (node.type === "row") {
    return [
      `${pad}<row ${attrs}>`,
      ...node.children.flatMap((child) => nodeToXml(child, level + 1)),
      `${pad}</row>`
    ];
  }

  if (node.type === "column") {
    const span = Object.entries(node.span).map(([key, value]) => `${key}:${value}`).join(",");
    return [
      `${pad}<column ${attrs} span="${escapeXml(span)}">`,
      ...node.children.flatMap((child) => nodeToXml(child, level + 1)),
      `${pad}</column>`
    ];
  }

  return [
    `${pad}<component ${attrs} type="${escapeXml(node.type)}">`,
    `${pad}  <props>${escapeXml(JSON.stringify(node.props ?? {}))}</props>`,
    `${pad}  <events>${escapeXml(JSON.stringify(node.events ?? {}))}</events>`,
    `${pad}</component>`
  ];
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
