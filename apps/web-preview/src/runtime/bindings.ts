const SEGMENT_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function isSupportedBindingExpression(expression: string): boolean {
  const trimmed = expression.trim();

  if (!trimmed.startsWith("state.")) {
    return false;
  }

  const path = trimmed.slice("state.".length).split(".").filter(Boolean);

  if (path.length === 0) {
    return false;
  }

  return path.every((segment) => SEGMENT_PATTERN.test(segment));
}

export function resolveBindingExpression(
  expression: string,
  stateStore: Record<string, unknown>,
  fallback: unknown
): unknown {
  if (!isSupportedBindingExpression(expression)) {
    return fallback;
  }

  const path = expression
    .trim()
    .slice("state.".length)
    .split(".")
    .filter(Boolean);

  let current: unknown = stateStore;

  for (const segment of path) {
    if (current === null || typeof current !== "object") {
      return fallback;
    }

    current = (current as Record<string, unknown>)[segment];

    if (current === undefined) {
      return fallback;
    }
  }

  return current;
}

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