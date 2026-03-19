import schema from "./schema.json";
export { schema };
export type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
export interface JsonObject {
    [key: string]: JsonValue;
}
export interface LowCodeDsl {
    schemaVersion: string;
    app: {
        id: string;
        name: string;
    };
    theme?: {
        bootstrapTheme?: string;
        primaryColor?: string;
        borderRadius?: "none" | "sm" | "md" | "lg" | "xl";
    };
    screens: ScreenDsl[];
}
export interface ScreenDsl {
    id: string;
    title: string;
    layout: LayoutNodeDsl;
}
export type LayoutNodeDsl = RowNodeDsl | ColumnNodeDsl | ComponentNodeDsl;
export interface BaseNodeDsl {
    id?: string;
    classList?: string[];
    bindings?: Record<string, string>;
}
export interface RowNodeDsl extends BaseNodeDsl {
    type: "row";
    children: LayoutNodeDsl[];
}
export interface ColumnNodeDsl extends BaseNodeDsl {
    type: "column";
    span: Partial<Record<"xs" | "sm" | "md" | "lg" | "xl", number>>;
    children: LayoutNodeDsl[];
}
export interface ComponentNodeDsl extends BaseNodeDsl {
    type: "text" | "button" | "image" | "input" | "card" | "list";
    id: string;
    props: Record<string, JsonValue>;
    events?: {
        onClick?: ActionDsl[];
        onChange?: ActionDsl[];
    };
}
export interface ActionDsl {
    type: "navigate" | "setState" | "callService" | "showMessage";
    target?: string;
    stateKey?: string;
    value?: JsonValue;
    service?: string;
    message?: string;
}
