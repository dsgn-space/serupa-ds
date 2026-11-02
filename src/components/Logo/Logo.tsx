"use client";
import * as React from "react";
import { cn, oneOf, setRef } from "../../internal/cn";
import { component } from "../../internal/component";
import { schemeOf, useThemeChanges } from "../../internal/scheme";

export type LogoSize = "sm" | "md" | "lg";

export interface LogoProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "children"> {
  /** The full logo (mark and name), drawn for a light background. */
  src: string;
  /** The brand's name, which a screen reader reads ("Acme"). Inside a link home, name the link instead ("Acme home")
   *  and pass alt="" here. */
  alt: string;
  /** The full logo drawn for a dark background: shown when the page's theme is dark (a *-dark data-theme or a
   *  data-mode), or, where the theme follows the screen, when the screen prefers dark. */
  darkSrc?: string;
  /** The small mark alone (a square symbol), for narrow spaces: shown when variant is 'mark', or 'auto' on a narrow screen. */
  markSrc?: string;
  /** The small mark drawn for a dark background. */
  markDarkSrc?: string;
  /** 'full' (default) shows the full logo; 'mark' the small mark; 'auto' the mark below the `collapseBelow` breakpoint
   *  and the full logo from there up. Without markSrc it is always the full logo. */
  variant?: "full" | "mark" | "auto";
  /** With variant 'auto', the screen width below which the mark shows: 'sm' (640px), 'md' (768px, default, where
   *  Navbar folds its links) or 'lg' (1024px). */
  collapseBelow?: "sm" | "md" | "lg";
  /** Its height: 'sm' (24px), 'md' (32px, default) or 'lg' (40px). The width follows the picture's shape. */
  size?: LogoSize;
}

const BELOW = { sm: "(max-width: 639.98px)", md: "(max-width: 767.98px)", lg: "(max-width: 1023.98px)" } as const;
// Two media conditions together; null is "never", "all" is "always".
function both(a: string | null, b: string | null): string | null {
  return a === null || b === null ? null : a === "all" ? b : b === "all" ? a : a + " and " + b;
}

/* Logo: the product's logo as a picture of a fixed height, with versions for a dark theme and a small mark for narrow
   spaces. A <picture> offers them as <source>s ahead of the full logo, so the browser fetches only the one it shows:
   the mark below a breakpoint (variant 'auto'), the dark version when the theme is dark. Which theme counts is read
   from the element's color-scheme in the browser, and from prefers-color-scheme on the server. It isn't a link: put
   it in the app's own link home (a router link, or <a href="/">). */
/** The product's logo: light and dark versions, and a small mark for narrow screens, at a set height.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const Logo = /* @__PURE__ */ component<HTMLImageElement, LogoProps>("Logo", function Logo(props, ref) {
  const { src, alt, darkSrc, markSrc, markDarkSrc, variant, collapseBelow, size, className, ...rest } = props;
  const img = React.useRef<HTMLImageElement | null>(null);
  const dark = !!(darkSrc || markDarkSrc);
  const themes = useThemeChanges(dark);
  const [scheme, setScheme] = React.useState<"light" | "dark" | null>(null);
  React.useEffect(() => { if (dark && img.current) setScheme(schemeOf(img.current)); }, [dark, themes]);
  const darkMedia = scheme === "dark" ? "all" : scheme === "light" ? null : "(prefers-color-scheme: dark)";
  const v = oneOf(["full", "mark", "auto"] as const, variant, "full");
  const mark = markSrc && v !== "full" ? (v === "mark" ? "all" : BELOW[oneOf(["sm", "md", "lg"] as const, collapseBelow, "md")]) : null;
  // In the order the browser tries them: the first whose media matches is shown.
  const sources: [string | undefined, string | null][] = [
    [markDarkSrc, both(mark, darkMedia)],
    [markSrc, mark === "all" ? null : mark],
    [darkSrc, mark === "all" ? null : darkMedia],
  ];
  const offered = sources.filter((s): s is [string, string] => !!s[0] && s[1] !== null);
  const picture = <img {...rest} ref={(n) => { img.current = n; setRef(ref, n); }} src={mark === "all" ? markSrc : src} alt={alt}
    className={cn("dk-logo", "dk-logo--" + oneOf(["sm", "md", "lg"] as const, size, "md"), className)} data-component="logo" />;
  return offered.length
    ? <picture className="dk-logo__picture">{offered.map(([s, media]) => <source key={s + media} srcSet={s} media={media} />)}{picture}</picture>
    : picture;
});
