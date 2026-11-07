"use client";
import * as React from "react";
import { cn, domId, elementRef, omit, setRef, useIsoLayoutEffect } from "../../internal/cn";
import { oneElement, useTriggerRef } from "../../internal/trigger";
import { NAME_HOW, useNameCheck } from "../../internal/nameCheck";
import type { Placement } from "../../internal/position";
import { useAnchoredLayer } from "../../internal/useAnchoredLayer";
import { useExit } from "../../internal/useExit";
import { lastInputKeyboard } from "../../internal/lastInput";
import { component } from "../../internal/component";
import { isComposing } from "../../internal/ime";
import { warnOnce } from "../../internal/warn";
import type { OpenChangeDetails, OpenChangeReason } from "../../internal/openChange";
import { activeIn } from "../../internal/root";

/** The trigger element's props this component reads and adds to. */
type TriggerProps = React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement>;

export interface PopoverProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'title' | 'role'> {
  /** The element that opens it: one element that can take focus, such as a Button. It gets aria-expanded and aria-controls. */
  trigger: React.ReactElement;
  /** What's inside: text, a form, links, buttons. A function gets close(), for a Cancel or Done button. */
  children: React.ReactNode | ((close: () => void) => React.ReactNode);
  /** A heading at the top that names the popover. */
  title?: React.ReactNode | undefined;
  /** The title's heading level, to fit the page's outline. Default: 2, as in Dialog. */
  headingLevel?: 2 | 3 | 4 | 5 | 6 | undefined;
  /** Where it goes: 'bottom' (default), 'top', 'left', 'right', with '-start' or '-end'. It flips when there's no room. */
  placement?: Placement | undefined;
  /** Open it yourself (controlled), with onOpenChange. */
  open?: boolean | undefined;
  /** Open at first (uncontrolled). Default: false. */
  defaultOpen?: boolean | undefined;
  /** Called when it asks to open or close, with why: { reason: 'trigger' | 'escape' | 'outside' | 'blur' | 'close' }. */
  onOpenChange?: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
  /** Its name for screen readers when it has no title. */
  "aria-label"?: string | undefined;
  /** Show it as a sheet along the bottom of the screen, full width, instead of next to its trigger: true always,
      'mobile' under 640px (the sm breakpoint), where a panel by a button is small to tap and covers what's around it. */
  sheet?: boolean | 'mobile' | undefined;
  /** Where focus goes when it opens: 'first' (default: the first control inside, or the panel) or 'panel'. */
  initialFocus?: 'first' | 'panel' | undefined;
  /** Classes on the panel. The other HTML attributes (id, data-*, aria-*) and the ref go on the panel too. */
  className?: string | undefined;
  /** Styles on the panel. */
  style?: React.CSSProperties | undefined;
}

const OWN = { trigger: 1, children: 1, title: 1, "aria-label": 1, "aria-labelledby": 1, headingLevel: 1, placement: 1, open: 1, defaultOpen: 1, onOpenChange: 1, sheet: 1, initialFocus: 1, className: 1, style: 1, onKeyDown: 1, onBlur: 1 } as const;
// 'mobile': under the sm breakpoint, as Dialog's fullScreen="mobile" (Dialog.css).
const NARROW = "(max-width: 639.98px)";
const noSubscribe = () => () => {};
const subscribeNarrow = (on: () => void) => { const m = window.matchMedia(NARROW); m.addEventListener("change", on); return () => m.removeEventListener("change", on); };
const isNarrow = () => window.matchMedia(NARROW).matches;
const notNarrow = () => false;
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/* Popover: a small non-modal dialog next to its trigger, for content people interact with (a form, filters,
   details with links): role="dialog", named by its title. Opening moves focus inside; Escape closes it and
   returns focus to the trigger; a click outside, or focus moving elsewhere, closes it too. It sits in the top
   layer, right after the trigger in the tab order. For a hint, use Tooltip; for a list of actions, Menu. */
