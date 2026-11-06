import * as React from "react";
import { cn, oneOf, omit } from "../../internal/cn";
import { component } from "../../internal/component";

const NAMES = ["empty", "search", "error", "offline", "no-access", "success"] as const;
export type IllustrationName = (typeof NAMES)[number];

export interface IllustrationProps extends Omit<React.SVGAttributes<SVGSVGElement>, "name"> {
  /** Which picture: 'empty' (default, an open box), 'search' (nothing found), 'error' (something broke), 'offline'
      (no connection), 'no-access' (a lock) or 'success' (a check). */
  name?: IllustrationName | undefined;
  /** 'sm' (96px wide), 'md' (default, 160px) or 'lg' (224px). The height is three quarters of the width. */
  size?: "sm" | "md" | "lg" | undefined;
  /** What the picture says, for a screen reader, when it adds something the text beside it doesn't. Without one
      (the usual case, next to an EmptyState title) it's hidden from screen readers. */
  label?: string | undefined;
}

type Part = [kind: "fill" | "line" | "accent", d: string];
// Each picture on a 160 × 120 grid (the 1em × 0.75em attributes keep it small before the stylesheet, and give the 4:3 height after), lines 3 units wide and the accent 4: soft fills first, then outlines, then the one primary detail on top.
const DOC = "M36 16H88L104 32V104H36Z";
const PICTURES: Record<IllustrationName, Part[]> = {
  empty: [
    ["fill", "M40 52L80 40L120 52V92L80 104L40 92Z"],
    ["line", "M40 52L80 40L120 52V92L80 104L40 92Z"],
    ["line", "M40 52L80 64L120 52M80 64V104M40 52L28 38L68 26L80 40M120 52L132 38L92 26L80 40"],
    ["accent", "M80 6V16M60 12L65 20M100 12L95 20"],
  ],
  search: [
    ["fill", DOC],
    ["line", DOC],
    ["line", "M88 16V32H104M50 42H88M50 54H78"],
    ["fill", "M96 58A18 18 0 1 1 96 94A18 18 0 1 1 96 58Z"],
    ["accent", "M96 58A18 18 0 1 1 96 94A18 18 0 1 1 96 58ZM109 89L124 104"],
  ],
  error: [
    ["fill", DOC],
    ["line", DOC],
    ["line", "M88 16V32H104M50 42H88M50 54H78"],
    ["fill", "M100 60L126 106H74Z"],
    ["accent", "M100 60L126 106H74ZM100 76V90M100 98V98.5"],
  ],
  offline: [
    ["fill", "M50 92H110A20 20 0 0 0 112 52A30 30 0 0 0 54 50A21 21 0 0 0 50 92Z"],
    ["line", "M50 92H110A20 20 0 0 0 112 52A30 30 0 0 0 54 50A21 21 0 0 0 50 92Z"],
    ["accent", "M44 22L116 104"],
  ],
  "no-access": [
    ["line", "M60 56V42A20 20 0 0 1 100 42V56"],
    ["fill", "M56 56H104A8 8 0 0 1 112 64V100A8 8 0 0 1 104 108H56A8 8 0 0 1 48 100V64A8 8 0 0 1 56 56Z"],
    ["line", "M56 56H104A8 8 0 0 1 112 64V100A8 8 0 0 1 104 108H56A8 8 0 0 1 48 100V64A8 8 0 0 1 56 56Z"],
    ["accent", "M80 74V90"],
  ],
  success: [
    ["fill", "M80 20A40 40 0 1 1 80 100A40 40 0 1 1 80 20Z"],
    ["line", "M80 20A40 40 0 1 1 80 100A40 40 0 1 1 80 20Z"],
    ["accent", "M62 60L75 73L99 49"],
  ],
};

/* Illustration: a small line drawing for an empty state, an error page or a finished flow, drawn from the theme's
   own colors so it fits every theme. Decorative by default (aria-hidden), since the text beside it says the same;
   with label it's an image with that name. className and every other prop go to the <svg>. */
/** A small themed drawing for an empty state: empty, search, error, offline, no-access or success.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const Illustration = /* @__PURE__ */ component<SVGSVGElement, IllustrationProps>("Illustration", function Illustration(props, ref) {
  const rest = omit(props, { className: 1, name: 1, size: 1, label: 1 });
  const label = props.label;
  const name = oneOf(NAMES, props.name, "empty");
  const size = oneOf(["sm", "md", "lg"] as const, props.size, "md");
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };
  return (
    <svg viewBox="0 0 160 120" width="1em" height="0.75em" focusable="false" {...a11y} {...rest} ref={ref} className={cn("dk-illustration", size !== "md" && "dk-illustration--" + size, props.className)} data-component="illustration" data-name={name}>
      {PICTURES[name].map(([kind, d], i) => <path key={i} className={"dk-illustration__" + kind} d={d} strokeWidth={kind === "accent" ? 4 : kind === "line" ? 3 : undefined} />)}
    </svg>
  );
});
