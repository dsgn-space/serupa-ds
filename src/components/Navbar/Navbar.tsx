'use client';
import * as React from 'react';
import { cn, domId, oneOf, omit, useMergedRef, useIsoLayoutEffect } from '../../internal/cn';
import { useBreakpoint } from '../../internal/media';
import { config } from '../../internal/config';
import { Icon } from '../Icon/Icon';
import { IconButton } from '../IconButton/IconButton';
import type { ContainerSize } from '../Container/Container';
import { named } from '../../internal/component';
import { isComposing } from '../../internal/ime';
import { flattenChildren } from '../../internal/children';
import { useSettings } from '../../internal/provider';
import * as icons from '../../material/builtin';
import { activeIn } from '../../internal/root';
import { useCloseWatcher } from '../../internal/closeWatcher';
import { TruncatedText } from '../TruncatedText/TruncatedText';
import { onFontsLoaded } from '../../internal/fontsLoaded';

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  /** The logo or product name on the left, usually a link home. */
  brand?: React.ReactNode | undefined;
  /** NavbarLinks: the main pages. Below 768px, or when they don't fit beside the brand and the actions, they fold into a menu button. */
  children?: React.ReactNode | undefined;
  /** Controls on the right: a search, a user menu, a sign-in button. */
  actions?: React.ReactNode | undefined;
  /** Keeps the bar at the top while the page scrolls, and keeps what the keyboard focuses (or a #link jumps to)
   *  from scrolling under it. Default: false. */
  sticky?: boolean | undefined;
  /** On a sticky bar, the bar condenses to 48px (--navbar-height-condensed) as the page scrolls under it: its lower
   *  edge goes up with the page, then stays, and what's in it stays centered. Where scroll-driven animations aren't
   *  supported (Firefox), the bar keeps its height. Default: false. */
  condense?: boolean | undefined;
  /** The content's maximum width, like Container: 'prose', 'md', 'lg', 'xl' (default), '2xl' or 'full'. */
  size?: ContainerSize | undefined;
  /** The links' nav name. Default: "Main". */
  'aria-label'?: string | undefined;
  /** The menu button's name on small screens. Default: "Menu". */
  menuLabel?: string | undefined;
}

/** NavbarLink's own props, beside those of the element it renders. */
export interface NavbarLinkOwnProps {
  /** The current page: shaded, with a bar in the primary color and aria-current="page". Default: false. */
  active?: boolean | undefined;
}

/** NavbarLink's props: its own, `as`, and the props of the element `as` names (an <a>'s by default), so
 *  <NavbarLink as={RouterLink} to="/team"> takes RouterLink's `to`, and its ref is that element's. */
export type NavbarLinkProps<C extends React.ElementType = 'a'> = NavbarLinkOwnProps & {
  /** What renders the link: your router's link component. Default: the link set with configure({ link }), else 'a'. */
  as?: C | undefined;
} & Omit<React.ComponentPropsWithoutRef<C>, keyof NavbarLinkOwnProps | 'as'>;

/** NavbarMenu's own props, beside a <div>'s. */
export interface NavbarMenuProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** The button's text: what its links are about ("Products"). */
  label: React.ReactNode;
  /** NavbarMenuGroups, each a titled list of links, or NavbarMenuLinks on their own. */
  children?: React.ReactNode | undefined;
  /** The current page is one of its links: the button is shaded and barred as the current page's link is, with aria-current="true". Default: false. */
  active?: boolean | undefined;
}
/** NavbarMenuGroup's own props, beside a <div>'s. */
export interface NavbarMenuGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** The group's title above its links ("Analytics"), which also names the group. */
  title: React.ReactNode;
  /** NavbarMenuLinks. */
  children?: React.ReactNode | undefined;
}
/** NavbarMenuLink's own props, beside those of the element it renders. */
export interface NavbarMenuLinkOwnProps {
  /** The current page: shaded, with a bar in the primary color and aria-current="page". Default: false. */
  active?: boolean | undefined;
  /** A line under the link's text saying what's there; read after its name, as its description. */
  description?: React.ReactNode | undefined;
}
/** NavbarMenuLink's props: its own, `as`, and the props of the element `as` names (an <a>'s by default). */
export type NavbarMenuLinkProps<C extends React.ElementType = 'a'> = NavbarMenuLinkOwnProps & {
  /** What renders the link: your router's link component. Default: the link set with configure({ link }), else 'a'. */
  as?: C | undefined;
} & Omit<React.ComponentPropsWithoutRef<C>, keyof NavbarMenuLinkOwnProps | 'as'>;

