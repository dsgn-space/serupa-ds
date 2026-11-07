'use client';
import * as React from 'react';
import { cn, domId, omit, setRef } from '../../internal/cn';
import { component } from '../../internal/component';
import { useLocale, useSettings } from '../../internal/provider';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { Icon } from '../Icon/Icon';
import { Popover } from '../Popover/Popover';
import { Menu, MenuItem } from '../Menu/Menu';
import { Checkbox, CheckboxGroup } from '../Checkbox/Checkbox';
import { Radio, RadioGroup } from '../Radio/Radio';
import { Switch } from '../Switch/Switch';
import { Input } from '../Input/Input';
import { DateRangePicker } from '../DateRangePicker/DateRangePicker';
import * as icons from '../../material/builtin';
import { en as words } from './labels';

/** One choice in a select filter: a string is both its value and its label. */
export type FilterOption = string | { value: string; label: string };

/** A field people can filter by, and the editor its chip opens. */
export type FilterField =
  | { id: string; label: string; type: 'select'; options: FilterOption[]; multiple?: boolean | undefined }
  | { id: string; label: string; type: 'date-range' }
  | { id: string; label: string; type: 'boolean' }
  | { id: string; label: string; type: 'text'; placeholder?: string | undefined };

/** A filter's value: the chosen option(s), a date range ("yyyy-mm-dd" ends, either may be null), true, or a text. */
export type FilterValue = string | string[] | boolean | { start: string | null; end: string | null };
/** Every active filter, by field id: plain data, so it can live in the URL. */
export type FilterValues = Record<string, FilterValue>;

export interface FilterBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'children'> {
  /** The fields people can filter by, in the order the "Add filter" menu lists them. */
  fields: FilterField[];
  /** The active filters (controlled). Use with onValueChange. */
  value?: FilterValues | undefined;
  /** The filters it starts with (uncontrolled). */
  defaultValue?: FilterValues | undefined;
  /** Called with every active filter when one is added, changed, removed or cleared. */
  onValueChange?: ((value: FilterValues) => void) | undefined;
  /** How many results the filters leave: shown at the end and announced when it changes. Leave it out to show nothing. */
  resultsCount?: number | undefined;
  /** Anything after the chips and before the count, such as a sort Select or a view switch. */
  actions?: React.ReactNode | undefined;
}

const labelOf = (o: FilterOption) => (typeof o === 'string' ? o : o.label);
const valueOf = (o: FilterOption) => (typeof o === 'string' ? o : o.value);
/** A filter with nothing chosen is left out of the value when its editor closes. */
function isEmpty(v: FilterValue | undefined): boolean {
  if (v == null || v === false || v === '') return true;
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object') return !v.start && !v.end;
  return false;
}
function emptyFor(f: FilterField): FilterValue {
  if (f.type === 'select') return f.multiple ? [] : '';
  if (f.type === 'date-range') return { start: null, end: null };
  if (f.type === 'boolean') return true;
  return '';
}
const toDate = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };

/* FilterBar: the filters on a list or table, as a row of chips. "Add filter" opens a menu of the fields not yet in
   use; each chip says its filter in words ("Status is Open or Closed") and opens its editor in a Popover (checkboxes
   or radios, a date range, a switch, a text field); its × removes it, and "Clear all" removes every one. The value is
   plain data ({ status: ["open"], due: { start, end } }) for the URL. With resultsCount, the count after the chips is
   a status, so screen readers hear it change. */
