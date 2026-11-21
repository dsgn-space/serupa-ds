import * as React from 'react';
import { cn, oneOf, omit } from '../../internal/cn';
import { named } from '../../internal/component';
import { SkipLink } from '../SkipLink/SkipLink';

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The bar across the top: a Navbar, sticky or not. */
  header?: React.ReactNode | undefined;
  /** Beside main, on the start side: a Sidebar. It stays put while the page scrolls, below a sticky Navbar. */
  sidebar?: React.ReactNode | undefined;
  /** The width the sidebar shows from: 'sm' 640px (default), 'md' 768px or 'lg' 1024px. Below it, it's gone, so put
      its links in the Navbar's menu or a BottomNav. */
  sidebarFrom?: 'sm' | 'md' | 'lg' | undefined;
  /** The page's content: it goes in main, which holds the page's one h1. */
  children?: React.ReactNode | undefined;
  /** Below main, beside the sidebar: its content goes in the page's <footer>, with a line above it, in small muted text. */
  footer?: React.ReactNode | undefined;
  /** A BottomNav for phones, last in the page. Give it hideFrom to match sidebarFrom. */
  bottomNav?: React.ReactNode | undefined;
  /** main's background. 'plain' (default) for a page people read or fill in; 'muted', a step below, for a page built
      from Cards or panels, so their edges stand off it. The header, sidebar and footer stay plain either way. */
  background?: 'plain' | 'muted' | undefined;
  /** Padding around main's content: 16px, 24px from 640px and 32px from 1024px. Default: true; false for content that brings its own. */
  padded?: boolean | undefined;
  /** A "Skip to content" link first in the page, which moves focus into main. Default: true. */
  skipLink?: boolean | undefined;
  /** main's id, the skip link's target. Default: "main". */
  mainId?: string | undefined;
}

function AppShellRender({ ref, ...props }: AppShellProps & React.RefAttributes<HTMLDivElement>) {
  const rest = omit(props, { header: 1, sidebar: 1, sidebarFrom: 1, children: 1, footer: 1, bottomNav: 1, background: 1, padded: 1, skipLink: 1, mainId: 1, className: 1 });
  const from = oneOf(['sm', 'md', 'lg'] as const, props.sidebarFrom, 'sm');
  const mainId = props.mainId || 'main';
  return (
    <div {...rest} ref={ref} data-component="app-shell" className={cn('dk-app-shell', props.background === 'muted' && 'dk-app-shell--muted', props.className)}>
      {props.skipLink === false ? null : <SkipLink target={mainId} />}
      {props.header}
      {props.sidebar == null ? null : <div className={'dk-app-shell__side dk-app-shell__side--from-' + from}>{props.sidebar}</div>}
      <main id={mainId} tabIndex={-1} className={cn('dk-app-shell__main', props.padded !== false && 'dk-app-shell__main--padded')}>{props.children}</main>
      {props.footer == null ? null : <footer className="dk-app-shell__footer">{props.footer}</footer>}
      {props.bottomNav == null ? null : <div className="dk-app-shell__bottom">{props.bottomNav}</div>}
    </div>
  );
}

/* AppShell: the frame around an app's pages. A skip link first, the header, the sidebar beside main and the footer
   (sticky, below a sticky Navbar, gone below sidebarFrom), main, the footer and a BottomNav, on the background the page's content calls
   for. className, style and every other prop go to the outer <div>. */
/** The frame around an app's pages: skip link, header, sidebar, main, footer and bottom navigation.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const AppShell = /* @__PURE__ */ named('AppShell', AppShellRender);
