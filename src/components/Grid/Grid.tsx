import * as React from 'react';
import { cn, oneOf, omit } from '../../internal/cn';
import { atWidths, space, WIDTHS, type ByWidth, type Responsive, type Space } from '../../internal/space';
import { named } from '../../internal/component';

export interface GridProps extends React.HTMLAttributes<HTMLElement> {
  /** A number of equal columns (1 to 12), or 'auto' (default): as many columns as fit, each at least minColumnWidth.
      A number with minColumnWidth is "up to": that many on a wide screen, fewer as columns would get narrower than minColumnWidth.
      Or a number per screen width, such as { base: 1, sm: 2, lg: 4 }: one column on a phone, two from 640px, four from 1024px. */
  columns?: number | 'auto' | GridColumns | undefined;
  /** The narrowest a column gets, a CSS length or a sizing token name ('container-3xs'). Default: 256px (container-3xs) with columns="auto"; none with a number. */
  minColumnWidth?: string | undefined;
  /** With columns="auto" or "up to": a short last row's cells stretch across the empty columns (auto-fit), so two cards on a wide screen share the width. Default: false (empty columns stay, so cells line up with the rows above). */
  fill?: boolean | undefined;
  /** The space between cells, a step of the spacing scale, or one per screen width ({ base: 3, md: 6 }). Default: 4 (16px). */
  gap?: Space | ByWidth<Space> | undefined;
  /** The element. Default: 'div'. */
  as?: 'div' | 'section' | 'ul' | 'ol' | undefined;
}

/** Grid's columns per screen width: { base, sm, md, lg } (from 640, 768 and 1024px up; each holds until the next one set). */
export interface GridColumns { base?: number | undefined; sm?: number | undefined; md?: number | undefined; lg?: number | undefined }

const TAGS = ['div', 'section', 'ul', 'ol'] as const;
const GAP = 'var(--grid-gap, var(--spacing-4))';
const count = (c: unknown) => { const n = typeof c === 'number' ? Math.round(c) : 0; return n >= 1 && n <= 12 ? n : 0; };

function GridRender({ ref, ...props }: GridProps & React.RefAttributes<HTMLElement>) {
  const rest = omit(props, { columns: 1, minColumnWidth: 1, fill: 1, gap: 1, as: 1, className: 1, style: 1 });
  const map = atWidths<number>(props.columns as Responsive<number> | undefined);
  const cols = map ? count(map.base) || 1 : count(props.columns);
  const vars: Record<string, string> = {};
  const widths: string[] = [];
  // Per width: the value at each width in --dk-grid-<prop>-<width>, which Grid.css's media queries pick from.
  if (map) {
    vars['--dk-grid-cols-base'] = String(cols);
    for (const w of WIDTHS) vars['--dk-grid-cols-' + w] = String(count(map[w]) || cols);
    widths.push('dk-grid--cols');
  } else if (cols) vars['--dk-grid-cols'] = String(cols);
  const gaps = atWidths(props.gap);
  if (gaps) {
    vars['--dk-grid-gap-base'] = space(gaps.base) || GAP;
    for (const w of WIDTHS) vars['--dk-grid-gap-' + w] = space(gaps[w]) || GAP;
    widths.push('dk-grid--gaps');
  } else {
    const gap = space(props.gap);
    if (gap) vars['--dk-grid-gap'] = gap;
  }
  const kind = !cols ? 'auto' : props.minColumnWidth ? 'upto' : 'fixed';
  if (props.minColumnWidth) vars['--dk-grid-min'] = /^[a-z][a-z0-9-]*$/.test(props.minColumnWidth) ? 'var(--' + props.minColumnWidth + ')' : props.minColumnWidth;
  const tag = oneOf(TAGS, props.as, 'div');
  // role="list": Safari drops list semantics from a <ul>/<ol> styled list-style: none, so VoiceOver stops saying "list, 6 items" (FU1).
  return React.createElement(tag, Object.assign(rest, {
    ref: ref, 'data-component': 'grid', role: rest.role ?? (tag === 'ul' || tag === 'ol' ? 'list' : undefined), className: cn('dk-grid', 'dk-grid--' + kind, props.fill && kind !== 'fixed' && 'dk-grid--fill', widths.join(' '), props.className),
    style: Object.assign(vars, props.style),
  }));
}

/* Grid: equal columns (columns={3}), as many as fit (columns="auto", each at least minColumnWidth), or up to a
   number (columns={3} with minColumnWidth: three, fewer as they'd get narrower), with gap from the spacing scale. A column never gets wider than the grid. className, style and every other prop go
   to the element. */
/** Equal columns, or as many as fit, with even space from the spacing scale between cells. */
export const Grid = /* @__PURE__ */ named('Grid', GridRender);
