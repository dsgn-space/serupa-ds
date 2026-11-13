'use client';
import * as React from 'react';
import { cn, oneOf, omit, useIsoLayoutEffect, useMergedRef } from '../../internal/cn';
import { config } from '../../internal/config';
import type { IconSource } from '../Icon/Icon';
import { asIcon } from '../Icon/asIcon';
import { component } from '../../internal/component';
import { SkeletonArt, useSkeletonShown } from '../../internal/loaderSkeleton';
import { useSettings } from '../../internal/provider';
import { warnOnce } from '../../internal/warn';
import { Checkbox, type CheckboxProps } from '../Checkbox/Checkbox';
import { en as words } from './labels';

export interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  /** ListItems. */
  children?: React.ReactNode | undefined;
  /** 'plain' (default) or 'card': inside a bordered, rounded frame. */
  variant?: 'plain' | 'card' | undefined;
  /** Lines between items. Default: true. */
  divided?: boolean | undefined;
  /** 'ul' (default) or 'ol' when the order matters. */
  as?: 'ul' | 'ol' | undefined;
  /** Its rows are loading (or reloading): sets aria-busy on the list. Pair it with ListLoadingItems. Default: false. */
  loading?: boolean | undefined;
  /** @deprecated Use loading (CONTRIBUTING.md, API naming table); removed in 15.0.0. Read as loading is, when loading isn't given. */
  busy?: boolean | undefined;
  /** 'multiple': each row gets a checkbox, and the list becomes a grid with one Tab stop: Space picks the focused row,
   *  Shift with an arrow or a click picks a run of rows, Ctrl or Cmd+A picks them all. 'single': a press or Space picks
   *  one row. Give each ListItem a value, and the list an aria-label. Default: 'none'. */
  selectionMode?: 'none' | 'single' | 'multiple' | undefined;
  /** The values of the picked rows (controlled). Use with onSelectedChange. */
  selected?: readonly string[] | undefined;
  /** The values picked at first (uncontrolled). */
  defaultSelected?: readonly string[] | undefined;
  /** Called with the picked rows' values, as they now are. */
  onSelectedChange?: ((values: string[]) => void) | undefined;
}

interface Pick { mode: 'single' | 'multiple'; has: (value: string) => boolean }
const PickContext = /* @__PURE__ */ React.createContext<Pick | null>(null);
const ROWS = ':scope > [data-list-value]';
const INSIDE = 'a[href], button, input, select, textarea, [tabindex]';
const val = (r: HTMLElement) => r.dataset.listValue as string;
const usable = (r: HTMLElement) => r.getAttribute('aria-disabled') !== 'true';

/** ListItem's own props; ListItemProps adds `as` and the linkProps that go with it. */
export interface ListItemOwnProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, 'title' | 'onClick'> {
  /** The item's main line. */
  title: React.ReactNode;
  /** A second, muted line. */
  description?: React.ReactNode | undefined;
  /** Before the text: an Avatar, an icon name or an image. */
  leading?: IconSource | undefined;
  /** After the text: meta (a date, a Badge) or actions (an IconButton, a Menu). Stays outside the link or button. */
  trailing?: React.ReactNode | undefined;
  /** Makes the item's main area a link. */
  href?: string | undefined;
  /** Makes the item's main area a button (when there's no href). */
  onClick?: ((event: React.MouseEvent<HTMLElement>) => void) | undefined;
  /** Shaded with a primary bar at its start, and aria-current="true" (or aria-pressed for a button). For the current page in a nav list, also pass linkProps={{ "aria-current": "page" }}, which wins. Default: false. */
  selected?: boolean | undefined;
  /** Dims a link or button item and stops it. In a List with selectionMode, it can't be picked either. Default: false. */
  disabled?: boolean | undefined;
  /** In a List with selectionMode: what onSelectedChange reports for this row. Unique within the list. */
  value?: string | undefined;
}

