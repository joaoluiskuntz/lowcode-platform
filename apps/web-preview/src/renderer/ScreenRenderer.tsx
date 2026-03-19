import type { ScreenIr } from "@lowcode/ir";
import { NodeRenderer } from "./NodeRenderer";

interface ScreenRendererProps {
  screen: ScreenIr;
}

export function ScreenRenderer({ screen }: ScreenRendererProps) {
  return (
    <div data-screen-id={screen.id}>
      <NodeRenderer node={screen.root} />
    </div>
  );
}