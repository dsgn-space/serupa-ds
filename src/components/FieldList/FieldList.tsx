'use client';
import * as React from 'react';
import { cn, domId, omit, useIsoLayoutEffect, useMergedRef } from '../../internal/cn';
import { component } from '../../internal/component';
import { useControllable } from '../../internal/controllable';
import { announce, ensureAnnouncer } from '../../internal/announce';
import { useLocale, useSettings } from '../../internal/provider';
import * as icons from '../../material/builtin';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { Icon } from '../Icon/Icon';
import { SortableList } from '../SortableList/SortableList';
import { en as words } from './labels';
import { en as tagWords } from '../TagGroup/labels';
import { en as comboWords } from '../Combobox/labels';

/** What each row's render function gets beside the row's value. */
export interface FieldListRow<T> {
  /** The row's place, from 0. */
  index: number;
  /** The row's name, from itemLabel ("Phone 2"). */
  label: string;
  /** A native form name for one of the row's fields: name("number") is "phones[1].number", and name() is
   *  "phones[1]". Undefined without the list's name. */
  name: (field?: string) => string | undefined;
  /** Changes the row's value: a new value, or a function of the current one. */
  update: (next: T | ((row: T) => T)) => void;
  /** The row's error, from errors, so its fields can show it as invalid. */
  error: React.ReactNode;
}

export interface FieldListProps<T> extends Omit<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, 'children' | 'onChange' | 'defaultValue'> {
  /** The list's name, its legend: "Phone numbers". */
  label: React.ReactNode;
  /** Words under the legend: what the list is for, or its limits. */
  hint?: React.ReactNode | undefined;
  /** Each row's name, from its place (counted from 0): `(i) => 'Phone ' + (i + 1)`. Rows are groups with this name,
   *  their Remove buttons say it ("Remove Phone 2"), and adding or removing one is announced with it. */
  itemLabel: (index: number) => string;
  /** The rows' values, controlled. Use with onValueChange. */
  value?: readonly T[] | undefined;
  /** The rows' values to start with, uncontrolled. Default: min rows made by newItem. */
  defaultValue?: readonly T[] | undefined;
  /** Called with the new rows when one is added, removed, changed or moved. */
  onValueChange?: ((rows: T[]) => void) | undefined;
  /** Makes the value of a row people add: `() => ({ number: '' })`. */
  newItem: () => T;
  /** One row's fields, up to three side by side: `(row, { name, update }) => <Field …><Input …/></Field>`. */
  children: (row: T, state: FieldListRow<T>) => React.ReactNode;
  /** The Add button's words: "Add phone". */
  addLabel: string;
  /** The fewest rows: Remove is hidden while the list has this many. Default 0. */
  min?: number | undefined;
  /** The most rows: at this many, Add stays focusable but does nothing, and says why ("Limit reached: 5."). */
  max?: number | undefined;
  /** The start of each field's native form name ("phones"), so a plain form submit sends phones[0].number and so on. */
  name?: string | undefined;
  /** An error for the whole list ("Add at least one phone"), under the rows. */
  error?: React.ReactNode | undefined;
  /** An error for each row, by place, under that row. */
  errors?: readonly React.ReactNode[] | undefined;
  /** People can put the rows in their own order, with a handle on each (SortableList). */
  reorderable?: boolean | undefined;
  /** Disables every field, Add and Remove (the fieldset's own disabled). */
  disabled?: boolean | undefined;
}

const OWN = { label: 1, hint: 1, itemLabel: 1, value: 1, defaultValue: 1, onValueChange: 1, newItem: 1, children: 1, addLabel: 1, min: 1, max: 1, name: 1, error: 1, errors: 1, reorderable: 1, className: 1 } as const;
const allWords = /* @__PURE__ */ Object.assign({}, words, tagWords, comboWords);
// The first field of a row, skipping its Remove button and the reorder handle.
const FIELD = 'input:not([type="hidden"]), select, textarea, button, a[href], [tabindex]:not([tabindex="-1"])';
const firstField = (row: Element | null | undefined) => (row ? Array.from(row.querySelectorAll<HTMLElement>(FIELD)).find((e) => !e.closest('.dk-field-list__remove, .dk-sortable-list__handle')) || null : null);
const shows = (v: React.ReactNode) => v != null && v !== false && v !== '';

/* FieldList: a <fieldset> with a legend, its rows (each a group named by itemLabel, its fields from children and a
   Remove button), then Add. Rows keep their own keys as they come and go, so a field keeps its focus and its text
   while the rows around it change. Add moves focus to the new row's first field, and Remove to the field of the row
   before, or to Add when the first row goes; each is said politely ("Phone 3 added"). At max, Add stays in the Tab
   order (aria-disabled) and says why; at min, Remove is gone. */
