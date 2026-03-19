import { useEffect, useMemo, useState } from "react";
import type { AppIr } from "@lowcode/ir";
import { ScreenRenderer } from "./renderer/ScreenRenderer";
import { RuntimeProvider } from "./runtime/RuntimeContext";

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

  const currentScreen = useMemo(() => {
    if (!app || !currentScreenId) {
      return null;
    }

    return app.screens.find((screen) => screen.id === currentScreenId) ?? null;
  }, [app, currentScreenId]);

  if (error) {
    return <div className="container py-4 text-danger">{error}</div>;
  }

  if (!app || !currentScreen) {
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
      <div className="preview-shell container py-4">
        <header className="mb-4">
          <h1 className="h3 mb-1">{app.app.name}</h1>
          <div className="text-muted">Screen: {currentScreen.title}</div>
          <div className="small text-muted">schema {app.version}</div>
        </header>

        <ScreenRenderer screen={currentScreen} />
      </div>
    </RuntimeProvider>
  );
}