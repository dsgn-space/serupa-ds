"use client";
import * as React from "react";
import { cn, domId, omit, setRef, useIsoLayoutEffect } from "../../internal/cn";
import { component } from "../../internal/component";
import type { OpenChangeDetails, OpenChangeReason } from "../../internal/openChange";
import { showLayer, type Placement } from "../../internal/position";
import { useSettings } from "../../internal/provider";
import { useAnchoredLayer } from "../../internal/useAnchoredLayer";
import { useExit } from "../../internal/useExit";
import * as icons from "../../material/builtin";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";
import { en as stepper } from "../Stepper/labels";
import { en as tour } from "./labels";

// Its words, with Stepper's ("Step 2 of 4"): a property read here would keep this module in every bundle.
const words = /* @__PURE__ */ Object.assign({}, stepper, tour);

/** One step of a Tour. */
export interface TourStep {
  /** What the step points at: a CSS selector ("#new-project"), an element, or a ref to one. Leave it out (or give one
   *  not on the page) for a step in the middle of the screen, such as a welcome. */
  target?: string | Element | React.RefObject<Element | null> | null;
  /** The step's heading, which also names its panel for screen readers. */
  title: React.ReactNode;
  /** What the step says: a sentence or two. */
  content?: React.ReactNode;
  /** Where the panel goes next to the target: 'bottom' (default), 'top', 'left', 'right', with '-start' or '-end'. It flips when there's no room. */
  placement?: Placement;
}

export interface TourProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "title" | "role" | "content"> {
  /** The steps, in order. */
  steps: readonly TourStep[];
  /** Show it yourself (controlled), with onOpenChange. */
  open?: boolean;
  /** Show it at first (uncontrolled). Default: false. */
  defaultOpen?: boolean;
  /** Called when it asks to close, with why: { reason: 'escape' (Escape) | 'close' (the close button, or Done) }. */
  onOpenChange?: (open: boolean, details: OpenChangeDetails) => void;
  /** The step shown, from 0 (controlled), with onStepChange. */
  step?: number;
  /** The step shown at first, from 0 (uncontrolled). Default: 0. */
  defaultStep?: number;
  /** Called with the new step when Back or Next is pressed. */
  onStepChange?: (step: number) => void;
  /** Called when Done is pressed on the last step, before it closes: the tour was seen to the end. */
  onFinish?: () => void;
  /** The heading level of each step's title, to fit the page's outline. Default: 2. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}

const OWN = { steps: 1, open: 1, defaultOpen: 1, onOpenChange: 1, step: 1, defaultStep: 1, onStepChange: 1, onFinish: 1, headingLevel: 1, className: 1, id: 1 } as const;

// The element a step points at, if it's on the page now.
function find(t: TourStep["target"]): HTMLElement | null {
  const el = typeof t === "string" ? document.querySelector(t) : t && "current" in t ? t.current : t;
  return el instanceof Element ? (el as HTMLElement) : null;
}

/* Tour: a short guided walk through a page, one step at a time. Each step is a small non-modal dialog next to the
   element it explains, which gets a ring, with Back, Next (Done on the last step) and a close button; a step with no
   element sits in the middle of the screen. The page stays usable: nothing is dimmed and a press outside doesn't end
   it. Showing a step moves focus to its panel, so screen readers read its title and text; Escape or the close button
   ends it and focus goes back to where it was. */
/** A guided tour: steps that point at parts of the page, one at a time, with Back, Next and Done.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const Tour = /* @__PURE__ */ component<HTMLDivElement, TourProps>("Tour", function Tour(props, ref) {
  const sds = useSettings(words);
  const own = domId("dk-tour", React.useId());
  const id = props.id || own;
  const steps = props.steps || [];
  const [ownOpen, setOwnOpen] = React.useState(!!props.defaultOpen);
  const open = steps.length > 0 && (props.open !== undefined ? !!props.open : ownOpen);
  const [ownStep, setOwnStep] = React.useState(props.defaultStep || 0);
  const at = Math.max(0, Math.min(steps.length - 1, props.step !== undefined ? props.step : ownStep));
  const step = steps[at] as TourStep | undefined;
  const panel = React.useRef<HTMLDivElement | null>(null);
  const anchor = React.useRef<HTMLElement | null>(null);
  const opener = React.useRef<Element | null>(null);
  const [target, setTarget] = React.useState<HTMLElement | null>(null);

  const close = (reason: OpenChangeReason) => {
    if (props.open === undefined) setOwnOpen(false);
    if (props.onOpenChange) props.onOpenChange(false, { reason });
  };
  const go = (to: number) => {
    if (props.step === undefined) setOwnStep(to);
    if (props.onStepChange) props.onStepChange(to);
  };
  const last = at === steps.length - 1;
  const next = () => {
    if (!last) { go(at + 1); return; }
    if (props.onFinish) props.onFinish();
    close("close");
  };

  // The step's element: found each time a step shows (it may have appeared since), brought into view and ringed.
  useIsoLayoutEffect(() => {
    const el = open && step ? find(step.target) : null;
    anchor.current = el;
    setTarget(el);
    if (!el) return;
    el.scrollIntoView({ block: "nearest", inline: "nearest" });
    el.setAttribute("data-tour-target", "");
    return () => el.removeAttribute("data-tour-target");
  }, [open, step]);
  const exit = useExit(open, panel);
  useAnchoredLayer(open && !!target, panel, anchor, { placement: step && step.placement, offsetVar: "--dk-tour-offset", watch: target });
  // A step with nothing to point at: the panel in the middle of the screen (the class), shown here.
  useIsoLayoutEffect(() => {
    const p = panel.current;
    if (!open || target || !p) return;
    p.style.top = p.style.left = "";
    showLayer(p);
  }, [open, target]);
  // Focus: where it was is kept when the tour opens, each step's panel takes it (so its title and text are read),
  // and it goes back when the tour ends, unless it has moved elsewhere on the page meanwhile.
  useIsoLayoutEffect(() => {
    const p = panel.current;
    if (!open || !p) return;
    if (!opener.current) opener.current = document.activeElement;
    p.focus({ preventScroll: true });
  }, [open, at]);
  useIsoLayoutEffect(() => {
    if (open) return;
    const back = opener.current as HTMLElement | null, p = panel.current, now = document.activeElement;
    opener.current = null;
    if (back && back.isConnected && typeof back.focus === "function" && (!now || now === document.body || (!!p && p.contains(now)))) back.focus({ preventScroll: true });
  }, [open]);

  // Escape ends it, from anywhere in the panel: a listener on the panel itself, as it isn't an interactive element.
  useIsoLayoutEffect(() => {
    const p = panel.current;
    if (!open || !p) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented || e.isComposing) return;
      e.preventDefault(); e.stopPropagation(); close("escape");
    };
    p.addEventListener("keydown", esc);
    return () => p.removeEventListener("keydown", esc);
  }, [open, close]);

