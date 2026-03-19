import { useEffect, useMemo, useState } from "react";
import type { AppIr, ScreenIr } from "@lowcode/ir";
import { RuntimeProvider } from "./runtime/RuntimeContext";
import { ScreenRenderer } from "./renderer/ScreenRenderer";

export default function App() {
  const [app, setApp] = useState<AppIr | null>(null);
  const [currentScreenId, setCurrentScreenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stateStore, setStateStore] = useState<Record<string, unknown>>({});

  useEffect(() => {
    fetch("/main.web.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load main.web.json: ${response.status}`);
        }
        return response.json();
      })
      .then((data: AppIr) => {
        setApp(data);
        if (data.screens.length > 0) {
          setCurrentScreenId(data.screens[0].id);
        }
      })
      .catch((err: Error) => {
        setError(err.message);
      });
  }, []);

  const currentScreen = useMemo<ScreenIr | null>(() => {
    if (!app || !currentScreenId) return null;
    return app.screens.find((screen) => screen.id === currentScreenId) ?? null;
  }, [app, currentScreenId]);

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!app || !currentScreen) {
    return <div className="container py-4">Loading preview...</div>;
  }

  return (
    <RuntimeProvider
      value={{
        app,
        currentScreenId,
        navigate: setCurrentScreenId,
        stateStore,
        setStateValue: (key, value) =>
          setStateStore((prev) => ({ ...prev, [key]: value }))
      }}
    >
      <div className="preview-shell">
        <header className="border-bottom bg-white">
          <div className="container py-3 d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h4 mb-0">{app.app.name}</h1>
              <small className="text-muted">Screen: {currentScreen.title}</small>
            </div>
            <span className="badge text-bg-secondary">schema {app.version}</span>
          </div>
        </header>

        <main className="container py-4">
          <ScreenRenderer screen={currentScreen} />
        </main>
      </div>
    </RuntimeProvider>
  );
}