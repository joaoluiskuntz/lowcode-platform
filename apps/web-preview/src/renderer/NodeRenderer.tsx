import type { IrNode } from "@lowcode/ir";
import { ContainerRenderer } from "./ContainerRenderer";
import { ComponentRenderer } from "./ComponentRenderer";

interface NodeRendererProps {
  node: IrNode;
}

export function NodeRenderer({ node }: NodeRendererProps) {
  if (node.kind === "container") {
    return <ContainerRenderer node={node} />;
  }

  return <ComponentRenderer node={node} />;
}