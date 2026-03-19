import { useMemo, useState, type ChangeEvent } from "react";
import type { AppIr } from "@lowcode/ir";
import { componentCatalog, componentCatalogByType, type MetadataNodeType } from "@lowcode/component-metadata";
import { ScreenRenderer } from "../../web-preview/src/renderer/ScreenRenderer";
import { RuntimeProvider } from "../../web-preview/src/runtime/RuntimeContext";

const initialDsl = `{
  "schemaVersion": "1.0.0",
  "app": {
    "id": "authoring-studio-demo",
    "name": "Authoring Studio Demo"
  },
  "theme": {
    "bootstrapTheme": "default",
    "primaryColor": "#0d6efd",
    "borderRadius": "md"
  },
  "screens": [
    {
      "id": "home",
      "title": "Home",
      "layout": {
        "type": "row",
        "children": [
          {
            "type": "column",
            "span": {
              "xs": 12,
              "md": 8
            },
            "children": [
              {
                "type": "card",
                "id": "intro-card",
                "props": {
                  "title": "Authoring Studio",
                  "body": "Edit the DSL, compile it through the local compiler service, and preview compiled IR."
                }
              },
              {
                "type": "input",
                "id": "customer-name-input",
                "props": {
                  "label": "Customer name",
                  "placeholder": "Type your name",
                  "stateKey": "customerName"
                }
              },
              {
                "type": "text",
                "id": "customer-name-preview",
                "props": {
                  "text": "Waiting for input"
                },
                "bindings": {
                  "text": "state.customerName"
                }
              }
            ]
          }
        ]
      }
    }
  ]
}`;

interface CompileError {
  path: string;
  message: string;
  code: string;
}

interface CompileResponse {
  ok: boolean;
  output?: {
    web: {
      ir: AppIr;
    };
  };
  errors?: CompileError[];
}

interface DraftSummary {
  appId: string;
  appName: string;
  screens: Array<{ id: string; title: string }>;
}

function summarizeDsl(text: string): DraftSummary | null {
  try {
    const parsed = JSON.parse(text) as {
      app?: { id?: string; name?: string };
      screens?: Array<{ id?: string; title?: string }>;
    };

    return {
      appId: typeof parsed.app?.id === "string" ? parsed.app.id : "",
      appName: typeof parsed.app?.name === "string" ? parsed.app.name : "",
      screens: Array.isArray(parsed.screens)
        ? parsed.screens.map((screen, index) => ({
            id: typeof screen.id === "string" ? screen.id : `screen-${index}`,
            title: typeof screen.title === "string" ? screen.title : ""
          }))
        : []
    };
  } catch {
    return null;
  }
}

function updateDslText(text: string, updater: (draft: any) => void): string {
  const parsed = JSON.parse(text);
  updater(parsed);
  return JSON.stringify(parsed, null, 2);
}

