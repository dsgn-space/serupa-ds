import * as React from "react";
import { cn } from "../../internal/cn";
import { component } from "../../internal/component";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** The heading element, h1 to h6: pick the level that fits the page's outline. Default: 2. */
  level?: HeadingLevel;
  /** The look, from the type scale, separate from the level. Default: the level's own (1: 3xl, 2: 2xl, 3: xl, 4: lg, 5: base, 6: sm). */
  size?: HeadingSize;
}

/* Heading: an h1 to h6 in the system's type. level sets the element, size the look (each level has its own
   default), so the outline and the look can differ. className and every other prop go to the heading. */
const SIZES: readonly HeadingSize[] = ["sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl"];

/** A heading (h1 to h6) in the system's type: level sets the element, size the look. */
export const Heading = /* @__PURE__ */ component<HTMLHeadingElement, HeadingProps>("Heading", function Heading(props, ref) {
  const { level: lv, size: sz, className, ...rest } = props;
  const level = [1, 2, 3, 4, 5, 6].indexOf(lv as number) < 0 ? 2 : (lv as number);
  const size = SIZES.indexOf(sz as HeadingSize) < 0 ? null : sz;
  return React.createElement("h" + level, Object.assign(rest, {
    ref: ref, className: cn("dk-heading", "dk-heading--" + level, size && "dk-heading--size-" + size, className), "data-component": "heading",
  }));
});
