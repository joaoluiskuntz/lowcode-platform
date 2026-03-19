export type MetadataNodeType =
  | "text"
  | "button"
  | "image"
  | "input"
  | "card"
  | "list"
  | "row"
  | "column";

export type MetadataPropertyType =
  | "string"
  | "number"
  | "boolean"
  | "enum"
  | "array"
  | "object";

export interface ComponentPropertyMetadata {
  name: string;
  type: MetadataPropertyType;
  required: boolean;
  bindable: boolean;
  defaultValue?: unknown;
  enumValues?: string[];
  description: string;
}

export interface ComponentEventMetadata {
  name: "onClick" | "onChange";
  supportedActions: Array<"navigate" | "setState" | "callService" | "showMessage">;
  description: string;
}

export interface AccessibilityMetadata {
  required: string[];
  notes: string[];
}

export interface PlatformSupportMetadata {
  web: boolean;
  android: boolean;
}

export interface ComponentMetadata {
  type: MetadataNodeType;
  category: "component" | "container";
  displayName: string;
  description: string;
  properties: ComponentPropertyMetadata[];
  events: ComponentEventMetadata[];
  accessibility: AccessibilityMetadata;
  platforms: PlatformSupportMetadata;
}

export const componentCatalog: ComponentMetadata[] = [
  {
    type: "text",
    category: "component",
    displayName: "Text",
    description: "Displays readable text content.",
    properties: [
      {
        name: "text",
        type: "string",
        required: true,
        bindable: true,
        defaultValue: "",
        description: "Visible text content."
      }
    ],
    events: [],
    accessibility: {
      required: [],
      notes: ["Text should remain readable and should not carry critical information by color alone."]
    },
    platforms: { web: true, android: true }
  },
  {
    type: "button",
    category: "component",
    displayName: "Button",
    description: "Interactive trigger for declarative actions.",
    properties: [
      {
        name: "label",
        type: "string",
        required: true,
        bindable: true,
        defaultValue: "Button",
        description: "Visible accessible button label."
      },
      {
        name: "variant",
        type: "enum",
        required: false,
        bindable: false,
        defaultValue: "primary",
        enumValues: ["primary", "secondary", "success", "danger", "warning", "info", "light", "dark"],
        description: "Bootstrap-oriented visual variant."
      },
      {
        name: "size",
        type: "enum",
        required: false,
        bindable: false,
        defaultValue: "",
        enumValues: ["", "sm", "lg"],
        description: "Optional button size."
      }
    ],
    events: [
      {
        name: "onClick",
        supportedActions: ["navigate", "setState", "callService", "showMessage"],
        description: "Triggered when the user clicks the button."
      }
    ],
    accessibility: {
      required: ["label"],
      notes: ["Buttons must expose a readable label."]
    },
    platforms: { web: true, android: true }
  },
  {
    type: "image",
    category: "component",
    displayName: "Image",
    description: "Displays an image asset.",
    properties: [
      {
        name: "src",
        type: "string",
        required: true,
        bindable: true,
        description: "Image source URL or asset path."
      },
      {
        name: "alt",
        type: "string",
        required: true,
        bindable: true,
        defaultValue: "",
        description: "Accessible alternative text."
      }
    ],
    events: [],
    accessibility: {
      required: ["alt"],
      notes: ["Alternative text is required for non-decorative images."]
    },
    platforms: { web: true, android: true }
  },
  {
    type: "input",
    category: "component",
    displayName: "Input",
    description: "Captures text input and can update runtime state.",
    properties: [
      {
        name: "label",
        type: "string",
        required: false,
        bindable: true,
        defaultValue: "",
        description: "Visible field label."
      },
      {
        name: "placeholder",
        type: "string",
        required: false,
        bindable: true,
        defaultValue: "",
        description: "Placeholder text."
      },
      {
        name: "stateKey",
        type: "string",
        required: false,
        bindable: false,
        description: "Runtime state key updated by the field."
      },
      {
        name: "value",
        type: "string",
        required: false,
        bindable: true,
        defaultValue: "",
        description: "Optional displayed value binding."
      }
    ],
    events: [
      {
        name: "onChange",
        supportedActions: ["navigate", "setState", "callService", "showMessage"],
        description: "Triggered after the field value changes."
      }
    ],
    accessibility: {
      required: [],
      notes: ["Prefer labels for better form accessibility."]
    },
    platforms: { web: true, android: true }
  },
  {
    type: "card",
    category: "component",
    displayName: "Card",
    description: "Groups content using a titled surface.",
    properties: [
      {
        name: "title",
        type: "string",
        required: false,
        bindable: true,
        defaultValue: "",
        description: "Card title."
      },
      {
        name: "body",
        type: "string",
        required: false,
        bindable: true,
        defaultValue: "",
        description: "Card body text."
      }
    ],
    events: [],
    accessibility: {
      required: [],
      notes: ["Use cards to group related information, not as the only source of navigation."]
    },
    platforms: { web: true, android: true }
  },
  {
    type: "list",
    category: "component",
    displayName: "List",
    description: "Displays a sequence of items.",
    properties: [
      {
        name: "items",
        type: "array",
        required: true,
        bindable: false,
        defaultValue: [],
        description: "Ordered values displayed in the list."
      }
    ],
    events: [],
    accessibility: {
      required: [],
      notes: ["List items should remain concise and readable."]
    },
    platforms: { web: true, android: true }
  },
  {
    type: "row",
    category: "container",
    displayName: "Row",
    description: "Bootstrap-oriented horizontal layout container.",
    properties: [],
    events: [],
    accessibility: {
      required: [],
      notes: ["Rows organize columns and should not hold business logic."]
    },
    platforms: { web: true, android: true }
  },
  {
    type: "column",
    category: "container",
    displayName: "Column",
    description: "Bootstrap-oriented responsive column container.",
    properties: [
      {
        name: "span",
        type: "object",
        required: true,
        bindable: false,
        description: "Responsive column span definition across breakpoints."
      }
    ],
    events: [],
    accessibility: {
      required: [],
      notes: ["Columns define layout only and remain renderer-agnostic in IR."]
    },
    platforms: { web: true, android: true }
  }
];

export const componentCatalogByType: Record<MetadataNodeType, ComponentMetadata> =
  Object.fromEntries(componentCatalog.map((entry) => [entry.type, entry])) as Record<
    MetadataNodeType,
    ComponentMetadata
  >;