type MenuUpdate = (was: string | null) => string | null;
const WIDTHS = ['prose', 'md', 'lg', 'xl', '2xl', 'full'] as const;
const NavbarContext = /* @__PURE__ */ React.createContext<{ close: () => void; menu: string | null; setMenu: (u: MenuUpdate) => void; size: ContainerSize } | null>(null);

function NavbarRender({ ref, ...props }: NavbarProps & React.RefAttributes<HTMLElement>) {
  const sds = useSettings();
  const rest = omit(props, { brand: 1, children: 1, actions: 1, sticky: 1, condense: 1, size: 1, menuLabel: 1, className: 1, 'aria-label': 1, onKeyDown: 1, onBlur: 1 });
  const [open, setOpen] = React.useState(false);
  // Read once: called through props, they could change props (and size) for the React Compiler.
  const { onKeyDown: onKeyDownProp, onBlur: onBlurProp } = props;
  // The NavbarMenu whose panel is open: one at a time.
  const [menu, setMenu] = React.useState<string | null>(null);
  // Closing, the panel stays after the menu button until it has faded out, then goes back between brand and actions.
  const [leaving, setLeaving] = React.useState(false);
  const panel = React.useRef<HTMLElement | null>(null);
  const [was, setWas] = React.useState(open);
  if (was !== open) { setWas(open); setLeaving(!open); }
  const toggle = React.useRef<HTMLButtonElement>(null);
  const bar = React.useRef<HTMLElement | null>(null);
  const id = domId('dk-nav', React.useId());
  const size = oneOf(WIDTHS, String(props.size), 'xl');   // String(): a plain string for the compiler, so ctx's memo holds
  const links = flattenChildren(props.children);
  const hasLinks = links.length > 0;
  const close = React.useCallback(() => { setOpen(false); setMenu(null); }, [setOpen, setMenu]);
  const ctx = React.useMemo(() => ({ close, menu, setMenu, size }), [close, menu, size]);
  /* Sticky: the page's scroll-padding-top follows the bar's height (Navbar.css), so a field Tab reaches, or the
     target of a #link, scrolls into view below the bar instead of under it (WCAG 2.4.11 Focus Not Obscured). */
  useIsoLayoutEffect(() => {
    const h = bar.current;
    if (!props.sticky || !h) return;
    const root = document.documentElement;
    const set = () => root.style.setProperty('--srp-navbar-offset', h.getBoundingClientRect().height + 'px');
    set();
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(set) : null;
    if (ro) ro.observe(h);
    // Safari doesn't always take the whole scroll-padding when it scrolls a focused field into view, and leaves a few
    // pixels of it under the bar. After the browser's own focus scroll, the page moves by what's still covered. Not for
    // a field in a dialog or popover: those sit above the page, not under the bar.
    let raf = 0;
    const onFocus = (e: FocusEvent) => {
      // The field itself, also inside a shadow root (where the event's target is the shadow host) (GR95).
      const t = typeof e.composedPath === 'function' ? e.composedPath()[0] : e.target;
      if (!(t instanceof Element) || h.contains(t) || t.closest('dialog, [popover]')) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (activeIn(t) !== t) return;
        // Still out of the window altogether, the browser never scrolled to it: the caller asked it not to
        // (focus({ preventScroll: true })), say to glide there itself. Only Safari leaves a shadow root's field there.
        const r = t.getBoundingClientRect();
        if (!(t.getRootNode() instanceof ShadowRoot) && (r.top >= window.innerHeight || r.bottom <= 0)) return;
        // Safari doesn't scroll a field focused inside a shadow root into view at all: below the window, it comes up.
        const below = t.getBoundingClientRect().bottom - window.innerHeight;
        if (below > 0) window.scrollBy(0, below);
        const covered = h.getBoundingClientRect().bottom - t.getBoundingClientRect().top;
        if (covered > 0) window.scrollBy(0, -covered);
      });
    };
    document.addEventListener('focusin', onFocus);
    return () => { if (ro) ro.disconnect(); cancelAnimationFrame(raf); document.removeEventListener('focusin', onFocus); root.style.removeProperty('--srp-navbar-offset'); };
  }, [props.sticky]);
  const wide = useBreakpoint('md');
  /* Wider than 768px the links still fold behind the menu button when they don't fit between the brand and the
     actions (seven links, long German labels), rather than run under the actions. Measured: the links' row against
     the room it has. Folded, it remembers how wide the bar had to be, and unfolds once it is that wide again. A font
     that loads late measures again from unfolded, before paint. */
  const [fold, setFold] = React.useState(false);
  const need = React.useRef(0);
  const linkCount = links.length;
  useIsoLayoutEffect(() => {
    const h = bar.current, inner = h && h.firstElementChild as HTMLElement | null;
    if (!wide || !linkCount || !inner) { setFold(false); return; }
    const nav = inner.querySelector<HTMLElement>(':scope > .dk-navbar__nav');
    // The effect runs again after each fold and unfold, so a local copy is as new as the state.
    let now = fold;
    const set = (to: boolean) => { now = to; setFold(to); };
    const check = () => {
      const row = nav && nav.firstElementChild as HTMLElement | null, over = nav && row ? row.scrollWidth - nav.clientWidth : 0;
      if (!now) { if (over > 0.5) { need.current = inner.clientWidth + over; set(true); } }
      else if (inner.clientWidth >= need.current) set(false);
    };
    check();
    // The bar's width, and the room the actions leave the links (an avatar that loads, a wider label).
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(check) : null;
    if (ro) { ro.observe(inner); if (nav) ro.observe(nav); }
    const stop = onFontsLoaded(() => { if (now) set(false); else check(); });
    return () => { if (ro) ro.disconnect(); stop(); };
    // Again after each fold and unfold (unfolded, the row is measured on the new layout, before paint), and when the
    // links move into the open panel and back: that's another element.
  }, [wide, linkCount, fold, open || leaving]);
  const folded = !wide || fold;
  // closes when the links unfold (the screen grows past the breakpoint, or they fit again), so it isn't open the next time
  // they fold; in this render, not an effect after
  if (!folded && open) setOpen(false);
  // Back on a phone closes the open menu, as Escape in it does, with focus back on the menu button unless it had gone
  // somewhere else on the page.
  useCloseWatcher(open, () => {
    setOpen(false);
    const a = document.activeElement;
    if (toggle.current && (!a || a === document.body || (bar.current && bar.current.contains(a)))) toggle.current.focus();
  });
  // A press outside the bar (on the page under the open panel) closes it, as a Popover does. Focus stays where the press puts it.
  React.useEffect(() => {
    if (!open) return;
    const on = (e: PointerEvent) => { if (bar.current && e.target instanceof Node && !bar.current.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', on, true);
    return () => document.removeEventListener('pointerdown', on, true);
  }, [open]);
  function onKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if (onKeyDownProp) onKeyDownProp(e);
    if (!e.defaultPrevented && e.key === 'Escape' && open && !isComposing(e)) { e.preventDefault(); setOpen(false); if (toggle.current) toggle.current.focus(); }
  }
  // Focus leaving the header (Tab past the last link, or into the page) closes the menu, as a Popover does.
  function onBlur(e: React.FocusEvent<HTMLElement>) {
    if (onBlurProp) onBlurProp(e);
    if (open && e.relatedTarget instanceof Node && !e.currentTarget.contains(e.relatedTarget)) setOpen(false);
  }
  // The fade out ends on transitionend; with nothing to fade (a wide screen, reduced motion) it goes back before paint,
  // and with no event, once the fade's time is up.
  useIsoLayoutEffect(() => {
    if (!leaving) return;
    const n = panel.current, s = n ? getComputedStyle(n) : null;
    const ms = s && s.display !== 'none' ? Math.max(...s.transitionDuration.split(',').map((d) => parseFloat(d) * (d.trim().endsWith('ms') ? 1 : 1000))) : 0;
    if (!(ms > 0)) { setLeaving(false); return; }
    const t = window.setTimeout(() => setLeaving(false), ms + 50);
    return () => window.clearTimeout(t);
  }, [leaving]);
  // While the small-screen menu is open, the links come after the menu button in the DOM, as they do on screen
  // (the panel opens under the bar), so Tab goes from the button into them. Closed, and on wide screens, they sit
  // between the brand and the actions.
  const nav = hasLinks ? (
    <nav ref={panel} id={id} aria-label={props['aria-label'] || sds.labels.mainNavigation} className={cn('srp-navbar__nav', leaving && 'srp-navbar__nav--leaving')} inert={leaving || undefined}
      onTransitionEnd={(e) => { if (e.target === e.currentTarget && e.propertyName === 'opacity' && !open) setLeaving(false); }}>
      <ul className="srp-navbar__links">{links.map((c, i) => <li key={React.isValidElement(c) && c.key != null ? c.key : i}>{c}</li>)}</ul>
    </nav>
  ) : null;
  const mergedRef = useMergedRef(ref, (n) => { bar.current = n; });
  return (
    <NavbarContext.Provider value={ctx}>
      <header {...rest} ref={mergedRef} onKeyDown={onKeyDown} onBlur={onBlur} data-component="navbar" data-state={open ? 'open' : 'closed'} data-fold={wide && fold ? '' : undefined} className={cn('srp-navbar', props.sticky && 'srp-navbar--sticky', props.sticky && props.condense && 'srp-navbar--condense', props.className)}>
        <div className={cn('srp-navbar__inner srp-container srp-container--padded', 'srp-container--' + size)}>
          {props.brand != null ? <div className="srp-navbar__brand">{typeof props.brand === 'string' || typeof props.brand === 'number' ? <TruncatedText>{String(props.brand)}</TruncatedText> : props.brand}</div> : null}
          {open || leaving ? null : nav}
          {props.actions != null ? <div className="srp-navbar__actions">{props.actions}</div> : null}
          {hasLinks ? (
            <IconButton ref={toggle} className="srp-navbar__toggle" icon={open ? icons.Close : icons.Menu} label={props.menuLabel || sds.labels.menu} hideTitle
              aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)} />
          ) : null}
          {open || leaving ? nav : null}
        </div>
      </header>
    </NavbarContext.Provider>
  );
}

