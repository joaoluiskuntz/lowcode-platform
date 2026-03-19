import { useEffect, useMemo, useState } from "react";

type ComponentType =
  | "text"
  | "button"
  | "input"
  | "textarea"
  | "select"
  | "image"
  | "card"
  | "alert"
  | "badge"
  | "checkbox"
  | "divider";

type ComponentNode = {
  id: string;
  type: ComponentType;
  classList: string[];
  props: Record<string, any>;
};

type ColumnNode = {
  id: string;
  type: "column";
  span: number;
  classList: string[];
  children: CanvasChild[];
};

type RowNode = {
  id: string;
  type: "row";
  classList: string[];
  children: ColumnNode[];
};

type CanvasChild = ComponentNode | RowNode;

type ScreenNode = {
  id: string;
  title: string;
  classList: string[];
  rows: RowNode[];
};

type LowCodeDsl = {
  schemaVersion: string;
  app: {
    id: string;
    name: string;
  };
  theme: {
    bootstrapTheme: string;
    primaryColor: string;
    borderRadius: string;
  };
  screens: ScreenNode[];
};

type Selection =
  | { kind: "screen"; screenId: string }
  | { kind: "row"; screenId: string; rowId: string; parentColumnId?: string }
  | { kind: "column"; screenId: string; rowId: string; columnId: string; parentColumnId?: string }
  | { kind: "component"; screenId: string; rowId: string; columnId: string; componentId: string; parentColumnId?: string };

type DragState = {
  componentId: string;
  sourceColumnId: string;
  sourceRowId: string;
};

type DropTarget =
  | { type: "column"; columnId: string }
  | { type: "free-space"; rowId: string }
  | null;

type StudioTab = "designer" | "dsl" | "xml" | "webIr" | "androidIr" | "manifest";

const componentTypes: ComponentType[] = [
  "text",
  "button",
  "input",
  "textarea",
  "select",
  "image",
  "card",
  "alert",
  "badge",
  "checkbox",
  "divider"
];

const buttonVariants = ["primary", "secondary", "success", "danger", "warning", "info", "light", "dark", "outline-primary", "outline-secondary", "outline-success", "outline-danger"];
const alertVariants = ["primary", "secondary", "success", "danger", "warning", "info", "light", "dark"];
const badgeVariants = ["primary", "secondary", "success", "danger", "warning", "info", "light", "dark"];
const textAlignments = ["Default", "Left", "Center", "Right"];
const textAlignmentMap: Record<string, string> = { Default: "", Left: "text-start", Center: "text-center", Right: "text-end" };
const fontSizes = ["Default", "Very Large", "Large", "Medium Large", "Medium", "Small", "Very Small"];
const fontSizeMap: Record<string, string> = { Default: "", "Very Large": "fs-1", Large: "fs-2", "Medium Large": "fs-3", Medium: "fs-4", Small: "fs-5", "Very Small": "fs-6" };
const fontWeights = ["Default", "Light", "Normal", "Semi Bold", "Bold"];
const fontWeightMap: Record<string, string> = { Default: "", Light: "fw-light", Normal: "fw-normal", "Semi Bold": "fw-semibold", Bold: "fw-bold" };
const roundedOptions = ["Default", "Small", "Medium", "Large", "Circle"];
const roundedMap: Record<string, string> = { Default: "", Small: "rounded-1", Medium: "rounded-2", Large: "rounded-3", Circle: "rounded-pill" };
const shadowOptions = ["Default", "Small", "Medium", "Large", "None"];
const shadowMap: Record<string, string> = { Default: "", Small: "shadow-sm", Medium: "shadow", Large: "shadow-lg", None: "shadow-none" };
const spacingOptions = ["Default", "0", "1", "2", "3", "4", "5"];
const columnSpanOptions = [1,2,3,4,5,6,7,8,9,10,11,12];

function uid(prefix: string): string {
  return prefix + "_" + Math.random().toString(36).slice(2, 10);
}

function createComponent(type: ComponentType): ComponentNode {
  if (type === "text") return { id: uid("cmp"), type, classList: ["fs-4"], props: { text: "New text" } };
  if (type === "button") return { id: uid("cmp"), type, classList: ["btn", "btn-primary"], props: { text: "Button", variant: "primary", size: "" } };
  if (type === "input") return { id: uid("cmp"), type, classList: ["form-control"], props: { label: "Input label", placeholder: "Type here" } };
  if (type === "textarea") return { id: uid("cmp"), type, classList: ["form-control"], props: { label: "Textarea label", placeholder: "Write here", rows: 4 } };
  if (type === "select") return { id: uid("cmp"), type, classList: ["form-select"], props: { label: "Select label", options: "Option 1, Option 2, Option 3" } };
  if (type === "image") return { id: uid("cmp"), type, classList: ["img-fluid", "rounded"], props: { src: "https://via.placeholder.com/640x240", alt: "Image", widthMode: "Responsive" } };
  if (type === "card") return { id: uid("cmp"), type, classList: ["card"], props: { title: "Card title", text: "Card content", buttonText: "Action" } };
  if (type === "alert") return { id: uid("cmp"), type, classList: ["alert", "alert-info"], props: { text: "Important message", variant: "info" } };
  if (type === "badge") return { id: uid("cmp"), type, classList: ["badge", "text-bg-primary"], props: { text: "Badge", variant: "primary" } };
  if (type === "checkbox") return { id: uid("cmp"), type, classList: ["form-check-input"], props: { label: "Checkbox label", checked: false } };
  return { id: uid("cmp"), type, classList: ["my-3"], props: {} };
}

function createRow(): RowNode {
  return {
    id: uid("row"),
    type: "row",
    classList: ["g-3"],
    children: []
  };
}

