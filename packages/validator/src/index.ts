import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import { schema, LowCodeDsl, LayoutNodeDsl, ComponentNodeDsl, ActionDsl } from "@lowcode/dsl-schema";

export interface ValidationIssue {
  path: string;
  message: string;
  severity: "error" | "warning";
  code: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

const ajv = new Ajv2020({
  allErrors: true,
  strict: false
});

addFormats(ajv);

const validateSchemaFn = ajv.compile(schema);

export function validateDsl(input: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];

  const schemaValid = validateSchemaFn(input);
  if (!schemaValid) {
    for (const err of validateSchemaFn.errors ?? []) {
      issues.push({
        path: err.instancePath || "/",
        message: err.message ?? "Schema validation error",
        severity: "error",
        code: "SCHEMA_VALIDATION"
      });
    }
    return { valid: false, issues };
  }

  const semanticIssues = validateSemantics(input as unknown as LowCodeDsl);
  issues.push(...semanticIssues);

  return {
    valid: issues.every((i) => i.severity !== "error"),
    issues
  };
}

function validateSemantics(dsl: LowCodeDsl): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const screenIds = new Set<string>();
  const componentIds = new Set<string>();

  for (const screen of dsl.screens) {
    if (screenIds.has(screen.id)) {
      issues.push({
        path: `/screens/${screen.id}`,
        message: `Duplicate screen id '${screen.id}'`,
        severity: "error",
        code: "DUPLICATE_SCREEN_ID"
      });
    }
    screenIds.add(screen.id);

    walkNode(screen.layout, screen.id, issues, componentIds, screenIds);
  }

  for (const screen of dsl.screens) {
    validateActions(screen.layout, screenIds, issues);
  }

  return issues;
}

function walkNode(
  node: LayoutNodeDsl,
  screenId: string,
  issues: ValidationIssue[],
  componentIds: Set<string>,
  screenIds: Set<string>
): void {
  if (node.type === "row" || node.type === "column") {
    for (const child of node.children) {
      walkNode(child, screenId, issues, componentIds, screenIds);
    }
    return;
  }

  const component = node as ComponentNodeDsl;

  if (componentIds.has(component.id)) {
    issues.push({
      path: `/screens/${screenId}/components/${component.id}`,
      message: `Duplicate component id '${component.id}'`,
      severity: "error",
      code: "DUPLICATE_COMPONENT_ID"
    });
  }
  componentIds.add(component.id);

  if (component.type === "image" && typeof component.props.alt !== "string") {
    issues.push({
      path: `/components/${component.id}/props/alt`,
      message: "Image component must define alt text",
      severity: "error",
      code: "ACCESSIBILITY_ALT_REQUIRED"
    });
  }

  if (component.type === "button" && typeof component.props.label !== "string") {
    issues.push({
      path: `/components/${component.id}/props/label`,
      message: "Button component must define a label",
      severity: "error",
      code: "BUTTON_LABEL_REQUIRED"
    });
  }
}

function validateActions(
  node: LayoutNodeDsl,
  screenIds: Set<string>,
  issues: ValidationIssue[]
): void {
  if (node.type === "row" || node.type === "column") {
    for (const child of node.children) {
      validateActions(child, screenIds, issues);
    }
    return;
  }

  const events = node.events;
  if (!events) return;

  const actionGroups = [events.onClick ?? [], events.onChange ?? []];

  for (const group of actionGroups) {
    for (const action of group) {
      validateAction(action, screenIds, issues, node.id);
    }
  }
}

function validateAction(
  action: ActionDsl,
  screenIds: Set<string>,
  issues: ValidationIssue[],
  componentId: string
): void {
  if (action.type === "navigate") {
    if (!action.target) {
      issues.push({
        path: `/components/${componentId}/events`,
        message: "Navigate action requires target",
        severity: "error",
        code: "NAVIGATE_TARGET_REQUIRED"
      });
      return;
    }

    if (!screenIds.has(action.target)) {
      issues.push({
        path: `/components/${componentId}/events`,
        message: `Navigate target '${action.target}' does not exist`,
        severity: "error",
        code: "NAVIGATE_TARGET_NOT_FOUND"
      });
    }
  }
}