/* Navbar: the bar across the top of an app: brand, the main links and actions. Below 768px the links fold
   into a menu button that opens them in a panel under the bar (Escape or a link closes it). className and
   every other prop go to the <header>. */
/** The bar across the top: brand, main links and actions. On small screens the links fold into a menu button. */
export const Navbar = /* @__PURE__ */ named('Navbar', NavbarRender);

function NavbarLinkBaseRender({ ref, ...props }: NavbarLinkProps & React.RefAttributes<HTMLAnchorElement>) {
  const ctx = React.useContext(NavbarContext);
  const rest = omit(props, { active: 1, as: 1, className: 1, onClick: 1 });
  const Tag = (props.as || config.link);   // JSX, not createElement, which the React Compiler skips with a ref
  return <Tag {...rest} ref={ref} aria-current={props.active ? 'page' : undefined}
    className={cn('dk-navbar__link', props.active && 'dk-navbar__link--active', props.className)}
    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => { if (props.onClick) props.onClick(e); if (ctx) ctx.close(); }} />;
}

/** A main page link in a Navbar. active marks the current page; following one closes the small-screen menu. */
const NavbarLinkBase = /* @__PURE__ */ named('NavbarLink', NavbarLinkBaseRender);

/** A main page link in a Navbar. active marks the current page; following one closes the small-screen menu. `as` renders your router's link, typed with its props. */
export const NavbarLink = NavbarLinkBase as {
  <C extends React.ElementType = 'a'>(props: NavbarLinkProps<C> & React.RefAttributes<React.ComponentRef<C>>): React.ReactElement | null;
  displayName?: string | undefined;
};

