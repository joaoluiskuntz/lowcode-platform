import { createContext, useContext } from "react";
import type { AppIr } from "@lowcode/ir";

export interface RuntimeContextValue {
  app: AppIr;
  currentScreenId: string;
  navigate: (screenId: string) => void;
  stateStore: Record<string, unknown>;
  setStateValue: (key: string, value: unknown) => void;
}

const RuntimeContext = createContext<RuntimeContextValue | null>(null);

export const RuntimeProvider = RuntimeContext.Provider;

export function useRuntime(): RuntimeContextValue {
  const context = useContext(RuntimeContext);

  if (!context) {
    throw new Error("useRuntime must be used inside RuntimeProvider");
  }

  return context;
}