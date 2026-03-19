import type { ScreenIr } from "@lowcode/ir";
import { NodeRenderer } from "./NodeRenderer";

interface ScreenRendererProps {
  screen: ScreenIr;
}

export function ScreenRenderer({ screen }: ScreenRendererProps) {
  return (
    <section className="lc-screen card border-0 shadow-sm">
      <div className="card-body p-4 p-lg-5">
        <div className="lc-screen-header mb-4">
          <div className="lc-screen-kicker">Compiled Screen</div>
          <h2 className="h4 mb-1">{screen.title}</h2>
          <div className="text-muted">Rendered from compiled IR only</div>
        </div>

        <NodeRenderer node={screen.root} />
      </div>
    </section>
  );
}