function NavbarMenuRender({ ref, ...props }: NavbarMenuProps & React.RefAttributes<HTMLDivElement>) {
  const ctx = React.useContext(NavbarContext);
  const rest = omit(props, { label: 1, children: 1, active: 1, className: 1 });
  const id = domId('srp-navbar-menu', React.useId());
  const [own, setOwn] = React.useState(false);
  const open = ctx ? ctx.menu === id : own;
  const set = React.useCallback((v: boolean) => { if (ctx) ctx.setMenu((was) => (v ? id : was === id ? null : was)); else setOwn(v); }, [ctx, id]);
  const root = React.useRef<HTMLDivElement | null>(null);
  const button = React.useRef<HTMLButtonElement>(null);
  // While open: a press outside it closes it, as a Popover does (focus stays where the press puts it), and so does
  // focus leaving it. Escape in it closes this panel only, the small-screen menu around it stays open, and focus goes
  // back to the button. Listened for on the element, not through JSX handlers on a <div>.
  React.useEffect(() => {
    const el = root.current;
    if (!open || !el) return;
    const press = (e: PointerEvent) => { if (e.target instanceof Node && !el.contains(e.target)) set(false); };
    const leave = (e: FocusEvent) => { if (e.relatedTarget instanceof Node && !el.contains(e.relatedTarget)) set(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape' && !e.defaultPrevented && !isComposing(e)) { e.preventDefault(); set(false); button.current?.focus(); } };
    document.addEventListener('pointerdown', press, true);
    el.addEventListener('focusout', leave);
    el.addEventListener('keydown', key);
    return () => { document.removeEventListener('pointerdown', press, true); el.removeEventListener('focusout', leave); el.removeEventListener('keydown', key); };
  }, [open, set]);
  // Back closes this panel first (it opened after the small-screen menu around it), focus back on its button.
  useCloseWatcher(open, () => {
    set(false);
    const a = document.activeElement;
    if (!a || a === document.body || (root.current && root.current.contains(a))) button.current?.focus();
  });
  // Links on their own are one list; each NavbarMenuGroup is its own.
  const parts: React.ReactNode[] = [];
  let loose: React.ReactNode[] = [];
  const flush = () => {
    if (loose.length) parts.push(<ul key={'list' + parts.length} role="list" className="srp-navbar__menu-list">{loose.map((c, i) => <li key={React.isValidElement(c) && c.key != null ? c.key : i}>{c}</li>)}</ul>);
    loose = [];
  };
  for (const c of flattenChildren(props.children)) {
    if (React.isValidElement(c) && c.type === NavbarMenuGroup) { flush(); parts.push(c); } else loose.push(c);
  }
  flush();
  const mergedRef2 = useMergedRef(ref, (n) => { root.current = n; });
  return (
    <div {...rest} ref={mergedRef2} data-state={open ? 'open' : 'closed'} className={cn('srp-navbar__menu', props.className)}>
      <button ref={button} type="button" className={cn('srp-navbar__link srp-navbar__menu-button', props.active && 'srp-navbar__link--active')}
        // active: the current page is in this section, so it's the current item of the bar (1.3.1, GR297).
        aria-current={props.active ? 'true' : undefined} aria-expanded={open} aria-controls={id} onClick={() => set(!open)}>
        {props.label}<Icon icon={icons.ExpandMore} className="srp-navbar__chevron" />
      </button>
      <div id={id} className="srp-navbar__menu-panel" hidden={!open}>
        <div className={cn('srp-navbar__menu-inner srp-container srp-container--padded', 'srp-container--' + (ctx ? ctx.size : 'xl'))}>{parts}</div>
      </div>
    </div>
  );
}

/* NavbarMenu: a nav item that opens a panel of links, grouped under titles, each with a line saying what's there
   (a mega menu). It's a disclosure, not a menu (role=menu is for app commands): a button with aria-expanded, and
   the panel after it, so Tab goes from the button into its links. Escape closes it and puts focus back on the button;
   a press outside, focus leaving it, following a link or opening another one closes it too. Wide, the panel spans
   the bar under it; in the small-screen menu it opens in place, under its button. */
/** A nav item that opens a panel of grouped links with descriptions (a disclosure, not role=menu). */
export const NavbarMenu = /* @__PURE__ */ named('NavbarMenu', NavbarMenuRender);

function NavbarMenuGroupRender({ ref, ...props }: NavbarMenuGroupProps & React.RefAttributes<HTMLDivElement>) {
  const rest = omit(props, { title: 1, children: 1, className: 1 });
  const id = domId('srp-navbar-group', React.useId());
  return (
    <div {...rest} ref={ref} role="group" aria-labelledby={id} className={cn('srp-navbar__menu-group', props.className)}>
      <div id={id} className="srp-navbar__menu-title">{props.title}</div>
      <ul role="list" className="srp-navbar__menu-list">{flattenChildren(props.children).map((c, i) => <li key={React.isValidElement(c) && c.key != null ? c.key : i}>{c}</li>)}</ul>
    </div>
  );
}

/** A titled list of links in a NavbarMenu's panel. */
export const NavbarMenuGroup = /* @__PURE__ */ named('NavbarMenuGroup', NavbarMenuGroupRender);

function NavbarMenuLinkBaseRender({ ref, ...props }: NavbarMenuLinkProps & React.RefAttributes<HTMLAnchorElement>) {
  const ctx = React.useContext(NavbarContext);
  const rest = omit(props, { active: 1, as: 1, className: 1, onClick: 1, description: 1, children: 1 });
  const id = domId('srp-navbar-link', React.useId());
  const has = props.description != null && props.description !== false && props.description !== '';
  const Tag = (props.as || config.link);   // JSX, as NavbarLink
  return <Tag {...rest} ref={ref} aria-current={props.active ? 'page' : undefined}
    aria-labelledby={has ? id + '-name' : undefined} aria-describedby={has ? id + '-desc' : undefined}
    className={cn('dk-navbar__menu-link', props.active && 'dk-navbar__menu-link--active', props.className)}
    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => { if (props.onClick) props.onClick(e); if (ctx) ctx.close(); }}>
    <span id={id + '-name'} className="dk-navbar__menu-name">{props.children}</span>
    {has ? <span id={id + '-desc'} className="dk-navbar__menu-desc">{props.description}</span> : null}
  </Tag>;
}

/* NavbarMenuLink: its text is its name and its description is read after it (aria-describedby), so a screen reader
   hears "Dashboards, link" and then what's there, not both as one long name. */
const NavbarMenuLinkBase = /* @__PURE__ */ named('NavbarMenuLink', NavbarMenuLinkBaseRender);

/** A link in a NavbarMenu's panel, with an optional line under it saying what's there. `as` renders your router's link, typed with its props. */
export const NavbarMenuLink = NavbarMenuLinkBase as {
  <C extends React.ElementType = 'a'>(props: NavbarMenuLinkProps<C> & React.RefAttributes<React.ComponentRef<C>>): React.ReactElement | null;
  displayName?: string | undefined;
};
