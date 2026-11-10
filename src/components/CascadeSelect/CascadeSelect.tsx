'use client';
import * as React from 'react';
import { cn, domId, isInvalid, omit, useMergedRef, useIsoLayoutEffect } from '../../internal/cn';
import { component } from '../../internal/component';
import { useSettings } from '../../internal/provider';
import { useFieldControl } from '../../internal/field';
import { useFormReset } from '../../internal/useFormReset';
import { useAnchoredLayer } from '../../internal/useAnchoredLayer';
import { useExit } from '../../internal/useExit';
import { isComposing } from '../../internal/ime';
import { typeahead, type Typed } from '../../internal/typeahead';
import { Icon } from '../Icon/Icon';
import * as icons from '../../material/builtin';
import { en as words } from './labels';

/** One choice in a CascadeSelect, with the choices under it. */
export interface CascadeOption {
  /** What it submits and what value holds. Unique among its siblings. */
  value: string;
  /** What people read. */
  label: string;
  /** The choices under it. Leave it out, with loadOptions, to load them when it's opened; an empty list makes it a last step. */
  children?: CascadeOption[] | undefined;
  /** It has nothing under it, even with loadOptions. */
  isLeaf?: boolean | undefined;
  /** Can't be chosen. */
  disabled?: boolean | undefined;
}

export interface CascadeSelectProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'defaultValue' | 'onChange' | 'children' | 'type'> {
  /** The first column's choices, with their children. */
  options: CascadeOption[];
  /** The chosen path, as values from the first column down (controlled). */
  value?: string[] | undefined;
  /** The path it starts with (uncontrolled). */
  defaultValue?: string[] | undefined;
  /** Called with the new path and its options when a choice is made. */
  onValueChange?: ((value: string[], details: { options: CascadeOption[] }) => void) | undefined;
  /** Loads the children of the last option of path, when it has none yet: return them (a promise). */
  loadOptions?: ((path: CascadeOption[]) => Promise<CascadeOption[]>) | undefined;
  /** Each column's name, from the first: ["Provinsi", "Kabupaten/Kota", "Kecamatan"]. Default: "Level 1", "Level 2"… */
  levels?: string[] | undefined;
  /** Lets a choice that has children be chosen too (Enter on it), not only a last step. Default: false. */
  selectParents?: boolean | undefined;
  /** Shown on the button with nothing chosen. Default: "Choose…". */
  placeholder?: string | undefined;
  /** 'sm', 'md' (default) or 'lg', at the control heights 24, 32 and 44px. */
  size?: 'sm' | 'md' | 'lg' | undefined;
  /** A danger outline, and aria-invalid. In a Field with an error, it's set for you. */
  invalid?: boolean | undefined;
  /** Submits the last value of the path with a form, under this name. */
  name?: string | undefined;
  /** Whether the panel is open (controlled). Use with onOpenChange. */
  open?: boolean | undefined;
  /** Whether the panel is open at first (uncontrolled). Default: false. */
  defaultOpen?: boolean | undefined;
  /** Called when the panel asks to open or close, with why: 'trigger' (the button or ArrowDown/ArrowUp on it),
   *  'select' (a choice was made), 'escape', 'outside' (a click or focus outside) or 'reset' (the form was reset). */
  onOpenChange?: ((open: boolean, details: { reason: 'trigger' | 'select' | 'escape' | 'outside' | 'reset' }) => void) | undefined;
}

type Loaded = Map<string, CascadeOption[] | 'loading' | 'failed'>;
const keyOf = (values: string[]) => JSON.stringify(values);

/* CascadeSelect: a button (role="combobox", so a Field's label, error and required reach it) that opens a dialog of
   side-by-side listboxes, one per level: picking in one shows its children in the next. Up and Down move in a column,
   Right (Left in right-to-left) goes into the children, Left goes back, Home and End, letters jump; Enter or a click
   on a last step chooses the path and closes it, Escape closes it without a change. Children can load when an option
   is opened (loadOptions). Narrower than three columns, it shows one column at a time with a Back button. */
