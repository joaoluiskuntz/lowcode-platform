import type { IrContainerNode } from "@lowcode/ir";
import { NodeRenderer } from "./NodeRenderer";

interface ContainerRendererProps {
  node: IrContainerNode;
}

function getColumnClasses(node: IrContainerNode): string {
  if (node.containerType !== "column") {
    return "";
  }

  const span = node.layout?.span ?? {};
  const parts: string[] = [];

  if (span.xs) {
    parts.push(`col-${span.xs}`);
  } else {
    parts.push("col-12");
  }

  if (span.sm) {
    parts.push(`col-sm-${span.sm}`);
  }

  if (span.md) {
    parts.push(`col-md-${span.md}`);
  }

  if (span.lg) {
    parts.push(`col-lg-${span.lg}`);
  }

  if (span.xl) {
    parts.push(`col-xl-${span.xl}`);
  }

  return parts.join(" ");
}

export function ContainerRenderer({ node }: ContainerRendererProps) {
  const className = [...node.classList];

  if (node.containerType === "row") {
    className.unshift("row", "g-3");
  }

  if (node.containerType === "column") {
    className.unshift(getColumnClasses(node));
  }

  return (
    <div className={className.filter(Boolean).join(" ")}>
      {node.children.map((child) => (
        <NodeRenderer key={child.nodeId} node={child} />
      ))}
    </div>
  );
}