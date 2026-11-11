'use client';
import * as React from 'react';
import { cn, omit } from '../../internal/cn';
import { component } from '../../internal/component';
import { config } from '../../internal/config';
import { asIcon } from '../Icon/asIcon';
import type { IconSource } from '../Icon/Icon';

export interface BottomNavProps extends React.HTMLAttributes<HTMLElement> {
  /** The navigation's name for screen readers ("Main"), so it's told apart from the Navbar and other landmarks. */
  label: string;
  /** From which width up it hides, when the Navbar or a Sidebar takes over: 'sm' (640px), 'md' (768px, the
   *  default, where Navbar shows its links), 'lg' (1024px), or false to show it at every width. */
  hideFrom?: 'sm' | 'md' | 'lg' | false | undefined;
  /** Three to five BottomNavLink elements. */
  children?: React.ReactNode;
}

/* BottomNav: a <nav> fixed along the bottom edge on phones, its links side by side in equal columns, an icon over a
   short label in each. The bar adds env(safe-area-inset-bottom) under its links, leaves the same room at the end of
   the page with a spacer, and while it shows, puts its height in --dk-bottom-nav-space so a bottom Toaster,
   OfflineBanner and Fab sit above it and scrolling into view clears it. className and other props go to the <nav>. */
/** A bar of three to five main destinations along the bottom of a phone screen.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const BottomNav = /* @__PURE__ */ component<HTMLElement, BottomNavProps>('BottomNav', function BottomNav(props, ref) {
  const { className, label, hideFrom = 'md', children, ...rest } = props;
  const hide = hideFrom ? `dk-bottom-nav--hide-${hideFrom}` : 'dk-bottom-nav--always';
  return (
    <>
      <div className={cn('dk-bottom-nav__spacer', hide)} aria-hidden="true" />
      <nav {...rest} ref={ref} aria-label={label} className={cn('dk-bottom-nav', hide, className)} data-component="bottom-nav">
        <ul className="dk-bottom-nav__list">{React.Children.map(children, (c) => (c == null || c === false ? null : <li className="dk-bottom-nav__item">{c}</li>))}</ul>
      </nav>
    </>
  );
});

/** BottomNavLink's own props, beside those of the element it renders. */
export interface BottomNavLinkOwnProps {
  /** The icon over the label: an icon name (Material Symbols) or element. */
  icon: IconSource;
  /** The current page: in the brand color, with aria-current="page". Default: false. */
  active?: boolean | undefined;
  /** The label: one or two short words. */
  children: React.ReactNode;
}

/** BottomNavLink's props: its own, `as`, and the props of the element `as` names (an <a>'s by default), so
 *  <BottomNavLink as={RouterLink} to="/inbox"> takes RouterLink's `to`, and its ref is that element's. */
export type BottomNavLinkProps<C extends React.ElementType = 'a'> = BottomNavLinkOwnProps & {
  /** What renders the link: your router's link component. Default: the link set with configure({ link }), else 'a'. */
  as?: C | undefined;
} & Omit<React.ComponentPropsWithoutRef<C>, keyof BottomNavLinkOwnProps | 'as'>;

const BottomNavLinkBase = /* @__PURE__ */ component<HTMLAnchorElement, BottomNavLinkProps>('BottomNavLink', function BottomNavLink(props, ref) {
  const rest = omit(props, { active: 1, as: 1, className: 1, icon: 1, children: 1 });
  return React.createElement(props.as || config.link, Object.assign(rest, {
    ref: ref, 'aria-current': props.active ? 'page' : undefined,
    className: cn('dk-bottom-nav__link', props.active && 'dk-bottom-nav__link--active', props.className),
  }), <span className="dk-bottom-nav__icon" aria-hidden="true">{asIcon(props.icon)}</span>, <span className="dk-bottom-nav__label">{props.children}</span>);
});

/** A destination in a BottomNav: an icon over a short label. active marks the current page. `as` renders your router's link, typed with its props. */
export const BottomNavLink = BottomNavLinkBase as {
  <C extends React.ElementType = 'a'>(props: BottomNavLinkProps<C> & { ref?: React.Ref<React.ComponentRef<C>> }): React.ReactElement | null;
  displayName?: string | undefined;
};
