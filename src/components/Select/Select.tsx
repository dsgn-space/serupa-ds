'use client';
import * as React from 'react';
import { useControllable } from '../../internal/controllable';
import { useControlSize } from '../../internal/controlSize';
import { cn, isInvalid, oneOf, omit, useMergedRef, SIZES } from '../../internal/cn';
import { useFormReset } from '../../internal/useFormReset';
import { warnOnce } from '../../internal/warn';
import { Icon, type IconSource } from '../Icon/Icon';
import { asIcon } from '../Icon/asIcon';
import { named } from '../../internal/component';
import { useFieldControl } from '../../internal/field';
import * as icons from '../../material/builtin';
import { NAME_HOW, useNameCheck } from '../../internal/nameCheck';

export type SelectOption = string | number | { value: string | number; label?: React.ReactNode; disabled?: boolean };
export interface SelectOptionGroup { label: string; options: SelectOption[]; disabled?: boolean }
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'multiple'> {
  /** 'sm' (24px, text-xs), 'md' (32px, text-sm, default) or 'lg' (44px, text-base): the control heights, like Input. */
  size?: 'sm' | 'md' | 'lg' | undefined;
  /** A danger border and focus ring, and aria-invalid. */
  invalid?: boolean | undefined;
  /** A decorative icon before the text: an icon name or an element. */
  startIcon?: IconSource | undefined;
  /** A first, empty option shown in the placeholder color until something is picked (it can't be picked back). An uncontrolled Select starts on it. */
  placeholder?: string | undefined;
  /** The options: strings, { value, label, disabled }, or groups { label, options }. Or pass <option> and <optgroup> children (after these). */
  options?: Array<SelectOption | SelectOptionGroup> | undefined;
  /** Shows the value without letting it change: still focusable and read out (aria-readonly), and a form still sends it, unlike disabled. Keys, a press and the phone's picker don't change it, and onChange doesn't run. */
  readOnly?: boolean | undefined;
}

/* Select: a native <select> styled like Input. size "sm", "md" (default) or "lg" (the control heights);
   invalid; startIcon (decorative); placeholder (a first, empty option shown in the placeholder color until
   something is picked); options (strings, { value, label, disabled } or groups { label, options }) or your own
   <option> children. Renders <span class="srp-select"> around the <select>: className and style go to the box,
   every other prop (value, defaultValue, onChange, name, disabled, required, aria-*…) and ref to the <select>. */
const OWN = { size: 1, invalid: 1, startIcon: 1, placeholder: 1, options: 1, children: 1, className: 1, style: 1, multiple: 1, readOnly: 1 } as const;

function optionNodes(list: Array<SelectOption | SelectOptionGroup> | undefined): React.ReactNode[] {
  return (list || []).map(function (o, i) {
    if (o != null && typeof o === 'object' && 'options' in o && Array.isArray(o.options)) return <optgroup key={'g' + i} label={o.label} disabled={o.disabled}>{optionNodes(o.options)}</optgroup>;
    const v = o != null && typeof o === 'object' ? (o as Exclude<SelectOption, string | number>) : { value: o, label: o, disabled: undefined };
    return <option key={String(v.value)} value={v.value} disabled={v.disabled}>{v.label != null ? v.label : v.value}</option>;
  });
}

