'use client';
import { listFormat } from '../../internal/intl';
import * as React from 'react';
import { useMergedRef, cn, domId, omit } from '../../internal/cn';
import { named } from '../../internal/component';
import { useLocale, useSettings } from '../../internal/provider';
import { displayNumber } from '../../internal/numbers';
import { announce } from '../../internal/announce';
import { useFormReset } from '../../internal/useFormReset';
import { useFieldsetDisabled } from '../../internal/useFieldsetDisabled';
import { NAME_HOW, useNameCheck } from '../../internal/nameCheck';
import { useRequired } from '../../internal/required';
import { FieldContext, useFieldControl } from '../../internal/field';
import { delegateFocus, useAutoFocus } from '../../internal/focus';
import { Checkbox, CheckboxGroup } from '../Checkbox/Checkbox';
import { Button } from '../Button/Button';
import { en as words } from './labels';

export interface TransferListOption {
  /** What's submitted, and the key. */
  value: string;
  /** Its name in the lists. */
  label: string;
  /** A line under the name. */
  description?: string | undefined;
  /** It can't be checked, so it stays in the list it's in. */
  disabled?: boolean | undefined;
}

export interface TransferListProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Everything there is to choose from, in the order the Available list shows them. */
  options: readonly TransferListOption[];
  /** The chosen values (controlled), in the order they were added. Use with onValueChange. */
  value?: readonly string[] | undefined;
  /** The chosen values at first (uncontrolled). */
  defaultValue?: readonly string[] | undefined;
  /** Called with the chosen values after each move. */
  onValueChange?: ((value: string[]) => void) | undefined;
  /** Sends the chosen values with a form, one hidden input each under this name. */
  name?: string | undefined;
  /** The id of a form elsewhere on the page that the values belong to. */
  form?: string | undefined;
  /** Disables both lists and the move buttons. */
  disabled?: boolean | undefined;
  /** Shows both lists without letting them change: the boxes are read-only (still focusable and read out), Add and
   *  Remove are left out, and a form still sends the chosen values, unlike disabled. */
  readOnly?: boolean | undefined;
  /** At least one value must be chosen: a form isn't sent while Chosen is empty (both lists are marked invalid and
   *  the first available box takes focus). role="group" can't carry aria-required, so say it in the label too. */
  required?: boolean | undefined;
  /** Marks it invalid (each box says so). Field sets it from its error. */
  invalid?: boolean | undefined;
  /** The first list's name. Default: "Available" (from SerupaProvider labels). */
  availableLabel?: string | undefined;
  /** The second list's name. Default: "Chosen". */
  chosenLabel?: string | undefined;
}

