import * as React from "react";

/* A control drawn inside a wrapper (Slider's thumbs, SegmentedControl's segments) keeps its ref on the wrapper, so
   ref.current.focus() would land nowhere: a form library that focuses the first invalid field after a failed submit
   (React Hook Form's shouldFocusError, Formik) would leave keyboard and screen reader users where they were. These
   point the wrapper's focus() and autoFocus at the control inside. */

/** Makes el.focus() focus what target() returns instead; nothing when it returns null (a disabled control, as a
 *  disabled input ignores focus()). Call it from the wrapper's ref callback, before handing the element on. */
export function delegateFocus(el: HTMLElement | null, target: () => HTMLElement | null | undefined): void {
  if (el) el.focus = (options?: FocusOptions) => { const t = target(); if (t) t.focus(options); };
}

/** autoFocus for such a control: focuses target() once, after the first render. */
export function useAutoFocus(on: boolean | undefined, target: () => HTMLElement | null | undefined): void {
  const first = React.useRef({ on, target });
  first.current.target = target;
  React.useEffect(() => { if (first.current.on) first.current.target()?.focus(); }, []);
}
