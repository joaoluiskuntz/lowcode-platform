import { useEffect, useMemo, useState } from "react";
import type { AppIr } from "@lowcode/ir";
import { ScreenRenderer } from "./renderer/ScreenRenderer";
import { RuntimeProvider } from "./runtime/RuntimeContext";

interface ArtifactIndexEntry {
  id: string;
  title: string;
  path: string;
}

const legacyArtifact: ArtifactIndexEntry = {
  id: "default",
  title: "Default Preview",
  path: "/main.web.json"
};

export default function App() {
  const [artifactIndex, setArtifactIndex] = useState<ArtifactIndexEntry[]>([]);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string>("");
  const [app, setApp] = useState<AppIr | null>(null);
  const [currentScreenId, setCurrentScreenId] = useState<string | null>(null);
  const [stateStore, setStateStore] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      setLoading(true);
      setError(null);

      try {
        const index = await loadArtifactIndex();
        if (cancelled) {
          return;
        }

        setArtifactIndex(index);

        const artifactId = resolveInitialArtifactId(index);
        setSelectedArtifactId(artifactId);

        await loadArtifactById(artifactId, index, cancelled);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to initialize preview");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  const currentScreen = useMemo(() => {
    if (!app || !currentScreenId) {
      return null;
    }

    return app.screens.find((screen) => screen.id === currentScreenId) ?? null;
  }, [app, currentScreenId]);

  async function handleArtifactChange(nextArtifactId: string) {
    setSelectedArtifactId(nextArtifactId);
    setLoading(true);
    setError(null);

    try {
      await loadArtifactById(nextArtifactId, artifactIndex);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load artifact");
    } finally {
      setLoading(false);
    }
  }

  async function loadArtifactById(
    artifactId: string,
    index: ArtifactIndexEntry[],
    cancelled = false
  ) {
    const entry = index.find((item) => item.id === artifactId) ?? legacyArtifact;
    const response = await fetch(entry.path);

    if (!response.ok) {
      throw new Error(`Failed to load ${entry.path}: ${response.status}`);
    }

    const data = (await response.json()) as AppIr;

    if (cancelled) {
      return;
    }

    setApp(data);
    setStateStore({});
    setCurrentScreenId(data.screens[0]?.id ?? null);
    syncQueryParam(artifactId);
  }

  if (error) {
    return <div className="container py-4 text-danger">{error}</div>;
  }

  if (loading || !app || !currentScreen) {
    return <div className="container py-4">Loading preview...</div>;
  }

  return (
    <RuntimeProvider
      value={{
        app,
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
      <div className="preview-shell">
        <div className="container py-4 py-lg-5">
          <header className="preview-header card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
                <div>
                  <div className="preview-eyebrow">Low-Code Self-Checkout Platform</div>
                  <h1 className="h3 mb-2">{app.app.name}</h1>
                  <div className="text-muted">
                    Compiled artifact preview for screen <strong>{currentScreen.title}</strong>
                  </div>
                </div>
                <div className="artifact-picker">
                  <label className="form-label small text-uppercase fw-semibold mb-2">Compiled artifact</label>
                  <select
                    className="form-select form-select-lg"
                    value={selectedArtifactId}
                    onChange={(event) => void handleArtifactChange(event.target.value)}
                  >
                    {artifactIndex.map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {entry.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="preview-meta row g-3 mt-1">
                <div className="col-sm-4">
                  <div className="preview-meta-card">
                    <div className="preview-meta-label">Artifact</div>
                    <div className="preview-meta-value">{selectedArtifactId}</div>
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="preview-meta-card">
                    <div className="preview-meta-label">Screens</div>
                    <div className="preview-meta-value">{app.screens.length}</div>
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="preview-meta-card">
                    <div className="preview-meta-label">Schema</div>
                    <div className="preview-meta-value">{app.version}</div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <ScreenRenderer screen={currentScreen} />
        </div>
      </div>
    </RuntimeProvider>
  );
}

async function loadArtifactIndex(): Promise<ArtifactIndexEntry[]> {
  try {
    const response = await fetch("/apps/index.json");

    if (!response.ok) {
      return [legacyArtifact];
    }

    const items = (await response.json()) as ArtifactIndexEntry[];

    if (!Array.isArray(items) || items.length === 0) {
      return [legacyArtifact];
    }

    return items;
  } catch {
    return [legacyArtifact];
  }
}

function resolveInitialArtifactId(index: ArtifactIndexEntry[]): string {
  const params = new URLSearchParams(window.location.search);
  const queryArtifact = params.get("app");

  if (queryArtifact && index.some((entry) => entry.id === queryArtifact)) {
    return queryArtifact;
  }

  return index[0]?.id ?? legacyArtifact.id;
}

function syncQueryParam(artifactId: string): void {
  const url = new URL(window.location.href);
  url.searchParams.set("app", artifactId);
  window.history.replaceState({}, "", url);
}