function TransferListRender({ ref, ...given }: TransferListProps & React.RefAttributes<HTMLDivElement>) {
  const props = useFieldControl(given);   // a surrounding Field's id, hint, required, invalid and disabled
  const fieldLabel = React.useContext(FieldContext)?.labelId;   // a Field's <label for> can't name a group, so it's aria-labelledby
  // A Field's required (aria-required) isn't kept: role="group" can't carry it. Its own required checks the count.
  const rest = omit(props, { options: 1, value: 1, defaultValue: 1, onValueChange: 1, name: 1, form: 1, disabled: 1, readOnly: 1, invalid: 1, required: 1, 'aria-required': 1, availableLabel: 1, chosenLabel: 1, className: 1, autoFocus: 1 } as const);
  const { options, value: valueIn, defaultValue, onValueChange, name, form, disabled, invalid, availableLabel, chosenLabel, className, autoFocus } = props;
  const nameRef = useNameCheck('TransferList', NAME_HOW.group);
  const sds = useSettings(words), locale = useLocale();
  const known = (vs: readonly string[] | undefined) => (vs || []).filter((v, i, a) => a.indexOf(v) === i && options.some((o) => o.value === v));
  const controlled = valueIn !== undefined;
  const [own, setOwn] = React.useState<string[]>(() => known(defaultValue));
  const chosen = controlled ? known(valueIn) : own;
  const [checkedLeft, setCheckedLeft] = React.useState<string[]>([]);
  const [checkedRight, setCheckedRight] = React.useState<string[]>([]);
  const root = React.useRef<HTMLDivElement | null>(null);
  const id = domId('srp-transfer', React.useId());
  useFormReset(root, () => { if (!controlled) setOwn(known(defaultValue)); setCheckedLeft([]); setCheckedRight([]); }, form);
  const inDisabledFieldset = useFieldsetDisabled(root);
  const off = !!disabled || inDisabledFieldset;
  const readOnly = !!props.readOnly && !off, required = !!props.required;
  const { missing, onInvalid } = useRequired(chosen.length > 0, () => root.current?.querySelector<HTMLElement>('input:enabled')?.focus());
  const marked = !!invalid || missing;

  const left = options.filter((o) => !chosen.includes(o.value));
  const right = chosen.map((v) => options.find((o) => o.value === v) as TransferListOption);
  const names = { left: availableLabel || sds.labels.transferAvailable, right: chosenLabel || sds.labels.transferChosen };
  // A checked box whose option the app moved to the other list (a controlled value) is forgotten, so it isn't still
  // checked when it comes back.
  const keep = (list: TransferListOption[], checked: string[]) => checked.filter((v) => list.some((o) => o.value === v));
  if (keep(left, checkedLeft).length !== checkedLeft.length) setCheckedLeft(keep(left, checkedLeft));
  if (keep(right, checkedRight).length !== checkedRight.length) setCheckedRight(keep(right, checkedRight));
  const moveable = (list: TransferListOption[], checked: string[]) => list.filter((o) => !o.disabled && checked.includes(o.value));

  const move = (to: 'left' | 'right') => {
    const moving = to === 'right' ? moveable(left, checkedLeft) : moveable(right, checkedRight);
    if (!moving.length || off || readOnly) return;
    const vs = moving.map((o) => o.value);
    const next = to === 'right' ? [...chosen, ...vs] : chosen.filter((v) => !vs.includes(v));
    if (!controlled) setOwn(next);
    if (onValueChange) onValueChange(next);
    (to === 'right' ? setCheckedLeft : setCheckedRight)([]);
    const list = listFormat(locale, { type: 'conjunction' }).format(moving.map((o) => o.label));
    announce(sds.labels.transferMoved(list, to === 'right' ? names.right : names.left));
  };

  const ref2 = useMergedRef(ref, (n: HTMLDivElement | null) => { root.current = n; delegateFocus(n, () => n && n.querySelector<HTMLElement>('input:enabled')); nameRef(n); });
  useAutoFocus(autoFocus, () => root.current);

  // Each option's box is made once per option and kept, so a check or a move draws again only the boxes whose state
  // changed (each reads it from its CheckboxGroup), not all of them: the same element is skipped.
  const boxes = React.useRef(new WeakMap<TransferListOption, React.ReactElement>()).current;
  const boxOf = (o: TransferListOption) => {
    let box = boxes.get(o);
    if (!box) { box = <Checkbox key={o.value} value={o.value} disabled={o.disabled} description={o.description}>{o.label}</Checkbox>; boxes.set(o, box); }
    return box;
  };
  const side = (which: 'left' | 'right', list: TransferListOption[], checked: string[], setChecked: (v: string[]) => void) => {
    const titleId = id + '-' + which;
    return (
      <div className="srp-transfer-list__side">
        <p id={titleId} className="srp-transfer-list__title">{names[which]} <span className="srp-transfer-list__count">({displayNumber(list.length, locale)})</span></p>
        {list.length ? (
          <CheckboxGroup className="srp-transfer-list__options" aria-labelledby={titleId} size="sm" value={checked.filter((v) => list.some((o) => o.value === v))}
            onValueChange={(v) => setChecked(v.map(String))} invalid={marked} disabled={off} readOnly={readOnly}>
            {list.length > 1 ? <Checkbox selectAll>{sds.labels.transferAll}</Checkbox> : null}
            {list.map(boxOf)}
          </CheckboxGroup>
        ) : <p className="srp-transfer-list__empty">{sds.labels.transferEmpty}</p>}
      </div>
    );
  };

  const canAdd = moveable(left, checkedLeft).length > 0, canRemove = moveable(right, checkedRight).length > 0;
  return (
    <div {...rest} ref={ref2} role="group" aria-labelledby={rest['aria-labelledby'] || (rest['aria-label'] ? undefined : fieldLabel)}
      aria-disabled={off || undefined}
      className={cn('srp-transfer-list', off && 'srp-transfer-list--disabled', className)} data-component="transfer-list">
      {side('left', left, checkedLeft, setCheckedLeft)}
      {readOnly ? null : <div className="srp-transfer-list__moves">
        <Button variant="secondary" size="sm" rightIcon="arrow_forward" disabled={off || !canAdd} disabledReason={off ? undefined : sds.labels.transferAddReason}
          onClick={() => move('right')}>{sds.labels.transferAdd}</Button>
        <Button variant="secondary" size="sm" leftIcon="arrow_back" disabled={off || !canRemove} disabledReason={off ? undefined : sds.labels.transferRemoveReason}
          onClick={() => move('left')}>{sds.labels.transferRemove}</Button>
      </div>}
      {side('right', right, checkedRight, setCheckedRight)}
      {name ? chosen.map((v) => <input key={v} type="hidden" name={name} form={form} value={v} disabled={off} />) : null}
      {/* required: a hidden-from-view field the form checks (remade when Chosen fills or empties, so no change handler). */}
      {required ? <input key={chosen.length ? 'filled' : 'empty'} className="srp-transfer-list__validity" tabIndex={-1} aria-hidden required defaultValue={chosen.length ? 'filled' : ''}
        disabled={off || readOnly} form={form} onInvalid={onInvalid} /> : null}
    </div>
  );
}

/* TransferList: two lists of checkboxes, Available and Chosen, with Add and Remove between them, for picking a set
   from many: table columns, permissions, a team's members. Each list is a CheckboxGroup named by its title, which
   counts what's in it, with an "All" box first; Add moves the checked ones from Available to the end of Chosen, and
   Remove moves them back to their place in Available. Each move is said politely ("Email and Phone moved to Chosen.").
   Add and Remove stay focusable when there's nothing to move, and say why (Button disabledReason), so focus is never
   dropped by a move. In a Field, the label names the whole (a role="group"); with name, each chosen value is a hidden
   input, so a form submits them in order. */
/** Two lists, Available and Chosen, with Add and Remove between them, to pick a set from many. */
export const TransferList = /* @__PURE__ */ named('TransferList', TransferListRender);
