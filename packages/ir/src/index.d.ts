export interface AppIr {
    version: string;
    app: {
        id: string;
        name: string;
    };
    theme: ThemeIr;
    screens: ScreenIr[];
}
export interface ThemeIr {
    bootstrapTheme: string;
    primaryColor: string;
    borderRadius: "none" | "sm" | "md" | "lg" | "xl";
}
export interface ScreenIr {
    id: string;
    title: string;
    root: IrNode;
}
export type IrNode = IrContainerNode | IrComponentNode;
export interface IrBaseNode {
    nodeId: string;
    classList: string[];
    bindings: Record<string, string>;
}
export interface IrContainerNode extends IrBaseNode {
    kind: "container";
    containerType: "row" | "column";
    layout?: {
        span?: Partial<Record<"xs" | "sm" | "md" | "lg" | "xl", number>>;
    };
    children: IrNode[];
}
export interface IrComponentNode extends IrBaseNode {
    kind: "component";
    componentType: "text" | "button" | "image" | "input" | "card" | "list";
    props: Record<string, unknown>;
    events: Record<string, IrAction[]>;
}
export interface IrAction {
    type: "navigate" | "setState" | "callService" | "showMessage";
    payload: Record<string, unknown>;
}