/** Rows people add and remove in a form, such as phone numbers or invoice lines, each a named group of a few fields.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const FieldList = /* @__PURE__ */ component<HTMLFieldSetElement, FieldListProps<unknown>>('FieldList', function FieldList(props, ref) {
  const rest = omit(props, OWN);
  const L = useSettings(allWords).labels;
  const locale = useLocale();
  const base = domId('dk-fl', React.useId());
  const min = Math.max(0, Math.floor(props.min || 0));
  const max = props.max != null && props.max >= Math.max(1, min) ? Math.floor(props.max) : Infinity;
  const { newItem, itemLabel, onValueChange } = props;
  const [start] = React.useState(() => props.defaultValue ? props.defaultValue.slice() : Array.from({ length: min }, () => newItem()));
  const [rows, setOwn] = useControllable<readonly unknown[]>(props.value, start, 'FieldList', 'value');
  // Each row's key, beside its value: kept in step by add, remove and move, and padded or cut when the caller
  // changes the number of rows some other way.
  const next = React.useRef(0);
  const keys = React.useRef<number[]>([]);
  while (keys.current.length < rows.length) keys.current.push(next.current++);
  if (keys.current.length > rows.length) keys.current.length = rows.length;
  const latest = React.useRef(rows);
  latest.current = rows;
  const own = React.useRef<HTMLFieldSetElement | null>(null);
  const setRef = useMergedRef(ref, (n: HTMLFieldSetElement | null) => { own.current = n; });
  const addRef = React.useRef<HTMLButtonElement | null>(null);
  const focusNext = React.useRef<number | 'add' | null>(null);
  React.useEffect(() => { ensureAnnouncer(); }, []);   // no cleanup: the region is shared
  const commit = (list: unknown[], order: number[]) => {
    keys.current = order;
    latest.current = list;
    setOwn(list);
    if (onValueChange) onValueChange(list);
  };
  const add = () => {
    if (rows.length >= max || props.disabled) return;
    const list = latest.current.concat([newItem()]);
    const order = keys.current.concat([next.current++]);
    focusNext.current = order[order.length - 1] as number;
    commit(list, order);
    announce(L.valueAdded(itemLabel(list.length - 1)));
  };
  const remove = (at: number) => {
    const label = itemLabel(at);
    const list = latest.current.slice(), order = keys.current.slice();
    list.splice(at, 1);
    order.splice(at, 1);
    focusNext.current = at > 0 ? order[at - 1] as number : 'add';
    commit(list, order);
    announce(L.valueRemoved(label));
  };
  const update = (at: number, value: unknown) => {
    const list = latest.current.slice();
    list[at] = typeof value === 'function' ? (value as (row: unknown) => unknown)(list[at]) : value;
    commit(list, keys.current.slice());
  };
  // every render: acts once, in the render that follows an add or a remove.
  useIsoLayoutEffect(() => {
    const want = focusNext.current;
    focusNext.current = null;
    if (want == null || !own.current) return;
    const target = want === 'add' ? addRef.current : firstField(own.current.querySelector(`[data-row-key="${want}"]`));
    if (target) target.focus();
  });

  const atMax = rows.length >= max;
  const limit = atMax ? L.fieldListLimit(new Intl.NumberFormat(locale).format(max)) : '';
  const hintId = shows(props.hint) ? base + '-hint' : undefined, errorId = shows(props.error) ? base + '-error' : undefined;
  const rowFor = (value: unknown, at: number) => {
    const label = itemLabel(at), rowError = props.errors ? props.errors[at] : undefined;
    const rowErrorId = shows(rowError) ? `${base}-${keys.current[at]}-error` : undefined;
    const state: FieldListRow<unknown> = {
      index: at,
      label,
      name: (field) => (props.name ? `${props.name}[${at}]${field ? '.' + field : ''}` : undefined),
      update: (v) => update(at, v),
      error: rowError,
    };
    return (
      <div className="dk-field-list__row" role="group" aria-label={label} aria-describedby={rowErrorId} data-row-key={keys.current[at]}>
        <div className="dk-field-list__fields">{props.children(value, state)}</div>
        {rows.length > min ? <IconButton className="dk-field-list__remove" icon={icons.Close} label={L.tagRemove(label)} onClick={() => remove(at)} /> : null}
        {rowErrorId ? <div className="dk-field-list__error dk-field-list__row-error"><Icon icon={icons.Error} className="dk-field-list__error-icon" /><span id={rowErrorId}>{rowError}</span></div> : null}
      </div>
    );
  };
  const list = props.reorderable
    ? <SortableList className="dk-field-list__rows" items={rows.map((value, at) => ({ value, at, key: keys.current[at] as number }))} getKey={(r) => r.key} getLabel={(r) => itemLabel(r.at)} disabled={props.disabled}
        renderItem={(r) => rowFor(r.value, r.at)}
        onReorder={(moved) => commit(moved.map((r) => r.value), moved.map((r) => r.key))} />
    : rows.length ? <ul role="list" className="dk-field-list__rows">{rows.map((value, at) => <li key={keys.current[at]}>{rowFor(value, at)}</li>)}</ul> : null;
  return (
    <fieldset {...rest} ref={setRef} className={cn('dk-field-list', props.className)} data-component="field-list" aria-describedby={cn(hintId, errorId, rest['aria-describedby']) || undefined}>
      <legend className="dk-field-list__label">{props.label}</legend>
      {hintId ? <div className="dk-field-list__hint" id={hintId}>{props.hint}</div> : null}
      {list}
      {errorId ? <div className="dk-field-list__error"><Icon icon={icons.Error} className="dk-field-list__error-icon" /><span id={errorId}>{props.error}</span></div> : null}
      <div className="dk-field-list__add">
        <Button ref={addRef} variant="secondary" size="sm" leftIcon={icons.Add} disabled={atMax} disabledReason={limit || undefined} onClick={add}>{props.addLabel}</Button>
        {atMax ? <span className="dk-field-list__limit" aria-hidden>{limit}</span> : null}
      </div>
    </fieldset>
  );
}) as <T>(props: FieldListProps<T> & { ref?: React.Ref<HTMLFieldSetElement> | undefined }) => React.ReactElement;
