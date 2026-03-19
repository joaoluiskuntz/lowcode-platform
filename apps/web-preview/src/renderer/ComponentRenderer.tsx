import type { IrComponentNode, IrAction } from "@lowcode/ir";
import { useActionExecutor } from "../runtime/actions";
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
    case "text":
      return <div className={classes} data-node-id={node.nodeId}>{asString(node.props.text)}</div>;

    case "button": {
      const label = asString(node.props.label, "Button");
      const variant = asString(node.props.variant, "primary");
      const size = asString(node.props.size, "");
      const buttonClass = ["btn", `btn-${variant}`, size ? `btn-${size}` : "", classes].filter(Boolean).join(" ");
      return (
        <button type="button" className={buttonClass} data-node-id={node.nodeId} onClick={() => executeActions(onClick)}>
          {label}
        </button>
      );
    }

    case "image": {
      const src = asString(node.props.src);
      const alt = asString(node.props.alt, "");
      return <img src={src} alt={alt} className={["img-fluid", classes].filter(Boolean).join(" ")} data-node-id={node.nodeId} />;
    }

    case "input": {
      const label = asString(node.props.label, "");
      const placeholder = asString(node.props.placeholder, "");
      const stateKey = asString(node.props.stateKey, node.nodeId);
      const value = runtime.stateStore[stateKey];
      const currentValue = typeof value === "string" ? value : "";
      return (
        <div className={classes} data-node-id={node.nodeId}>
          {label ? <label className="form-label">{label}</label> : null}
          <input
            className="form-control"
            placeholder={placeholder}
            value={currentValue}
            onChange={(event) => {
              runtime.setStateValue(stateKey, event.target.value);
              executeActions(onChange);
            }}
          />
        </div>
      );
    }

    case "card": {
      const title = asString(node.props.title, "");
      const body = asString(node.props.body, "");
      return (
        <div className={["card", classes].filter(Boolean).join(" ")} data-node-id={node.nodeId}>
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
        <ul className={["list-group", classes].filter(Boolean).join(" ")} data-node-id={node.nodeId}>
          {items.map((item, index) => (
            <li key={`${node.nodeId}-${index}`} className="list-group-item">{String(item)}</li>
          ))}
        </ul>
      );
    }

    default:
      return <div className="alert alert-warning">Unsupported component type: {node.componentType}</div>;
  }
}

function getActions(value: unknown): IrAction[] {
  return Array.isArray(value) ? (value as IrAction[]) : [];
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}