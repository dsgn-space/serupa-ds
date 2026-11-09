'use client';
import * as React from 'react';
import { cn, oneOf, omit } from '../../internal/cn';
import { component } from '../../internal/component';
import type { IconSource } from '../Icon/Icon';
import { asIcon } from '../Icon/asIcon';

export type IconTileTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type IconTileSize = 'sm' | 'md' | 'lg' | 'xl';

export interface IconTileProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The icon: a custom or Material Symbols name ("bolt") or any element. */
  icon: IconSource;
  /** 'neutral' (default), 'primary', or a status: 'success', 'warning', 'danger', 'info'. A tint with the icon in the
      tone's color, at 3:1 or more in every theme. */
  tone?: IconTileTone | undefined;
  /** 'sm' 32px (16px icon), 'md' 40px (20px icon, default), 'lg' 48px (24px icon), 'xl' 64px (32px icon). */
  size?: IconTileSize | undefined;
  /** 'square' (default): rounded corners. 'circle'. */
  shape?: 'square' | 'circle' | undefined;
  /** What the icon means, when it says something the text beside it doesn't: the tile becomes role="img" with this
      name. Without it the tile is decorative (aria-hidden), as it usually sits next to a title that says it all. */
  label?: string | undefined;
}

const TONES: readonly IconTileTone[] = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'];
const SIZES: readonly IconTileSize[] = ['sm', 'md', 'lg', 'xl'];

/* IconTile: an icon centered in a tinted square (or circle), for the start of a Card's header, an EmptyState, a
   settings row or a feature list. Decorative unless given a label. */
/** An icon in a tinted rounded square, at the shared sizes and tones. Decorative by default. */
export const IconTile = /* @__PURE__ */ component<HTMLSpanElement, IconTileProps>('IconTile', function IconTile(props, ref) {
  const rest = omit(props, { icon: 1, tone: 1, size: 1, shape: 1, label: 1, className: 1, children: 1 });
  const tone = oneOf(TONES, props.tone, 'neutral');
  const size = oneOf(SIZES, props.size, 'md');
  const named = props.label ? { role: 'img', 'aria-label': props.label } : { 'aria-hidden': true as const };
  return (
    <span {...named} {...rest} ref={ref} data-component="icon-tile"
      className={cn('dk-icon-tile', 'dk-icon-tile--' + tone, 'dk-icon-tile--' + size, props.shape === 'circle' && 'dk-icon-tile--circle', props.className)}>
      <span className="dk-icon-tile__icon">{asIcon(props.icon)}</span>
    </span>
  );
});
