'use client';
import * as React from 'react';
import { cn, oneOf, omit, useMergedRef } from '../../internal/cn';
import { useRowWrap } from '../../internal/useRowWrap';
import { component } from '../../internal/component';
import { ControlSize } from '../../internal/controlSize';

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Buttons, IconButtons or ToggleButtons. */
  children?: React.ReactNode | undefined;
  /** Joins them into one control: shared borders, outer corners only. Default: true. */
  attached?: boolean | undefined;
  /** 'horizontal' (default) or 'vertical'. */
  orientation?: 'horizontal' | 'vertical' | undefined;
  /** The size of every Button, IconButton and ToggleButton in it that doesn't set its own: 'sm', 'md' or 'lg'.
      Default: none, so each button keeps its own (md unless set). */
  size?: 'sm' | 'md' | 'lg' | undefined;
  /** What the group is for ("Text formatting"), for screen readers. */
  'aria-label'?: string | undefined;
}

/* ButtonGroup: related buttons side by side (or stacked) in a role="group": attached into one control, or
   spaced apart. size sets every button's size that has none of its own; variant stays on each button. className and every other prop go to the wrapper. */
/** Related buttons in a row or a column, joined into one control or spaced apart. */
export const ButtonGroup = /* @__PURE__ */ component<HTMLDivElement, ButtonGroupProps>('ButtonGroup', function ButtonGroup(props, ref) {
  const rest = omit(props, { attached: 1, orientation: 1, size: 1, className: 1, children: 1 });
  const size = props.size === 'sm' || props.size === 'md' || props.size === 'lg' ? props.size : undefined;
  const vertical = oneOf(['horizontal', 'vertical'] as const, props.orientation, 'horizontal') === 'vertical';
  const attached = props.attached !== false;
  // An attached row wider than its container wraps as separate buttons (useRowWrap).
  const root = React.useRef<HTMLDivElement | null>(null);
  const wrapped = useRowWrap(root, attached && !vertical, props.children);
  const mergedRef = useMergedRef(ref, (n) => { root.current = n; });
  return <div role="group" {...rest} ref={mergedRef} data-component="button-group" data-orientation={vertical ? 'vertical' : 'horizontal'}
    data-wrapped={wrapped || undefined}
    className={cn('dk-button-group', vertical && 'dk-button-group--vertical', attached && !wrapped && 'dk-button-group--attached', props.className)}>
    {size ? <ControlSize.Provider value={size}>{props.children}</ControlSize.Provider> : props.children}
  </div>;
});
