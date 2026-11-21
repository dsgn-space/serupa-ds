import * as React from 'react';
import { cn, oneOf, omit } from '../../internal/cn';
import { space, type Space } from '../../internal/space';
import { named } from '../../internal/component';

export interface SidebarLayoutProps extends React.HTMLAttributes<HTMLElement> {
  /** The narrow column: filters, a list to pick from, a page's sections, a summary. */
  sidebar: React.ReactNode;
  /** The wide column: the page's content. */
  children?: React.ReactNode | undefined;
  /** Which side the narrow column is on: 'start' (default; left in a left-to-right language) or 'end'. It comes in that
      order in the HTML too, so the reading and Tab order match what people see. */
  sidebarPlacement?: 'start' | 'end' | undefined;
  /** The narrow column's width while the two sit side by side: a sizing token name ('container-3xs', 256px, the default;
      'container-2xs' 288px; 'container-xs' 320px) or a CSS length. */
  sidebarWidth?: string | undefined;
  /** The narrowest the wide column gets, as a percentage of the whole (1 to 99). Below it, the narrow column moves
      above (or below, with sidebarPlacement="end") and both take the full width. Default: 50. */
  contentMin?: number | undefined;
  /** The space between the columns, and between them once stacked, a step of the spacing scale. Default: 6 (24px). */
  gap?: Space | undefined;
  /** 'stretch' (default): both columns as tall as the taller one, for panels side by side. 'start': each its own height. */
  align?: 'stretch' | 'start' | undefined;
  /** The element. Default: 'div'. */
  as?: 'div' | 'section' | 'main' | 'article' | undefined;
}

const TAGS = ['div', 'section', 'main', 'article'] as const;

function SidebarLayoutRender({ ref, ...props }: SidebarLayoutProps & React.RefAttributes<HTMLElement>) {
  const rest = omit(props, { sidebar: 1, children: 1, sidebarPlacement: 1, sidebarWidth: 1, contentMin: 1, gap: 1, align: 1, as: 1, className: 1, style: 1 });
  const vars: Record<string, string> = {};
  const w = props.sidebarWidth;
  if (w) vars['--dk-sidebar-layout-side'] = /^[a-z][a-z0-9-]*$/.test(w) ? 'var(--' + w + ')' : w;
  const min = typeof props.contentMin === 'number' && props.contentMin >= 1 && props.contentMin <= 99 ? props.contentMin : 0;
  if (min) vars['--dk-sidebar-layout-min'] = min + '%';
  const gap = space(props.gap);
  if (gap) vars['--dk-sidebar-layout-gap'] = gap;
  const end = props.sidebarPlacement === 'end';
  const side = <div className="dk-sidebar-layout__side">{props.sidebar}</div>;
  const Tag = oneOf(TAGS, props.as, 'div') as 'div';
  return (
    <Tag {...rest} ref={ref as React.Ref<HTMLDivElement>} data-component="sidebar-layout"
      className={cn('dk-sidebar-layout', end && 'dk-sidebar-layout--end', props.align === 'start' && 'dk-sidebar-layout--align-start', props.className)}
      style={Object.keys(vars).length ? Object.assign(vars, props.style) : props.style}>
      {end ? null : side}
      <div className="dk-sidebar-layout__content">{props.children}</div>
      {end ? side : null}
    </Tag>
  );
}

/* SidebarLayout: a narrow column beside a wide one, which moves above it (or below) once the wide one would get
   narrower than contentMin of the whole. It follows the space it's in, not the screen, so it works in a Dialog or a
   Card as well as on a page. className, style and every other prop go to the element. */
/** A narrow column beside a wide one, stacking when the space gets too narrow for both.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const SidebarLayout = /* @__PURE__ */ named('SidebarLayout', SidebarLayoutRender);
