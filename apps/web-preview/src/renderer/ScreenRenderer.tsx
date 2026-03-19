import type { ScreenIr } from "@lowcode/ir";
import { NodeRenderer } from "./NodeRenderer";

interface ScreenRendererProps {
  screen: ScreenIr;
}

export function ScreenRenderer({ screen }: ScreenRendererProps) {
  return (
    <section className="container-fluid px-0">
      <NodeRenderer node={screen.root} />
    </section>
  );
}