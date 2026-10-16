import * as React from "react";
import { cn, oneOf } from "../../internal/cn";

export type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl';
export type TextTone = 'default' | 'muted' | 'primary' | 'danger';
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  /** The element: 'p' (default), 'span', 'div', 'label', 'strong', 'em', 'small', 'li' or 'figcaption'. */
  as?: 'p' | 'span' | 'div' | 'label' | 'strong' | 'em' | 'small' | 'li' | 'figcaption';
  /** From the type scale, with its line height. Default: inherited from the parent. */
  size?: TextSize;
  /** 'default' (text), 'muted' (secondary), 'primary' or 'danger'. Each keeps 4.5:1 on surface. Default: inherited. */
  tone?: TextTone;
  /** Default: inherited. */
  weight?: TextWeight;
  /** Keeps it on one line, cut with an ellipsis. Give it a width (it's a block). */
  truncate?: boolean;
  /** For a label: the id of the control it names. */
  htmlFor?: string;
}

/* Text: body text in the system's type. size, tone and weight only set what's given; anything unset follows
   the parent. className and every other prop go to the element. */
const TAGS = ["p", "span", "div", "label", "strong", "em", "small", "li", "figcaption"] as const;
const SIZES: readonly TextSize[] = ["xs", "sm", "base", "lg", "xl"];
const TONES: readonly TextTone[] = ["default", "muted", "primary", "danger"];
const WEIGHTS: readonly TextWeight[] = ["normal", "medium", "semibold", "bold"];
const pick = <T extends string>(list: readonly T[], v: unknown): T | null => (list.indexOf(v as T) < 0 ? null : (v as T));

/** Body text in the system's type: size, tone and weight, each inherited when unset. */
export const Text = React.forwardRef<HTMLElement, TextProps>(function Text(props, ref) {
  const { as, size, tone, weight, truncate, className, ...rest } = props;
  const s = pick(SIZES, size), t = pick(TONES, tone), w = pick(WEIGHTS, weight);
  return React.createElement(oneOf(TAGS, as, "p"), Object.assign(rest, {
    ref: ref, "data-component": "text",
    className: cn("dk-text", s && "dk-text--" + s, t && "dk-text--" + t, w && "dk-text--" + w, truncate && "dk-text--truncate", className),
  }));
});
Text.displayName = "Text";
