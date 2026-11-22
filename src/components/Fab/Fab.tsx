'use client';
import * as React from 'react';
import type { IconSource } from '../Icon/Icon';
import { cn, oneOf } from '../../internal/cn';
import { ButtonBase, type ButtonAsButtonProps } from '../Button/Button';
import { Tooltip } from '../Tooltip/Tooltip';
import { named } from '../../internal/component';

export type FabPlacement = 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start' | 'static';
/** @deprecated Use FabPlacement, the name of the prop it types; removed in 19.0.0. */
export type FabPosition = 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start' | 'static';

export interface FabProps extends Omit<ButtonAsButtonProps, 'icon' | 'startIcon' | 'endIcon' | 'children' | 'variant' | 'size' | 'aria-label'> {
  /** The icon: a custom or Material Symbols name ("add") or any element. */
  icon: IconSource;
  /** What the button does. Shown next to the icon when extended; otherwise its aria-label, and a Tooltip on hover and keyboard focus. */
  label: string;
  /** Shows the label next to the icon (an extended FAB). 'auto': extended, and while the page scrolls down it
   *  shrinks to its icon, so it covers less of what people read; scrolling up, or back to the top, brings the label
   *  back. Its name stays the label either way. Default: false. */
  extended?: boolean | 'auto' | undefined;
  /** 'md' (default, 56px) or 'sm' (40px). */
  size?: 'sm' | 'md' | undefined;
  /** Where it's fixed on the screen: 'bottom-end' (default), 'bottom-start', 'top-end' or 'top-start', 24px from the corner; 'static' leaves the placing to you. */
  placement?: FabPlacement | undefined;
}

/* Fab: a floating action button for a screen's main action. A round, raised primary Button fixed to a corner of
   the screen (placement), 56px (or 40px with size="sm"); extended shows the label next to the icon. Every other
   Button prop (onClick, loading, disabled, destructive, ref…) works the same. */
const POSITIONS: readonly FabPlacement[] = ['bottom-end', 'bottom-start', 'top-end', 'top-start', 'static'];

/** Whether the page is scrolling down (and is past its first 64px): an extended="auto" FAB shrinks to its icon then.
 *  Moves under 8px are ignored, so a finger's jitter doesn't flicker it. */
function useShrinkOnScroll(on: boolean): boolean {
  const [shrunk, setShrunk] = React.useState(false);
  React.useEffect(() => {
    if (!on) return;
    let last = window.scrollY;
    const scrolled = () => {
      const y = window.scrollY;
      if (y <= 64) setShrunk(false);
      else if (y > last + 8) setShrunk(true);
      else if (y < last - 8) setShrunk(false);
      else return;
      last = y;
    };
    window.addEventListener('scroll', scrolled, { passive: true });
    return () => window.removeEventListener('scroll', scrolled);
  }, [on]);
  return on && shrunk;
}

function FabRender({ ref, ...props }: FabProps & React.RefAttributes<HTMLButtonElement>) {
  const { icon, label, extended, size, placement, className, ...rest } = props;
  const pos = oneOf(POSITIONS, placement, 'bottom-end');
  const sm = size === 'sm';
  const auto = extended === 'auto', shrunk = useShrinkOnScroll(auto);
  const look = { variant: 'primary', size: sm ? 'sm' : 'md', 'data-position': pos,
    className: cn('srp-fab', sm && 'srp-fab--sm', extended && 'srp-fab--extended', auto && 'srp-fab--auto', shrunk && 'srp-fab--shrunk', pos !== 'static' && 'srp-fab--' + pos, className) } as const;
  const button = extended
    ? <ButtonBase {...(auto ? { 'aria-label': label } : null)} {...rest} {...look} ref={ref} startIcon={icon}>{auto ? <span className="srp-fab__label">{label}</span> : label}</ButtonBase>
    : <ButtonBase {...rest} {...look} ref={ref} icon={icon} aria-label={label} />;
  // Its icon alone (or shrunk to it, with extended="auto"): the label shows in a Tooltip on hover and on keyboard focus,
  // as IconButton's does, which a native title never does. None while the label shows, or when a Tooltip or a title of
  // yours already says something. The Tooltip stays around an auto FAB either way, so shrinking doesn't remount it.
  const own = rest.title != null || rest['aria-describedby'] != null || rest['aria-labelledby'] != null;
  return own || (extended && !auto) ? button : <Tooltip content={label} role="label" disabled={!!rest.disabled || (auto && !shrunk)}>{button}</Tooltip>;
}

/** A floating action button: the screen's main action, round and raised, fixed to a corner. */
export const Fab = /* @__PURE__ */ named('Fab', FabRender);
