import { useEffect, useMemo, useState } from "react";

type ComponentType = "text" | "button" | "input" | "textarea" | "select" | "image" | "card" | "alert" | "badge" | "checkbox" | "divider";

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
  children: Array<ComponentNode | RowNode>;
};

type RowNode = {
  id: string;
  type: "row";
  classList: string[];
  children: ColumnNode[];
};

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

type StudioTab = "designer" | "dsl" | "xml" | "webIr" | "androidIr" | "manifest";

type DragState =
  | { kind: "row"; rowId: string }
  | { kind: "column"; columnId: string; rowId: string }
  | { kind: "component"; componentId: string; rowId: string; columnId: string };

type DropTarget =
  | { kind: "row"; rowId: string; position: "before" | "after" }
  | { kind: "column"; rowId: string; columnId: string; position: "before" | "after" | "inside" }
  | { kind: "free-space"; rowId: string }
  | null;

const componentTypes: ComponentType[] = ["text", "button", "input", "textarea", "select", "image", "card", "alert", "badge", "checkbox", "divider"];
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

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
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
  return { id: uid("row"), type: "row", classList: ["g-3"], children: [] };
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

function safeStringify(value: unknown): string {
  return JSON.stringify(value, null, 2);
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

function getMaxSpanForColumn(row: RowNode, columnId: string): number {
  return 12 - row.children.filter((column) => column.id !== columnId).reduce((sum, column) => sum + column.span, 0);
}

function findRow(rows: RowNode[], rowId: string): RowNode | undefined {
  for (const row of rows) {
    if (row.id === rowId) return row;
    for (const column of row.children) {
      for (const child of column.children) {
        if (child.type === "row") {
          const found = findRow([child], rowId);
          if (found) return found;
        }
      }
    }
  }
  return undefined;
}

function findComponent(rows: RowNode[], componentId: string): ComponentNode | undefined {
  for (const row of rows) {
    for (const column of row.children) {
      for (const child of column.children) {
        if (child.type !== "row" && child.id === componentId) return child;
        if (child.type === "row") {
          const found = findComponent([child], componentId);
          if (found) return found;
        }
      }
    }
  }
  return undefined;
}

function findColumnAndRow(rows: RowNode[], columnId: string): { rowId: string; column: ColumnNode } | undefined {
  for (const row of rows) {
    const column = row.children.find((item) => item.id === columnId);
    if (column) return { rowId: row.id, column };
    for (const childColumn of row.children) {
      for (const child of childColumn.children) {
        if (child.type === "row") {
          const found = findColumnAndRow([child], columnId);
          if (found) return found;
        }
      }
    }
  }
  return undefined;
}

function replaceClassMap(classList: string[], map: Record<string, string>, label: string): string[] {
  const values = Object.values(map).filter(Boolean);
  const cleaned = classList.filter((item) => !values.includes(item));
  const nextValue = map[label];
  return nextValue ? [...cleaned, nextValue] : cleaned;
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

function updateRowsComponent(rows: RowNode[], componentId: string, patch: Partial<ComponentNode>): RowNode[] {
  return rows.map((row) => ({
    ...row,
    children: row.children.map((column) => ({
      ...column,
      children: column.children.map((child) => {
        if (child.type === "row") return updateRowsComponent([child], componentId, patch)[0];
        return child.id === componentId ? { ...child, ...patch } : child;
      })
    }))
  }));
}

function updateRowsColumn(rows: RowNode[], columnId: string, patch: Partial<ColumnNode>): RowNode[] {
  return rows.map((row) => ({
    ...row,
    children: row.children.map((column) => {
      if (column.id === columnId) return { ...column, ...patch };
      return {
        ...column,
        children: column.children.map((child) => child.type === "row" ? updateRowsColumn([child], columnId, patch)[0] : child)
      };
    })
  }));
}

function removeRowsRow(rows: RowNode[], rowId: string): RowNode[] {
  return rows
    .filter((row) => row.id !== rowId)
    .map((row) => ({
      ...row,
      children: row.children.map((column) => ({
        ...column,
        children: column.children
          .filter((child) => child.type !== "row" || child.id !== rowId)
          .map((child) => child.type === "row" ? removeRowsRow([child], rowId)[0] ?? child : child)
      }))
    }));
}

function removeRowsColumn(rows: RowNode[], columnId: string): RowNode[] {
  return rows.map((row) => ({
    ...row,
    children: row.children
      .filter((column) => column.id !== columnId)
      .map((column) => ({
        ...column,
        children: column.children.map((child) => child.type === "row" ? removeRowsColumn([child], columnId)[0] : child)
      }))
  }));
}

function removeRowsComponent(rows: RowNode[], componentId: string): RowNode[] {
  return rows.map((row) => ({
    ...row,
    children: row.children.map((column) => ({
      ...column,
      children: column.children
        .filter((child) => child.type === "row" || child.id !== componentId)
        .map((child) => child.type === "row" ? removeRowsComponent([child], componentId)[0] : child)
    }))
  }));
}

function moveTopLevelRow(rows: RowNode[], draggedRowId: string, targetRowId: string, position: "before" | "after"): RowNode[] {
  const nextRows = [...rows];
  const draggedIndex = nextRows.findIndex((row) => row.id === draggedRowId);
  const targetIndex = nextRows.findIndex((row) => row.id === targetRowId);
  if (draggedIndex < 0 || targetIndex < 0 || draggedRowId === targetRowId) return rows;
  const [dragged] = nextRows.splice(draggedIndex, 1);
  const updatedTargetIndex = nextRows.findIndex((row) => row.id === targetRowId);
  nextRows.splice(position === "before" ? updatedTargetIndex : updatedTargetIndex + 1, 0, dragged);
  return nextRows;
}

function moveColumn(rows: RowNode[], draggedColumnId: string, targetRowId: string, targetColumnId?: string, position: "before" | "after" | "inside" = "inside"): RowNode[] {
  const cloned = cloneValue(rows);
  let draggedColumn: ColumnNode | undefined;

  function removeColumnFromRows(input: RowNode[]): RowNode[] {
    return input.map((row) => ({
      ...row,
      children: row.children
        .filter((column) => {
          if (column.id === draggedColumnId) {
            draggedColumn = column;
            return false;
          }
          return true;
        })
        .map((column) => ({
          ...column,
          children: column.children.map((child) => child.type === "row" ? removeColumnFromRows([child])[0] : child)
        }))
    }));
  }

  const withoutDragged = removeColumnFromRows(cloned);
  if (!draggedColumn) return rows;

  function insertIntoRows(input: RowNode[]): RowNode[] {
    return input.map((row) => {
      if (row.id === targetRowId) {
        const used = getRowUsedSpan(row);
        if (used + draggedColumn!.span > 12) return row;
        const nextChildren = [...row.children];
        if (!targetColumnId || position === "inside") {
          nextChildren.push(draggedColumn!);
          return { ...row, children: nextChildren };
        }
        const targetIndex = nextChildren.findIndex((column) => column.id === targetColumnId);
        if (targetIndex < 0) {
          nextChildren.push(draggedColumn!);
          return { ...row, children: nextChildren };
        }
        nextChildren.splice(position === "before" ? targetIndex : targetIndex + 1, 0, draggedColumn!);
        return { ...row, children: nextChildren };
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

  return insertIntoRows(withoutDragged);
}

function moveComponent(rows: RowNode[], componentId: string, targetColumnId: string): RowNode[] {
  const cloned = cloneValue(rows);
  let draggedComponent: ComponentNode | undefined;

  function removeComponentFromRows(input: RowNode[]): RowNode[] {
    return input.map((row) => ({
      ...row,
      children: row.children.map((column) => ({
        ...column,
        children: column.children
          .filter((child) => {
            if (child.type !== "row" && child.id === componentId) {
              draggedComponent = child;
              return false;
            }
            return true;
          })
          .map((child) => child.type === "row" ? removeComponentFromRows([child])[0] : child)
      }))
    }));
  }

  const withoutDragged = removeComponentFromRows(cloned);
  if (!draggedComponent) return rows;

  function insertIntoRows(input: RowNode[]): RowNode[] {
    return input.map((row) => ({
      ...row,
      children: row.children.map((column) => {
        if (column.id === targetColumnId) return { ...column, children: [...column.children, draggedComponent!] };
        return {
          ...column,
          children: column.children.map((child) => child.type === "row" ? insertIntoRows([child])[0] : child)
        };
      })
    }));
  }

  return insertIntoRows(withoutDragged);
}

function moveComponentToFreeSpace(rows: RowNode[], componentId: string, sourceColumnId: string, targetRowId: string): RowNode[] {
  const source = findColumnAndRow(rows, sourceColumnId);
  if (!source) return rows;

  const cloned = cloneValue(rows);
  let draggedComponent: ComponentNode | undefined;

  function removeComponentFromRows(input: RowNode[]): RowNode[] {
    return input.map((row) => ({
      ...row,
      children: row.children.map((column) => ({
        ...column,
        children: column.children
          .filter((child) => {
            if (child.type !== "row" && child.id === componentId) {
              draggedComponent = child;
              return false;
            }
            return true;
          })
          .map((child) => child.type === "row" ? removeComponentFromRows([child])[0] : child)
      }))
    }));
  }

  const withoutDragged = removeComponentFromRows(cloned);
  if (!draggedComponent) return rows;

  function insertIntoRows(input: RowNode[]): RowNode[] {
    return input.map((row) => {
      if (row.id === targetRowId) {
        const remaining = 12 - getRowUsedSpan(row);
        if (remaining <= 0) return row;
        const span = Math.min(source.column.span, remaining);
        const newColumn: ColumnNode = { id: uid("col"), type: "column", span, classList: [], children: [draggedComponent!] };
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

  return insertIntoRows(withoutDragged);
}

function App() {
  const [dsl, setDsl] = useState<LowCodeDsl>(createInitialDsl());
  const [selection, setSelection] = useState<Selection>({ kind: "screen", screenId: "screen_home" });
  const [editingComponentId, setEditingComponentId] = useState<string | null>(null);
  const [draftComponent, setDraftComponent] = useState<ComponentNode | null>(null);
  const [activeTab, setActiveTab] = useState<StudioTab>("designer");
  const [dslEditorText, setDslEditorText] = useState<string>(safeStringify(createInitialDsl()));
  const [dslEditorError, setDslEditorError] = useState<string>("");
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget>(null);

  useEffect(() => {
    setDslEditorText(safeStringify(dsl));
  }, [dsl]);

  const selectedScreen = dsl.screens.find((screen) => screen.id === selection.screenId) ?? dsl.screens[0];

  const artifactBundle = useMemo(() => {
    const webIr = { target: "web", app: dsl.app, theme: dsl.theme, screens: dsl.screens };
    const androidIr = { target: "android", app: dsl.app, theme: dsl.theme, screens: dsl.screens };
    const manifest = { appId: dsl.app.id, appName: dsl.app.name, schemaVersion: dsl.schemaVersion, targets: ["web", "android"], screenCount: dsl.screens.length };
    return {
      dsl: safeStringify(dsl),
      xml: dslToXml(dsl),
      webIr: safeStringify(webIr),
      androidIr: safeStringify(androidIr),
      manifest: safeStringify(manifest)
    };
  }, [dsl]);

  function updateDsl(mutator: (current: LowCodeDsl) => LowCodeDsl) {
    setDsl((current) => mutator(current));
  }

  function applyDslFromEditor() {
    try {
      const parsed = JSON.parse(dslEditorText) as LowCodeDsl;
      if (!parsed || !Array.isArray(parsed.screens) || parsed.screens.length === 0) {
        setDslEditorError("Invalid DSL.");
        return;
      }
      setDsl(parsed);
      setSelection({ kind: "screen", screenId: parsed.screens[0].id });
      setDslEditorError("");
      setActiveTab("designer");
    } catch (error) {
      setDslEditorError(error instanceof Error ? error.message : "Invalid JSON");
    }
  }

  function addScreen() {
    const newScreen: ScreenNode = { id: uid("screen"), title: "New Screen", classList: ["container-fluid", "py-3"], rows: [createRow()] };
    updateDsl((current) => ({ ...current, screens: [...current.screens, newScreen] }));
    setSelection({ kind: "screen", screenId: newScreen.id });
  }

  function addRowToScreen() {
    const newRow = createRow();
    updateDsl((current) => ({
      ...current,
      screens: current.screens.map((screen) => screen.id === selectedScreen.id ? { ...screen, rows: [...screen.rows, newRow] } : screen)
    }));
  }

  function addColumnToRow(rowId: string) {
    const row = findRow(selectedScreen.rows, rowId);
    if (!row) return;
    const remaining = 12 - getRowUsedSpan(row);
    if (remaining <= 0) {
      alert("This row already uses all 12 columns.");
      return;
    }
    const newColumn: ColumnNode = { id: uid("col"), type: "column", span: remaining, classList: [], children: [] };
    updateDsl((current) => ({
      ...current,
      screens: current.screens.map((screen) => screen.id !== selectedScreen.id ? screen : { ...screen, rows: updateRowsAddColumn(screen.rows, rowId, newColumn) })
    }));
  }

  function addNestedRowToColumn(columnId: string) {
    const nestedRow = createRow();
    updateDsl((current) => ({
      ...current,
      screens: current.screens.map((screen) => screen.id !== selectedScreen.id ? screen : { ...screen, rows: updateRowsAddNestedRow(screen.rows, columnId, nestedRow) })
    }));
    setSelection({ kind: "screen", screenId: selectedScreen.id });
  }

  function addComponentToColumn(type: ComponentType, columnId: string) {
    const component = createComponent(type);
    const nextRows = updateRowsAddComponent(selectedScreen.rows, columnId, component);
    updateDsl((current) => ({
      ...current,
      screens: current.screens.map((screen) => screen.id !== selectedScreen.id ? screen : { ...screen, rows: nextRows })
    }));
    setSelection({ kind: "screen", screenId: selectedScreen.id });
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

  function removeRow(rowId: string) {
    updateDsl((current) => ({
      ...current,
      screens: current.screens.map((screen) => screen.id !== selectedScreen.id ? screen : { ...screen, rows: removeRowsRow(screen.rows, rowId) })
    }));
  }

  function removeColumn(columnId: string) {
    updateDsl((current) => ({
      ...current,
      screens: current.screens.map((screen) => screen.id !== selectedScreen.id ? screen : { ...screen, rows: removeRowsColumn(screen.rows, columnId) })
    }));
    setSelection({ kind: "screen", screenId: selectedScreen.id });
  }

  function removeComponent(componentId: string) {
    updateDsl((current) => ({
      ...current,
      screens: current.screens.map((screen) => screen.id !== selectedScreen.id ? screen : { ...screen, rows: removeRowsComponent(screen.rows, componentId) })
    }));
  }

  function resizeColumn(row: RowNode, columnId: string, currentSpan: number, direction: "increase" | "decrease") {
    const nextSpan = direction === "increase" ? currentSpan + 1 : currentSpan - 1;
    if (nextSpan < 1) return;
    const maxSpan = getMaxSpanForColumn(row, columnId);
    if (nextSpan > maxSpan) return;
    updateDsl((current) => ({
      ...current,
      screens: current.screens.map((screen) => screen.id !== selectedScreen.id ? screen : { ...screen, rows: updateRowsColumn(screen.rows, columnId, { span: nextSpan }) })
    }));
  }

  function openComponentSettings(componentId: string) {
    const component = findComponent(selectedScreen.rows, componentId);
    if (!component) return;
    setEditingComponentId(componentId);
    setDraftComponent(cloneValue(component));
  }

  function closeComponentSettings() {
    setEditingComponentId(null);
    setDraftComponent(null);
  }

  function saveComponentSettings() {
    if (!editingComponentId || !draftComponent) return;
    updateDsl((current) => ({
      ...current,
      screens: current.screens.map((screen) => screen.id !== selectedScreen.id ? screen : { ...screen, rows: updateRowsComponent(screen.rows, editingComponentId, draftComponent) })
    }));
    closeComponentSettings();
  }

  function setDraftProp(name: string, value: any) {
    if (!draftComponent) return;
    setDraftComponent({ ...draftComponent, props: { ...draftComponent.props, [name]: value } });
  }

  function replaceDraftClassMap(map: Record<string, string>, label: string) {
    if (!draftComponent) return;
    setDraftComponent({ ...draftComponent, classList: replaceClassMap(draftComponent.classList, map, label) });
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

  function onRowDragStart(rowId: string) {
    setDragState({ kind: "row", rowId });
  }

  function onColumnDragStart(columnId: string, rowId: string) {
    setDragState({ kind: "column", columnId, rowId });
  }

  function onComponentDragStart(componentId: string, rowId: string, columnId: string) {
    setDragState({ kind: "component", componentId, rowId, columnId });
  }

  function handleRowDrop(targetRowId: string, position: "before" | "after") {
    if (!dragState || dragState.kind !== "row") return;
    if (dragState.rowId === targetRowId) return;
    const nextRows = moveTopLevelRow(selectedScreen.rows, dragState.rowId, targetRowId, position);
    updateDsl((current) => ({
      ...current,
      screens: current.screens.map((screen) => screen.id !== selectedScreen.id ? screen : { ...screen, rows: nextRows })
    }));
    setDragState(null);
    setDropTarget(null);
  }

  function handleColumnDrop(targetRowId: string, targetColumnId?: string, position: "before" | "after" | "inside" = "inside") {
    if (!dragState) return;

    if (dragState.kind === "column") {
      const nextRows = moveColumn(selectedScreen.rows, dragState.columnId, targetRowId, targetColumnId, position);
      updateDsl((current) => ({
        ...current,
        screens: current.screens.map((screen) => screen.id !== selectedScreen.id ? screen : { ...screen, rows: nextRows })
      }));
    } else if (dragState.kind === "component") {
      if (targetColumnId) {
        const nextRows = moveComponent(selectedScreen.rows, dragState.componentId, targetColumnId);
        updateDsl((current) => ({
          ...current,
          screens: current.screens.map((screen) => screen.id !== selectedScreen.id ? screen : { ...screen, rows: nextRows })
        }));
      } else {
        const nextRows = moveComponentToFreeSpace(selectedScreen.rows, dragState.componentId, dragState.columnId, targetRowId);
        updateDsl((current) => ({
          ...current,
          screens: current.screens.map((screen) => screen.id !== selectedScreen.id ? screen : { ...screen, rows: nextRows })
        }));
      }
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

  function renderColumnAddMenu(columnId: string) {
    return (
      <div className="column-add-menu-safe">
        <div className="column-add-menu-title">Add to this column</div>
        <button type="button" className="btn btn-sm btn-outline-primary w-100 text-start mb-2" onClick={() => addNestedRowToColumn(columnId)}>Nested row</button>
        <div className="column-add-grid">
          {componentTypes.map((type) => (
            <button key={type} type="button" className="btn btn-sm btn-outline-secondary" onClick={() => addComponentToColumn(type, columnId)}>
              {type}
            </button>
          ))}
        </div>
      </div>
    );
  }

  function renderRow(row: RowNode, level: number = 0): JSX.Element {
    const rowDropClass =
      dropTarget?.kind === "row" && dropTarget.rowId === row.id
        ? dropTarget.position === "before"
          ? "drop-before"
          : "drop-after"
        : "";

    return (
      <div
        key={row.id}
        className={`designer-row ${level > 0 ? "designer-row-nested" : ""} ${rowDropClass}`}
        draggable={level === 0}
        onDragStart={() => level === 0 && onRowDragStart(row.id)}
        onDragOver={(e) => {
          e.preventDefault();
          if (dragState?.kind === "row" && level === 0) {
            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            setDropTarget({ kind: "row", rowId: row.id, position: e.clientY < midpoint ? "before" : "after" });
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          if (dragState?.kind === "row" && level === 0) {
            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            handleRowDrop(row.id, e.clientY < midpoint ? "before" : "after");
          }
        }}
      >
        <div className="designer-row-toolbar">
          <div className="row-action-left">
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => addColumnToRow(row.id)}>+ Column</button>
          </div>
          <button type="button" className="btn btn-sm btn-outline-danger icon-button" onClick={() => removeRow(row.id)}>x</button>
        </div>

        <div className="designer-grid">
          {row.children.map((column) => {
            const columnDropClass =
              dropTarget?.kind === "column" && dropTarget.columnId === column.id
                ? dropTarget.position === "before"
                  ? "drop-before"
                  : dropTarget.position === "after"
                  ? "drop-after"
                  : "drop-inside"
                : "";

            return (
              <div
                key={column.id}
                className={`designer-col ${columnDropClass}`}
                style={{ width: `${(column.span / 12) * 100}%` }}
                draggable
                onDragStart={() => onColumnDragStart(column.id, row.id)}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!dragState) return;
                  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                  const midpoint = rect.left + rect.width / 2;
                  setDropTarget({
                    kind: "column",
                    rowId: row.id,
                    columnId: column.id,
                    position: dragState.kind === "column" ? (e.clientX < midpoint ? "before" : "after") : "inside"
                  });
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (!dragState) return;
                  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                  const midpoint = rect.left + rect.width / 2;
                  handleColumnDrop(row.id, column.id, dragState.kind === "column" ? (e.clientX < midpoint ? "before" : "after") : "inside");
                }}
              >
                <div className="designer-col-header">
                  <div />
                  <div className="designer-col-actions">
                    <button type="button" className="btn btn-sm btn-outline-secondary span-button" onClick={() => resizeColumn(row, column.id, column.span, "decrease")} disabled={column.span <= 1}>{"<"}</button>
                    <button type="button" className="btn btn-sm btn-outline-secondary span-button" onClick={() => resizeColumn(row, column.id, column.span, "increase")} disabled={column.span >= getMaxSpanForColumn(row, column.id)}>{">"}</button>
                    <button type="button" className="btn btn-sm btn-primary span-button" onClick={() => setSelection({ kind: "column", screenId: selectedScreen.id, rowId: row.id, columnId: column.id })}>+</button>
                    <button type="button" className="btn btn-sm btn-outline-danger span-button" onClick={() => removeColumn(column.id)}>x</button>
                  </div>
                </div>

                {selection.kind === "column" && selection.columnId === column.id ? renderColumnAddMenu(column.id) : null}

                <div className="designer-col-body">
                  {column.children.length === 0 ? <div className="empty-column-message">Use + to add content</div> : null}

                  {column.children.map((child) => {
                    if (child.type === "row") return renderRow(child, level + 1);

                    return (
                      <div key={child.id} className="designer-component" draggable onDragStart={() => onComponentDragStart(child.id, row.id, column.id)}>
                        <div className="designer-component-header">
                          <div />
                          <div className="designer-component-actions">
                            <button type="button" className="btn btn-sm btn-outline-secondary mini-action" onClick={() => openComponentSettings(child.id)}>Engine</button>
                            <button type="button" className="btn btn-sm btn-outline-danger mini-action" onClick={() => removeComponent(child.id)}>x</button>
                          </div>
                        </div>
                        <div>{renderComponent(child)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {12 - getRowUsedSpan(row) > 0 ? (
            <div
              className={`designer-col-placeholder ${dropTarget?.kind === "free-space" && dropTarget.rowId === row.id ? "drop-inside" : ""}`}
              style={{ width: `${((12 - getRowUsedSpan(row)) / 12) * 100}%` }}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragState?.kind === "column" || dragState?.kind === "component") {
                  setDropTarget({ kind: "free-space", rowId: row.id });
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragState?.kind === "column" || dragState?.kind === "component") {
                  handleColumnDrop(row.id);
                }
              }}
            >
              +
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  function renderDesigner() {
    return (
      <div className="canvas-card">
        <div className="canvas-top-actions">
          <button type="button" className="btn btn-primary" onClick={addRowToScreen}>+ Row</button>
        </div>
        <div className="screen-surface">{selectedScreen.rows.map((row) => renderRow(row))}</div>
      </div>
    );
  }

  function renderTabContent() {
    if (activeTab === "designer") return renderDesigner();

    if (activeTab === "dsl") {
      return (
        <div className="artifact-card">
          <div className="artifact-toolbar">
            <button type="button" className="btn btn-primary" onClick={applyDslFromEditor}>Apply DSL</button>
            {dslEditorError ? <div className="artifact-error">{dslEditorError}</div> : null}
          </div>
          <textarea className="artifact-editor" value={dslEditorText} onChange={(e) => { setDslEditorText(e.target.value); setDslEditorError(""); }} />
        </div>
      );
    }

    const content =
      activeTab === "xml" ? artifactBundle.xml :
      activeTab === "webIr" ? artifactBundle.webIr :
      activeTab === "androidIr" ? artifactBundle.androidIr :
      artifactBundle.manifest;

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
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeScreen(screen.id)}>x</button>
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
            <div className="topbar-subtitle">New columns use all remaining space. Add menu now closes after selection.</div>
          </div>

          {renderTabContent()}
        </main>
      </div>

      {draftComponent ? (
        <div className="settings-modal-backdrop" onClick={closeComponentSettings}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h3>Component settings</h3>
              <button type="button" className="btn btn-sm btn-outline-danger" onClick={closeComponentSettings}>x</button>
            </div>

            <div className="settings-modal-body">
              {draftComponent.type === "text" ? (
                <>
                  <label className="form-label mb-1">Text</label>
                  <textarea className="form-control form-control-sm mb-3" rows={4} value={draftComponent.props.text || ""} onChange={(e) => setDraftProp("text", e.target.value)} />
                  <label className="form-label mb-1">Alignment</label>
                  <select className="form-select form-select-sm mb-3" value={Object.keys(textAlignmentMap).find((key) => textAlignmentMap[key] === (draftComponent.classList.find((item) => Object.values(textAlignmentMap).includes(item)) || "")) || "Default"} onChange={(e) => replaceDraftClassMap(textAlignmentMap, e.target.value)}>
                    {textAlignments.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                  <label className="form-label mb-1">Font size</label>
                  <select className="form-select form-select-sm mb-3" value={Object.keys(fontSizeMap).find((key) => fontSizeMap[key] === (draftComponent.classList.find((item) => Object.values(fontSizeMap).includes(item)) || "")) || "Default"} onChange={(e) => replaceDraftClassMap(fontSizeMap, e.target.value)}>
                    {fontSizes.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                  <label className="form-label mb-1">Font weight</label>
                  <select className="form-select form-select-sm mb-3" value={Object.keys(fontWeightMap).find((key) => fontWeightMap[key] === (draftComponent.classList.find((item) => Object.values(fontWeightMap).includes(item)) || "")) || "Default"} onChange={(e) => replaceDraftClassMap(fontWeightMap, e.target.value)}>
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
                  <select className="form-select form-select-sm mb-3" value={Object.keys(roundedMap).find((key) => roundedMap[key] === (draftComponent.classList.find((item) => Object.values(roundedMap).includes(item)) || "")) || "Default"} onChange={(e) => replaceDraftClassMap(roundedMap, e.target.value)}>
                    {roundedOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                  <label className="form-label mb-1">Shadow</label>
                  <select className="form-select form-select-sm mb-3" value={Object.keys(shadowMap).find((key) => shadowMap[key] === (draftComponent.classList.find((item) => Object.values(shadowMap).includes(item)) || "")) || "Default"} onChange={(e) => replaceDraftClassMap(shadowMap, e.target.value)}>
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