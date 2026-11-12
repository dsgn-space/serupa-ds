'use client';
import * as React from 'react';
import { cn, domId, isInvalid, omit, oneOf, useMergedRef, SIZES, useIsoLayoutEffect } from '../../internal/cn';
import { component } from '../../internal/component';
import { useFormReset } from '../../internal/useFormReset';
import { NAME_HOW, useNameCheck } from '../../internal/nameCheck';
import { warnOnce } from '../../internal/warn';
import { markKeyFocus } from '../../internal/keyFocus';
import { listenForInput } from '../../internal/lastInput';
import { delegateFocus, useAutoFocus } from '../../internal/focus';

/** V is the radios' value type: string (or number) as you use them, inferred from value or onValueChange. */
export interface RadioGroupProps<V extends string | number = string | number> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** The radios' name; a generated one by default. */
  name?: string | undefined;
  /** The picked value (controlled); null or undefined for none. Use with onValueChange. */
  value?: V | null | undefined;
  /** The value picked at first (uncontrolled). */
  defaultValue?: V | undefined;
  /** Called with the picked radio's value (and the change event), like SegmentedControl, Tabs and Slider. */
  onValueChange?: ((value: V, event: React.ChangeEvent<HTMLInputElement>) => void) | undefined;
  /** 'vertical' (stacked, default) or 'horizontal' (a wrapping row). */
  orientation?: 'vertical' | 'horizontal' | undefined;
  /** The radios' size, unless a Radio sets its own. */
  size?: 'sm' | 'md' | 'lg' | undefined;
  /** 'default' (a radio beside its label) or 'card' (each radio a bordered card, for plans, delivery options and
   *  other choices with a description), unless a Radio sets its own. Default: 'default'. */
  variant?: 'default' | 'card' | undefined;
  /** A danger border on every unchecked radio, and aria-invalid on the group. Field sets it from its error. */
  invalid?: boolean | undefined;
  /** Disables every radio. */
  disabled?: boolean | undefined;
  /** Marks the choice required (aria-required, and required on the radios). */
  required?: boolean | undefined;
  /** Shows the choice without letting it change: the radios stay focusable and the group says it (aria-readonly), and a form still sends the choice, unlike disabled. Arrows, Space and clicks don't change it, and onValueChange doesn't run. */
  readOnly?: boolean | undefined;
  /** The Radio elements, at any depth. */
  children?: React.ReactNode | undefined;
}
export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** 'sm' (14px circle, text-xs), 'md' (16px, text-sm, default) or 'lg' (20px, text-base). In a RadioGroup, the group's size by default. */
  size?: 'sm' | 'md' | 'lg' | undefined;
  /** The label, next to the circle; a click on it picks the radio. Without one, give the radio an aria-label. */
  children?: React.ReactNode | undefined;
  /** A second, muted line under the label, linked to the radio with aria-describedby. */
  description?: React.ReactNode | undefined;
  /** A danger border (while unchecked) and focus ring, and aria-invalid. In a group, set invalid on the RadioGroup. */
  invalid?: boolean | undefined;
  /** 'default' or 'card': the radio, label and description in a bordered card that's pressed as a whole, with a
   *  primary border and tint once checked. In a RadioGroup, the group's variant by default. */
  variant?: 'default' | 'card' | undefined;
}

interface RadioContextValue {
  name: string;
  value: string | number | null | undefined;
  size: unknown;
  variant: unknown;
  invalid: boolean;
  disabled: boolean;
  required: boolean;
  readOnly: boolean;
  select(value: unknown, event: React.ChangeEvent<HTMLInputElement>): void;
}
const VARIANTS = ['default', 'card'] as const;
const RadioContext = /* @__PURE__ */ React.createContext<RadioContextValue | null>(null);

/* RadioGroup: one choice from a set of Radios. It names them (name, or a generated one), holds the value
   (value with onValueChange, or defaultValue), and passes size, invalid, disabled and required down. onValueChange
   gets (value, event); the old onChange alias is gone (use onValueChange). orientation "vertical" (default) or "horizontal". Renders <div role="radiogroup">: label it
   with Field group (a fieldset and legend), aria-label or aria-labelledby. */
const GROUP_OWN = { name: 1, value: 1, defaultValue: 1, onValueChange: 1, orientation: 1, size: 1, variant: 1, invalid: 1, disabled: 1, required: 1, readOnly: 1, children: 1, className: 1, autoFocus: 1 } as const;

