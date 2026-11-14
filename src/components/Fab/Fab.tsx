'use client';
import * as React from 'react';
import type { IconSource } from '../Icon/Icon';
import { cn, oneOf } from '../../internal/cn';
import { ButtonBase, type ButtonAsButtonProps } from '../Button/Button';
import { component } from '../../internal/component';

export type FabPosition = 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start' | 'static';

export interface FabProps extends Omit<ButtonAsButtonProps, 'icon' | 'leftIcon' | 'rightIcon' | 'children' | 'variant' | 'size' | 'aria-label'> {
  /** The icon: a custom or Material Symbols name ("add") or any element. */
  icon: IconSource;
  /** What the button does. Shown next to the icon when extended; otherwise its aria-label and title. */
  label: string;
  /** Shows the label next to the icon (an extended FAB). 'auto': extended, and while the page scrolls down it
   *  shrinks to its icon, so it covers less of what people read; scrolling up, or back to the top, brings the label
   *  back. Its name stays the label either way. Default: false. */
  extended?: boolean | 'auto' | undefined;
  /** 'md' (default, 56px) or 'sm' (40px). */
  size?: 'sm' | 'md' | undefined;
  /** Where it's fixed on the screen: 'bottom-end' (default), 'bottom-start', 'top-end' or 'top-start', 24px from the corner; 'static' leaves the placing to you. */
  placement?: FabPosition | undefined;
}

/* Fab: a floating action button for a screen's main action. A round, raised primary Button fixed to a corner of
   the screen (placement), 56px (or 40px with size="sm"); extended shows the label next to the icon. Every other
   Button prop (onClick, loading, disabled, destructive, ref…) works the same. */
const POSITIONS: readonly FabPosition[] = ['bottom-end', 'bottom-start', 'top-end', 'top-start', 'static'];

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

/** A floating action button: the screen's main action, round and raised, fixed to a corner. */
export const Fab = /* @__PURE__ */ component<HTMLButtonElement, FabProps>('Fab', function Fab(props, ref) {
  const { icon, label, extended, size, placement, className, ...rest } = props;
  const pos = oneOf(POSITIONS, placement, 'bottom-end');
  const sm = size === 'sm';
  const auto = extended === 'auto', shrunk = useShrinkOnScroll(auto);
  const look = { variant: 'primary', size: sm ? 'sm' : 'md', 'data-position': pos,
    className: cn('dk-fab', sm && 'dk-fab--sm', extended && 'dk-fab--extended', auto && 'dk-fab--auto', shrunk && 'dk-fab--shrunk', pos !== 'static' && 'dk-fab--' + pos, className) } as const;
  return extended
    ? <ButtonBase {...(auto ? { 'aria-label': label } : null)} {...rest} {...look} ref={ref} leftIcon={icon}>{auto ? <span className="dk-fab__label">{label}</span> : label}</ButtonBase>
    : <ButtonBase title={label} {...rest} {...look} ref={ref} icon={icon} aria-label={label} />;
});