export default function App() {
  const [dslText, setDslText] = useState<string>(initialDsl);
  const [compiledApp, setCompiledApp] = useState<AppIr | null>(null);
  const [compiledOutput, setCompiledOutput] = useState<string>("");
  const [errors, setErrors] = useState<CompileError[]>([]);
  const [status, setStatus] = useState<string>("Ready");
  const [currentScreenId, setCurrentScreenId] = useState<string | null>(null);
  const [stateStore, setStateStore] = useState<Record<string, unknown>>({});
  const [selectedComponentType, setSelectedComponentType] = useState<MetadataNodeType>("text");

  const draftSummary = useMemo(() => summarizeDsl(dslText), [dslText]);
  const selectedMetadata = componentCatalogByType[selectedComponentType];

  const currentScreen = useMemo(() => {
    if (!compiledApp || !currentScreenId) {
      return null;
    }

    return compiledApp.screens.find((screen) => screen.id === currentScreenId) ?? null;
  }, [compiledApp, currentScreenId]);

  function applyStructuredUpdate(updater: (draft: any) => void): void {
    try {
      setDslText((current) => updateDslText(current, updater));
      setStatus("Structured editor updated the DSL");
    } catch {
      setStatus("Structured editor is disabled until the JSON is valid");
    }
  }

  async function compileCurrentDsl() {
    setStatus("Compiling through the local compiler service...");
    setErrors([]);

    let normalizedDslText = dslText;

    try {
      normalizedDslText = JSON.stringify(JSON.parse(dslText), null, 2);
      setDslText(normalizedDslText);
    } catch (error) {
      setCompiledApp(null);
      setCompiledOutput("");
      setCurrentScreenId(null);
      setStatus("Invalid JSON");
      setErrors([
        {
          path: "/",
          message: error instanceof Error ? error.message : "Invalid JSON",
          code: "INVALID_JSON"
        }
      ]);
      return;
    }

    const response = await fetch("http://localhost:4177/compile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: normalizedDslText
    });

    const result = (await response.json()) as CompileResponse;

    if (!result.ok || !result.output) {
      setCompiledApp(null);
      setCompiledOutput("");
      setCurrentScreenId(null);
      setErrors(result.errors ?? []);
      setStatus("Compilation failed");
      return;
    }

    setCompiledApp(result.output.web.ir);
    setCompiledOutput(JSON.stringify(result.output, null, 2));
    setCurrentScreenId(result.output.web.ir.screens[0]?.id ?? null);
    setStateStore({});
    setStatus("Compiled successfully");
  }

  function handleFileLoad(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const value = typeof reader.result === "string" ? reader.result : "";
      setDslText(value);
      setStatus(`Loaded ${file.name}`);
    };

    reader.readAsText(file);
  }

  return (
    <div className="studio-shell">
      <div className="container-fluid py-4 py-lg-5">
        <div className="studio-header card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <div className="d-flex flex-column flex-xl-row gap-3 justify-content-between align-items-xl-center">
              <div>
                <div className="preview-eyebrow">Authoring Studio Foundation</div>
                <h1 className="h3 mb-2">Edit DSL and preview compiled IR</h1>
                <div className="text-muted">
                  The editor uses structured metadata hints but the preview still renders only compiled IR.
                </div>
              </div>
              <div className="studio-actions d-flex flex-wrap gap-2">
                <label className="btn btn-outline-secondary shadow-sm mb-0">
                  Load DSL file
                  <input type="file" className="d-none" accept=".json,application/json" onChange={handleFileLoad} />
                </label>
                <button type="button" className="btn btn-primary shadow-sm" onClick={() => void compileCurrentDsl()}>
                  Compile and Preview
                </button>
              </div>
            </div>
            <div className="preview-meta row g-3 mt-1">
              <div className="col-sm-4">
                <div className="preview-meta-card">
                  <div className="preview-meta-label">Status</div>
                  <div className="preview-meta-value">{status}</div>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="preview-meta-card">
                  <div className="preview-meta-label">Screens</div>
                  <div className="preview-meta-value">{draftSummary?.screens.length ?? 0}</div>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="preview-meta-card">
                  <div className="preview-meta-label">Preview source</div>
                  <div className="preview-meta-value">Compiler output</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12 col-xl-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <h2 className="h5 mb-3">Structured authoring</h2>
                <div className="mb-3">
                  <label htmlFor="app-name" className="form-label fw-semibold">Application Name</label>
                  <input
                    id="app-name"
                    className="form-control"
                    value={draftSummary?.appName ?? ""}
                    onChange={(event) =>
                      applyStructuredUpdate((draft) => {
                        draft.app = draft.app ?? {};
                        draft.app.name = event.target.value;
                      })
                    }
                    disabled={!draftSummary}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="app-id" className="form-label fw-semibold">Application ID</label>
                  <input
                    id="app-id"
                    className="form-control"
                    value={draftSummary?.appId ?? ""}
                    onChange={(event) =>
                      applyStructuredUpdate((draft) => {
                        draft.app = draft.app ?? {};
                        draft.app.id = event.target.value;
                      })
                    }
                    disabled={!draftSummary}
                  />
                </div>

                <h3 className="h6 mb-3">Bindability metadata</h3>
                <div className="mb-3">
                  <label htmlFor="component-type" className="form-label fw-semibold">Component Type</label>
                  <select
                    id="component-type"
                    className="form-select"
                    value={selectedComponentType}
                    onChange={(event) => setSelectedComponentType(event.target.value as MetadataNodeType)}
                  >
                    {componentCatalog.map((component) => (
                      <option key={component.type} value={component.type}>
                        {component.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="metadata-card rounded-4 border p-3">
                  <div className="fw-semibold">{selectedMetadata.displayName}</div>
                  <div className="small text-muted mb-3">{selectedMetadata.description}</div>

                  <div className="small text-uppercase fw-semibold text-muted mb-2">Bindable Props</div>
                  <ul className="list-group list-group-flush">
                    {selectedMetadata.bindableProps.length === 0 ? (
                      <li className="list-group-item px-0">No bindable properties</li>
                    ) : (
                      selectedMetadata.bindableProps.map((binding) => (
                        <li key={binding.name} className="list-group-item px-0">
                          <div className="fw-semibold">{binding.name}</div>
                          <div className="small text-muted">Target: {binding.bindingTarget}</div>
                          <div className="small text-muted">
                            Examples: {binding.expressionExamples.join(", ")}
                          </div>
                          <div className="small text-muted">{binding.fallbackDescription}</div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2 className="h5 mb-0">DSL JSON</h2>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => {
                      try {
                        setDslText(JSON.stringify(JSON.parse(dslText), null, 2));
                      } catch {
                        setStatus("Cannot format invalid JSON");
                      }
                    }}
                  >
                    Format JSON
                  </button>
                </div>
                <textarea
                  aria-label="DSL JSON"
                  className="form-control studio-editor"
                  value={dslText}
                  onChange={(event) => setDslText(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h2 className="h5 mb-3">Compiled Preview</h2>

                {errors.length > 0 ? (
                  <div className="alert alert-danger mb-3">
                    <div className="fw-semibold mb-2">Compilation failed</div>
                    <ul className="mb-0">
                      {errors.map((error, index) => (
                        <li key={`${error.code}-${index}`}>
                          [{error.code}] {error.path}: {error.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {!compiledApp || !currentScreen ? (
                  errors.length === 0 ? (
                    <div className="text-muted">Compile the current DSL to preview the compiled result here.</div>
                  ) : null
                ) : (
                  <RuntimeProvider
                    value={{
                      app: compiledApp,
                      currentScreenId: currentScreen.id,
                      navigate: setCurrentScreenId,
                      stateStore,
                      setStateValue: (key, value) => {
                        setStateStore((prev) => ({
                          ...prev,
                          [key]: value
                        }));
                      }
                    }}
                  >
                    <ScreenRenderer screen={currentScreen} />
                  </RuntimeProvider>
                )}
              </div>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h2 className="h5 mb-3">Compiled Artifact</h2>
                <pre className="studio-output mb-0">{compiledOutput || "Compile to inspect the generated artifact."}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}