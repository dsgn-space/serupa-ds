"use client";
import * as React from "react";
import { cn, omit } from "../../internal/cn";
import { Icon } from "../Icon/Icon";
import { VisuallyHidden } from "../VisuallyHidden/VisuallyHidden";
import { component } from "../../internal/component";
import { useSerupa } from "../../internal/provider";
import * as icons from "../../material/builtin";

export interface StepperStep {
  title: React.ReactNode;
  /** A muted line under the title. */
  description?: React.ReactNode;
  /** Shows "Optional" under the title. */
  optional?: boolean;
  /** 'error': marks the step in danger, such as a step with a problem to fix. */
  status?: 'error';
}
export interface StepperProps extends React.HTMLAttributes<HTMLElement> {
  /** The steps, in order. */
  steps: StepperStep[];
  /** The current step's index, from 0. Steps before it are complete; steps.length marks them all complete. */
  current: number;
  /** 'horizontal' (default): side by side, joined by lines. 'vertical': stacked, for narrow spaces or long descriptions. */
  orientation?: 'horizontal' | 'vertical';
  /** 'sm' (24px circles, text-xs) or 'md' (32px, text-sm, default). */
  size?: 'sm' | 'md';
  /** Makes completed steps buttons that go back to them. */
  onStepClick?: (index: number) => void;
  /** Words read out or shown: { completed: 'completed', error: 'has an error', optional: 'Optional' }. */
  labels?: { completed?: string; error?: string; optional?: string };
}

const OWN = { steps: 1, current: 1, orientation: 1, size: 1, onStepClick: 1, labels: 1, className: 1 } as const;

/* Stepper: where people are in a task split into steps (sign-up, checkout, setup). Each step has a numbered
   circle, a title and an optional description; completed steps show a check and fill in primary, the current
   one is filled and ringed, a step with status "error" turns danger. Horizontal (default), joined by lines, or
   vertical. A <nav> around an <ol>; the current step has aria-current="step", and completed or error steps say
   so to screen readers. With onStepClick, completed steps are buttons that go back to them. */
/** Where people are in a task split into steps: numbered circles joined by lines. */
export const Stepper = /* @__PURE__ */ component<HTMLElement, StepperProps>("Stepper", function Stepper(props, ref) {
  const sds = useSerupa();
  const rest = omit(props, OWN);
  const steps = props.steps || [];
  const current = Math.max(0, Math.min(steps.length, Math.floor(Number(props.current)) || 0));
  const vertical = props.orientation === "vertical";
  const size = props.size === "sm" ? "sm" : "md";
  const L = { completed: sds.labels.completed, error: sds.labels.hasError, optional: sds.labels.optional, ...(props.labels || {}) };
  return (
    <nav {...rest} ref={ref} aria-label={rest["aria-label"] || (rest["aria-labelledby"] ? undefined : sds.labels.progress)}
      className={cn("dk-stepper", vertical ? "dk-stepper--vertical" : "dk-stepper--horizontal", "dk-stepper--size-" + size, props.className)}
      data-component="stepper" data-orientation={vertical ? "vertical" : "horizontal"} data-size={size}>
      <ol className="dk-stepper__list">
        {steps.map((s, i) => {
          const state = s.status === "error" ? "error" : i < current ? "complete" : i === current ? "current" : "upcoming";
          const clickable = !!props.onStepClick && i < current;
          const Head: React.ElementType = clickable ? "button" : "div";
          const hasDesc = s.description != null && s.description !== "";
          return (
            <li key={i} className={cn("dk-stepper__step", "dk-stepper__step--" + state, i < current && "dk-stepper__step--done")} data-state={state} aria-current={i === current ? "step" : undefined}>
              <Head className="dk-stepper__head" {...(clickable ? { type: "button", onClick: () => props.onStepClick!(i) } : {})}>
                <span className="dk-stepper__indicator" aria-hidden>
                  {state === "complete" ? <Icon icon={icons.Check} /> : state === "error" ? <Icon icon={icons.PriorityHigh} /> : i + 1}
                </span>
                <span className="dk-stepper__text">
                  <span className="dk-stepper__title">
                    {s.title}
                    {state === "complete" ? <VisuallyHidden>{", " + L.completed}</VisuallyHidden> : state === "error" ? <VisuallyHidden>{", " + L.error}</VisuallyHidden> : null}
                  </span>
                  {hasDesc ? <span className="dk-stepper__description">{s.description}</span> : null}
                  {s.optional ? <span className="dk-stepper__description dk-stepper__optional">{L.optional}</span> : null}
                </span>
              </Head>
              {i < steps.length - 1 ? <span className="dk-stepper__connector" aria-hidden /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});
