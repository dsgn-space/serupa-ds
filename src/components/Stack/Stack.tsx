import * as React from 'react';
import { cn, oneOf, omit } from '../../internal/cn';
import { atWidths, space, WIDTHS, type ByWidth, type Space } from '../../internal/space';
import { named } from '../../internal/component';

export interface StackProps extends React.HTMLAttributes<HTMLElement> {
  /** 'column' (default): items one under another. 'row': side by side. Or one per screen width, such as
      { base: 'column', md: 'row' }: stacked on a phone, side by side from 768px up. */
  direction?: 'column' | 'row' | ByWidth<'column' | 'row'> | undefined;
  /** The space between items, a step of the spacing scale (4 → 16px), or one per screen width ({ base: 3, lg: 6 }). Default: 4. */
  gap?: Space | ByWidth<Space> | undefined;
  /** Cross-axis alignment: 'stretch' (default for columns), 'start', 'center' (default for rows), 'end' or 'baseline'.
      Or one per screen width; a width it leaves out follows that width's direction. */
  align?: 'stretch' | 'start' | 'center' | 'end' | 'baseline' | ByWidth<'stretch' | 'start' | 'center' | 'end' | 'baseline'> | undefined;
  /** Main-axis distribution: 'start' (default), 'center', 'end' or 'between'. */
  justify?: 'start' | 'center' | 'end' | 'between' | undefined;
  /** Lets a row wrap onto more lines. Default: false. */
  wrap?: boolean | undefined;
  /** The element. Default: 'div'. */
  as?: 'div' | 'section' | 'ul' | 'ol' | 'nav' | 'header' | 'footer' | 'form' | 'fieldset' | 'span' | undefined;
}

const TAGS = ['div', 'section', 'ul', 'ol', 'nav', 'header', 'footer', 'form', 'fieldset', 'span'] as const;
const ALIGNS = ['stretch', 'start', 'center', 'end', 'baseline'] as const;
const GAP = 'var(--stack-gap, var(--spacing-4))';

function StackRender({ ref, ...props }: StackProps & React.RefAttributes<HTMLElement>) {
  const rest = omit(props, { direction: 1, gap: 1, align: 1, justify: 1, wrap: 1, as: 1, className: 1, style: 1 });
  const dirs = atWidths(props.direction), aligns = atWidths(props.align), gaps = atWidths(props.gap);
  const dirAt = (d: unknown) => (d === 'row' ? 'row' : 'column');
  const alignAt = (a: unknown, d: string) => oneOf(ALIGNS, a, d === 'row' ? 'center' : 'stretch');
  const dir = dirAt(dirs ? dirs.base : props.direction);
  const align = alignAt(aligns ? aligns.base : props.align, dir);
  const row = dir === 'row';
  const justify = oneOf(['start', 'center', 'end', 'between'] as const, props.justify, 'start');
  // Per width: a class where the direction or alignment changes from the width before (Stack.css's media queries).
  const widths: string[] = [];
  const vars: Record<string, string> = {};
  if (dirs || aligns) {
    let d = dir, a = align;
    for (const w of WIDTHS) {
      const dw = dirAt(dirs ? dirs[w] : props.direction), aw = alignAt(aligns ? aligns[w] : props.align, dw);
      if (dw !== d) widths.push('dk-stack--' + w + '-' + dw);
      if (aw !== a) widths.push('dk-stack--' + w + '-align-' + aw);
      d = dw; a = aw;
    }
  }
  if (gaps) {
    vars['--dk-stack-gap-base'] = space(gaps.base) || GAP;
    for (const w of WIDTHS) vars['--dk-stack-gap-' + w] = space(gaps[w]) || GAP;
    widths.push('dk-stack--gaps');
  } else {
    const gap = space(props.gap);
    if (gap) vars['--dk-stack-gap'] = gap;
  }
  const tag = oneOf(TAGS, props.as, 'div');
  // role="list": Safari drops list semantics from a <ul>/<ol> styled list-style: none, so VoiceOver stops saying "list, 6 items" (FU1).
  return React.createElement(tag, Object.assign(rest, {
    ref: ref, 'data-component': 'stack', role: rest.role ?? (tag === 'ul' || tag === 'ol' ? 'list' : undefined),
    className: cn('dk-stack', row && 'dk-stack--row', 'dk-stack--align-' + align, justify !== 'start' && 'dk-stack--justify-' + justify, props.wrap && 'dk-stack--wrap', widths.join(' '), props.className),
    style: Object.keys(vars).length ? Object.assign(vars, props.style) : props.style,
  }));
}

/* Stack: lays its children out in a column (or a row) with even space between them, from the spacing scale.
   className, style and every other prop go to the element. */
/** Lays children out in a column or a row, with even space from the spacing scale between them. */
export const Stack = /* @__PURE__ */ named('Stack', StackRender);