function SelectRender({ ref, ...props }: SelectProps & React.RefAttributes<HTMLSelectElement>) {
  const nameRef = useNameCheck('Select', NAME_HOW.field);   // warns when it has no accessible name
  props = useFieldControl(props);   // the props a surrounding Field hands it, at any depth
  const rest = omit(props, OWN);
  if (process.env.NODE_ENV !== 'production' && (props as { multiple?: boolean }).multiple) warnOnce('select-multiple', "Serupa.Select: multiple isn't supported (a native multi-select is hard to use); use checkboxes instead. It was ignored.");
  const size = oneOf(SIZES, useControlSize(props.size), 'md');
  const invalid = isInvalid(props.invalid, rest['aria-invalid']);
  if (invalid) rest['aria-invalid'] = true;
  const hasPh = props.placeholder != null && props.placeholder !== '';
  if (hasPh && rest.value === undefined && rest.defaultValue === undefined) rest.defaultValue = '';   // start on the placeholder
  const [cur, setPicked, controlled] = useControllable(rest.value, rest.defaultValue, 'Select', 'value');
  const { onChange, onKeyDown, onMouseDown } = rest;
  // A form reset puts the native <select> back on its default; the placeholder look follows it.
  const ownRef = React.useRef<HTMLSelectElement | null>(null);
  const setRefs = useMergedRef(ref, nameRef, ownRef);
  const start = rest.defaultValue;
  useFormReset(ownRef, () => { if (!controlled) setPicked(start); });
  // A value that matches no option shows the first one instead, and a form sends that, while the app holds its own
  // value (GR161). Read from the <select> itself, so options passed as children count too.
  React.useEffect(() => {
    const s = ownRef.current;
    if (process.env.NODE_ENV !== 'production' && controlled && cur != null && s && ![...s.options].some((o) => o.value === String(cur))) warnOnce('select-value', `Select: value "${String(cur)}" matches no option, so it shows "${s.value}" and a form sends that. Set value to one of the options' values, or add an option for it.`);
  }, [controlled, cur]);
  const shownRef = React.useRef('');
  // every render: the value it shows, which a read-only change goes back to.
  React.useEffect(() => { if (ownRef.current) shownRef.current = ownRef.current.value; });
  // Read-only: a native <select> has no readonly, so the keys and the press that open or change it are cancelled,
  // and a change that still gets through (a phone's picker) is put back, without onChange.
  const readOnly = !!props.readOnly;
  if (readOnly) rest['aria-readonly'] = true;
  // The handlers go on the <select> beside rest, not into it, so rest stays plain props.
  const handlers = readOnly ? {
    onKeyDown: (e: React.KeyboardEvent<HTMLSelectElement>) => { if (onKeyDown) onKeyDown(e); if (e.key !== 'Tab' && e.key !== 'Escape' && !e.ctrlKey && !e.metaKey) e.preventDefault(); },
    onMouseDown: (e: React.MouseEvent<HTMLSelectElement>) => { if (onMouseDown) onMouseDown(e); e.preventDefault(); e.currentTarget.focus(); },
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => { e.target.value = shownRef.current; },
  } : { onChange: (e: React.ChangeEvent<HTMLSelectElement>) => { if (!controlled) setPicked(e.target.value); if (onChange) onChange(e); } };
  const empty = hasPh && (cur == null || cur === '');
  const left = asIcon(props.startIcon);
  return (
    <span className={cn('srp-select', 'srp-select--size-' + size, invalid && 'srp-select--invalid', props.disabled && 'srp-select--disabled', readOnly && 'srp-select--readonly', empty && 'srp-select--empty', left != null && left !== false && 'srp-select--has-icon', props.className)} data-invalid={invalid ? '' : undefined} data-disabled={props.disabled ? '' : undefined} data-readonly={readOnly ? '' : undefined} data-empty={empty ? '' : undefined} style={props.style} data-component="select" data-size={size}>
      {left == null || left === false ? null : <span className="srp-select__icon srp-select__icon--start" aria-hidden key="left">{left}</span>}
      <select {...rest} {...handlers} ref={setRefs} className="srp-select__field" key="field">
        {hasPh ? <option value="" disabled key="__placeholder" className="srp-select__placeholder">{props.placeholder}</option> : null}
        {optionNodes(props.options)}
        {props.children}
      </select>
      <span className="srp-select__icon srp-select__icon--chevron" aria-hidden key="chevron"><Icon icon={icons.ExpandMore} /></span>
    </span>
  );
}

/** A native <select> styled like Input (ref, value, onChange and every select attribute go to it), with a chevron; className and style go to the box. Label it with <label htmlFor>, aria-label or Field. multiple isn't supported. */
export const Select = /* @__PURE__ */ named('Select', SelectRender);
