'use client';
import * as React from 'react';
import { cn, oneOf } from '../../internal/cn';
import { ButtonBase, type ButtonAsButtonProps } from '../Button/Button';
import type { IconSource } from '../Icon/Icon';
import { component } from '../../internal/component';

export interface ToggleButtonProps extends Omit<ButtonAsButtonProps, 'variant' | 'destructive' | 'loading' | 'loadingLabel'> {
  /** Whether it's on (controlled). Use with onPressedChange. */
  pressed?: boolean | undefined;
  /** Whether it starts on (uncontrolled). Default: false. */
  defaultPressed?: boolean | undefined;
  /** Called with the new state when it's pressed. */
  onPressedChange?: ((pressed: boolean) => void) | undefined;
  /** 'outline' (default) or 'ghost' (for toolbars). */
  variant?: 'outline' | 'ghost' | undefined;
  /** Icon-only: an icon name (custom or Material Symbols) or element, in a square at the size's height, in place of children; give it an aria-label. */
  icon?: IconSource | undefined;
}

/* ToggleButton: a Button that stays on or off (aria-pressed), for a setting that applies right away: bold,
   mute, show grid. On, it's primary-subtle with primary text. Every Button prop but variant, destructive and
   loading goes through. */
/** A Button that turns something on and off, with aria-pressed: bold, mute, show grid. */
export const ToggleButton = /* @__PURE__ */ component<HTMLButtonElement, ToggleButtonProps>('ToggleButton', function ToggleButton(props, ref) {
  const { pressed, defaultPressed, onPressedChange, variant, className, onClick, ...rest } = props;
  const [own, setOwn] = React.useState(!!defaultPressed);
  const controlled = pressed !== undefined;
  const on = controlled ? !!pressed : own;
  const v = oneOf(['outline', 'ghost'] as const, variant, 'outline');
  return (
    <ButtonBase {...rest} ref={ref} variant={v} aria-pressed={on}
      className={cn('dk-toggle-button', on && 'dk-toggle-button--pressed', className)}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        if (onClick) onClick(e);
        if (e.defaultPrevented) return;
        if (!controlled) setOwn(!on);
        if (onPressedChange) onPressedChange(!on);
      }} />
  );
});
