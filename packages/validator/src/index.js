"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDsl = validateDsl;
const _2020_1 = __importDefault(require("ajv/dist/2020"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
const dsl_schema_1 = require("@lowcode/dsl-schema");
const ajv = new _2020_1.default({
    allErrors: true,
    strict: false
});
(0, ajv_formats_1.default)(ajv);
const validateSchemaFn = ajv.compile(dsl_schema_1.schema);
function validateDsl(input) {
    const issues = [];
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
    const semanticIssues = validateSemantics(input);
    issues.push(...semanticIssues);
    return {
        valid: issues.every((i) => i.severity !== "error"),
        issues
    };
}
function validateSemantics(dsl) {
    const issues = [];
    const screenIds = new Set();
    const componentIds = new Set();
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
function walkNode(node, screenId, issues, componentIds, screenIds) {
    if (node.type === "row" || node.type === "column") {
        for (const child of node.children) {
            walkNode(child, screenId, issues, componentIds, screenIds);
        }
        return;
    }
    const component = node;
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
function validateActions(node, screenIds, issues) {
    if (node.type === "row" || node.type === "column") {
        for (const child of node.children) {
            validateActions(child, screenIds, issues);
        }
        return;
    }
    const events = node.events;
    if (!events)
        return;
    const actionGroups = [events.onClick ?? [], events.onChange ?? []];
    for (const group of actionGroups) {
        for (const action of group) {
            validateAction(action, screenIds, issues, node.id);
        }
    }
}
function validateAction(action, screenIds, issues, componentId) {
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
