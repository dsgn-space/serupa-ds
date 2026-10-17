import * as React from "react";
import { cn, domId, useIsoLayoutEffect } from "../../internal/cn";
import { cssLength, hideLayer, place, showLayer, type Placement } from "../../internal/position";

/** The trigger element's props this component reads and adds to. */
type TriggerProps = React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement>;

export interface PopoverProps {
  /** The element that opens it: one element that can take focus, such as a Button. It gets aria-expanded and aria-controls. */
  trigger: React.ReactElement;
  /** What's inside: text, a form, links, buttons. A function gets close(), for a Cancel or Done button. */
  children: React.ReactNode | ((close: () => void) => React.ReactNode);
  /** A heading at the top that names the popover. */
  title?: React.ReactNode;
  /** Where it goes: 'bottom' (default), 'top', 'left', 'right', with '-start' or '-end'. It flips when there's no room. */
  placement?: Placement;
  /** Open it yourself (controlled), with onOpenChange. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Its name for screen readers when it has no title. */
  "aria-label"?: string;
  /** Where focus goes when it opens: 'first' (default: the first control inside, or the panel) or 'panel'. */
  initialFocus?: 'first' | 'panel';
  className?: string;
  style?: React.CSSProperties;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/* Popover: a small non-modal dialog next to its trigger, for content people interact with (a form, filters,
   details with links): role="dialog", named by its title. Opening moves focus inside; Escape closes it and
   returns focus to the trigger; a click outside, or focus moving elsewhere, closes it too. It sits in the top
   layer, right after the trigger in the tab order. For a hint, use Tooltip; for a list of actions, Menu. */
/** A small non-modal dialog next to its trigger, for interactive content: a form, filters, details. */
export function Popover(props: PopoverProps): React.ReactElement {
  const id = domId("dk-pop", React.useId());
  const [inner, setInner] = React.useState(false);
  const controlled = props.open !== undefined;
  const open = controlled ? !!props.open : inner;
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const ask = React.useRef(props.onOpenChange); ask.current = props.onOpenChange;
  const set = React.useCallback((v: boolean) => { if (!controlled) setInner(v); if (ask.current) ask.current(v); }, [controlled]);
  const close = React.useCallback((focusTrigger = true) => { set(false); if (focusTrigger && triggerRef.current) triggerRef.current.focus(); }, [set]);
  const focusFirst = props.initialFocus !== "panel";

  useIsoLayoutEffect(() => {
    const panel = panelRef.current, trigger = triggerRef.current;
    if (!panel) return;
    if (!open || !trigger) { hideLayer(panel); return; }
    showLayer(panel);
    const update = () => {
      const r = place(trigger.getBoundingClientRect(), { width: panel.offsetWidth, height: panel.offsetHeight }, props.placement || "bottom", cssLength(panel, "--dk-popover-offset"), "bottom");
      panel.style.left = r.x + "px"; panel.style.top = r.y + "px"; panel.dataset.side = r.side;
    };
    update();
    const first = focusFirst ? panel.querySelector<HTMLElement>(FOCUSABLE) : null;
    (first || panel).focus();
    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(update) : null;
    if (ro) { ro.observe(panel); ro.observe(trigger); }
    window.addEventListener("scroll", update, true); window.addEventListener("resize", update);
    return () => { if (ro) ro.disconnect(); window.removeEventListener("scroll", update, true); window.removeEventListener("resize", update); };
  }, [open, props.placement]);

  // A press outside the panel and its trigger closes it (focus stays where the press put it).
  React.useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panelRef.current && panelRef.current.contains(t)) return;
      if (triggerRef.current && triggerRef.current.contains(t)) return;
      close(false);
    };
    document.addEventListener("pointerdown", down, true);
    return () => document.removeEventListener("pointerdown", down, true);
  }, [open, close]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(true); }
  };
  // Focus leaving for somewhere other than the trigger closes it.
  const onBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const to = e.relatedTarget as Node | null;
    if (!to) return;
    if (panelRef.current && panelRef.current.contains(to)) return;
    if (triggerRef.current && triggerRef.current.contains(to)) return;
    close(false);
  };

  const child = React.Children.only(props.trigger) as React.ReactElement<TriggerProps>;
  const cp = child.props;
  const childRef = (child as { ref?: React.ForwardedRef<HTMLElement> }).ref;
  const trigger = React.cloneElement(child, {
    ref: (n: HTMLElement | null) => { triggerRef.current = n; if (typeof childRef === "function") childRef(n); else if (childRef && typeof childRef === "object") childRef.current = n; },
    "aria-haspopup": "dialog",
    "aria-expanded": open,
    "aria-controls": open ? id : undefined,
    onClick: (e: React.MouseEvent<HTMLElement>) => { if (cp.onClick) cp.onClick(e); if (e.defaultPrevented) return; set(!open); },
  });
  const titled = props.title != null && props.title !== false && props.title !== "";
  const content = typeof props.children === "function" ? (props.children as (c: () => void) => React.ReactNode)(() => close(true)) : props.children;
  return (
    <>
      {trigger}
      <div ref={panelRef} id={id} role="dialog" tabIndex={-1} {...{ popover: "manual" }} hidden={!open || undefined}
        aria-labelledby={titled ? id + "-title" : undefined} aria-label={titled ? undefined : props["aria-label"]}
        className={cn("dk-popover", props.className)} style={props.style} data-component="popover" data-state={open ? "open" : "closed"}
        onKeyDown={onKeyDown} onBlur={onBlur}>
        {open ? <>
          {titled ? <div id={id + "-title"} className="dk-popover__title">{props.title}</div> : null}
          <div className="dk-popover__body">{content}</div>
        </> : null}
      </div>
    </>
  );
}
Popover.displayName = "Popover";
