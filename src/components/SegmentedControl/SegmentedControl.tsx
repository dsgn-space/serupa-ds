import * as React from "react";
import { cn, omit, useIsoLayoutEffect } from "../../internal/cn";
import { asIcon } from "../Icon/Icon";

export interface SegmentedControlOption {
  value: string;
  /** The segment's text. With only an icon, pass aria-label instead. */
  label?: React.ReactNode;
  /** An icon name or element before the label. */
  icon?: React.ReactNode;
  /** The segment's name when it shows only an icon. */
  "aria-label"?: string;
  disabled?: boolean;
}
export interface SegmentedControlProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** The segments, in order: 2 to about 5. */
  options: SegmentedControlOption[];
  /** The selected value (controlled). Use with onValueChange. */
  value?: string;
  /** The value selected at first (uncontrolled). Default: the first segment that isn't disabled. */
  defaultValue?: string;
  /** Called with the new value when a segment is chosen. */
  onValueChange?: (value: string) => void;
  /** 'sm' (24px) or 'md' (32px, default): the control heights. */
  size?: 'sm' | 'md';
  /** Stretches to its container, with equal segments. Default: false. */
  fullWidth?: boolean;
  disabled?: boolean;
  /** Submits the value with a form, in a hidden input. */
  name?: string;
}

const OWN = { options: 1, value: 1, defaultValue: 1, onValueChange: 1, size: 1, fullWidth: 1, disabled: 1, name: 1, className: 1 } as const;

/* SegmentedControl: picks one of a few options shown side by side, such as a view (List, Board) or a period
   (Day, Week, Month). It's a radio group: one Tab stop, arrow keys move and select (Home and End too), and
   each segment is role="radio" with aria-checked. The selection is a raised surface that slides to the chosen
   segment. For switching panels of content, use Tabs; for independent on/off buttons, ButtonGroup with
   ToggleButton. */
/** Picks one of a few options shown side by side: a radio group drawn as segments. */
export const SegmentedControl = React.forwardRef<HTMLDivElement, SegmentedControlProps>(function SegmentedControl(props, ref) {
  const rest = omit(props, OWN);
  const options = props.options || [];
  const disabled = !!props.disabled;
  const usable = options.filter((o) => !o.disabled && !disabled);
  const controlled = props.value !== undefined;
  const [own, setOwn] = React.useState<string | undefined>(props.defaultValue ?? (options.find((o) => !o.disabled) || {}).value);
  const value = controlled ? props.value : own;
  const root = React.useRef<HTMLDivElement | null>(null);
  const buttons = React.useRef<Record<string, HTMLButtonElement | null>>({});
  const [box, setBox] = React.useState<{ x: number; w: number } | null>(null);
  const size = props.size === "sm" ? "sm" : "md";

  const choose = (v: string, focus?: boolean) => {
    if (focus) { const b = buttons.current[v]; if (b) b.focus(); }
    if (v === value) return;
    if (!controlled) setOwn(v);
    if (props.onValueChange) props.onValueChange(v);
  };
  const measure = React.useCallback(() => {
    const r = root.current, b = value != null ? buttons.current[value] : null;
    if (!r || !b) { setBox(null); return; }
    setBox({ x: b.offsetLeft, w: b.offsetWidth });
  }, [value]);
  useIsoLayoutEffect(measure, [measure, options.length, size, props.fullWidth]);
  React.useEffect(() => {
    const r = root.current;
    if (!r || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(r);
    for (const k in buttons.current) { const b = buttons.current[k]; if (b) ro.observe(b); }
    return () => ro.disconnect();
  }, [measure, options.length]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!usable.length) return;
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const i = usable.findIndex((o) => o.value === value);
    let n: number;
    switch (e.key) {
      case "ArrowRight": n = i + (rtl ? -1 : 1); break;
      case "ArrowDown": n = i + 1; break;
      case "ArrowLeft": n = i + (rtl ? 1 : -1); break;
      case "ArrowUp": n = i - 1; break;
      case "Home": n = 0; break;
      case "End": n = usable.length - 1; break;
      default: return;
    }
    e.preventDefault();
    choose(usable[(n + usable.length) % usable.length].value, true);
  };
  const checkedUsable = usable.some((o) => o.value === value);
  return (
    <div {...rest} ref={(n) => { root.current = n; if (typeof ref === "function") ref(n); else if (ref) ref.current = n; }}
      role="radiogroup" aria-disabled={disabled || undefined}
      className={cn("dk-segmented", "dk-segmented--size-" + size, props.fullWidth && "dk-segmented--full", disabled && "dk-segmented--disabled", props.className)}
      data-component="segmented-control" data-size={size}>
      {box ? <span className="dk-segmented__indicator" aria-hidden style={{ left: box.x, width: box.w }} /> : null}
      {options.map((o, i) => {
        const on = o.value === value, off = disabled || !!o.disabled;
        const icon = asIcon(o.icon);
        const hasLabel = o.label != null && o.label !== false && o.label !== "";
        const tab = off ? -1 : on || (!checkedUsable && usable[0] && usable[0].value === o.value) ? 0 : -1;
        return (
          <button key={o.value} ref={(n) => { buttons.current[o.value] = n; }} type="button" role="radio" aria-checked={on}
            aria-label={o["aria-label"]} disabled={off} tabIndex={tab} data-value={o.value}
            className={cn("dk-segmented__item", on && "dk-segmented__item--selected", !hasLabel && "dk-segmented__item--icon-only")}
            onClick={() => choose(o.value)} onKeyDown={onKeyDown}>
            {icon != null && icon !== false ? <span className="dk-segmented__icon" aria-hidden>{icon}</span> : null}
            {hasLabel ? <span className="dk-segmented__label">{o.label}</span> : null}
          </button>
        );
      })}
      {props.name ? <input type="hidden" name={props.name} value={value ?? ""} disabled={disabled} /> : null}
    </div>
  );
});
SegmentedControl.displayName = "SegmentedControl";
