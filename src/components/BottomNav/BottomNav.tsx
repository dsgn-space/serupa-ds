'use client';
import * as React from 'react';
import { cn, omit } from '../../internal/cn';
import { named } from '../../internal/component';
import { config } from '../../internal/config';
import { asIcon } from '../Icon/asIcon';
import type { IconSource } from '../Icon/Icon';
import { TruncatedText } from '../TruncatedText/TruncatedText';

export interface BottomNavProps extends React.HTMLAttributes<HTMLElement> {
  /** The navigation's name for screen readers ("Main"), so it's told apart from the Navbar and other landmarks. */
  'aria-label': string;
  /** From which width up it hides, when the Navbar or a Sidebar takes over: 'sm' (640px), 'md' (768px, the
   *  default, where Navbar shows its links), 'lg' (1024px), or false to show it at every width. */
  hideFrom?: 'sm' | 'md' | 'lg' | false | undefined;
  /** Three to five BottomNavLink elements. */
  children?: React.ReactNode;
}

function BottomNavRender({ ref, ...props }: BottomNavProps & React.RefAttributes<HTMLElement>) {
  const { className, hideFrom: _hideFrom, children, ...rest } = props;
  const hideFrom = props.hideFrom ?? 'md';
  const hide = hideFrom ? `srp-bottom-nav--hide-${hideFrom}` : 'srp-bottom-nav--always';
  return (
    <>
      <div className={cn('srp-bottom-nav__spacer', hide)} aria-hidden="true" />
      <nav {...rest} ref={ref} className={cn('srp-bottom-nav', hide, className)} data-component="bottom-nav">
        <ul className="srp-bottom-nav__list">{React.Children.map(children, (c) => (c == null || c === false ? null : <li className="srp-bottom-nav__item">{c}</li>))}</ul>
      </nav>
    </>
  );
}

/* BottomNav: a <nav> fixed along the bottom edge on phones, its links side by side in equal columns, an icon over a
   short label in each. The bar adds env(safe-area-inset-bottom) under its links, leaves the same room at the end of
   the page with a spacer, and while it shows, puts its height in --srp-bottom-nav-space so a bottom Toaster,
   OfflineBanner and Fab sit above it and scrolling into view clears it. className and other props go to the <nav>. */
/** A bar of three to five main destinations along the bottom of a phone screen.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const BottomNav = /* @__PURE__ */ named('BottomNav', BottomNavRender);

/** BottomNavLink's own props, beside those of the element it renders. */
export interface BottomNavLinkOwnProps {
  /** The icon over the label: an icon name (Material Symbols) or element. */
  icon: IconSource;
  /** The current page: in the brand color, with aria-current="page". Default: false. */
  current?: boolean | undefined;
  /** The label: one or two short words. */
  children: React.ReactNode;
  /** A count or dot on the icon's top-end corner, such as <Badge count={4} /> for unread items. Screen readers read
   *  it after the link's name ("Inbox", then "4"). */
  badge?: React.ReactNode | undefined;
}

/** BottomNavLink's props: its own, `as`, and the props of the element `as` names (an <a>'s by default), so
 *  <BottomNavLink as={RouterLink} to="/inbox"> takes RouterLink's `to`, and its ref is that element's. */
export type BottomNavLinkProps<C extends React.ElementType = 'a'> = BottomNavLinkOwnProps & {
  /** What renders the link: your router's link component. Default: the link set with configure({ link }), else 'a'. */
  as?: C | undefined;
} & Omit<React.ComponentPropsWithoutRef<C>, keyof BottomNavLinkOwnProps | 'as'>;

function BottomNavLinkBaseRender({ ref, ...props }: BottomNavLinkProps & React.RefAttributes<HTMLAnchorElement>) {
  const rest = omit(props, { current: 1, as: 1, className: 1, icon: 1, children: 1, badge: 1 });
  // The badge sits in the icon's pill, which is hidden from screen readers with the icon; aria-describedby reads it
  // after the name, as Sidebar's rail does.
  const badgeId = React.useId(), badge = props.badge != null && props.badge !== false;
  if (badge) rest['aria-describedby'] = cn(rest['aria-describedby'], badgeId);
  const Tag = props.as || config.link;
  return <Tag {...rest} ref={ref} aria-current={props.current ? 'page' : undefined}
    className={cn('srp-bottom-nav__link', props.current && 'srp-bottom-nav__link--active', props.className)}><span className="srp-bottom-nav__icon" aria-hidden="true">{asIcon(props.icon)}{badge ? <span className="srp-bottom-nav__badge" id={badgeId}>{props.badge}</span> : null}</span>{typeof props.children === 'string' ? <TruncatedText className="srp-bottom-nav__label">{props.children}</TruncatedText> : <span className="srp-bottom-nav__label">{props.children}</span>}</Tag>;
}

const BottomNavLinkBase = /* @__PURE__ */ named('BottomNavLink', BottomNavLinkBaseRender);

/** A destination in a BottomNav: an icon over a short label. current marks the current page. `as` renders your router's link, typed with its props. */
export const BottomNavLink = BottomNavLinkBase as {
  <C extends React.ElementType = 'a'>(props: BottomNavLinkProps<C> & React.RefAttributes<React.ComponentRef<C>>): React.ReactElement | null;
  displayName?: string | undefined;
};
