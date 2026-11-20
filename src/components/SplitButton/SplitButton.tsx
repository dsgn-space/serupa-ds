'use client';
import * as React from 'react';
import { cn, omit } from '../../internal/cn';
import { named } from '../../internal/component';
import type { OpenChangeDetails } from '../../internal/openChange';
import type { Placement } from '../../internal/position';
import * as icons from '../../material/builtin';
import { Button } from '../Button/Button';
import type { IconSource } from '../Icon/Icon';
import { IconButton } from '../IconButton/IconButton';
import { Menu } from '../Menu/Menu';

export interface SplitButtonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick' | 'children'> {
  /** The main action's label ("Save"). */
  children: React.ReactNode;
  /** The main action, run by the main button. */
  onClick?: ((event: React.MouseEvent<HTMLButtonElement>) => unknown) | undefined;
  /** The other ways to do it: MenuItem, MenuGroup and MenuSeparator, shown by the arrow button. */
  menu: React.ReactNode;
  /** The arrow button's name, which says what the menu holds ("More save options"). Required: it shows only an icon. */
  menuLabel: string;
  /** 'primary' (default), 'secondary' or 'outline', for both halves. */
  variant?: 'primary' | 'secondary' | 'outline' | undefined;
  /** 'sm', 'md' (default) or 'lg'. */
  size?: 'sm' | 'md' | 'lg' | undefined;
  /** The danger color, for a main action that deletes or can't be undone. */
  destructive?: boolean | undefined;
  /** An icon before the main label. */
  leftIcon?: IconSource | undefined;
  /** Turns off both halves. */
  disabled?: boolean | undefined;
  /** While the main action runs: the main button shows a Loader and can't be pressed again. The menu stays usable. */
  loading?: boolean | undefined;
  /** Where the menu opens. Default: 'bottom-end', under the arrow, lined up with the group's end. */
  placement?: Placement | undefined;
  /** The menu's open state, controlled. */
  open?: boolean | undefined;
  /** Opens the menu on the first render. */
  defaultOpen?: boolean | undefined;
  /** Called when the menu opens or closes. */
  onOpenChange?: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
}

const OWN = { children: 1, onClick: 1, menu: 1, menuLabel: 1, variant: 1, size: 1, destructive: 1, leftIcon: 1, disabled: 1, loading: 1, placement: 1, open: 1, defaultOpen: 1, onOpenChange: 1, className: 1 } as const;

function SplitButtonRender({ ref, ...props }: SplitButtonProps & React.RefAttributes<HTMLDivElement>) {
  const rest = omit(props, OWN);
  const variant = props.variant === 'secondary' || props.variant === 'outline' ? props.variant : 'primary';
  const size = props.size === 'sm' || props.size === 'lg' ? props.size : 'md';
  // The name goes to the group, which has the role; everything else to the wrapper.
  const label = rest['aria-label'], labelledBy = rest['aria-labelledby'];
  delete rest['aria-label']; delete rest['aria-labelledby'];
  return (
    <div {...rest} ref={ref} className={cn('dk-split-button', props.className)} data-component="split-button">
    {/* ButtonGroup's markup and classes, attached, but never coming apart: a long label shortens with an ellipsis instead. */}
    <div role="group" aria-label={label} aria-labelledby={labelledBy} data-component="button-group" data-orientation="horizontal" className="dk-button-group dk-button-group--attached">
      <Button size={size} variant={variant} destructive={props.destructive} leftIcon={props.leftIcon} disabled={props.disabled} loading={props.loading} onClick={props.onClick}>{props.children}</Button>
      <Menu placement={props.placement ?? 'bottom-end'} open={props.open} defaultOpen={props.defaultOpen} onOpenChange={props.onOpenChange}
        trigger={<IconButton className="dk-split-button__menu" size={size} variant={variant} destructive={props.destructive} disabled={props.disabled} icon={icons.ExpandMore} label={props.menuLabel} />}>
        {props.menu}
      </Menu>
    </div>
    </div>
  );
}

/* SplitButton: a main action and an arrow button that opens a menu of other ways to do it, joined into one control
   (an attached ButtonGroup row in a wrapper <div>, which never comes apart: a long label ends in an ellipsis). The main button runs onClick; the arrow is an IconButton named by
   menuLabel, with aria-haspopup and aria-expanded from Menu. aria-label and aria-labelledby name the group; className,
   ref and every other prop go to the wrapper. */
/** A main action joined to an arrow button that opens a menu of other ways to do it.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const SplitButton = /* @__PURE__ */ named('SplitButton', SplitButtonRender);