/** One choice from a set of Radios: a <div role="radiogroup"> that names them, holds the value and passes size, invalid, disabled and required down. Label it with Field group, aria-label or aria-labelledby. */
export const RadioGroup = /* @__PURE__ */ component<HTMLDivElement, RadioGroupProps>('RadioGroup', function RadioGroup(props: RadioGroupProps, ref) {
  const nameRef = useNameCheck('RadioGroup', NAME_HOW.group);   // warns when it has no accessible name
  const rest = omit(props, GROUP_OWN);
  const autoName = domId('dk-rg', React.useId());
  const controlled = props.value !== undefined;
  const [picked, setPicked] = React.useState<string | number | null | undefined>(props.defaultValue), cur = controlled ? props.value : picked;
  const invalid = isInvalid(props.invalid, rest['aria-invalid']);
  const orientation = props.orientation === 'horizontal' ? 'horizontal' : 'vertical';
  const onValueChange = props.onValueChange;
  // A form reset checks the radio that was checked first; the group's choice follows it (a controlled one shows its value again).
  const root = React.useRef<HTMLDivElement | null>(null);
  const [, rerender] = React.useState(0);
  useFormReset(root, function () { if (!controlled) setPicked(props.defaultValue); rerender(function (n) { return n + 1; }); });
  const ctx: RadioContextValue = { name: props.name || autoName, value: cur, size: props.size, variant: props.variant, invalid: invalid, disabled: !!props.disabled, required: !!props.required, readOnly: !!props.readOnly,
    select: function (v, e) { if (!controlled) setPicked(v as string | number); if (onValueChange) onValueChange(v as string | number, e); } };
  // The arrows wrap from the last radio to the first and back, as the radio group pattern asks: Chromium and Firefox
  // do that themselves, but WebKit stops at the ends. A radio hidden by CSS isn't one of the ends: wrapping to it checked
  // it out of sight while focus stayed put (L8E82).
  const own = rest.onKeyDown;
  rest.onKeyDown = function (e: React.KeyboardEvent<HTMLDivElement>) {
    if (own) own(e);
    const t = e.target as HTMLInputElement, k = e.key;
    // Read-only: an arrow would move the choice with focus, so focus stays on the checked radio.
    if (props.readOnly && t.type === 'radio' && k.indexOf('Arrow') === 0) { e.preventDefault(); return; }
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || t.type !== 'radio' || k.indexOf('Arrow') !== 0) return;
    const all = Array.prototype.filter.call(root.current!.querySelectorAll('input[type=radio]'), function (r: HTMLInputElement) { return r.name === t.name && !r.disabled && r.getClientRects().length > 0; }) as HTMLInputElement[];
    const fwd = k === 'ArrowDown' || k === (getComputedStyle(t).direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight'), i = all.indexOf(t);
    const to = fwd ? (i === all.length - 1 ? all[0] : null) : (i === 0 ? all[all.length - 1] : null);
    if (!to || to === t) return;
    e.preventDefault();
    to.focus();
    to.click();
  };
  useAutoFocus(props.autoFocus, () => root.current);   // through the delegation below; the <div> ignored it (L8E93)
  // ref.current.focus() (a form library focusing the first invalid field) lands on the radio in the Tab order, the
  // checked one or else the first that can be picked; the <div> took no focus. aria-required given to the group
  // is kept, not overwritten by the required prop (L8E90).
  const groupRef = useMergedRef(ref, function (n: HTMLDivElement | null) {
    root.current = n;
    delegateFocus(n, () => n && (n.querySelector<HTMLElement>('input:checked:enabled') || n.querySelector<HTMLElement>('input:enabled')));
    nameRef(n);
  });
  return (
    <div {...rest} ref={groupRef} role="radiogroup" aria-invalid={invalid || undefined} aria-required={props.required || rest['aria-required'] || undefined} aria-disabled={props.disabled || undefined} aria-readonly={props.readOnly || undefined}
      className={cn('dk-radio-group', 'dk-radio-group--' + orientation, props.variant === 'card' && 'dk-radio-group--card', invalid && 'dk-radio-group--invalid', props.className)} data-component="radio-group" data-orientation={orientation}>
      <RadioContext.Provider value={ctx}>{props.children}</RadioContext.Provider>
    </div>
  );
}) as (<V extends string | number = string | number>(props: RadioGroupProps<V> & React.RefAttributes<HTMLDivElement>) => React.ReactElement | null) & { displayName?: string };