  if (!step) return null;
  const H = ("h" + ([2, 3, 4, 5, 6].indexOf(props.headingLevel as number) >= 0 ? props.headingLevel : 2)) as "h2";
  return (
    <div {...omit(props, OWN)} ref={(n) => { panel.current = n; setRef(ref, n); }} id={id} role="dialog" tabIndex={-1} {...{ popover: "manual" }}
      hidden={!open || undefined} inert={!open || undefined} aria-labelledby={id + "-title"} aria-describedby={step.content != null ? id + "-text" : undefined}
      className={cn("dk-tour", !target && "dk-tour--center", props.className)} data-component="tour" data-state={open ? "open" : "closed"} data-instant={exit.instant ? "" : undefined}>
      {open || exit.leaving ? <>
        <div className="dk-tour__head">
          <H id={id + "-title"} className="dk-tour__title">{step.title}</H>
          <IconButton className="dk-tour__close" icon={icons.Close} label={sds.labels.close} size="sm" hideTitle onClick={() => close("close")} />
        </div>
        {step.content != null ? <div id={id + "-text"} className="dk-tour__text">{step.content}</div> : null}
        <div className="dk-tour__foot">
          {steps.length > 1 ? <span className="dk-tour__count">{sds.labels.stepOf(at + 1, steps.length)}</span> : null}
          <span className="dk-tour__actions">
            {at > 0 ? <Button size="sm" variant="secondary" onClick={() => go(at - 1)}>{sds.labels.tourBack}</Button> : null}
            <Button size="sm" onClick={next}>{last ? sds.labels.tourDone : sds.labels.tourNext}</Button>
          </span>
        </div>
      </> : null}
    </div>
  );
});
