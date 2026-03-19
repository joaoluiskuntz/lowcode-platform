import type { IrAction, IrComponentNode } from "@lowcode/ir";
import { useActionExecutor } from "../runtime/actions";
import { resolveBoundString } from "../runtime/bindings";
import { useRuntime } from "../runtime/RuntimeContext";

interface ComponentRendererProps {
  node: IrComponentNode;
}

export function ComponentRenderer({ node }: ComponentRendererProps) {
  const { executeActions } = useActionExecutor();
  const runtime = useRuntime();
  const classes = node.classList.join(" ");
  const onClick = getActions(node.events.onClick);
  const onChange = getActions(node.events.onChange);

  switch (node.componentType) {
    case "text": {
      const text = resolveBoundString(node, "text", runtime.stateStore, asString(node.props.text));

      return <p className={classes}>{text}</p>;
    }

    case "button": {
      const label = resolveBoundString(node, "label", runtime.stateStore, asString(node.props.label, "Button"));
      const variant = asString(node.props.variant, "primary");
      const size = asString(node.props.size, "");
      const buttonClass = ["btn", `btn-${variant}`, size ? `btn-${size}` : "", classes]
        .filter(Boolean)
        .join(" ");

      return (
        <button type="button" className={buttonClass} onClick={() => executeActions(onClick)}>
          {label}
        </button>
      );
    }

    case "image": {
      const src = resolveBoundString(node, "src", runtime.stateStore, asString(node.props.src));
      const alt = resolveBoundString(node, "alt", runtime.stateStore, asString(node.props.alt, ""));

      return <img className={classes} src={src} alt={alt} />;
    }

    case "input": {
      const label = resolveBoundString(node, "label", runtime.stateStore, asString(node.props.label, ""));
      const placeholder = resolveBoundString(
        node,
        "placeholder",
        runtime.stateStore,
        asString(node.props.placeholder, "")
      );
      const stateKey = asString(node.props.stateKey, node.nodeId);
      const rawValue = runtime.stateStore[stateKey];
      const baseValue = typeof rawValue === "string" ? rawValue : rawValue == null ? "" : String(rawValue);
      const currentValue = resolveBoundString(node, "value", runtime.stateStore, baseValue);

      return (
        <div className={classes}>
          {label ? <label className="form-label">{label}</label> : null}
          <input
            className="form-control"
            value={currentValue}
            placeholder={placeholder}
            onChange={(event) => {
              runtime.setStateValue(stateKey, event.target.value);
              executeActions(onChange);
            }}
          />
        </div>
      );
    }

    case "card": {
      const title = resolveBoundString(node, "title", runtime.stateStore, asString(node.props.title, ""));
      const body = resolveBoundString(node, "body", runtime.stateStore, asString(node.props.body, ""));

      return (
        <div className={["card", classes].filter(Boolean).join(" ")}>
          <div className="card-body">
            {title ? <h5 className="card-title">{title}</h5> : null}
            {body ? <p className="card-text mb-0">{body}</p> : null}
          </div>
        </div>
      );
    }

    case "list": {
      const items = Array.isArray(node.props.items) ? node.props.items : [];

      return (
        <ul className={classes}>
          {items.map((item, index) => (
            <li key={`${node.nodeId}-${index}`}>{String(item)}</li>
          ))}
        </ul>
      );
    }

    default: {
      return <div className={classes}>Unsupported component type: {node.componentType}</div>;
    }
  }
}

function getActions(value: unknown): IrAction[] {
  return Array.isArray(value) ? (value as IrAction[]) : [];
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}