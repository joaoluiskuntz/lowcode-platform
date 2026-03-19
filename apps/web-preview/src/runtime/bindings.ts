export function resolveNodeBinding(
  node: { bindings: Record<string, string> },
  bindingKey: string,
  stateStore: Record<string, unknown>,
  fallback: unknown
): unknown {
  const expression = node.bindings[bindingKey];

  if (typeof expression !== "string" || expression.trim().length === 0) {
    return fallback;
  }

  return resolveBindingExpression(expression, stateStore, fallback);
}

export function resolveBoundString(
  node: { bindings: Record<string, string> },
  bindingKey: string,
  stateStore: Record<string, unknown>,
  fallback = ""
): string {
  const value = resolveNodeBinding(node, bindingKey, stateStore, fallback);

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return fallback;
}

function resolveBindingExpression(
  expression: string,
  stateStore: Record<string, unknown>,
  fallback: unknown
): unknown {
  const trimmed = expression.trim();

  if (!trimmed.startsWith("state.")) {
    return fallback;
  }

  const path = trimmed.slice("state.".length).split(".").filter(Boolean);

  if (path.length === 0) {
    return fallback;
  }

  let current: unknown = stateStore;

  for (const segment of path) {
    if (current === null || typeof current !== "object") {
      return fallback;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return current ?? fallback;
}