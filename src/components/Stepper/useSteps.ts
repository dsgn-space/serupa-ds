'use client';
import * as React from 'react';
import { useIsoLayoutEffect } from '../../internal/cn';
import type { StepperProps, StepperStep } from './Stepper';

export interface UseStepsOptions {
  /** The steps, as Stepper takes them. A step's status from here is kept; a failed check adds 'error'. */
  steps: StepperStep[];
  /** Checks the step about to be left with next(), or every step before the one goTo() jumps forward to: true lets
      it go on, false keeps people there and marks it with an error. It may return a promise (a server check). */
  validate?: ((index: number) => boolean | Promise<boolean>) | undefined;
  /** Called by next() on the last step, once it passes its check: submit here. */
  onComplete?: (() => void) | undefined;
  /** The step to start on. Default: 0. */
  defaultStep?: number | undefined;
}

export interface UseSteps {
  /** The current step's index, from 0. */
  current: number;
  /** Checks the current step, then goes to the next one (or calls onComplete on the last). Resolves to whether it went on. */
  next: () => Promise<boolean>;
  /** Goes back one step, with no check: what was typed stays. */
  back: () => void;
  /** Goes to a step: back at once, forward only once every step in between passes its check. */
  goTo: (index: number) => Promise<boolean>;
  isFirst: boolean;
  isLast: boolean;
  /** Spread on Stepper: steps (with errors marked), current, and onStepClick going back to finished steps. */
  stepperProps: Pick<StepperProps, 'steps' | 'current' | 'onStepClick'>;
  /** Spread on each step's container: every step stays rendered, the others hidden, so what was typed in them stays. */
  panelProps: (index: number) => { id: string; hidden: boolean; 'aria-labelledby': string };
  /** Spread on each step's heading: focus moves to it when the step changes, so a screen reader says where people are. */
  headingProps: (index: number) => { id: string; tabIndex: -1; ref: (node: HTMLElement | null) => void };
}

/* useSteps: the state of a form split into steps, for Stepper (41). It keeps the current step, checks a step before
   leaving it forward (the app's validate, sync or async), marks a step that fails with an error in the Stepper and
   keeps people on it, goes back freely, and moves focus to the heading of each step it opens, never on the first
   render. Every step stays rendered and the others are hidden, so what was typed in a step, controlled or not, is
   still there on the way back (WCAG 3.3.7: nothing asked for twice). Two calls at once (a double press of Next)
   run one check. */
/** The state of a multi-step form for Stepper: which step is open, a check before each step forward, errors marked, focus moved to each step's heading, and every step kept rendered so nothing typed is lost. */
export function useSteps(options: UseStepsOptions): UseSteps {
  const id = React.useId();
  const count = options.steps.length;
  const [current, setCurrent] = React.useState(() => Math.min(Math.max(options.defaultStep ?? 0, 0), Math.max(count - 1, 0)));
  const [failed, setFailed] = React.useState<ReadonlySet<number>>(() => new Set());
  const opts = React.useRef(options);
  const now = React.useRef(current);
  // every render: the refs keep the latest options and step for the checks, which run after awaits.
  useIsoLayoutEffect(() => { opts.current = options; now.current = current; });
  const busy = React.useRef(false);
  const moved = React.useRef(false);
  const headings = React.useRef(new Map<number, HTMLElement>());

  React.useEffect(() => {
    if (!moved.current) return;
    const h = headings.current.get(current);
    if (h) h.focus();
  }, [current]);

  const move = (to: number) => { moved.current = true; setCurrent(to); };
  const mark = (index: number, ok: boolean) => setFailed((f) => {
    if (ok !== f.has(index)) return f;
    const n = new Set(f);
    if (ok) n.delete(index); else n.add(index);
    return n;
  });
  // Checks the steps from..to-1 in order; stops at the first that fails and moves there.
  const pass = async (from: number, to: number) => {
    for (let i = from; i < to; i++) {
      const check = opts.current.validate;
      const ok = !check || (await check(i)) !== false;
      mark(i, ok);
      if (!ok) { if (i !== now.current) move(i); return false; }
    }
    return true;
  };
  const goTo = async (index: number) => {
    const to = Math.min(Math.max(index, 0), count - 1);
    const from = now.current;
    if (to === from || busy.current) return false;
    if (to < from) { move(to); return true; }
    busy.current = true;
    try { const ok = await pass(from, to); if (ok) move(to); return ok; } finally { busy.current = false; }
  };
  const next = async () => {
    const from = now.current;
    if (from < count - 1) return goTo(from + 1);
    if (busy.current) return false;
    busy.current = true;
    try { const ok = await pass(from, from + 1); if (ok && opts.current.onComplete) opts.current.onComplete(); return ok; } finally { busy.current = false; }
  };
  const back = () => { if (now.current > 0 && !busy.current) move(now.current - 1); };

  const steps = options.steps.map((s, i) => (failed.has(i) ? { ...s, status: 'error' as const } : s));
  return {
    current, next, back, goTo,
    isFirst: current === 0,
    isLast: current === count - 1,
    stepperProps: { steps, current, onStepClick: (i: number) => { void goTo(i); } },
    panelProps: (i) => ({ id: `${id}-step-${i}`, hidden: i !== current, 'aria-labelledby': `${id}-title-${i}` }),
    headingProps: (i) => ({ id: `${id}-title-${i}`, tabIndex: -1, ref: (n) => { if (n) headings.current.set(i, n); else headings.current.delete(i); } }),
  };
}
