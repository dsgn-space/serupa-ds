"use client";
import * as React from "react";
import { cn, oneOf, omit } from "../../internal/cn";
import { config } from "../../internal/config";
import { component } from "../../internal/component";

export type CardVariant = 'outline' | 'elevated' | 'filled';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /** 'outline' (default): surface, a border and a hairline shadow. 'elevated': a raised shadow, for content that floats over the page. 'filled': surface-muted and flat, for panels inside another surface. */
  variant?: CardVariant;
  /** Inner padding: 'none' (for full-bleed media; pad the parts yourself), 'sm' 12px, 'md' 20px (default) or 'lg' 24px. */
  padding?: CardPadding;
  /** The element: 'div' (default), 'section', 'article' or 'li'. Ignored with href. */
  as?: 'div' | 'section' | 'article' | 'li';
  /** Makes the whole card a link (the component set with configure({ link }), <a> by default), with a hover border and a focus ring. Keep buttons and other links out of a linked card. */
  href?: string;
  target?: string;
  rel?: string;
}

/* Card: a surface that groups related content and actions, made of CardHeader, CardBody and CardFooter (or any
   content). variant "outline" (default), "elevated" or "filled"; padding "none", "sm", "md" (default) or "lg".
   With href the whole card is a link. className and every other prop go to the card element. */
const OWN = { variant: 1, padding: 1, as: 1, className: 1 } as const;
const VARIANTS: readonly CardVariant[] = ["outline", "elevated", "filled"];
const PADDINGS: readonly CardPadding[] = ["none", "sm", "md", "lg"];
const TAGS = ["div", "section", "article", "li"] as const;

/** A surface that groups related content and actions: CardHeader, CardBody and CardFooter inside. With href, the whole card is a link. */
export const Card = /* @__PURE__ */ component<HTMLElement, CardProps>("Card", function Card(props, ref) {
  const rest = omit(props, OWN);
  const variant = oneOf(VARIANTS, props.variant, "outline");
  const padding = oneOf(PADDINGS, props.padding, "md");
  const isLink = rest.href != null;
  if (isLink && rest.target === "_blank" && rest.rel == null) rest.rel = "noopener noreferrer";
  const cls = cn("dk-card", variant !== "outline" && "dk-card--" + variant, padding !== "md" && "dk-card--padding-" + padding, isLink && "dk-card--link", props.className);
  return React.createElement(isLink ? config.link : oneOf(TAGS, props.as, "div"),
    Object.assign(rest, { ref: ref, className: cls, "data-component": "card", "data-variant": variant }));
});

export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** The card's title, as a heading. */
  title?: React.ReactNode;
  /** A muted line (or a few) under the title. */
  description?: React.ReactNode;
  /** Something at the end of the header: a Badge, a menu button. */
  action?: React.ReactNode;
  /** The title's heading level: 2 to 6, default 3. Pick the level that fits the page's outline. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}

/** The card's title, an optional description and an optional action at the end. Any children come after the description. */
export const CardHeader = /* @__PURE__ */ component<HTMLDivElement, CardHeaderProps>("CardHeader", function CardHeader(props, ref) {
  const rest = omit(props, { title: 1, description: 1, action: 1, headingLevel: 1, className: 1, children: 1 });
  const level = [2, 3, 4, 5, 6].indexOf(props.headingLevel as number) < 0 ? 3 : (props.headingLevel as number);
  const has = (n: React.ReactNode) => n != null && n !== false && n !== "";
  return (
    <div {...rest} ref={ref} className={cn("dk-card__header", props.className)}>
      <div className="dk-card__heading">
        {has(props.title) ? React.createElement("h" + level, { className: "dk-card__title" }, props.title) : null}
        {has(props.description) ? <p className="dk-card__description">{props.description}</p> : null}
        {props.children}
      </div>
      {has(props.action) ? <div className="dk-card__action">{props.action}</div> : null}
    </div>
  );
});

export type CardBodyProps = React.HTMLAttributes<HTMLDivElement>;

/** The card's main content. */
export const CardBody = /* @__PURE__ */ component<HTMLDivElement, CardBodyProps>("CardBody", function CardBody(props, ref) {
  return <div {...props} ref={ref} className={cn("dk-card__body", props.className)} />;
});

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Where the actions sit: 'end' (default), 'start' or 'between' (the first at the start, the rest at the end: give them a wrapper). */
  justify?: 'start' | 'end' | 'between';
}

/** The card's actions, in a wrapping row at the end. */
export const CardFooter = /* @__PURE__ */ component<HTMLDivElement, CardFooterProps>("CardFooter", function CardFooter(props, ref) {
  const rest = omit(props, { justify: 1, className: 1 });
  const j = oneOf(["start", "end", "between"] as const, props.justify, "end");
  return <div {...rest} ref={ref} className={cn("dk-card__footer", j !== "end" && "dk-card__footer--" + j, props.className)} />;
});
