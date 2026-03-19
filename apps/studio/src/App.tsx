import { useMemo, useState } from "react";

type ComponentType = "text" | "button" | "input" | "image" | "card";

type ComponentNode = {
  id: string;
  type: ComponentType;
  classList?: string[];
  props?: Record<string, any>;
};

type ColumnNode = {
  id: string;
  type: "column";
  span: number;
  classList?: string[];
  children: ComponentNode[];
};

type RowNode = {
  id: string;
  type: "row";
  classList?: string[];
  children: ColumnNode[];
};

type ScreenNode = {
  id: string;
  title: string;
  layout: RowNode;
};

type LowCodeDsl = {
  schemaVersion: string;
  app: {
    id: string;
    name: string;
  };
  theme: {
    bootstrapTheme: string;
    primaryColor: string;
    borderRadius: string;
  };
  screens: ScreenNode[];
};

function uid(prefix: string): string {
  return prefix + "_" + Math.random().toString(36).slice(2, 10);
}

function createInitialDsl(): LowCodeDsl {
  return {
    schemaVersion: "1.0.0",
    app: {
      id: "self-checkout-app",
      name: "Self Checkout"
    },
    theme: {
      bootstrapTheme: "bootstrap",
      primaryColor: "#0d6efd",
      borderRadius: "md"
    },
    screens: [
      {
        id: "screen_home",
        title: "Home",
        layout: {
          id: uid("row"),
          type: "row",
          classList: ["g-3"],
          children: [
            {
              id: uid("col"),
              type: "column",
              span: 12,
              classList: [],
              children: [
                {
                  id: uid("cmp"),
                  type: "text",
                  classList: ["fw-bold", "fs-3"],
                  props: {
                    text: "Welcome to Self Checkout"
                  }
                },
                {
                  id: uid("cmp"),
                  type: "button",
                  classList: ["btn", "btn-primary"],
                  props: {
                    text: "Start"
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

function dslToXml(dsl: LowCodeDsl): string {
  const lines: string[] = [];
  lines.push(`<app id="${escapeXml(dsl.app.id)}" name="${escapeXml(dsl.app.name)}" schemaVersion="${escapeXml(dsl.schemaVersion)}">`);
  lines.push(`  <theme bootstrapTheme="${escapeXml(dsl.theme.bootstrapTheme)}" primaryColor="${escapeXml(dsl.theme.primaryColor)}" borderRadius="${escapeXml(dsl.theme.borderRadius)}" />`);
  lines.push(`  <screens>`);
  for (const screen of dsl.screens) {
    lines.push(`    <screen id="${escapeXml(screen.id)}" title="${escapeXml(screen.title)}">`);
    lines.push(`      <row id="${escapeXml(screen.layout.id)}" classList="${escapeXml((screen.layout.classList ?? []).join(" "))}">`);
    for (const column of screen.layout.children) {
      lines.push(`        <column id="${escapeXml(column.id)}" span="${column.span}" classList="${escapeXml((column.classList ?? []).join(" "))}">`);
      for (const component of column.children) {
        lines.push(`          <component id="${escapeXml(component.id)}" type="${escapeXml(component.type)}" classList="${escapeXml((component.classList ?? []).join(" "))}">`);
        lines.push(`            <props>${escapeXml(JSON.stringify(component.props ?? {}))}</props>`);
        lines.push(`          </component>`);
      }
      lines.push(`        </column>`);
    }
    lines.push(`      </row>`);
    lines.push(`    </screen>`);
  }
  lines.push(`  </screens>`);
  lines.push(`</app>`);
  return lines.join("`n");
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function App() {
  const [dsl, setDsl] = useState<LowCodeDsl>(createInitialDsl());
  const [selectedScreenId, setSelectedScreenId] = useState<string>(dsl.screens[0].id);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(dsl.screens[0].layout.children[0].children[0].id);

  const selectedScreen = dsl.screens.find((s) => s.id === selectedScreenId) ?? dsl.screens[0];

  const selectedComponent = (() => {
    for (const column of selectedScreen.layout.children) {
      for (const component of column.children) {
        if (component.id === selectedComponentId) return component;
      }
    }
    return null;
  })();

  const exportBundle = useMemo(() => {
    const webIr = {
      target: "web",
      app: dsl.app,
      theme: dsl.theme,
      screens: dsl.screens
    };
    const androidIr = {
      target: "android",
      app: dsl.app,
      theme: dsl.theme,
      screens: dsl.screens
    };
    const manifest = {
      appId: dsl.app.id,
      appName: dsl.app.name,
      schemaVersion: dsl.schemaVersion,
      targets: ["web", "android"]
    };
    return {
      dsl: JSON.stringify(dsl, null, 2),
      xml: dslToXml(dsl),
      webIr: JSON.stringify(webIr, null, 2),
      androidIr: JSON.stringify(androidIr, null, 2),
      manifest: JSON.stringify(manifest, null, 2)
    };
  }, [dsl]);

  function addScreen() {
    const newScreen: ScreenNode = {
      id: uid("screen"),
      title: "New Screen",
      layout: {
        id: uid("row"),
        type: "row",
        classList: ["g-3"],
        children: [
          {
            id: uid("col"),
            type: "column",
            span: 12,
            classList: [],
            children: []
          }
        ]
      }
    };
    setDsl((current) => ({ ...current, screens: [...current.screens, newScreen] }));
    setSelectedScreenId(newScreen.id);
    setSelectedComponentId(null);
  }

  function addColumn() {
    setDsl((current) => ({
      ...current,
      screens: current.screens.map((screen) =>
        screen.id !== selectedScreenId
          ? screen
          : {
              ...screen,
              layout: {
                ...screen.layout,
                children: [
                  ...screen.layout.children,
                  {
                    id: uid("col"),
                    type: "column",
                    span: 6,
                    classList: [],
                    children: []
                  }
                ]
              }
            }
      )
    }));
  }

  function addComponent(type: ComponentType) {
    setDsl((current) => ({
      ...current,
      screens: current.screens.map((screen) => {
        if (screen.id !== selectedScreenId) return screen;
        const firstColumn = screen.layout.children[0];
        const newComponent: ComponentNode = {
          id: uid("cmp"),
          type,
          classList: [],
          props:
            type === "text"
              ? { text: "New text" }
              : type === "button"
              ? { text: "Button" }
              : type === "input"
              ? { placeholder: "Type here" }
              : type === "image"
              ? { src: "https://via.placeholder.com/300x120", alt: "placeholder" }
              : { title: "Card title", text: "Card text" }
        };
        return {
          ...screen,
          layout: {
            ...screen.layout,
            children: [
              {
                ...firstColumn,
                children: [...firstColumn.children, newComponent]
              },
              ...screen.layout.children.slice(1)
            ]
          }
        };
      })
    }));
  }

  function updateSelectedComponentProps(raw: string) {
    if (!selectedComponent) return;
    try {
      const parsed = JSON.parse(raw);
      setDsl((current) => ({
        ...current,
        screens: current.screens.map((screen) => {
          if (screen.id !== selectedScreenId) return screen;
          return {
            ...screen,
            layout: {
              ...screen.layout,
              children: screen.layout.children.map((column) => ({
                ...column,
                children: column.children.map((component) =>
                  component.id === selectedComponent.id ? { ...component, props: parsed } : component
                )
              }))
            }
          };
        })
      }));
    } catch {
    }
  }

  function renderComponent(component: ComponentNode) {
    if (component.type === "text") {
      return <div>{component.props?.text ?? "Text"}</div>;
    }
    if (component.type === "button") {
      return <button>{component.props?.text ?? "Button"}</button>;
    }
    if (component.type === "input") {
      return <input placeholder={component.props?.placeholder ?? ""} />;
    }
    if (component.type === "image") {
      return <img src={component.props?.src} alt={component.props?.alt ?? ""} style={{ maxWidth: "100%" }} />;
    }
    return (
      <div>
        <h5>{component.props?.title ?? "Card title"}</h5>
        <p>{component.props?.text ?? "Card text"}</p>
      </div>
    );
  }

  return (
    <div className="studio-shell">
      <aside className="left-panel">
        <h2>Studio</h2>
        <div className="section">
          <button onClick={addScreen}>Add screen</button>
          <button onClick={addColumn}>Add column</button>
        </div>
        <div className="section">
          <h3>Screens</h3>
          {dsl.screens.map((screen) => (
            <button key={screen.id} className={screen.id === selectedScreenId ? "active" : ""} onClick={() => setSelectedScreenId(screen.id)}>
              {screen.title}
            </button>
          ))}
        </div>
        <div className="section">
          <h3>Components</h3>
          <button onClick={() => addComponent("text")}>Text</button>
          <button onClick={() => addComponent("button")}>Button</button>
          <button onClick={() => addComponent("input")}>Input</button>
          <button onClick={() => addComponent("image")}>Image</button>
          <button onClick={() => addComponent("card")}>Card</button>
        </div>
      </aside>

      <main className="canvas-panel">
        <div className="canvas-header">
          <h1>{selectedScreen.title}</h1>
        </div>
        <div className="canvas-surface">
          <div className="canvas-row">
            {selectedScreen.layout.children.map((column) => (
              <div key={column.id} className="canvas-col" style={{ width: `${(column.span / 12) * 100}%` }}>
                <div className="canvas-column">
                  {column.children.map((component) => (
                    <div
                      key={component.id}
                      className={`canvas-component ${selectedComponentId === component.id ? "selected" : ""}`}
                      onClick={() => setSelectedComponentId(component.id)}
                    >
                      <div className="canvas-component-label">{component.type}</div>
                      {renderComponent(component)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="exports-grid">
          <section>
            <h3>DSL</h3>
            <pre>{exportBundle.dsl}</pre>
          </section>
          <section>
            <h3>XML</h3>
            <pre>{exportBundle.xml}</pre>
          </section>
          <section>
            <h3>Web IR</h3>
            <pre>{exportBundle.webIr}</pre>
          </section>
          <section>
            <h3>Android IR</h3>
            <pre>{exportBundle.androidIr}</pre>
          </section>
          <section>
            <h3>Manifest</h3>
            <pre>{exportBundle.manifest}</pre>
          </section>
        </div>
      </main>

      <aside className="right-panel">
        <h2>Properties</h2>
        {selectedComponent ? (
          <>
            <div className="property-line">
              <strong>Type:</strong> {selectedComponent.type}
            </div>
            <textarea
              value={JSON.stringify(selectedComponent.props ?? {}, null, 2)}
              onChange={(e) => updateSelectedComponentProps(e.target.value)}
              rows={20}
            />
          </>
        ) : (
          <div>Select a component</div>
        )}
      </aside>
    </div>
  );
}

export default App;