/** ListItem's props: its own, `as`, and linkProps typed by the element `as` names (an <a>'s by default), so
 *  <ListItem as={RouterLink} linkProps={{ to: '/team' }}> checks `to` against RouterLink's props (GR276). */
export type ListItemProps<C extends React.ElementType = 'a'> = ListItemOwnProps & {
  /** What renders the link: your router's link component. Default: the link set with configure({ link }), else 'a'. Its props go in linkProps. */
  as?: C | undefined;
  /** Extra props for the link or button (to for a router link, target, aria-*, data-*). */
  linkProps?: (Partial<React.ComponentPropsWithoutRef<C>> & { [data: `data-${string}`]: string | number | boolean | undefined }) | undefined;
};

/* List: rows of related things (people, files, settings), each a title with an optional description, leading
   avatar or icon and trailing meta or actions. A row can be a link or a button; trailing actions stay outside
   it so controls are never nested. className and every other prop go to the <ul>. */
/** Rows of related things: title, description, leading avatar or icon, trailing meta or actions; rows can be links. */
export const List = /* @__PURE__ */ component<HTMLUListElement, ListProps>('List', function List(props, ref) {
  if (process.env.NODE_ENV !== 'production' && props.busy != null) warnOnce('list-busy', 'List: busy is deprecated and removed in 15.0.0. Use loading, which does the same.');
  const rest = omit(props, { variant: 1, divided: 1, as: 1, loading: 1, busy: 1, className: 1, selectionMode: 1, selected: 1, defaultSelected: 1, onSelectedChange: 1 });
  const variant = oneOf(['plain', 'card'] as const, props.variant, 'plain');
  const mode = props.selectionMode === 'single' || props.selectionMode === 'multiple' ? props.selectionMode : null;
  const [own, setOwn] = React.useState<readonly string[]>(props.defaultSelected || []);
  const picked = props.selected !== undefined ? props.selected : own;
  const ul = React.useRef<HTMLUListElement | null>(null);
  const merged = useMergedRef(ref, (n: HTMLUListElement | null) => { ul.current = n; });
  const focused = React.useRef<string | null>(null);   // the row that holds the Tab stop
  const anchor = React.useRef<string | null>(null);    // where a Shift run starts
  const rows = () => (ul.current ? Array.from(ul.current.querySelectorAll<HTMLElement>(ROWS)) : []);
  // One Tab stop: the focused row (the first until the reader moves), and nothing inside a row in the Tab order;
  // the arrow keys reach a row's checkbox, link and actions.
  const rove = () => {
    const all = rows(), cur = all.find((r) => val(r) === focused.current) || all[0];
    for (const r of all) { r.tabIndex = r === cur ? 0 : -1; r.querySelectorAll<HTMLElement>(INSIDE).forEach((c) => { c.tabIndex = -1; }); }
  };
  useIsoLayoutEffect(() => { if (mode) rove(); });   // every render: rows come and go as children change

  const emit = (next: string[]) => { if (props.selected === undefined) setOwn(next); if (props.onSelectedChange) props.onSelectedChange(next); };
  const pick = (row: HTMLElement, run: boolean) => {
    if (!usable(row)) return;
    const v = val(row);
    if (mode === 'single') { emit(picked.includes(v) ? [] : [v]); return; }
    const all = rows(), from = run && anchor.current != null ? all.findIndex((r) => val(r) === anchor.current) : -1;
    if (from >= 0) {
      const to = all.indexOf(row), span = all.slice(Math.min(from, to), Math.max(from, to) + 1).filter(usable).map(val);
      emit(picked.concat(span.filter((x) => !picked.includes(x))));
      return;
    }
    anchor.current = v;
    emit(picked.includes(v) ? picked.filter((x) => x !== v) : [...picked, v]);
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    const t = e.target as HTMLElement, row = t.closest<HTMLElement>('[data-list-value]');
    if (!row || row.parentElement !== ul.current) return;
    const all = rows(), i = all.indexOf(row), onRow = t === row;
    const inside = Array.from(row.querySelectorAll<HTMLElement>(INSIDE)).filter((c) => !(c as HTMLButtonElement).disabled);
    const rtl = getComputedStyle(row).direction === 'rtl';
    const go = (j: number) => {
      const r = all[Math.max(0, Math.min(j, all.length - 1))];
      if (!r) return;
      if (e.shiftKey && mode === 'multiple') { if (anchor.current == null) anchor.current = val(row); pick(r, true); }
      r.focus();
    };
    const across = (d: number) => { const j = onRow ? (d > 0 ? 0 : -1) : inside.indexOf(t) + d; (j >= 0 && inside[j] ? inside[j] : row).focus(); };
    if (e.key === 'ArrowDown') go(i + 1);
    else if (e.key === 'ArrowUp') go(i - 1);
    else if (e.key === 'Home' && onRow) go(0);
    else if (e.key === 'End' && onRow) go(all.length - 1);
    else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') across((e.key === 'ArrowRight') !== rtl ? 1 : -1);
    else if (onRow && e.key === ' ') pick(row, e.shiftKey);
    else if (onRow && e.key === 'Enter') { const main = row.querySelector<HTMLElement>('a.dk-list__main, button.dk-list__main'); if (main) main.click(); else pick(row, false); }
    else if (onRow && mode === 'multiple' && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') emit(all.filter(usable).map(val));
    else return;
    e.preventDefault();
  };
  // A press on the row picks it, but not one on its link, button or actions: only the checkbox itself among the controls.
  const onClick = (e: React.MouseEvent<HTMLUListElement>) => {
    const t = e.target as HTMLElement, row = t.closest<HTMLElement>('[data-list-value]');
    if (!row || row.parentElement !== ul.current) return;
    const control = t.closest('a, button, input, select, textarea, label, [role="button"], [role="menuitem"]');
    if (control && !(control.matches('input') && control.closest('.dk-list__select'))) return;
    pick(row, e.shiftKey);
  };
  const onFocus = (e: React.FocusEvent<HTMLUListElement>) => {
    const row = (e.target as HTMLElement).closest<HTMLElement>('[data-list-value]');
    if (row && row.parentElement === ul.current) { focused.current = val(row); rove(); }
  };

  const theirs = { key: rest.onKeyDown, click: rest.onClick, focus: rest.onFocus };
  const ctx = React.useMemo<Pick | null>(() => (mode ? { mode, has: (v) => picked.includes(v) } : null), [mode, picked]);
  // role="list": Safari drops list semantics from a <ul>/<ol> styled list-style: none, so VoiceOver stops saying "list, 6 items" (FU1).
  const el = React.createElement(oneOf(['ul', 'ol'] as const, props.as, 'ul'), Object.assign(rest, {
    ref: merged, 'data-component': 'list', role: rest.role ?? (mode ? 'grid' : 'list'), 'aria-busy': rest['aria-busy'] ?? ((props.loading ?? props.busy) || undefined),
    'aria-multiselectable': mode === 'multiple' || undefined,
    onKeyDown: mode ? (e: React.KeyboardEvent<HTMLUListElement>) => { if (theirs.key) theirs.key(e); if (!e.defaultPrevented) onKeyDown(e); } : theirs.key,
    onClick: mode ? (e: React.MouseEvent<HTMLUListElement>) => { if (theirs.click) theirs.click(e); onClick(e); } : theirs.click,
    onFocus: mode ? (e: React.FocusEvent<HTMLUListElement>) => { if (theirs.focus) theirs.focus(e); onFocus(e); } : theirs.focus,
    className: cn('dk-list', variant === 'card' && 'dk-list--card', props.divided !== false && 'dk-list--divided', mode && 'dk-list--selectable', props.className),
  }));
  return <PickContext.Provider value={ctx}>{el}</PickContext.Provider>;
});

// ListItem before its generic signature (below).
const ListItemBase = /* @__PURE__ */ component<HTMLLIElement, ListItemProps<React.ElementType>>('ListItem', function ListItem(props, ref) {
  const rest = omit(props, { title: 1, description: 1, leading: 1, trailing: 1, href: 1, onClick: 1, as: 1, linkProps: 1, selected: 1, disabled: 1, className: 1, value: 1 });
  const pick = React.useContext(PickContext);
  const titleId = React.useId();
  if (process.env.NODE_ENV !== 'production' && pick && props.value == null) warnOnce('list-value', 'ListItem: in a List with selectionMode, give each ListItem a value, which onSelectedChange reports.');
  const value = props.value != null ? props.value : titleId;
  const on = pick ? pick.has(value) : false;
  const lead = asIcon(props.leading as React.ReactNode);
  const body = <>
    {lead != null && lead !== false ? <span className={cn('dk-list__leading', typeof props.leading === 'string' && 'dk-list__leading--icon')}>{lead}</span> : null}
    <span className="dk-list__text">
      <span className="dk-list__title" id={pick ? titleId : undefined}>{props.title}</span>
      {props.description != null ? <span className="dk-list__description">{props.description}</span> : null}
    </span>
  </>;
  const lp: Record<string, unknown> = Object.assign({}, props.linkProps);
  let main: React.ReactNode;
  if (props.href != null || props.as) {
    const attrs: Record<string, unknown> = Object.assign(lp, { className: cn('dk-list__main', lp.className), 'aria-current': lp['aria-current'] !== undefined ? lp['aria-current'] : props.selected ? 'true' : undefined });
    // Disabled, it's a plain <a> without an address: a router link would still draw its href from to (or a similar
    // prop), which a middle or Ctrl click opens. Only the names, data and look of linkProps stay (L8E67).
    const keep = (k: string) => /^(aria-|data-)/.test(k) || k === 'id' || k === 'title' || k === 'style' || k === 'className' || k === 'lang' || k === 'dir';
    if (props.disabled) {
      for (const k of Object.keys(attrs)) if (!keep(k)) delete attrs[k];
      Object.assign(attrs, { 'aria-disabled': true, tabIndex: -1, onClick: (e: React.MouseEvent) => e.preventDefault() });
    }
    else { attrs.href = props.href; if (props.onClick) attrs.onClick = props.onClick; }
    main = React.createElement(props.disabled ? 'a' : props.as || config.link, attrs, body);
  } else if (props.onClick) {
    main = <button type="button" {...lp} className={cn('dk-list__main', lp.className)} onClick={props.onClick} disabled={props.disabled} aria-pressed={props.selected === undefined ? undefined : !!props.selected}>{body}</button>;
  } else {
    main = <div className="dk-list__main dk-list__main--static" role={pick ? 'gridcell' : undefined}>{body}</div>;
  }
  const interactive = props.href != null || !!props.as || !!props.onClick;
  // In a List with selectionMode: a grid row named by its title, with a cell for the checkbox, the main area and the actions.
  const row = pick ? { role: 'row', 'data-list-value': value, 'aria-selected': on, 'aria-disabled': props.disabled || undefined, 'aria-labelledby': titleId } : null;
  return (
    <li {...rest} {...row} ref={ref} className={cn('dk-list__item', interactive && 'dk-list__item--interactive', pick && !interactive && 'dk-list__item--pickable', (props.selected || on) && 'dk-list__item--selected', props.disabled && 'dk-list__item--disabled', props.className)}>
      {pick && pick.mode === 'multiple' ? (
        <span role="gridcell" className="dk-list__select">
          <Checkbox tabIndex={-1} aria-labelledby={titleId} checked={on} disabled={props.disabled} onChange={noop} />
        </span>
      ) : null}
      {pick && interactive ? <span role="gridcell" className="dk-list__cell">{main}</span> : main}
      {props.trailing != null ? <span className="dk-list__trailing" role={pick ? 'gridcell' : undefined}>{props.trailing}</span> : null}
    </li>
  );
});

/** One row in a List. `as` renders your router's link, and linkProps are typed with its props. */
export const ListItem = ListItemBase as {
  <C extends React.ElementType = 'a'>(props: ListItemProps<C> & { ref?: React.Ref<HTMLLIElement> }): React.ReactElement | null;
  displayName?: string | undefined;
};

export interface ListLoadingItemsProps {
  /** How many placeholder rows: about as many as will load, up to a screenful. Default: 3. */
  rows?: number | undefined;
  /** The rows will have a description: each placeholder gets a second, shorter line. Default: false. */
  description?: boolean | undefined;
  /** What the rows will start with: an icon (20px), or an Avatar of that size ('md' is 40px). Default: nothing. */
  leading?: 'icon' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | undefined;
  /** Said once as the rows appear ("Loading people"), after the loader's delay. Default: "Loading" (labels.loading). */
  label?: string | undefined;
}

const noop = () => {};   // the List picks on the click, so the box's own change does nothing

export interface ListSelectAllProps extends Omit<CheckboxProps, 'checked' | 'defaultChecked' | 'indeterminate' | 'onChange' | 'onCheckedChange' | 'selectAll' | 'name' | 'value'> {
  /** The values of every row it picks: the List's enabled rows. */
  values: readonly string[];
  /** The values picked now: the List's selected. */
  selected: readonly string[];
  /** Called with every value when it's checked, or none of them when it's cleared: the List's onSelectedChange. */
  onSelectedChange: (values: string[]) => void;
  /** Its label. Default: "Select all" (labels.listSelectAll). */
  children?: React.ReactNode;
}

/* ListSelectAll: a Checkbox that picks every row of a List with selectionMode="multiple", or clears them: checked
   when all are picked and indeterminate (a dash, said as mixed) when some are. Picks outside values are kept. */
/** The "Select all" box for a List with selectionMode="multiple": checked when every row is picked, a dash when some are. */
export const ListSelectAll = /* @__PURE__ */ component<HTMLInputElement, ListSelectAllProps>('ListSelectAll', function ListSelectAll(props, ref) {
  const L = useSettings(words).labels;
  const rest = omit(props, { values: 1, selected: 1, onSelectedChange: 1, children: 1 });
  const some = props.values.filter((v) => props.selected.includes(v)).length;
  const all = props.values.length > 0 && some === props.values.length;
  const change = (checked: boolean) => props.onSelectedChange(checked
    ? props.selected.concat(props.values.filter((v) => !props.selected.includes(v)))
    : props.selected.filter((v) => !props.values.includes(v)));
  return (
    <Checkbox {...rest} ref={ref} checked={all} indeterminate={some > 0 && !all} disabled={props.disabled || props.values.length === 0} onCheckedChange={change}>
      {props.children != null ? props.children : L.listSelectAll}
    </Checkbox>
  );
});

const LEADS = ['icon', 'xs', 'sm', 'md', 'lg', 'xl'] as const;

/* ListLoadingItems: placeholder rows inside a List, built from the rows' own parts (padding, gap, text lines, a
   circle the size of the leading icon or Avatar), so each is as tall as the row that replaces it and nothing moves.
   They're decorative: the label is said once, after the loader's delay, and the List's loading marks it as loading. */
/** Placeholder rows (skeletons) the height of real ListItems, while a List's rows load. Put it inside the List and set its loading. */
export function ListLoadingItems(props: ListLoadingItemsProps): React.ReactElement {
  const rows = Math.min(50, Math.max(1, Math.floor(Number(props.rows)) || 3));
  const lead = props.leading == null ? null : oneOf(LEADS, props.leading, 'md');
  const sds = useSettings();
  const label = props.label == null ? sds.labels.loading : props.label;
  const waiting = !useSkeletonShown(label);
  const out: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) out.push(
    <li key={r} className="dk-list__item dk-list__loading">
      <div className="dk-list__main dk-list__main--static">
        {lead ? <span className={'dk-list__leading dk-list__leading--' + lead}><SkeletonArt shape="circle" waiting={waiting} /></span> : null}
        <span className="dk-list__text"><SkeletonArt lines={props.description ? 2 : 1} waiting={waiting} /></span>
      </div>
    </li>,
  );
  return <>{out}</>;
}
