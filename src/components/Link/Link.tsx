import * as React from "react";
import { cn, oneOf, omit } from "../../internal/cn";
import { Icon } from "../Icon/Icon";
import { VisuallyHidden } from "../VisuallyHidden/VisuallyHidden";

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** 'primary' (default): the primary color. 'neutral': the surrounding text's color, still underlined. */
  tone?: 'primary' | 'neutral';
  /** 'always' (default): underlined, so it's a link without relying on color. 'hover': only on hover and focus, for links whose place already says they're links (a nav bar, a footer). */
  underline?: 'always' | 'hover';
  /** Opens in a new tab (target="_blank", rel="noopener noreferrer"), with a new-tab icon and "(opens in a new tab)" for screen readers. Default: false. */
  external?: boolean;
  /** What renders the link: 'a' (default), or your router's link component (it gets href, className and the rest). */
  as?: React.ElementType;
}

/* Link: an inline text link, underlined, in the primary color or the surrounding text's. external opens a new
   tab and says so. `as` renders your router's link instead of an <a>. className and every other prop go to it. */
/** An inline text link: underlined, primary or the text's color. external opens a new tab and says so. */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(props, ref) {
  const rest = omit(props, { tone: 1, underline: 1, external: 1, as: 1, className: 1, children: 1 });
  const tone = oneOf(["primary", "neutral"] as const, props.tone, "primary");
  const underline = oneOf(["always", "hover"] as const, props.underline, "always");
  if (props.external) {
    if (rest.target == null) rest.target = "_blank";
    rest.rel = cn(rest.rel, "noopener noreferrer");
  }
  return React.createElement(props.as || "a", Object.assign(rest, {
    ref: ref, "data-component": "link",
    className: cn("dk-link", tone === "neutral" && "dk-link--neutral", underline === "hover" && "dk-link--hover-underline", props.className),
  }), props.children, props.external ? <>
    <Icon name="open_in_new" className="dk-link__icon" />
    <VisuallyHidden> (opens in a new tab)</VisuallyHidden>
  </> : null);
});
Link.displayName = "Link";
