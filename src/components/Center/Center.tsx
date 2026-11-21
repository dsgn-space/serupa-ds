import * as React from 'react';
import { cn, oneOf, omit } from '../../internal/cn';
import { named } from '../../internal/component';

export interface CenterProps extends React.HTMLAttributes<HTMLElement> {
  /** The widest the content gets: a sizing token name ('container-md', 448px, the default; 'container-sm' 384px;
      'container-2xl' 672px) or a CSS length. The side padding is outside it. */
  maxWidth?: string | undefined;
  /** Also centers it from top to bottom, in a box at least as tall as the screen: a sign-in card, an error page. Default: false. */
  vertical?: boolean | undefined;
  /** Centers each child at its own width, instead of stretching it across: a logo, a button, a short heading. Default: false. */
  intrinsic?: boolean | undefined;
  /** Centers the lines of text too. Default: false. */
  centerText?: boolean | undefined;
  /** Side padding (16px), so the content keeps off the screen's edges on a phone; with vertical, 32px above and below as well. Default: true. */
  padded?: boolean | undefined;
  /** The element. Default: 'div'. */
  as?: 'div' | 'main' | 'section' | 'article' | undefined;
}

const TAGS = ['div', 'main', 'section', 'article'] as const;

function CenterRender({ ref, ...props }: CenterProps & React.RefAttributes<HTMLElement>) {
  const rest = omit(props, { maxWidth: 1, vertical: 1, intrinsic: 1, centerText: 1, padded: 1, as: 1, className: 1, style: 1 });
  const max = props.maxWidth;
  const vars: Record<string, string> = {};
  if (max) vars['--dk-center-max'] = /^[a-z][a-z0-9-]*$/.test(max) ? 'var(--' + max + ')' : max;
  return React.createElement(oneOf(TAGS, props.as, 'div'), Object.assign(rest, {
    ref: ref, 'data-component': 'center',
    className: cn('dk-center', props.vertical && 'dk-center--vertical', props.intrinsic && 'dk-center--intrinsic', props.centerText && 'dk-center--text', props.padded !== false && 'dk-center--padded', props.className),
    style: max ? Object.assign(vars, props.style) : props.style,
  }));
}

/* Center: keeps its content to a maximum width in the middle of the space it's in, and with vertical, in the middle
   of the screen's height too. className, style and every other prop go to the element. */
/** Centers content at a maximum width, and with vertical, in the middle of the screen's height.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const Center = /* @__PURE__ */ named('Center', CenterRender);
