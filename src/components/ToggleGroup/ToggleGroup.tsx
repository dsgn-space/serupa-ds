'use client';
import * as React from 'react';
import { cn, oneOf, omit } from '../../internal/cn';
import { named } from '../../internal/component';
import { ButtonGroup, type ButtonGroupProps } from '../ButtonGroup/ButtonGroup';
import type { ToggleButtonProps } from '../ToggleButton/ToggleButton';
import { useControllable } from '../../internal/controllable';

export interface ToggleGroupProps extends Omit<ButtonGroupProps, 'defaultValue' | 'onChange'> {
  /** 'single' (default): turning one on turns the others off, and pressing the one that's on turns it off. 'multiple': each turns on and off by itself. */
  selectionMode?: 'single' | 'multiple' | undefined;
  /** The values of the buttons that are on (controlled). Use with onValueChange. */
  value?: string[] | undefined;
  /** The values of the buttons that are on at first (uncontrolled). */
  defaultValue?: string[] | undefined;
  /** Called with the values of the buttons that are on, when one is pressed. */
  onValueChange?: ((value: string[]) => void) | undefined;
  /** With selectionMode="single": one button always stays on, so pressing the one that's on does nothing. Default: false. */
  required?: boolean | undefined;
  /** Turns every button off and out of use. */
  disabled?: boolean | undefined;
  /** The buttons' size, for those that don't set their own. */
  size?: ToggleButtonProps['size'] | undefined;
  /** The buttons' variant, for those that don't set their own: 'outline' (default) or 'ghost'. */
  variant?: ToggleButtonProps['variant'] | undefined;
  /** ToggleButtons, each with a value ("bold", "left"). Other children render as they are. */
  children?: React.ReactNode | undefined;
}

function ToggleGroupRender({ ref, ...props }: ToggleGroupProps & React.RefAttributes<HTMLDivElement>) {
  const rest = omit(props, { selectionMode: 1, value: 1, defaultValue: 1, onValueChange: 1, required: 1, disabled: 1, size: 1, variant: 1, attached: 1, orientation: 1, className: 1, children: 1 });
  const vertical = oneOf(['horizontal', 'vertical'] as const, props.orientation, 'horizontal') === 'vertical';
  const single = props.selectionMode !== 'multiple';
  const [value, setOwn] = useControllable<string[]>(props.value, props.defaultValue || [], 'ToggleGroup', 'value');
  const change = (next: string[]) => {
    if (props.value === undefined) setOwn(next);
    if (props.onValueChange) props.onValueChange(next);
  };
  const press = (v: string, on: boolean) => {
    if (single) { if (on) change([v]); else if (!props.required) change([]); return; }
    change(on ? value.concat(v) : value.filter((x) => x !== v));
  };
  const children = React.Children.map(props.children, function (child) {
    if (!React.isValidElement<ToggleButtonProps>(child) || child.props.value == null) return child;
    const v = String(child.props.value), own = child.props;
    return React.cloneElement(child, {
      pressed: value.indexOf(v) >= 0,
      onPressedChange: (on: boolean) => { if (own.onPressedChange) own.onPressedChange(on); press(v, on); },
      size: own.size ?? props.size,
      variant: own.variant ?? props.variant,
      disabled: own.disabled || props.disabled,
    });
  });
  // A ButtonGroup, so it looks, lays out and wraps the same (GP1). size goes to each button rather than through
  // ButtonGroup's, so a button's own size still wins.
  return (
    <ButtonGroup {...rest} ref={ref} {...{ 'data-component': 'toggle-group', 'data-type': single ? 'single' : 'multiple' }}
      orientation={vertical ? 'vertical' : 'horizontal'} attached={props.attached} className={cn('srp-toggle-group', props.className)}>
      {children}
    </ButtonGroup>
  );
}

/* ToggleGroup: a ButtonGroup whose ToggleButtons share one value. With selectionMode="single" it works like a set of
   radios that can all be off (text alignment, a view mode in a toolbar); with selectionMode="multiple" each button is its
   own setting but the group reports them together (bold, italic, underline). Each button keeps aria-pressed and
   its own Tab stop, as in a ButtonGroup; inside a Toolbar the arrow keys move between them. */
/** ToggleButtons that share one value: one on at a time, or any number. */
export const ToggleGroup = /* @__PURE__ */ named('ToggleGroup', ToggleGroupRender);
