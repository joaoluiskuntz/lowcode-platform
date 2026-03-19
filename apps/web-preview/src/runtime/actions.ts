import type { IrAction } from "@lowcode/ir";
import { useRuntime } from "./RuntimeContext";

export function useActionExecutor() {
  const runtime = useRuntime();

  function executeActions(actions: IrAction[]): void {
    for (const action of actions) {
      switch (action.type) {
        case "navigate": {
          const target = action.payload.target;
          if (typeof target === "string") runtime.navigate(target);
          break;
        }
        case "setState": {
          const key = action.payload.stateKey;
          if (typeof key === "string") runtime.setStateValue(key, action.payload.value);
          break;
        }
        case "showMessage": {
          const message = action.payload.message;
          if (typeof message === "string") window.alert(message);
          break;
        }
        case "callService": {
          console.warn("callService not implemented in preview runtime", action.payload);
          break;
        }
      }
    }
  }

  return { executeActions };
}