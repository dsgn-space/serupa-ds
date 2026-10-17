import * as React from "react";
import { cn, oneOf, omit } from "../../internal/cn";

export interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLElement> {
  /** Shows it while it (or something in it) has keyboard focus: for a "Skip to content" link. Default: false. */
  focusable?: boolean;
  /** The element. Default: 'span'. */
  as?: 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'label' | 'legend';
}

const TAGS = ["span", "div", "h1", "h2", "h3", "h4", "h5", "h6", "p", "label", "legend"] as const;

/* VisuallyHidden: content that screen readers announce but nobody sees, such as "(opens in a new tab)" or a
   heading for a section that's obvious by sight. focusable shows it while it has focus (skip links).
   className and every other prop go to the element. */
/** Content for screen readers only: hidden on screen, still announced. focusable shows it on keyboard focus. */
export const VisuallyHidden = React.forwardRef<HTMLElement, VisuallyHiddenProps>(function VisuallyHidden(props, ref) {
  const rest = omit(props, { focusable: 1, as: 1, className: 1 });
  return React.createElement(oneOf(TAGS, props.as, "span"), Object.assign(rest, {
    ref: ref, "data-component": "visually-hidden",
    className: cn("dk-visually-hidden", props.focusable && "dk-visually-hidden--focusable", props.className),
  }));
});
VisuallyHidden.displayName = "VisuallyHidden";
