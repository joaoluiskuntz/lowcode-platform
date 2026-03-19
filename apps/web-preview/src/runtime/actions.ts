import type { IrAction } from "@lowcode/ir";
import { isSupportedBindingExpression, resolveBindingExpression } from "./bindings";
import { useRuntime } from "./RuntimeContext";

type ActionInput = IrAction[] | IrAction | null | undefined;

export function useActionExecutor() {
  const runtime = useRuntime();

  function executeActions(input: ActionInput): void {
    const actions = normalizeActions(input);

    for (const action of actions) {
      executeSingleAction(action);
    }
  }

  function executeSingleAction(action: IrAction): void {
    switch (action.type) {
      case "navigate": {
        const target = action.payload?.target;

        if (typeof target === "string" && target.length > 0) {
          runtime.navigate(target);
        } else {
          console.warn("navigate action ignored because target is missing", action);
        }

        break;
      }

      case "setState": {
        applySetStatePayload(action.payload ?? {});
        break;
      }

      case "showMessage": {
        const message = action.payload?.message;

        if (typeof message === "string") {
          window.alert(message);
        } else {
          console.warn("showMessage action ignored because message is missing", action);
        }

        break;
      }

      case "callService": {
        console.warn("callService not implemented in preview runtime", action.payload);
        break;
      }

      default: {
        console.warn("Unsupported action ignored by preview runtime", action);
        break;
      }
    }
  }

  function applySetStatePayload(payload: Record<string, unknown>): void {
    if (Array.isArray(payload.updates)) {
      for (const update of payload.updates) {
        if (isStateUpdate(update)) {
          applyStateUpdate(update.stateKey, update.value);
        } else {
          console.warn("Invalid setState update ignored", update);
        }
      }

      return;
    }

    if (isStateUpdate(payload)) {
      applyStateUpdate(payload.stateKey, payload.value);
      return;
    }

    console.warn("Invalid setState payload ignored", payload);
  }

  function applyStateUpdate(stateKey: string, value: unknown): void {
    runtime.setStateValue(stateKey, resolveActionValue(value));
  }

  function resolveActionValue(value: unknown): unknown {
    if (typeof value === "string" && isSupportedBindingExpression(value)) {
      return resolveBindingExpression(value, runtime.stateStore, value);
    }

    return value;
  }

  return { executeActions };
}

function normalizeActions(input: ActionInput): IrAction[] {
  if (!input) {
    return [];
  }

  if (Array.isArray(input)) {
    return input.flatMap((item) => normalizeActions(item));
  }

  if (typeof input === "object" && input !== null && typeof (input as { type?: unknown }).type === "string") {
    return [input as IrAction];
  }

  return [];
}

function isStateUpdate(value: unknown): value is { stateKey: string; value: unknown } {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { stateKey?: unknown }).stateKey === "string"
  );
}