function createInitialDsl(): LowCodeDsl {
  return {
    schemaVersion: "1.0.0",
    app: { id: "self-checkout-app", name: "Self Checkout" },
    theme: { bootstrapTheme: "bootstrap", primaryColor: "#0d6efd", borderRadius: "md" },
    screens: [
      {
        id: "screen_home",
        title: "Home",
        classList: ["container-fluid", "py-3"],
        rows: [
          {
            id: uid("row"),
            type: "row",
            classList: ["g-3"],
            children: [
              {
                id: uid("col"),
                type: "column",
                span: 12,
                classList: [],
                children: [
                  {
                    id: uid("cmp"),
                    type: "text",
                    classList: ["fs-2", "fw-bold", "text-center"],
                    props: { text: "Welcome to Self Checkout" }
                  },
                  {
                    id: uid("cmp"),
                    type: "button",
                    classList: ["btn", "btn-primary"],
                    props: { text: "Start", variant: "primary", size: "" }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  };
}

function escapeXml(value: string): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function appendRowXml(lines: string[], row: RowNode, indentLevel: number) {
  const indent = "  ".repeat(indentLevel);
  lines.push(`${indent}<row id="${escapeXml(row.id)}" classList="${escapeXml(row.classList.join(" "))}">`);
  for (const column of row.children) {
    lines.push(`${indent}  <column id="${escapeXml(column.id)}" span="${column.span}" classList="${escapeXml(column.classList.join(" "))}">`);
    for (const child of column.children) {
      if (child.type === "row") {
        appendRowXml(lines, child, indentLevel + 2);
      } else {
        lines.push(`${indent}    <component id="${escapeXml(child.id)}" type="${escapeXml(child.type)}" classList="${escapeXml(child.classList.join(" "))}">`);
        lines.push(`${indent}      <props>${escapeXml(JSON.stringify(child.props ?? {}))}</props>`);
        lines.push(`${indent}    </component>`);
      }
    }
    lines.push(`${indent}  </column>`);
  }
  lines.push(`${indent}</row>`);
}

function dslToXml(dsl: LowCodeDsl): string {
  const lines: string[] = [];
  lines.push(`<app id="${escapeXml(dsl.app.id)}" name="${escapeXml(dsl.app.name)}" schemaVersion="${escapeXml(dsl.schemaVersion)}">`);
  lines.push(`  <theme bootstrapTheme="${escapeXml(dsl.theme.bootstrapTheme)}" primaryColor="${escapeXml(dsl.theme.primaryColor)}" borderRadius="${escapeXml(dsl.theme.borderRadius)}" />`);
  lines.push(`  <screens>`);
  for (const screen of dsl.screens) {
    lines.push(`    <screen id="${escapeXml(screen.id)}" title="${escapeXml(screen.title)}" classList="${escapeXml(screen.classList.join(" "))}">`);
    for (const row of screen.rows) appendRowXml(lines, row, 3);
    lines.push(`    </screen>`);
  }
  lines.push(`  </screens>`);
  lines.push(`</app>`);
  return lines.join("\n");
}

function getRowUsedSpan(row: RowNode): number {
  return row.children.reduce((sum, column) => sum + column.span, 0);
}

function findLabelFromMap(classList: string[], map: Record<string, string>, fallback: string): string {
  for (const [label, value] of Object.entries(map)) {
    if (value && classList.includes(value)) return label;
  }
  return fallback;
}

function findRowInTree(rows: RowNode[], rowId: string): RowNode | undefined {
  for (const row of rows) {
    if (row.id === rowId) return row;
    for (const column of row.children) {
      for (const child of column.children) {
        if (child.type === "row") {
          const found = findRowInTree([child], rowId);
          if (found) return found;
        }
      }
    }
  }
  return undefined;
}

function findComponentInTree(rows: RowNode[], componentId: string): ComponentNode | undefined {
  for (const row of rows) {
    for (const column of row.children) {
      for (const child of column.children) {
        if (child.type !== "row" && child.id === componentId) return child;
        if (child.type === "row") {
          const found = findComponentInTree([child], componentId);
          if (found) return found;
        }
      }
    }
  }
  return undefined;
}

function getSelectedScreen(dsl: LowCodeDsl, selection: Selection): ScreenNode | undefined {
  return dsl.screens.find((screen) => screen.id === selection.screenId);
}

function getSelectedRow(dsl: LowCodeDsl, selection: Selection): RowNode | undefined {
  const screen = getSelectedScreen(dsl, selection);
  if (!screen || selection.kind === "screen") return undefined;
  return findRowInTree(screen.rows, selection.rowId);
}

function cloneRows(rows: RowNode[]): RowNode[] {
  return rows.map((row) => ({
    ...row,
    children: row.children.map((column) => ({
      ...column,
      classList: [...column.classList],
      children: column.children.map((child) => child.type === "row" ? cloneRows([child])[0] : { ...child, classList: [...child.classList], props: { ...child.props } })
    }))
  }));
}

function updateRowsAddColumn(rows: RowNode[], targetRowId: string, column: ColumnNode): RowNode[] {
  return rows.map((row) => {
    if (row.id === targetRowId) return { ...row, children: [...row.children, column] };
    return {
      ...row,
      children: row.children.map((col) => ({
        ...col,
        children: col.children.map((child) => child.type === "row" ? updateRowsAddColumn([child], targetRowId, column)[0] : child)
      }))
    };
  });
}

function updateRowsAddNestedRow(rows: RowNode[], targetColumnId: string, nestedRow: RowNode): RowNode[] {
  return rows.map((row) => ({
    ...row,
    children: row.children.map((column) => {
      if (column.id === targetColumnId) return { ...column, children: [...column.children, nestedRow] };
      return {
        ...column,
        children: column.children.map((child) => child.type === "row" ? updateRowsAddNestedRow([child], targetColumnId, nestedRow)[0] : child)
      };
    })
  }));
}

function updateRowsAddComponent(rows: RowNode[], targetColumnId: string, component: ComponentNode): RowNode[] {
  return rows.map((row) => ({
    ...row,
    children: row.children.map((column) => {
      if (column.id === targetColumnId) return { ...column, children: [...column.children, component] };
      return {
        ...column,
        children: column.children.map((child) => child.type === "row" ? updateRowsAddComponent([child], targetColumnId, component)[0] : child)
      };
    })
  }));
}

function updateComponentInTree(rows: RowNode[], componentId: string, patch: Partial<ComponentNode>): RowNode[] {
  return rows.map((row) => ({
    ...row,
    children: row.children.map((column) => ({
      ...column,
      children: column.children.map((child) => {
        if (child.type === "row") return updateComponentInTree([child], componentId, patch)[0];
        return child.id === componentId ? { ...child, ...patch } : child;
      })
    }))
  }));
}

function updateColumnInTree(rows: RowNode[], columnId: string, patch: Partial<ColumnNode>): RowNode[] {
  return rows.map((row) => ({
    ...row,
    children: row.children.map((column) => {
      if (column.id === columnId) return { ...column, ...patch };
      return {
        ...column,
        children: column.children.map((child) => child.type === "row" ? updateColumnInTree([child], columnId, patch)[0] : child)
      };
    })
  }));
}

function removeRowFromTree(rows: RowNode[], rowId: string): RowNode[] {
  return rows
    .filter((row) => row.id !== rowId)
    .map((row) => ({
      ...row,
      children: row.children.map((column) => ({
        ...column,
        children: column.children
          .filter((child) => child.type !== "row" || child.id !== rowId)
          .map((child) => child.type === "row" ? removeRowFromTree([child], rowId)[0] ?? child : child)
      }))
    }));
}

function removeColumnFromTree(rows: RowNode[], columnId: string): RowNode[] {
  return rows.map((row) => ({
    ...row,
    children: row.children
      .filter((column) => column.id !== columnId)
      .map((column) => ({
        ...column,
        children: column.children.map((child) => child.type === "row" ? removeColumnFromTree([child], columnId)[0] : child)
      }))
  }));
}

function removeComponentFromTree(rows: RowNode[], componentId: string): RowNode[] {
  return rows.map((row) => ({
    ...row,
    children: row.children.map((column) => ({
      ...column,
      children: column.children
        .filter((child) => child.type === "row" || child.id !== componentId)
        .map((child) => child.type === "row" ? removeComponentFromTree([child], componentId)[0] : child)
    }))
  }));
}

function findRowAndColumnForComponent(rows: RowNode[], componentId: string, parentColumnId?: string): { rowId: string; columnId: string; parentColumnId?: string } | undefined {
  for (const row of rows) {
    for (const column of row.children) {
      for (const child of column.children) {
        if (child.type !== "row" && child.id === componentId) return { rowId: row.id, columnId: column.id, parentColumnId };
        if (child.type === "row") {
          const found = findRowAndColumnForComponent([child], componentId, column.id);
          if (found) return found;
        }
      }
    }
  }
  return undefined;
}

function findColumnAndOwnerRow(rows: RowNode[], columnId: string): { row: RowNode; column: ColumnNode } | undefined {
  for (const row of rows) {
    for (const column of row.children) {
      if (column.id === columnId) return { row, column };
      for (const child of column.children) {
        if (child.type === "row") {
          const found = findColumnAndOwnerRow([child], columnId);
          if (found) return found;
        }
      }
    }
  }
  return undefined;
}

function moveComponentInTree(rows: RowNode[], componentId: string, targetColumnId: string): RowNode[] {
  let movedComponent: ComponentNode | undefined;

  function removeFromRows(sourceRows: RowNode[]): RowNode[] {
    return sourceRows.map((row) => ({
      ...row,
      children: row.children.map((column) => ({
        ...column,
        children: column.children
          .filter((child) => {
            if (child.type !== "row" && child.id === componentId) {
              movedComponent = { ...child, classList: [...child.classList], props: { ...child.props } };
              return false;
            }
            return true;
          })
          .map((child) => child.type === "row" ? removeFromRows([child])[0] : child)
      }))
    }));
  }

  function insertIntoRows(targetRows: RowNode[]): RowNode[] {
    return targetRows.map((row) => ({
      ...row,
      children: row.children.map((column) => {
        if (column.id === targetColumnId && movedComponent) return { ...column, children: [...column.children, movedComponent] };
        return {
          ...column,
          children: column.children.map((child) => child.type === "row" ? insertIntoRows([child])[0] : child)
        };
      })
    }));
  }

  const removed = removeFromRows(cloneRows(rows));
  if (!movedComponent) return rows;
  return insertIntoRows(removed);
}

function moveComponentToFreeSpace(rows: RowNode[], componentId: string, targetRowId: string, preferredSpan: number): RowNode[] {
  let movedComponent: ComponentNode | undefined;

  function removeFromRows(sourceRows: RowNode[]): RowNode[] {
    return sourceRows.map((row) => ({
      ...row,
      children: row.children.map((column) => ({
        ...column,
        children: column.children
          .filter((child) => {
            if (child.type !== "row" && child.id === componentId) {
              movedComponent = { ...child, classList: [...child.classList], props: { ...child.props } };
              return false;
            }
            return true;
          })
          .map((child) => child.type === "row" ? removeFromRows([child])[0] : child)
      }))
    }));
  }

  function insertIntoRows(targetRows: RowNode[]): RowNode[] {
    return targetRows.map((row) => {
      if (row.id === targetRowId && movedComponent) {
        const remaining = 12 - getRowUsedSpan(row);
        const span = Math.min(preferredSpan, remaining);
        if (span < 1) return row;
        const newColumn: ColumnNode = {
          id: uid("col"),
          type: "column",
          span,
          classList: [],
          children: [movedComponent]
        };
        return { ...row, children: [...row.children, newColumn] };
      }

      return {
        ...row,
        children: row.children.map((column) => ({
          ...column,
          children: column.children.map((child) => child.type === "row" ? insertIntoRows([child])[0] : child)
        }))
      };
    });
  }

  const removed = removeFromRows(cloneRows(rows));
  if (!movedComponent) return rows;
  return insertIntoRows(removed);
}

function getMaxSpanForColumn(row: RowNode, columnId: string): number {
  const otherUsed = row.children.filter((column) => column.id !== columnId).reduce((sum, column) => sum + column.span, 0);
  return 12 - otherUsed;
}

function extractComponentDraft(component: ComponentNode) {
  return JSON.parse(JSON.stringify(component));
}

function safeJsonStringify(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function App() {
  const [dsl, setDsl] = useState<LowCodeDsl>(createInitialDsl());
  const [selection, setSelection] = useState<Selection>({ kind: "screen", screenId: "screen_home" });
  const [newColumnSpan, setNewColumnSpan] = useState<number>(6);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget>(null);
  const [openAddMenuColumnId, setOpenAddMenuColumnId] = useState<string | null>(null);
  const [editingComponentId, setEditingComponentId] = useState<string | null>(null);
  const [draftComponent, setDraftComponent] = useState<ComponentNode | null>(null);
  const [activeTab, setActiveTab] = useState<StudioTab>("designer");
  const [dslEditorText, setDslEditorText] = useState<string>(safeJsonStringify(createInitialDsl()));
  const [dslEditorError, setDslEditorError] = useState<string>("");

  useEffect(() => {
    setDslEditorText(safeJsonStringify(dsl));
  }, [dsl]);

  const selectedScreen = getSelectedScreen(dsl, selection) ?? dsl.screens[0];
  const selectedRow = getSelectedRow(dsl, selection);

  const artifactBundle = useMemo(() => {
    const webIr = { target: "web", app: dsl.app, theme: dsl.theme, screens: dsl.screens };
    const androidIr = { target: "android", app: dsl.app, theme: dsl.theme, screens: dsl.screens };
    const manifest = { appId: dsl.app.id, appName: dsl.app.name, schemaVersion: dsl.schemaVersion, targets: ["web", "android"], screenCount: dsl.screens.length };

    return {
      dsl: safeJsonStringify(dsl),
      xml: dslToXml(dsl),
      webIr: safeJsonStringify(webIr),
      androidIr: safeJsonStringify(androidIr),
      manifest: safeJsonStringify(manifest)
    };
  }, [dsl]);

  function applyDslFromEditor() {
    try {
      const parsed = JSON.parse(dslEditorText) as LowCodeDsl;
      if (!parsed || !parsed.screens || !Array.isArray(parsed.screens)) {
        setDslEditorError("Invalid DSL: screens array is required.");
        return;
      }
      setDsl(parsed);
      setDlsSelectionSafely(parsed);
      setDslEditorError("");
      setActiveTab("designer");
    } catch (error) {
      setDslEditorError(error instanceof Error ? error.message : "Invalid JSON");
    }
  }

  function setDlsSelectionSafely(nextDsl: LowCodeDsl) {
    const firstScreen = nextDsl.screens[0];
    if (!firstScreen) return;
    setSelection({ kind: "screen", screenId: firstScreen.id });
  }

  function updateDsl(mutator: (current: LowCodeDsl) => LowCodeDsl) {
    setDsl((current) => mutator(current));
  }

  function openComponentSettings(componentId: string) {
    const component = findComponentInTree(selectedScreen.rows, componentId);
    if (!component) return;
    setEditingComponentId(componentId);
    setDraftComponent(extractComponentDraft(component));
  }

  function closeComponentSettings() {
    setEditingComponentId(null);
    setDraftComponent(null);
  }

  function saveComponentSettings() {
    if (!editingComponentId || !draftComponent) return;
    updateDsl((current) => ({
      ...current,
      screens: current.screens.map((screen) =>
        screen.id !== selectedScreen.id ? screen : { ...screen, rows: updateComponentInTree(screen.rows, editingComponentId, draftComponent) }
      )
    }));
    closeComponentSettings();
  }

  function updateDraftComponent(patch: Partial<ComponentNode>) {
    if (!draftComponent) return;
    setDraftComponent({ ...draftComponent, ...patch });
  }

  function setDraftProp(name: string, value: any) {
    if (!draftComponent) return;
    setDraftComponent({ ...draftComponent, props: { ...draftComponent.props, [name]: value } });
  }

  function replaceDraftClassMap(map: Record<string, string>, label: string) {
    if (!draftComponent) return;
    const values = Object.values(map).filter(Boolean);
    const cleaned = draftComponent.classList.filter((item) => !values.includes(item));
    const nextValue = map[label];
    setDraftComponent({ ...draftComponent, classList: nextValue ? [...cleaned, nextValue] : cleaned });
  }

  function updateDraftButtonVariant(variant: string) {
    if (!draftComponent || draftComponent.type !== "button") return;
    let nextClasses = draftComponent.classList.filter((item) => !item.startsWith("btn-") && item !== "btn");
    nextClasses = ["btn", `btn-${variant}`, ...nextClasses.filter((item) => item === "btn-sm" || item === "btn-lg")];
    setDraftComponent({ ...draftComponent, classList: nextClasses, props: { ...draftComponent.props, variant } });
  }

  function updateDraftAlertVariant(variant: string) {
    if (!draftComponent || draftComponent.type !== "alert") return;
    setDraftComponent({ ...draftComponent, classList: ["alert", `alert-${variant}`], props: { ...draftComponent.props, variant } });
  }

  function updateDraftBadgeVariant(variant: string) {
    if (!draftComponent || draftComponent.type !== "badge") return;
    setDraftComponent({ ...draftComponent, classList: ["badge", `text-bg-${variant}`], props: { ...draftComponent.props, variant } });
  }

  function updateDraftButtonSize(size: string) {
    if (!draftComponent || draftComponent.type !== "button") return;
    let nextClasses = draftComponent.classList.filter((item) => item !== "btn-sm" && item !== "btn-lg");
    if (size) nextClasses = [...nextClasses, size];
    setDraftComponent({ ...draftComponent, classList: nextClasses, props: { ...draftComponent.props, size } });
  }

  function updateDraftImageWidthMode(mode: string) {
    if (!draftComponent || draftComponent.type !== "image") return;
    let nextClasses = draftComponent.classList.filter((item) => item !== "img-fluid" && item !== "w-100");
    if (mode === "Responsive") nextClasses = [...nextClasses, "img-fluid"];
    if (mode === "Full Width") nextClasses = [...nextClasses, "w-100"];
    setDraftComponent({ ...draftComponent, classList: nextClasses, props: { ...draftComponent.props, widthMode: mode } });
  }

  function updateDraftSpacing(prefix: string, value: string) {
    if (!draftComponent) return;
    const cleaned = draftComponent.classList.filter((item) => !item.startsWith(`${prefix}-`));
    const next = value === "Default" ? cleaned : [...cleaned, `${prefix}-${value}`];
    setDraftComponent({ ...draftComponent, classList: next });
  }

  function addScreen() {
    const newScreen: ScreenNode = {
      id: uid("screen"),
      title: "New Screen",
      classList: ["container-fluid", "py-3"],
      rows: [createRow()]
    };
    updateDsl((current) => ({ ...current, screens: [...current.screens, newScreen] }));
    setSelection({ kind: "screen", screenId: newScreen.id });
  }

  function addRowToScreen() {
    const newRow = createRow();
    updateDsl((current) => ({
      ...current,
      screens: current.screens.map((screen) => screen.id === selectedScreen.id ? { ...screen, rows: [...screen.rows, newRow] } : screen)
    }));
    setSelection({ kind: "row", screenId: selectedScreen.id, rowId: newRow.id });
  }

  function addNestedRowToColumn(columnId: string) {
    const nestedRow = createRow();
    updateDsl((current) => ({
      ...current,
      screens: current.screens.map((screen) =>
        screen.id !== selectedScreen.id ? screen : { ...screen, rows: updateRowsAddNestedRow(screen.rows, columnId, nestedRow) }
      )
    }));
    setSelection({ kind: "row", screenId: selectedScreen.id, rowId: nestedRow.id, parentColumnId: columnId });
    setOpenAddMenuColumnId(null);
  }

  function addColumnToRow(rowId: string) {
    const row = findRowInTree(selectedScreen.rows, rowId);
    if (!row) return;

    const remaining = 12 - getRowUsedSpan(row);
    if (remaining <= 0) {
      alert("This row already uses all 12 Bootstrap columns.");
      return;
    }

    const span = Math.min(newColumnSpan, remaining);

    const newColumn: ColumnNode = {
      id: uid("col"),
      type: "column",
      span,
      classList: [],
      children: []
    };

    updateDsl((current) => ({
      ...current,
      screens: current.screens.map((screen) =>
        screen.id !== selectedScreen.id ? screen : { ...screen, rows: updateRowsAddColumn(screen.rows, rowId, newColumn) }
      )
    }));

    setSelection({ kind: "column", screenId: selectedScreen.id, rowId, columnId: newColumn.id });
  }

  function addComponentToColumn(type: ComponentType, columnId: string) {
    const component = createComponent(type);
    const nextRows = updateRowsAddComponent(selectedScreen.rows, columnId, component);

    updateDsl((current) => ({
      ...current,
      screens: current.screens.map((screen) =>
        screen.id !== selectedScreen.id ? screen : { ...screen, rows: updateRowsAddComponent(screen.rows, columnId, component) }
      )
    }));

    const owner = findRowAndColumnForComponent(nextRows, component.id);

    if (owner) {
      setSelection({
        kind: "component",
        screenId: selectedScreen.id,
        rowId: owner.rowId,
        columnId: owner.columnId,
        componentId: component.id,
        parentColumnId: owner.parentColumnId
      });
    }

    setOpenAddMenuColumnId(null);
  }

  function removeScreen(screenId: string) {
    if (dsl.screens.length === 1) {
      alert("At least one screen is required.");
      return;
    }
    const nextScreens = dsl.screens.filter((screen) => screen.id !== screenId);
    updateDsl((current) => ({ ...current, screens: nextScreens }));
    setSelection({ kind: "screen", screenId: nextScreens[0].id });
  }

  function removeRow(screenId: string, rowId: string) {
    updateDsl((current) => ({
      ...current,
      screens: current.screens.map((screen) => screen.id !== screenId ? screen : { ...screen, rows: removeRowFromTree(screen.rows, rowId) })
    }));
    setSelection({ kind: "screen", screenId });
  }

  function removeColumn(screenId: string, columnId: string) {
    updateDsl((current) => ({
      ...current,
      screens: current.screens.map((screen) => screen.id !== screenId ? screen : { ...screen, rows: removeColumnFromTree(screen.rows, columnId) })
    }));
    setSelection({ kind: "screen", screenId });
  }

  function removeComponent(screenId: string, componentId: string) {
    updateDsl((current) => ({
      ...current,
      screens: current.screens.map((screen) => screen.id !== screenId ? screen : { ...screen, rows: removeComponentFromTree(screen.rows, componentId) })
    }));
    setSelection({ kind: "screen", screenId });
  }

  function resizeColumn(screenId: string, columnId: string, ownerRow: RowNode, currentSpan: number, direction: "increase" | "decrease") {
    const nextSpan = direction === "increase" ? currentSpan + 1 : currentSpan - 1;
    if (nextSpan < 1) return;
    const maxSpan = getMaxSpanForColumn(ownerRow, columnId);
    if (nextSpan > maxSpan) return;

    updateDsl((current) => ({
      ...current,
      screens: current.screens.map((screen) => screen.id !== screenId ? screen : { ...screen, rows: updateColumnInTree(screen.rows, columnId, { span: nextSpan }) })
    }));
  }

  function handleDragStart(componentId: string, columnId: string, rowId: string) {
    setDragState({ componentId, sourceColumnId: columnId, sourceRowId: rowId });
  }

  function handleDropOnColumn(targetColumnId: string) {
    if (!dragState) return;
    const nextRows = moveComponentInTree(selectedScreen.rows, dragState.componentId, targetColumnId);

    updateDsl((current) => ({
      ...current,
      screens: current.screens.map((screen) => screen.id !== selectedScreen.id ? screen : { ...screen, rows: moveComponentInTree(screen.rows, dragState.componentId, targetColumnId) })
    }));

    const movedLocation = findRowAndColumnForComponent(nextRows, dragState.componentId);

    if (movedLocation) {
      setSelection({
        kind: "component",
        screenId: selectedScreen.id,
        rowId: movedLocation.rowId,
        columnId: movedLocation.columnId,
        componentId: dragState.componentId,
        parentColumnId: movedLocation.parentColumnId
      });
    }

    setDragState(null);
    setDropTarget(null);
  }

  function handleDropOnFreeSpace(targetRowId: string) {
    if (!dragState) return;

    const sourceInfo = findColumnAndOwnerRow(selectedScreen.rows, dragState.sourceColumnId);
    const targetRow = findRowInTree(selectedScreen.rows, targetRowId);
    if (!sourceInfo || !targetRow) return;

    const remaining = 12 - getRowUsedSpan(targetRow);
    if (remaining <= 0) {
      alert("This row has no free space left.");
      return;
    }

    const preferredSpan = sourceInfo.column.span;
    const nextRows = moveComponentToFreeSpace(selectedScreen.rows, dragState.componentId, targetRowId, preferredSpan);

    updateDsl((current) => ({
      ...current,
      screens: current.screens.map((screen) => screen.id !== selectedScreen.id ? screen : { ...screen, rows: moveComponentToFreeSpace(screen.rows, dragState.componentId, targetRowId, preferredSpan) })
    }));

    const movedLocation = findRowAndColumnForComponent(nextRows, dragState.componentId);

    if (movedLocation) {
      setSelection({
        kind: "component",
        screenId: selectedScreen.id,
        rowId: movedLocation.rowId,
        columnId: movedLocation.columnId,
        componentId: dragState.componentId,
        parentColumnId: movedLocation.parentColumnId
      });
    }

    setDragState(null);
    setDropTarget(null);
  }

  function renderComponent(component: ComponentNode) {
    if (component.type === "text") return <div className={component.classList.join(" ")}>{component.props.text || "Text"}</div>;
    if (component.type === "button") return <button className={component.classList.join(" ")}>{component.props.text || "Button"}</button>;
    if (component.type === "input") return <div><label className="form-label">{component.props.label || "Input label"}</label><input className={component.classList.join(" ")} placeholder={component.props.placeholder || ""} /></div>;
    if (component.type === "textarea") return <div><label className="form-label">{component.props.label || "Textarea label"}</label><textarea className={component.classList.join(" ")} rows={Number(component.props.rows) || 4} placeholder={component.props.placeholder || ""} /></div>;
    if (component.type === "select") {
      const options = String(component.props.options || "").split(",").map((item) => item.trim()).filter(Boolean);
      return <div><label className="form-label">{component.props.label || "Select label"}</label><select className={component.classList.join(" ")}>{options.map((option) => <option key={option}>{option}</option>)}</select></div>;
    }
    if (component.type === "image") return <img className={component.classList.join(" ")} src={component.props.src} alt={component.props.alt || ""} />;
    if (component.type === "card") return <div className={component.classList.join(" ")}><div className="card-body"><h5 className="card-title">{component.props.title || "Card title"}</h5><p className="card-text">{component.props.text || "Card content"}</p>{component.props.buttonText ? <button className="btn btn-primary">{component.props.buttonText}</button> : null}</div></div>;
    if (component.type === "alert") return <div className={component.classList.join(" ")}>{component.props.text || "Alert"}</div>;
    if (component.type === "badge") return <span className={component.classList.join(" ")}>{component.props.text || "Badge"}</span>;
    if (component.type === "checkbox") return <div className="form-check"><input className={component.classList.join(" ")} type="checkbox" checked={Boolean(component.props.checked)} readOnly /><label className="form-check-label ms-2">{component.props.label || "Checkbox label"}</label></div>;
    return <hr className={component.classList.join(" ")} />;
  }

  function renderAddMenu(columnId: string) {
    if (openAddMenuColumnId !== columnId) return null;

    return (
      <div className="column-add-menu-safe" onClick={(e) => e.stopPropagation()}>
        <div className="column-add-menu-title">Add to this column</div>
        <button type="button" className="btn btn-sm btn-outline-primary w-100 text-start mb-2" onClick={() => addNestedRowToColumn(columnId)}>
          Nested row
        </button>
        <div className="column-add-grid">
          {componentTypes.map((type) => (
            <button
              key={type}
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => addComponentToColumn(type, columnId)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    );
  }

  function renderRow(row: RowNode, screenId: string, parentColumnId?: string, level: number = 0): JSX.Element {
    const remaining = 12 - getRowUsedSpan(row);

    return (
      <div key={row.id} className={`designer-row ${level > 0 ? "designer-row-nested" : ""}`}>
        <div className="designer-row-toolbar">
          <div className="row-action-left">
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => addColumnToRow(row.id)}>+ Column</button>
          </div>
          <button type="button" className="btn btn-sm btn-outline-danger icon-button" onClick={() => removeRow(screenId, row.id)}>
            ×
          </button>
        </div>

        <div className="designer-grid">
          {row.children.map((column) => (
            <div
              key={column.id}
              className={[
                "designer-col",
                dropTarget?.type === "column" && dropTarget.columnId === column.id ? "designer-col-drop-shadow" : ""
              ].filter(Boolean).join(" ")}
              style={{ width: `${(column.span / 12) * 100}%` }}
              onDragOver={(e) => {
                e.preventDefault();
                setDropTarget({ type: "column", columnId: column.id });
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDropOnColumn(column.id);
              }}
            >
              <div className="designer-col-header">
                <div />
                <div className="designer-col-actions">
                  <button type="button" className="btn btn-sm btn-outline-secondary span-button" onClick={() => resizeColumn(screenId, column.id, row, column.span, "decrease")} disabled={column.span <= 1}>←</button>
                  <button type="button" className="btn btn-sm btn-outline-secondary span-button" onClick={() => resizeColumn(screenId, column.id, row, column.span, "increase")} disabled={column.span >= getMaxSpanForColumn(row, column.id)}>→</button>
                  <button type="button" className="btn btn-sm btn-primary span-button" onClick={() => setOpenAddMenuColumnId(openAddMenuColumnId === column.id ? null : column.id)}>+</button>
                  <button type="button" className="btn btn-sm btn-outline-danger span-button" onClick={() => removeColumn(screenId, column.id)}>×</button>
                </div>
              </div>

              {renderAddMenu(column.id)}

              <div className="designer-col-body">
                {column.children.length === 0 ? <div className="empty-column-message">Use + to add content</div> : null}

                {column.children.map((child) => {
                  if (child.type === "row") return renderRow(child, screenId, column.id, level + 1);

                  return (
                    <div
                      key={child.id}
                      className="designer-component"
                      draggable
                      onDragStart={() => handleDragStart(child.id, column.id, row.id)}
                    >
                      <div className="designer-component-header">
                        <div />
                        <div className="designer-component-actions">
                          <button type="button" className="btn btn-sm btn-outline-secondary mini-action" onClick={() => openComponentSettings(child.id)}>⚙</button>
                          <button type="button" className="btn btn-sm btn-outline-danger mini-action" onClick={() => removeComponent(screenId, child.id)}>×</button>
                        </div>
                      </div>
                      <div>{renderComponent(child)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {remaining > 0 ? (
            <div
              className={`designer-col-placeholder ${dropTarget?.type === "free-space" && dropTarget.rowId === row.id ? "designer-col-drop-shadow" : ""}`}
              style={{ width: `${(remaining / 12) * 100}%` }}
              onDragOver={(e) => {
                e.preventDefault();
                setDropTarget({ type: "free-space", rowId: row.id });
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDropOnFreeSpace(row.id);
              }}
            >
              +
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  function renderArtifactTab() {
    if (activeTab === "designer") {
      return (
        <div className="canvas-card">
          <div className="canvas-top-actions">
            <button type="button" className="btn btn-primary" onClick={addRowToScreen}>+ Row</button>
          </div>
          <div className="screen-surface">
            {selectedScreen.rows.map((row) => renderRow(row, selectedScreen.id))}
          </div>
        </div>
      );
    }

    if (activeTab === "dsl") {
      return (
        <div className="artifact-card">
          <div className="artifact-toolbar">
            <button type="button" className="btn btn-primary" onClick={applyDslFromEditor}>Apply DSL</button>
            {dslEditorError ? <div className="artifact-error">{dslEditorError}</div> : null}
          </div>
          <textarea
            className="artifact-editor"
            value={dslEditorText}
            onChange={(e) => {
              setDslEditorText(e.target.value);
              setDslEditorError("");
            }}
          />
        </div>
      );
    }

    const content =
      activeTab === "xml" ? artifactBundle.xml :
      activeTab === "webIr" ? artifactBundle.webIr :
      activeTab === "androidIr" ? artifactBundle.androidIr :
      activeTab === "manifest" ? artifactBundle.manifest :
      artifactBundle.dsl;

    return (
      <div className="artifact-card">
        <pre className="artifact-pre">{content}</pre>
      </div>
    );
  }

  return (
    <>
      <div className="studio-shell-simple">
        <aside className="studio-sidebar">
          <div className="studio-brand">
            <div className="studio-brand-title">Lowcode Studio</div>
            <div className="studio-brand-subtitle">Visual screen builder for self-checkout</div>
          </div>

          <div className="panel-card">
            <div className="panel-title">Screens</div>
            <div className="stack">
              {dsl.screens.map((screen) => (
                <div key={screen.id} className="screen-item">
                  <button type="button" className={`btn btn-sm text-start flex-grow-1 ${selection.kind === "screen" && selection.screenId === screen.id ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setSelection({ kind: "screen", screenId: screen.id })}>
                    {screen.title}
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeScreen(screen.id)}>×</button>
                </div>
              ))}
              <button type="button" className="btn btn-success btn-sm" onClick={addScreen}>Add screen</button>
            </div>
          </div>
        </aside>

        <main className="studio-main">
          <div className="topbar">
            <div className="topbar-title-row">
              <div className="topbar-title">{selectedScreen.title}</div>
              <div className="topbar-tabs">
                <button type="button" className={`btn btn-sm ${activeTab === "designer" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setActiveTab("designer")}>Designer</button>
                <button type="button" className={`btn btn-sm ${activeTab === "dsl" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setActiveTab("dsl")}>DSL</button>
                <button type="button" className={`btn btn-sm ${activeTab === "xml" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setActiveTab("xml")}>XML</button>
                <button type="button" className={`btn btn-sm ${activeTab === "webIr" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setActiveTab("webIr")}>Web IR</button>
                <button type="button" className={`btn btn-sm ${activeTab === "androidIr" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setActiveTab("androidIr")}>Android</button>
                <button type="button" className={`btn btn-sm ${activeTab === "manifest" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setActiveTab("manifest")}>Manifest</button>
              </div>
            </div>
            <div className="topbar-subtitle">Switch between visual builder and generated artifacts.</div>
          </div>

          {renderArtifactTab()}
        </main>
      </div>

      {draftComponent ? (
        <div className="settings-modal-backdrop" onClick={closeComponentSettings}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h3>Component settings</h3>
              <button type="button" className="btn btn-sm btn-outline-danger" onClick={closeComponentSettings}>×</button>
            </div>

            <div className="settings-modal-body">
              {draftComponent.type === "text" ? (
                <>
                  <label className="form-label mb-1">Text</label>
                  <textarea className="form-control form-control-sm mb-3" rows={4} value={draftComponent.props.text || ""} onChange={(e) => setDraftProp("text", e.target.value)} />
                  <label className="form-label mb-1">Alignment</label>
                  <select className="form-select form-select-sm mb-3" value={findLabelFromMap(draftComponent.classList, textAlignmentMap, "Default")} onChange={(e) => replaceDraftClassMap(textAlignmentMap, e.target.value)}>
                    {textAlignments.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                  <label className="form-label mb-1">Font size</label>
                  <select className="form-select form-select-sm mb-3" value={findLabelFromMap(draftComponent.classList, fontSizeMap, "Default")} onChange={(e) => replaceDraftClassMap(fontSizeMap, e.target.value)}>
                    {fontSizes.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                  <label className="form-label mb-1">Font weight</label>
                  <select className="form-select form-select-sm mb-3" value={findLabelFromMap(draftComponent.classList, fontWeightMap, "Default")} onChange={(e) => replaceDraftClassMap(fontWeightMap, e.target.value)}>
                    {fontWeights.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </>
              ) : null}

              {draftComponent.type === "button" ? (
                <>
                  <label className="form-label mb-1">Button text</label>
                  <input className="form-control form-control-sm mb-3" value={draftComponent.props.text || ""} onChange={(e) => setDraftProp("text", e.target.value)} />
                  <label className="form-label mb-1">Button style</label>
                  <select className="form-select form-select-sm mb-3" value={draftComponent.props.variant || "primary"} onChange={(e) => updateDraftButtonVariant(e.target.value)}>
                    {buttonVariants.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                  <label className="form-label mb-1">Button size</label>
                  <select className="form-select form-select-sm mb-3" value={draftComponent.props.size || ""} onChange={(e) => updateDraftButtonSize(e.target.value)}>
                    <option value="">Default</option>
                    <option value="btn-sm">Small</option>
                    <option value="btn-lg">Large</option>
                  </select>
                </>
              ) : null}

              {draftComponent.type === "input" ? (
                <>
                  <label className="form-label mb-1">Label</label>
                  <input className="form-control form-control-sm mb-3" value={draftComponent.props.label || ""} onChange={(e) => setDraftProp("label", e.target.value)} />
                  <label className="form-label mb-1">Placeholder</label>
                  <input className="form-control form-control-sm mb-3" value={draftComponent.props.placeholder || ""} onChange={(e) => setDraftProp("placeholder", e.target.value)} />
                </>
              ) : null}

              {draftComponent.type === "textarea" ? (
                <>
                  <label className="form-label mb-1">Label</label>
                  <input className="form-control form-control-sm mb-3" value={draftComponent.props.label || ""} onChange={(e) => setDraftProp("label", e.target.value)} />
                  <label className="form-label mb-1">Placeholder</label>
                  <input className="form-control form-control-sm mb-3" value={draftComponent.props.placeholder || ""} onChange={(e) => setDraftProp("placeholder", e.target.value)} />
                  <label className="form-label mb-1">Rows</label>
                  <input className="form-control form-control-sm mb-3" type="number" min="1" max="12" value={String(draftComponent.props.rows || 4)} onChange={(e) => setDraftProp("rows", Number(e.target.value))} />
                </>
              ) : null}

              {draftComponent.type === "select" ? (
                <>
                  <label className="form-label mb-1">Label</label>
                  <input className="form-control form-control-sm mb-3" value={draftComponent.props.label || ""} onChange={(e) => setDraftProp("label", e.target.value)} />
                  <label className="form-label mb-1">Options</label>
                  <textarea className="form-control form-control-sm mb-3" rows={4} value={draftComponent.props.options || ""} onChange={(e) => setDraftProp("options", e.target.value)} />
                </>
              ) : null}

              {draftComponent.type === "image" ? (
                <>
                  <label className="form-label mb-1">Image URL</label>
                  <input className="form-control form-control-sm mb-3" value={draftComponent.props.src || ""} onChange={(e) => setDraftProp("src", e.target.value)} />
                  <label className="form-label mb-1">Alt text</label>
                  <input className="form-control form-control-sm mb-3" value={draftComponent.props.alt || ""} onChange={(e) => setDraftProp("alt", e.target.value)} />
                  <label className="form-label mb-1">Image width</label>
                  <select className="form-select form-select-sm mb-3" value={draftComponent.props.widthMode || "Responsive"} onChange={(e) => updateDraftImageWidthMode(e.target.value)}>
                    <option value="Responsive">Responsive</option>
                    <option value="Full Width">Full Width</option>
                    <option value="Original Size">Original Size</option>
                  </select>
                </>
              ) : null}

              {draftComponent.type === "card" ? (
                <>
                  <label className="form-label mb-1">Title</label>
                  <input className="form-control form-control-sm mb-3" value={draftComponent.props.title || ""} onChange={(e) => setDraftProp("title", e.target.value)} />
                  <label className="form-label mb-1">Text</label>
                  <textarea className="form-control form-control-sm mb-3" rows={4} value={draftComponent.props.text || ""} onChange={(e) => setDraftProp("text", e.target.value)} />
                  <label className="form-label mb-1">Button text</label>
                  <input className="form-control form-control-sm mb-3" value={draftComponent.props.buttonText || ""} onChange={(e) => setDraftProp("buttonText", e.target.value)} />
                  <label className="form-label mb-1">Rounded corners</label>
                  <select className="form-select form-select-sm mb-3" value={findLabelFromMap(draftComponent.classList, roundedMap, "Default")} onChange={(e) => replaceDraftClassMap(roundedMap, e.target.value)}>
                    {roundedOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                  <label className="form-label mb-1">Shadow</label>
                  <select className="form-select form-select-sm mb-3" value={findLabelFromMap(draftComponent.classList, shadowMap, "Default")} onChange={(e) => replaceDraftClassMap(shadowMap, e.target.value)}>
                    {shadowOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </>
              ) : null}

              {draftComponent.type === "alert" ? (
                <>
                  <label className="form-label mb-1">Message</label>
                  <textarea className="form-control form-control-sm mb-3" rows={4} value={draftComponent.props.text || ""} onChange={(e) => setDraftProp("text", e.target.value)} />
                  <label className="form-label mb-1">Alert style</label>
                  <select className="form-select form-select-sm mb-3" value={draftComponent.props.variant || "info"} onChange={(e) => updateDraftAlertVariant(e.target.value)}>
                    {alertVariants.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </>
              ) : null}

              {draftComponent.type === "badge" ? (
                <>
                  <label className="form-label mb-1">Text</label>
                  <input className="form-control form-control-sm mb-3" value={draftComponent.props.text || ""} onChange={(e) => setDraftProp("text", e.target.value)} />
                  <label className="form-label mb-1">Badge style</label>
                  <select className="form-select form-select-sm mb-3" value={draftComponent.props.variant || "primary"} onChange={(e) => updateDraftBadgeVariant(e.target.value)}>
                    {badgeVariants.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </>
              ) : null}

              {draftComponent.type === "checkbox" ? (
                <>
                  <label className="form-label mb-1">Label</label>
                  <input className="form-control form-control-sm mb-3" value={draftComponent.props.label || ""} onChange={(e) => setDraftProp("label", e.target.value)} />
                  <div className="form-check mb-3">
                    <input className="form-check-input" type="checkbox" checked={Boolean(draftComponent.props.checked)} onChange={(e) => setDraftProp("checked", e.target.checked)} />
                    <label className="form-check-label">Checked by default</label>
                  </div>
                </>
              ) : null}

              <div className="spacing-grid">
                <div>
                  <label className="form-label mb-1">Margin top</label>
                  <select className="form-select form-select-sm" onChange={(e) => updateDraftSpacing("mt", e.target.value)}>
                    {spacingOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label mb-1">Margin bottom</label>
                  <select className="form-select form-select-sm" onChange={(e) => updateDraftSpacing("mb", e.target.value)}>
                    {spacingOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label mb-1">Padding top</label>
                  <select className="form-select form-select-sm" onChange={(e) => updateDraftSpacing("pt", e.target.value)}>
                    {spacingOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label mb-1">Padding bottom</label>
                  <select className="form-select form-select-sm" onChange={(e) => updateDraftSpacing("pb", e.target.value)}>
                    {spacingOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="settings-modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={closeComponentSettings}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={saveComponentSettings}>Save</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default App;