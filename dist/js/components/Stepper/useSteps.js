"use client";

// src/components/Stepper/useSteps.ts
import * as React from "react";
import { useIsoLayoutEffect } from "../../internal/cn.js";
import { withViewTransition } from "../../internal/viewTransition.js";
function useSteps(options) {
  const id = React.useId();
  const count = options.steps.length;
  const [current, setCurrent] = React.useState(() => Math.min(Math.max(options.defaultStep ?? 0, 0), Math.max(count - 1, 0)));
  const [failed, setFailed] = React.useState(() => /* @__PURE__ */ new Set());
  const opts = React.useRef(options);
  const now = React.useRef(current);
  useIsoLayoutEffect(() => {
    opts.current = options;
    now.current = current;
  });
  const busy = React.useRef(false);
  const moved = React.useRef(false);
  const headings = React.useRef(/* @__PURE__ */ new Map());
  React.useEffect(() => {
    if (!moved.current) return;
    const h = headings.current.get(current);
    if (h) h.focus();
  }, [current]);
  const move = (to) => {
    const update = () => {
      moved.current = true;
      setCurrent(to);
    };
    if (opts.current.transition) void withViewTransition(update, { types: [to > now.current ? "forward" : "back"] });
    else update();
  };
  const vtName = "dk-steps-" + id.replace(/[^\w-]/g, "");
  const mark = (index, ok) => setFailed((f) => {
    if (ok !== f.has(index)) return f;
    const n = new Set(f);
    if (ok) n.delete(index);
    else n.add(index);
    return n;
  });
  const pass = async (from, to) => {
    for (let i = from; i < to; i++) {
      const check = opts.current.validate;
      const ok = !check || await check(i) !== false;
      mark(i, ok);
      if (!ok) {
        if (i !== now.current) move(i);
        return false;
      }
    }
    return true;
  };
  const goTo = async (index) => {
    const to = Math.min(Math.max(index, 0), count - 1);
    const from = now.current;
    if (to === from || busy.current) return false;
    if (to < from) {
      move(to);
      return true;
    }
    busy.current = true;
    try {
      const ok = await pass(from, to);
      if (ok) move(to);
      return ok;
    } finally {
      busy.current = false;
    }
  };
  const next = async () => {
    const from = now.current;
    if (from < count - 1) return goTo(from + 1);
    if (busy.current) return false;
    busy.current = true;
    try {
      const ok = await pass(from, from + 1);
      if (ok && opts.current.onComplete) opts.current.onComplete();
      return ok;
    } finally {
      busy.current = false;
    }
  };
  const back = () => {
    if (now.current > 0 && !busy.current) move(now.current - 1);
  };
  const steps = options.steps.map((s, i) => failed.has(i) ? { ...s, status: "error" } : s);
  return {
    current,
    next,
    back,
    goTo,
    isFirst: current === 0,
    isLast: current === count - 1,
    stepperProps: { steps, current, onStepClick: (i) => {
      void goTo(i);
    } },
    panelProps: (i) => ({
      id: `${id}-step-${i}`,
      hidden: i !== current,
      "aria-labelledby": `${id}-title-${i}`,
      ...options.transition && i === current ? { style: { viewTransitionName: vtName, viewTransitionClass: "step" } } : {}
    }),
    headingProps: (i) => ({ id: `${id}-title-${i}`, tabIndex: -1, ref: (n) => {
      if (n) headings.current.set(i, n);
      else headings.current.delete(i);
    } })
  };
}
export {
  useSteps
};
//# sourceMappingURL=useSteps.js.map