/** A small non-modal dialog next to its trigger, for interactive content: a form, filters, details. */
export const Popover = /* @__PURE__ */ component<HTMLDivElement, PopoverProps>("Popover", function Popover(props, ref) {
  const nameRef = useNameCheck("Popover", NAME_HOW.title);   // warns when it has no accessible name
  const own = domId("dk-pop", React.useId());
  const id = props.id || own;
  const [inner, setInner] = React.useState(!!props.defaultOpen);
  const controlled = props.open !== undefined;
  const open = controlled ? !!props.open : inner;
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const ask = React.useRef(props.onOpenChange); ask.current = props.onOpenChange;
  // A close() kept by the content and called once it has closed already (after Escape, say) asks nothing.
  const shown = React.useRef(open); shown.current = open;
  const set = React.useCallback((v: boolean, reason: OpenChangeReason) => {
    if (v === shown.current) return;
    if (!controlled) { shown.current = v; setInner(v); }
    if (ask.current) ask.current(v, { reason });
  }, [controlled]);
  const close = React.useCallback((reason: OpenChangeReason, focusTrigger: boolean) => { set(false, reason); if (focusTrigger && triggerRef.current) triggerRef.current.focus(); }, [set]);
  const focusFirst = props.initialFocus !== "panel";

  // Closing: the content stays (inert) while the panel fades out (DZ1); one open on arrival doesn't fade in.
  const exit = useExit(open, panelRef);
  // A sheet: on the server and while hydrating, a 'mobile' one is next to its trigger until the screen is known.
  const mobile = props.sheet === "mobile";
  const narrow = React.useSyncExternalStore(mobile ? subscribeNarrow : noSubscribe, mobile ? isNarrow : notNarrow, notNarrow);
  const sheet = props.sheet === true || narrow;
  useAnchoredLayer(open, panelRef, triggerRef, { placement: props.placement, offsetVar: "--dk-popover-offset", onOutside: () => close("outside", false), inside: triggerRef, docked: sheet });
  // On open, focus moves inside (a press outside the panel and its trigger closes it; focus stays where the press put it).
  useIsoLayoutEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;
    // The panel renders where it's placed: inside a page <form>, its own form nests in that one (Enter reloads the
    // page) and Enter in its field submits the page's form (GR170).
    if (process.env.NODE_ENV !== "production" && panel.parentElement?.closest("form") && panel.querySelector("form, textarea, input:not([type=checkbox], [type=radio], [type=hidden])")) warnOnce("overlay-in-form", "Popover: it's inside a <form> and holds a form or a field, so Enter there submits the page's form, or reloads the page. Place the Popover after the form.");
    // The first control that takes focus: one hidden (display: none, in a closed <details>) or in a disabled
    // <fieldset> doesn't, and focus would have stayed on the trigger, where Escape doesn't close it (L8E22).
    // Opened from the keyboard, the ring shows where focus went: Firefox doesn't work that out on its own for focus
    // moved by script inside a shadow root.
    const how = lastInputKeyboard() ? { focusVisible: true } : undefined;
    const took = focusFirst && Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).some((el) => el.tabIndex >= 0 && (el.focus(how), activeIn(el) === el));   // its own root's focus, in a shadow root too (GR60)
    if (!took) panel.focus(how);
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (props.onKeyDown) props.onKeyDown(e);
    if (e.defaultPrevented) return;
    if (e.key === "Escape" && !isComposing(e)) { e.preventDefault(); e.stopPropagation(); close("escape", true); }
  };
  // Focus leaving for somewhere other than the trigger closes it.
  const onBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (props.onBlur) props.onBlur(e);
    const to = e.relatedTarget as Node | null;
    if (!to) return;
    if (panelRef.current && panelRef.current.contains(to)) return;
    if (triggerRef.current && triggerRef.current.contains(to)) return;
    close("blur", false);
  };

  const child = oneElement<TriggerProps>(props.trigger, "Popover", "trigger");
  useTriggerRef(triggerRef, "Popover");
  const cp = child.props;
  const childRef = elementRef<HTMLElement>(child);
  const trigger = React.cloneElement(child, {
    ref: (n: HTMLElement | null) => { triggerRef.current = n; if (childRef) setRef(childRef, n); },
    "aria-haspopup": "dialog",
    "aria-expanded": open,
    "aria-controls": open ? id : undefined,
    onClick: (e: React.MouseEvent<HTMLElement>) => { if (cp.onClick) cp.onClick(e); if (e.defaultPrevented) return; set(!open, "trigger"); },
  });
  const titled = props.title != null && props.title !== false && props.title !== "";
  const H = ("h" + ([2, 3, 4, 5, 6].indexOf(props.headingLevel as number) >= 0 ? props.headingLevel : 2)) as "h2";
  const content = typeof props.children === "function" ? (props.children as (c: () => void) => React.ReactNode)(() => close("close", true)) : props.children;
  return (
    <>
      {trigger}
      <div {...omit(props, OWN)} ref={(n) => { panelRef.current = n; setRef(ref, n); if (!titled) nameRef(n); }} id={id} role="dialog" tabIndex={-1} {...{ popover: "manual" }} hidden={!open || undefined}
        aria-labelledby={titled ? id + "-title" : props["aria-labelledby"]} aria-label={titled ? undefined : props["aria-label"]}
        className={cn("dk-popover", sheet && "dk-popover--sheet", props.className)} style={props.style} data-component="popover" data-state={open ? "open" : "closed"} data-instant={exit.instant ? "" : undefined}
        inert={!open || undefined} onKeyDown={onKeyDown} onBlur={onBlur}>
        {open || exit.leaving ? <>
          {titled ? <H id={id + "-title"} className="dk-popover__title">{props.title}</H> : null}
          <div className="dk-popover__body">{content}</div>
        </> : null}
      </div>
    </>
  );
});