/* Radio: a native radio and its label, like Checkbox. In a RadioGroup it takes the group's name, checked state,
   size, invalid, disabled and required; on its own, pass name and checked yourself. size "sm", "md" (default) or
   "lg"; children (the label); description; invalid. className and style go to the <label>, every other prop
   (value, checked, onChange, disabled, aria-*…) and ref to the <input type="radio">. */
const OWN = { size: 1, variant: 1, invalid: 1, description: 1, children: 1, className: 1, style: 1, type: 1 } as const;

/** A native radio with its label (ref, value and every input attribute go to the <input>); className and style go to the <label> around it. In a RadioGroup, the group sets name and checked. */
export const Radio = /* @__PURE__ */ component<HTMLInputElement, RadioProps>('Radio', function Radio(props, ref) {
  const nameRef = useNameCheck('Radio', NAME_HOW.label, ref);   // warns when it has no accessible name
  if (process.env.NODE_ENV !== 'production' && (props as { label?: unknown }).label != null) warnOnce('label-prop', "Radio: label isn't one of its props, so it lands on the <input> as an attribute and names nothing. Put the text in children.", 'label-prop:Radio');
  const ctx = React.useContext(RadioContext);
  const rest = omit(props, OWN);
  const size = oneOf(SIZES, props.size, oneOf(SIZES, ctx && ctx.size, 'md'));
  const card = oneOf(VARIANTS, props.variant, oneOf(VARIANTS, ctx && ctx.variant, 'default')) === 'card';
  const invalid = isInvalid(props.invalid, rest['aria-invalid']);
  if (invalid) rest['aria-invalid'] = true;   // a group's invalid is on the group
  if (ctx) {
    const own = rest.onChange;
    rest.name = ctx.name;
    rest.checked = ctx.value != null && String(ctx.value) === String(props.value);
    delete rest.defaultChecked;
    rest.onChange = function (e: React.ChangeEvent<HTMLInputElement>) { if (own) own(e); ctx.select(props.value, e); };
    if (ctx.disabled) rest.disabled = true;
    if (ctx.required) rest.required = true;
    if (ctx.readOnly) rest.readOnly = true;
  }
  // Read-only (the group's, or its own): the native readonly does nothing on a radio, so a click (Space clicks too) is
  // cancelled, which puts the check back, as Checkbox does. Your onClick still runs; onChange doesn't.
  const readOnly = !!rest.readOnly;
  if (readOnly) {
    delete rest.onChange;
    const onClick = rest.onClick;
    rest.onClick = (e) => { if (onClick) onClick(e); e.preventDefault(); };
  }
  // The ring for keyboard focus where the browser's :focus-visible leaves one out (internal/keyFocus.ts).
  markKeyFocus(rest);
  useIsoLayoutEffect(listenForInput, []);
  const base = domId('dk-rd', React.useId()), labelId = base + '-label', descId = base + '-desc';
  const hasLabel = props.children != null && props.children !== false && props.children !== '';
  const hasDesc = props.description != null && props.description !== false && props.description !== '';
  if (hasDesc) rest['aria-describedby'] = cn(rest['aria-describedby'], descId);
  if (hasDesc && hasLabel && rest['aria-label'] == null && rest['aria-labelledby'] == null) rest['aria-labelledby'] = labelId;   // the description stays out of the name
  return (
    <label className={cn('dk-radio', 'dk-radio--size-' + size, card && 'dk-radio--card', (invalid || (ctx && ctx.invalid)) && 'dk-radio--invalid', rest.disabled && 'dk-radio--disabled', readOnly && 'dk-radio--readonly', !hasLabel && !hasDesc && 'dk-radio--bare', props.className)} style={props.style} data-component="radio" data-size={size as string}>
      <span className="dk-radio__control" key="control">
        <input {...rest} ref={nameRef} type="radio" className="dk-radio__input" key="input" />
        <span className="dk-radio__dot" aria-hidden key="dot" />
      </span>
      {hasLabel || hasDesc ? <span className="dk-radio__text" key="text">
        {hasLabel ? <span className="dk-radio__label" id={labelId} key="label">{props.children}</span> : null}
        {hasDesc ? <span className="dk-radio__description" id={descId} key="desc">{props.description}</span> : null}
      </span> : null}
    </label>
  );
});
