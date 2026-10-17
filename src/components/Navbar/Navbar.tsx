import * as React from "react";
import { cn, domId, oneOf, omit } from "../../internal/cn";
import { IconButton } from "../IconButton/IconButton";
import type { ContainerSize } from "../Container/Container";

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  /** The logo or product name on the left, usually a link home. */
  brand?: React.ReactNode;
  /** NavbarLinks: the main pages. Below 768px they fold into a menu button. */
  children?: React.ReactNode;
  /** Controls on the right: a search, a user menu, a sign-in button. */
  actions?: React.ReactNode;
  /** Keeps the bar at the top while the page scrolls. Default: false. */
  sticky?: boolean;
  /** The content's maximum width, like Container: 'md', 'lg', 'xl' (default), '2xl' or 'full'. */
  size?: ContainerSize;
  /** The links' nav name. Default: "Main". */
  "aria-label"?: string;
  /** The menu button's name on small screens. Default: "Menu". */
  menuLabel?: string;
}

export interface NavbarLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** The current page: shaded, with aria-current="page". Default: false. */
  active?: boolean;
  /** What renders the link: 'a' (default), or your router's link component. */
  as?: React.ElementType;
}

const NavbarContext = React.createContext<{ close: () => void } | null>(null);

/* Navbar: the bar across the top of an app: brand, the main links and actions. Below 768px the links fold
   into a menu button that opens them in a panel under the bar (Escape or a link closes it). className and
   every other prop go to the <header>. */
/** The bar across the top: brand, main links and actions. On small screens the links fold into a menu button. */
export const Navbar = React.forwardRef<HTMLElement, NavbarProps>(function Navbar(props, ref) {
  const rest = omit(props, { brand: 1, children: 1, actions: 1, sticky: 1, size: 1, menuLabel: 1, className: 1, "aria-label": 1, onKeyDown: 1 });
  const [open, setOpen] = React.useState(false);
  const toggle = React.useRef<HTMLButtonElement>(null);
  const id = domId("dk-nav", React.useId());
  const size = oneOf(["prose", "md", "lg", "xl", "2xl", "full"] as const, props.size, "xl");
  const hasLinks = React.Children.count(props.children) > 0;
  const close = React.useCallback(() => setOpen(false), []);
  // closes when the screen grows past the breakpoint, so it isn't open the next time it shrinks
  React.useEffect(() => {
    if (!open || typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const on = () => { if (mq.matches) setOpen(false); };
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [open]);
  function onKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if (props.onKeyDown) props.onKeyDown(e);
    if (!e.defaultPrevented && e.key === "Escape" && open) { e.preventDefault(); setOpen(false); if (toggle.current) toggle.current.focus(); }
  }
  return (
    <NavbarContext.Provider value={{ close }}>
      <header {...rest} ref={ref} onKeyDown={onKeyDown} data-component="navbar" data-state={open ? "open" : "closed"} className={cn("dk-navbar", props.sticky && "dk-navbar--sticky", props.className)}>
        <div className={cn("dk-navbar__inner dk-container dk-container--padded", "dk-container--" + size)}>
          {props.brand != null ? <div className="dk-navbar__brand">{props.brand}</div> : null}
          {hasLinks ? (
            <nav id={id} aria-label={props["aria-label"] || "Main"} className="dk-navbar__nav">
              <ul className="dk-navbar__links">{React.Children.map(props.children, (c) => c == null || c === false ? null : <li>{c}</li>)}</ul>
            </nav>
          ) : null}
          {props.actions != null ? <div className="dk-navbar__actions">{props.actions}</div> : null}
          {hasLinks ? (
            <IconButton ref={toggle} className="dk-navbar__toggle" icon={open ? "close" : "menu"} label={props.menuLabel || "Menu"} noTitle
              aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)} />
          ) : null}
        </div>
      </header>
    </NavbarContext.Provider>
  );
});
Navbar.displayName = "Navbar";

/** A main page link in a Navbar. active marks the current page; following one closes the small-screen menu. */
export const NavbarLink = React.forwardRef<HTMLAnchorElement, NavbarLinkProps>(function NavbarLink(props, ref) {
  const ctx = React.useContext(NavbarContext);
  const rest: Record<string, any> = omit(props, { active: 1, as: 1, className: 1, onClick: 1 });
  return React.createElement(props.as || "a", Object.assign(rest, {
    ref: ref, "aria-current": props.active ? "page" : undefined,
    className: cn("dk-navbar__link", props.active && "dk-navbar__link--active", props.className),
    onClick: (e: React.MouseEvent<HTMLAnchorElement>) => { if (props.onClick) props.onClick(e); if (ctx) ctx.close(); },
  }));
});
NavbarLink.displayName = "NavbarLink";
