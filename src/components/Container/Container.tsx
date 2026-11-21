import * as React from 'react';
import { cn, oneOf, omit } from '../../internal/cn';
import { named } from '../../internal/component';

export type ContainerSize = 'prose' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

export interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
  /** The widest the content gets: 'prose' 672px (reading), 'md' 768, 'lg' 1024, 'xl' 1280 (default), '2xl' 1536 or 'full'. */
  size?: ContainerSize | undefined;
  /** Side padding that grows with the screen (16, 24 from 640px, 32 from 1024px), outside the maximum width and never
   *  less than the screen's safe area (a notch). It follows the screen's width, not the space the Container is in.
   *  Default: true. */
  padded?: boolean | undefined;
  /** The element. Default: 'div'. */
  as?: 'div' | 'main' | 'section' | 'header' | 'footer' | 'article' | undefined;
}

const SIZES: readonly ContainerSize[] = ['prose', 'md', 'lg', 'xl', '2xl', 'full'];
const TAGS = ['div', 'main', 'section', 'header', 'footer', 'article'] as const;

function ContainerRender({ ref, ...props }: ContainerProps & React.RefAttributes<HTMLElement>) {
  const rest = omit(props, { size: 1, padded: 1, as: 1, className: 1 });
  const size = oneOf(SIZES, props.size, 'xl');
  return React.createElement(oneOf(TAGS, props.as, 'div'), Object.assign(rest, {
    ref: ref, 'data-component': 'container', 'data-size': size,
    className: cn('srp-container', 'srp-container--' + size, props.padded !== false && 'srp-container--padded', props.className),
  }));
}

/* Container: centers the page's content with a maximum width and side padding that grows with the screen.
   className, style and every other prop go to the element. */
/** Centers content with a maximum width and responsive side padding. */
export const Container = /* @__PURE__ */ named('Container', ContainerRender);