/** A choice made through a hierarchy, such as Provinsi › Kabupaten/Kota › Kecamatan, in side-by-side columns.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const CascadeSelect = /* @__PURE__ */ component<HTMLButtonElement, CascadeSelectProps>('CascadeSelect', function CascadeSelect(props, ref) {
  props = useFieldControl(props);
  const sds = useSettings(words), L = sds.labels;
  const rest = omit(props, { options: 1, value: 1, defaultValue: 1, onValueChange: 1, loadOptions: 1, levels: 1, selectParents: 1, placeholder: 1, size: 1, invalid: 1, name: 1, open: 1, defaultOpen: 1, onOpenChange: 1, className: 1, style: 1, form: 1, disabled: 1 } as const);
  const base = domId('dk-cs', React.useId());
  const size = props.size === 'sm' || props.size === 'lg' ? props.size : 'md';
  const invalid = isInvalid(props.invalid, props['aria-invalid']);
  const disabled = !!props.disabled;
  const controlled = props.value !== undefined;
  const [own, setOwn] = React.useState<string[]>(props.defaultValue || []);
  const value = controlled ? props.value! : own;
  const [loaded, setLoaded] = React.useState<Loaded>(() => new Map());
  // Options chosen before, kept so a path whose children were loaded still reads in words.
  const [known, setKnown] = React.useState<CascadeOption[]>([]);
  const [ownOpen, setOwnOpen] = React.useState(!!props.defaultOpen);
  const open = !disabled && (props.open !== undefined ? props.open : ownOpen);
  type Reason = 'trigger' | 'select' | 'escape' | 'outside' | 'reset';
  const setOpen = (next: boolean, reason: Reason) => {
    if (next === open) return;
    if (props.open === undefined) setOwnOpen(next);
    if (props.onOpenChange) props.onOpenChange(next, { reason });
  };
  // The path being looked at while open (the highlighted option in each column), and the focused column.
  const [path, setPath] = React.useState<string[]>(value);
  const [col, setCol] = React.useState(Math.max(0, value.length - 1));
  const button = React.useRef<HTMLButtonElement | null>(null);
  const panel = React.useRef<HTMLDivElement | null>(null);
  const hidden = React.useRef<HTMLInputElement | null>(null);
  const typed = React.useRef<Typed>({ text: '', at: 0 });
  const rtl = () => !!button.current && getComputedStyle(button.current).direction === 'rtl';

  const childrenOf = (o: CascadeOption | null, at: string[]): CascadeOption[] | 'loading' | 'failed' | null => {
    if (!o) return props.options || [];
    if (o.children) return o.children;
    if (o.isLeaf || !props.loadOptions) return null;
    return loaded.get(keyOf(at)) || null;
  };
  const hasMore = (o: CascadeOption, at: string[]) => !o.isLeaf && (o.children ? o.children.length > 0 : !!props.loadOptions || (loaded.get(keyOf(at)) || []).length > 0);
  // The columns for a path: the first column, then the children of each option on it.
  const columnsFor = (p: string[]) => {
    const cols: { options: CascadeOption[] | 'loading' | 'failed'; chosen: CascadeOption | null }[] = [];
    let list: ReturnType<typeof childrenOf> = childrenOf(null, []);
    for (let i = 0; list; i++) {
      const chosen = Array.isArray(list) ? list.find((o) => o.value === p[i]) || null : null;
      cols.push({ options: list, chosen });
      if (!chosen) break;
      list = childrenOf(chosen, p.slice(0, i + 1));
    }
    return cols;
  };
  const optionsOf = (p: string[]) => {
    const out: CascadeOption[] = [];
    for (const c of columnsFor(p)) if (c.chosen) out.push(c.chosen);
    return out;
  };
  const columns = columnsFor(open ? path : value);

  const load = (p: string[]) => {
    const opts = optionsOf(p), last = opts[opts.length - 1];
    // Only once every step of the path is known: before that, a deeper path would load the wrong option's children.
    if (!props.loadOptions || !last || opts.length !== p.length || last.children || last.isLeaf || (loaded.has(keyOf(p)) && loaded.get(keyOf(p)) !== 'failed')) return;
    setLoaded((m) => new Map(m).set(keyOf(p), 'loading'));
    props.loadOptions(opts).then((kids) => setLoaded((m) => new Map(m).set(keyOf(p), kids)), () => setLoaded((m) => new Map(m).set(keyOf(p), 'failed')));
  };

  // A value set from outside (a saved one in an edit form): its deeper levels are loaded without opening, a level at
  // a time, so the button reads it in words. A load that failed isn't tried again until the panel opens.
  // every render: each level that arrives lets the next one load, and load() itself skips what's loaded or loading.
  React.useEffect(() => {
    if (!props.loadOptions) return;
    for (let i = 1; i < value.length; i++) { const p = value.slice(0, i); if (!loaded.has(keyOf(p))) load(p); }
  });
  // The value in words: from the options, or from the ones chosen before (loaded children), or the values themselves.
  const chosenLabels = value.map((v, i) => {
    const o = optionsOf(value)[i] || known.find((k, j) => j === i && k.value === v);
    return o ? o.label : v;
  });

  const choose = (p: string[]) => {
    const opts = optionsOf(p);
    setKnown(opts);
    if (!controlled) setOwn(p);
    if (props.onValueChange) props.onValueChange(p, { options: opts });
    close(true, 'select');
  };
  const close = (focus: boolean, reason: Reason) => { setOpen(false, reason); if (focus && button.current) button.current.focus(); };
  // The dialog is named as the field is: its aria-label, else its <label>'s text (a Field's), read when it opens.
  const [dialogName, setDialogName] = React.useState('');
  const show = () => { if (!disabled) setOpen(true, 'trigger'); };
  // Each time it opens: the chosen path highlighted, its column focused, the columns on it loaded, the dialog named.
  const focusCol = React.useRef<number | null>(null);
  const first = React.useRef(true);
  useIsoLayoutEffect(() => {
    const opening = open && !first.current;
    first.current = false;
    if (!open) return;
    const b = button.current, label = b && b.labels && b.labels[0];
    setDialogName(props['aria-label'] || (label && label.textContent) || (props.levels && props.levels[0]) || L.cascadePlaceholder);
    const start = value.slice(), c = Math.max(0, start.length - 1);
    setPath(start); setCol(c);
    if (opening) focusCol.current = c;
    start.forEach((_, i) => load(start.slice(0, i + 1)));
  }, [open]);
  useFormReset(hidden, () => { if (!controlled) setOwn(props.defaultValue || []); setOpen(false, 'reset'); }, props.form);
  const exit = useExit(open, panel);
  useAnchoredLayer(open, panel, button, { placement: 'bottom-start', offsetVar: '--dk-cs-offset', onOutside: () => close(false, 'outside'), onFocusOutside: () => close(false, 'outside'), inside: button });

  // Focus follows the focused column's highlighted option (or its first).
  // every render: a key or a load that moves focus sets focusCol, and the column it names is in this render's panel.
  React.useEffect(() => {
    if (!open || focusCol.current == null || !panel.current) return;
    const lists = panel.current.querySelectorAll<HTMLElement>('[role=listbox]'), list = lists[focusCol.current];
    if (!list) return;
    const target = list.querySelector<HTMLElement>("[role=option][tabindex='0']") || list;
    target.focus({ preventScroll: true });
    if (typeof target.scrollIntoView === 'function') target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    focusCol.current = null;
  });

  const pick = (c: number, o: CascadeOption, viaKey: boolean) => {
    if (o.disabled) return;
    const next = path.slice(0, c).concat(o.value);
    // A last step is chosen at once; with selectParents, a second click on a highlighted parent chooses it too.
    if (!hasMore(o, next) || (props.selectParents && path[c] === o.value && path.length === c + 1)) { choose(next); return; }
    setPath(next);
    load(next);
    if (!viaKey) { setCol(c + 1); focusCol.current = c + 1; }
  };
  const onKeyDown = (c: number, list: CascadeOption[]) => (e: React.KeyboardEvent<HTMLElement>) => {
    if (isComposing(e)) return;
    const k = e.key, into = rtl() ? 'ArrowLeft' : 'ArrowRight', back = rtl() ? 'ArrowRight' : 'ArrowLeft';
    const enabled = list.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);
    const at = list.findIndex((o) => o.value === path[c]);
    const go = (i: number) => {
      if (i < 0 || !list[i]) return;
      const next = path.slice(0, c).concat(list[i].value);
      setPath(next); setCol(c); focusCol.current = c;
    };
    if (k === 'ArrowDown') go(enabled.find((i) => i > at) ?? (at < 0 ? enabled[0] : -1));
    else if (k === 'ArrowUp') go([...enabled].reverse().find((i) => i < at) ?? -1);
    else if (k === 'Home') go(enabled[0]);
    else if (k === 'End') go(enabled[enabled.length - 1]);
    else if (k === into) {
      const o = list[at];
      if (!o || !hasMore(o, path.slice(0, c + 1))) return;
      load(path.slice(0, c + 1)); setCol(c + 1); focusCol.current = c + 1;
      const kids = childrenOf(o, path.slice(0, c + 1));
      if (Array.isArray(kids)) { const first = kids.find((x) => !x.disabled); if (first) setPath(path.slice(0, c + 1).concat(first.value)); }
    } else if (k === back) { if (c > 0) { setPath(path.slice(0, c)); setCol(c - 1); focusCol.current = c - 1; } }
    else if (k === 'Enter' || k === ' ') {
      const o = list[at];
      if (!o || o.disabled) return;
      const p = path.slice(0, c + 1);
      if (!hasMore(o, p) || props.selectParents) choose(p);
      else { load(p); setCol(c + 1); focusCol.current = c + 1; }
    } else if (k === 'Escape') { e.stopPropagation(); close(true, 'escape'); }
    else if (k === 'Tab') return;
    else if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      go(typeahead(typed.current, k, list.map((o) => (o.disabled ? '' : o.label)), at));
    } else return;
    e.preventDefault();
  };

  const labelFor = (c: number) => (props.levels && props.levels[c]) || L.cascadeLevel(c + 1);
  const empty = !value.length;
  const mergedRef = useMergedRef(ref, (n) => { button.current = n; });
  return (
    <div className={cn('dk-cascade-select', 'dk-cascade-select--size-' + size, invalid && 'dk-cascade-select--invalid', disabled && 'dk-cascade-select--disabled', open && 'dk-cascade-select--open', props.className)} style={props.style} data-component="cascade-select" data-state={open ? 'open' : 'closed'}>
      <button {...rest} ref={mergedRef} type="button" role="combobox" className="dk-cascade-select__button"
        aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? base + '-panel' : undefined} aria-invalid={invalid || undefined} disabled={disabled}
        onClick={(e) => { if (rest.onClick) rest.onClick(e); if (!e.defaultPrevented) { if (open) close(false, 'trigger'); else show(); } }}
        onKeyDown={(e) => { if (rest.onKeyDown) rest.onKeyDown(e); if (!e.defaultPrevented && !open && (e.key === 'ArrowDown' || e.key === 'ArrowUp') && !isComposing(e)) { e.preventDefault(); show(); } }}>
        <span className={cn('dk-cascade-select__value', empty && 'dk-cascade-select__value--empty')} dir="auto">{empty ? props.placeholder ?? L.cascadePlaceholder : L.cascadePath(chosenLabels)}</span>
        <Icon icon={icons.ExpandMore} className="dk-cascade-select__chevron" />
      </button>
      {props.name ? <input ref={hidden} type="hidden" name={props.name} form={props.form} value={value[value.length - 1] || ''} disabled={disabled} /> : <input ref={hidden} type="hidden" disabled />}
      <span id={base + '-more'} hidden>{L.cascadeHasMore(open && rtl())}</span>
      <div ref={panel} id={base + '-panel'} role="dialog" aria-label={dialogName}
        {...{ popover: 'manual' }} hidden={!open || undefined} inert={!open || undefined} data-instant={exit.instant ? '' : undefined} className="dk-cascade-select__panel">
        {open || exit.leaving ? columns.map((column, c) => (
          <div key={c} className="dk-cascade-select__column" data-active={c === Math.min(col, columns.length - 1) ? '' : undefined}>
            <div className="dk-cascade-select__level" id={base + '-level-' + c}>
              {c > 0 ? <button type="button" className="dk-cascade-select__back" tabIndex={-1} aria-label={L.cascadeBack} onClick={() => { setPath(path.slice(0, c)); setCol(c - 1); focusCol.current = c - 1; }}><Icon icon={icons.ChevronLeft} /></button> : null}
              {labelFor(c)}
            </div>
            {Array.isArray(column.options) ? (
              <div role="listbox" className="dk-cascade-select__list" aria-labelledby={base + '-level-' + c} tabIndex={column.options.length && column.options.some((o) => o.value === path[c]) ? -1 : 0}
                onKeyDown={onKeyDown(c, column.options)} onFocus={() => setCol(c)}
                onClick={(e) => { const el = e.target instanceof Element ? e.target.closest<HTMLElement>('[role=option]') : null, o = el && Array.isArray(column.options) ? column.options[Number(el.dataset.index)] : null; if (o) { setCol(c); pick(c, o, false); } }}>
                {column.options.length ? column.options.map((o, i) => {
                  const on = path[c] === o.value, more = hasMore(o, path.slice(0, c).concat(o.value));
                  return (
                    <div key={o.value} role="option" id={base + '-' + c + '-' + o.value} className={cn('dk-cascade-select__option', on && 'dk-cascade-select__option--on')} aria-selected={on} aria-disabled={o.disabled || undefined}
                      aria-describedby={more ? base + '-more' : undefined} tabIndex={on ? 0 : -1} dir="auto" data-index={i}>
                      <span className="dk-cascade-select__label">{o.label}</span>
                      {more ? <Icon icon={icons.ChevronRight} className="dk-cascade-select__more" /> : (value[c] === o.value && value.length === c + 1 ? <Icon icon={icons.Check} className="dk-cascade-select__check" /> : null)}
                    </div>
                  );
                }) : <div className="dk-cascade-select__note">{L.cascadeEmpty}</div>}
              </div>
            ) : (
              <div className="dk-cascade-select__note" role="status" aria-live="polite" aria-busy={column.options === 'loading' || undefined}>{column.options === 'loading' ? L.cascadeLoading : L.cascadeFailed}</div>
            )}
          </div>
        )) : null}
      </div>
    </div>
  );
});