/** A row of removable filter chips, each opening its own editor, with "Add filter", "Clear all" and a results count.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const FilterBar = /* @__PURE__ */ component<HTMLDivElement, FilterBarProps>('FilterBar', function FilterBar(props, ref) {
  const sds = useSettings(words), L = sds.labels, locale = useLocale();
  const rest = omit(props, { fields: 1, value: 1, defaultValue: 1, onValueChange: 1, resultsCount: 1, actions: 1, className: 1 } as const);
  const base = domId('dk-fb', React.useId());
  const controlled = props.value !== undefined;
  const [own, setOwn] = React.useState<FilterValues>(props.defaultValue || {});
  const value = controlled ? props.value! : own;
  const [editing, setEditing] = React.useState<string | null>(null);
  const root = React.useRef<HTMLDivElement | null>(null);
  // Where focus goes after a render: a chip's button (by field id), or "add".
  const focusNext = React.useRef<string | null>(null);

  const set = (next: FilterValues) => {
    if (!controlled) setOwn(next);
    if (props.onValueChange) props.onValueChange(next);
  };
  const without = (id: string) => { const next = { ...value }; delete next[id]; return next; };
  const active = props.fields.filter((f) => f.id in value);
  const unused = props.fields.filter((f) => !(f.id in value));

  // every render: a removal or an added filter sets focusNext, and what it names is in this render's chips.
  React.useEffect(() => {
    const to = focusNext.current;
    if (!to || !root.current) return;
    focusNext.current = null;
    const el = root.current.querySelector<HTMLElement>(to === 'add' ? '[data-filter-add]' : '[data-filter="' + CSS.escape(to) + '"]');
    if (el) el.focus();
  });

  const add = (f: FilterField) => {
    set({ ...value, [f.id]: emptyFor(f) });
    // A switch is on as soon as it's added; the others open their editor.
    if (f.type === 'boolean') focusNext.current = f.id;
    else setEditing(f.id);
  };
  const remove = (f: FilterField) => {
    const i = active.indexOf(f), after = active[i + 1] || active[i - 1];
    focusNext.current = after ? after.id : 'add';
    set(without(f.id));
  };
  const closeEditor = (f: FilterField) => {
    setEditing(null);
    // Closed with nothing chosen: the filter goes, and focus to "Add filter".
    if (isEmpty(value[f.id])) { focusNext.current = 'add'; set(without(f.id)); }
  };

  const list = (vs: string[]) => {
    try { return new Intl.ListFormat(locale, { type: 'disjunction' }).format(vs); } catch { return vs.join(', '); }
  };
  const said = (f: FilterField): string => {
    const v = value[f.id];
    if (isEmpty(v)) return L.filterAny(f.label);
    if (f.type === 'boolean') return f.label;
    if (f.type === 'text') return L.filterContains(f.label, typeof v === 'string' ? v : '');
    if (f.type === 'date-range') {
      const r = v as { start: string | null; end: string | null };
      const fmt = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });
      // Thin and narrow spaces as plain ones: Node's ICU and the browser's put different spaces around the range's dash,
      // so a server render wouldn't match the browser's.
      const text = (r.start && r.end ? fmt.formatRange(toDate(r.start), toDate(r.end)) : r.start ? fmt.format(toDate(r.start)) + ' –' : '– ' + fmt.format(toDate(r.end!))).replace(/[\u2009\u202f]/g, ' ');
      return L.filterIs(f.label, text);
    }
    const chosen = Array.isArray(v) ? v : typeof v === 'string' ? [v] : [];
    return L.filterIs(f.label, list(chosen.map((c) => { const o = f.options.find((x) => valueOf(x) === c); return o ? labelOf(o) : c; })));
  };

  const editor = (f: FilterField) => {
    const v = value[f.id], put = (x: FilterValue) => set({ ...value, [f.id]: x });
    if (f.type === 'select' && f.multiple) {
      return (
        <CheckboxGroup aria-label={f.label} value={Array.isArray(v) ? v : []} onValueChange={(x: string[]) => put(x)} className="dk-filter-bar__options">
          {f.options.map((o) => <Checkbox key={valueOf(o)} value={valueOf(o)}>{labelOf(o)}</Checkbox>)}
        </CheckboxGroup>
      );
    }
    if (f.type === 'select') {
      return (
        <RadioGroup aria-label={f.label} value={typeof v === 'string' ? v : ''} onValueChange={(x: string) => put(x)} className="dk-filter-bar__options">
          {f.options.map((o) => <Radio key={valueOf(o)} value={valueOf(o)}>{labelOf(o)}</Radio>)}
        </RadioGroup>
      );
    }
    if (f.type === 'date-range') {
      const r = (v && typeof v === 'object' && !Array.isArray(v) ? v : { start: null, end: null });
      return <DateRangePicker aria-label={f.label} value={r} onValueChange={(_, iso) => put(iso)} />;
    }
    if (f.type === 'boolean') return <Switch checked={v === true} onCheckedChange={(on) => put(on)}>{f.label}</Switch>;
    return <Input aria-label={f.label} placeholder={f.placeholder} value={typeof v === 'string' ? v : ''} onChange={(e) => put(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); focusNext.current = f.id; closeEditor(f); } }} />;
  };

  return (
    <div {...rest} ref={(n) => { root.current = n; setRef(ref, n); }} role="group" aria-label={props['aria-label'] || (props['aria-labelledby'] ? undefined : L.filterBar)}
      className={cn('dk-filter-bar', props.className)} data-component="filter-bar">
      <ul className="dk-filter-bar__chips" role="list">
        {active.map((f) => (
          <li key={f.id} className={cn('dk-filter-bar__chip', isEmpty(value[f.id]) && 'dk-filter-bar__chip--empty')}>
            <Popover title={f.label} placement="bottom-start" sheet="mobile" open={editing === f.id}
              onOpenChange={(open) => { if (open) setEditing(f.id); else closeEditor(f); }}
              trigger={<button type="button" className="dk-filter-bar__edit" data-filter={f.id} dir="auto" title={said(f)}>{said(f)}</button>}>
              {(close) => (
                <div className="dk-filter-bar__editor">
                  {editor(f)}
                  <Button size="sm" className="dk-filter-bar__done" onClick={() => { close(); }}>{L.filterDone}</Button>
                </div>
              )}
            </Popover>
            <IconButton className="dk-filter-bar__remove" icon={icons.Close} size="sm" variant="ghost" label={L.filterRemove(f.label)} onClick={() => remove(f)} />
          </li>
        ))}
        <li className="dk-filter-bar__add">
          <Menu trigger={<Button variant="ghost" size="sm" leftIcon={<Icon icon={icons.Add} />} disabled={!unused.length} data-filter-add="">{L.filterAdd}</Button>}>
            {unused.map((f) => <MenuItem key={f.id} onSelect={() => add(f)}>{f.label}</MenuItem>)}
          </Menu>
        </li>
      </ul>
      {active.length ? <Button variant="link" size="sm" className="dk-filter-bar__clear" onClick={() => { focusNext.current = 'add'; setEditing(null); set({}); }}>{L.filterClear}</Button> : null}
      {props.actions != null ? <div className="dk-filter-bar__actions">{props.actions}</div> : null}
      {props.resultsCount != null ? <span className="dk-filter-bar__count" role="status" id={base + '-count'}>{L.filterResults(props.resultsCount)}</span> : null}
    </div>
  );
});
