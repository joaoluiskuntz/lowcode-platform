"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformDslToIr = transformDslToIr;
function transformDslToIr(dsl) {
    return {
        version: dsl.schemaVersion,
        app: {
            id: dsl.app.id,
            name: dsl.app.name
        },
        theme: {
            bootstrapTheme: dsl.theme?.bootstrapTheme ?? "default",
            primaryColor: dsl.theme?.primaryColor ?? "#0d6efd",
            borderRadius: dsl.theme?.borderRadius ?? "md"
        },
        screens: dsl.screens.map((screen) => ({
            id: screen.id,
            title: screen.title,
            root: transformNode(screen.layout, `screen-${screen.id}-root`)
        }))
    };
}
function transformNode(node, fallbackId) {
    const nodeId = node.id ?? fallbackId;
    const classList = [...(node.classList ?? [])].sort();
    const bindings = { ...(node.bindings ?? {}) };
    if (node.type === "row") {
        return {
            kind: "container",
            containerType: "row",
            nodeId,
            classList,
            bindings,
            children: node.children.map((child, index) => transformNode(child, `${nodeId}-child-${index}`))
        };
    }
    if (node.type === "column") {
        return {
            kind: "container",
            containerType: "column",
            nodeId,
            classList,
            bindings,
            layout: {
                span: normalizeSpan(node.span)
            },
            children: node.children.map((child, index) => transformNode(child, `${nodeId}-child-${index}`))
        };
    }
    const component = node;
    return {
        kind: "component",
        componentType: component.type,
        nodeId,
        classList,
        bindings,
        props: normalizeProps(component.props),
        events: normalizeEvents(component.events)
    };
}
function normalizeSpan(span) {
    const ordered = {};
    for (const key of ["xs", "sm", "md", "lg", "xl"]) {
        const value = span[key];
        if (typeof value === "number") {
            ordered[key] = value;
        }
    }
    return ordered;
}
function normalizeProps(props) {
    const sortedKeys = Object.keys(props).sort();
    const result = {};
    for (const key of sortedKeys) {
        result[key] = props[key];
    }
    return result;
}
function normalizeEvents(events) {
    if (!events) {
        return {};
    }
    const result = {};
    for (const [eventName, actions] of Object.entries(events)) {
        if (!Array.isArray(actions)) {
            continue;
        }
        result[eventName] = actions.map((action) => transformAction(action));
    }
    return result;
}
function transformAction(action) {
    switch (action.type) {
        case "navigate":
            return {
                type: "navigate",
                payload: { target: action.target }
            };
        case "setState":
            return {
                type: "setState",
                payload: { stateKey: action.stateKey, value: action.value }
            };
        case "callService":
            return {
                type: "callService",
                payload: { service: action.service }
            };
        case "showMessage":
            return {
                type: "showMessage",
                payload: { message: action.message }
            };
        default:
            return {
                type: "showMessage",
                payload: { message: "Unsupported action" }
            };
    }
}
