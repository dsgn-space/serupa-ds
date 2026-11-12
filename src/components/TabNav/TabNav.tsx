'use client';
import * as React from 'react';
import { cn, oneOf, omit } from '../../internal/cn';
import { config } from '../../internal/config';
import { component } from '../../internal/component';
import type { IconSource } from '../Icon/Icon';
import { asIcon } from '../Icon/asIcon';
import type { TabsVariant } from '../Tabs/Tabs';
import { useTabRow } from '../Tabs/tabRow';

export interface TabNavProps extends React.HTMLAttributes<HTMLElement> {
  /** 'line' (default): a line under the current page's tab. 'pill': its tab filled in primary. As on Tabs. */
  variant?: TabsVariant | undefined;
  /** 'sm' (32px tabs), 'md' (36px, default) or 'lg' (44px with 16px text, the touch-target size). As on Tabs. */
  size?: 'sm' | 'md' | 'lg' | undefined;
}

// The current link's href, found in the children while rendering, so the row scrolls it into view when it changes.
// Links inside a component of your own aren't seen: the row still shows the current one as it mounts.
function currentHref(children: React.ReactNode): string | null {
  let found: string | null = null;
  React.Children.forEach(children, (c) => {
    if (found != null || !React.isValidElement(c)) return;
    const p = c.props as { current?: boolean; href?: string; children?: React.ReactNode };
    if (c.type === TabNavLink) { if (p.current) found = String(p.href); return; }
    found = currentHref(p.children);
  });
  return found;
}

/* TabNav: moves between the sub-pages of one thing (Overview, Activity, Settings), each at its own URL. It looks like
   Tabs, from Tabs' classes and tokens, but it's a nav of links: aria-current="page" marks where you are, Tab moves
   between them, and Enter follows one, as on any link. No tablist roles or arrow keys: those promise panels on this
   page. When the links don't fit, the row scrolls with the edge fading, as Tabs' does, and the current one is shown. */
/** Moves between the sub-pages of one thing, each at its own URL: a nav of links that looks like Tabs.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const TabNav = /* @__PURE__ */ component<HTMLElement, TabNavProps>('TabNav', function TabNav(props, ref) {
  const rest = omit(props, { variant: 1, size: 1, className: 1, children: 1 });
  const variant = oneOf(['line', 'pill'] as const, props.variant, 'line');
  const size = oneOf(['sm', 'md', 'lg'] as const, props.size, 'md');
  const [list, fade] = useTabRow<HTMLUListElement>('.dk-tabs__tab', '.dk-tabs__tab[aria-current="page"]', false, currentHref(props.children));
  return (
    <nav {...rest} ref={ref} className={cn('dk-tabs', 'dk-tabs--' + variant, size !== 'md' && 'dk-tabs--' + size, 'dk-tab-nav', props.className)} data-component="tab-nav" data-variant={variant}>
      <ul ref={list} className="dk-tabs__list dk-tab-nav__list" data-fade-before={fade.before ? '' : undefined} data-fade-after={fade.after ? '' : undefined}>
        {props.children}
      </ul>
    </nav>
  );
});

/** TabNavLink's own props, beside those of the element it renders. */
export interface TabNavLinkOwnProps {
  /** This link is the page you're on: aria-current="page", drawn as the selected tab. Give it to one link. */
  current?: boolean | undefined;
  /** An icon before the label: an icon name or any element. */
  icon?: IconSource | undefined;
}

/** TabNavLink's props: its own, `as`, and the props of the element `as` names (an <a>'s by default). */
export type TabNavLinkProps<C extends React.ElementType = 'a'> = TabNavLinkOwnProps & {
  /** What renders the link: your router's link component. Default: the link set with configure({ link }), else 'a'. */
  as?: C | undefined;
} & Omit<React.ComponentPropsWithoutRef<C>, keyof TabNavLinkOwnProps | 'as'>;

/* One link in a TabNav, in a list item. className and every other prop go to the link. */
const TabNavLinkBase = /* @__PURE__ */ component<HTMLAnchorElement, TabNavLinkProps>('TabNavLink', function TabNavLink(props, ref) {
  const rest = omit(props, { current: 1, icon: 1, as: 1, className: 1, children: 1 });
  const attrs = Object.assign(rest, {
    ref,
    'aria-current': props.current ? 'page' : undefined,
    'data-state': props.current ? 'active' : 'inactive',
    className: cn('dk-tabs__tab', props.className),
  });
  return (
    <li className="dk-tab-nav__item">
      {React.createElement(props.as || config.link, attrs,
        props.icon != null ? <span className="dk-tabs__icon" aria-hidden="true">{asIcon(props.icon)}</span> : null,
        <span className="dk-tabs__label">{props.children}</span>)}
    </li>
  );
});

/** One link in a TabNav. current marks the page you're on. `as` renders your router's link, typed with its props. */
export const TabNavLink = TabNavLinkBase as {
  <C extends React.ElementType = 'a'>(props: TabNavLinkProps<C> & { ref?: React.Ref<React.ComponentRef<C>> }): React.ReactElement | null;
  displayName?: string | undefined;
};
