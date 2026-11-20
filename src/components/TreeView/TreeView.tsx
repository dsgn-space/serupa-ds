'use client';
import * as React from 'react';
import { cn, omit, useMergedRef, useIsoLayoutEffect } from '../../internal/cn';
import { NAME_HOW, useNameCheck } from '../../internal/nameCheck';
import { component } from '../../internal/component';
import { isComposing } from '../../internal/ime';
import { lastInputKeyboard, listenForInput } from '../../internal/lastInput';
import { typeahead, typing, type Typed } from '../../internal/typeahead';
import { Icon, type IconSource } from '../Icon/Icon';
import { useServerStyles } from '../../internal/serverStyles';
import { asIcon } from '../Icon/asIcon';
import * as icons from '../../material/builtin';
import { useControllable } from '../../internal/controllable';

export interface TreeViewItem {
  /** Identifies the item in value and expanded. Unique in the whole tree. */
  id: string;
  /** What the row shows. */
  label: React.ReactNode;
  /** The text typing finds it by, when label isn't a string. Default: label. */
  textValue?: string | undefined;
  /** An icon before the label, such as a folder or a file. */
  icon?: IconSource | undefined;
  /** The items inside it. An item with children (even an empty array) can open and close. */
  children?: TreeViewItem[] | undefined;
  /** Can be focused and read, but not picked, opened or closed. */
  disabled?: boolean | undefined;
}

export interface TreeViewProps extends Omit<React.HTMLAttributes<HTMLUListElement>, 'defaultValue' | 'onChange'> {
  /** The items at the top level, each with its own children. */
  items: TreeViewItem[];
  /** 'single' (default): one item is picked at a time. 'multiple': any number, toggled with Space or a click. 'none': items are only opened and closed. */
  selectionMode?: 'single' | 'multiple' | 'none' | undefined;
  /** The picked items' ids (controlled). Use with onValueChange. */
  value?: string[] | undefined;
  /** The picked items' ids at first (uncontrolled). */
  defaultValue?: string[] | undefined;
  /** Called with the picked items' ids when they change. */
  onValueChange?: ((value: string[]) => void) | undefined;
  /** The open items' ids (controlled). Use with onExpandedChange. */
  expanded?: string[] | undefined;
  /** The open items' ids at first (uncontrolled). */
  defaultExpanded?: string[] | undefined;
  /** Called with the open items' ids when one opens or closes. */
  onExpandedChange?: ((expanded: string[]) => void) | undefined;
  /** With selectionMode="multiple": each item gets a checkbox, and checking a folder checks everything in it. A
   *  folder with some of its items checked shows a dash (aria-checked="mixed"); Space or a click on it checks the
   *  whole branch, and again clears it. Disabled items keep their state. */
  cascade?: boolean | undefined;
  /** With cascade, what value lists: 'all' (default), every checked item, folders whose items are all checked
   *  included; or 'leaves', only items with no children. value given either way is read both ways: a folder's id
   *  in it checks everything in the folder. */
  cascadeValue?: 'all' | 'leaves' | undefined;
  /** What the tree holds ("Files"). Needed, unless aria-labelledby names it. */
  'aria-label'?: string | undefined;
}

interface Row { item: TreeViewItem; level: number; parent: string | null }

/* What the rows read: open and picked ids as Sets, the Tab stop and the mode. Each row subscribes to its own part
   (open, picked, Tab stop), so a focus move or a pick redraws the rows it changes, not every row in view. */
interface Store { open: Set<string>; value: Set<string>; mixed: Set<string>; tab: string | null; mode: string; listeners: Map<string, () => void> }
interface Api { focus: (id: string) => void; press: (item: TreeViewItem, e: React.MouseEvent) => void; toggle: (item: TreeViewItem) => void }
const TreeContext = /* @__PURE__ */ React.createContext<{ store: Store; api: React.RefObject<Api> } | null>(null);

const textOf = (it: TreeViewItem) => it.textValue ?? (typeof it.label === 'string' || typeof it.label === 'number' ? String(it.label) : '');
const opens = (it: TreeViewItem) => it.children !== undefined;
const within = (item: TreeViewItem, id: string): boolean => !!item.children && item.children.some((c) => c.id === id || within(c, id));
// module state: an empty set that is never added to, only read (no item is mixed outside cascade), so no request can leave anything in it for another.
const NO_MIXED: Set<string> = /* @__PURE__ */ new Set();

/* For cascade: every item's leaves (itself, when it has no children), and which of them can be changed (not
   disabled, and not under a disabled folder), with every item in tree order. */
interface Leaves { all: Map<string, string[]>; usable: Map<string, string[]>; order: TreeViewItem[] }
function leavesOf(items: TreeViewItem[]): Leaves {
  const all = new Map<string, string[]>(), usable = new Map<string, string[]>(), order: TreeViewItem[] = [];
  const walk = (it: TreeViewItem, off: boolean): [string[], string[]] => {
    order.push(it);
    const dead = off || !!it.disabled;
    let a: string[] = [], u: string[] = [];
    if (it.children && it.children.length) for (const c of it.children) { const [ca, cu] = walk(c, dead); a = a.concat(ca); u = u.concat(cu); }
    else { a = [it.id]; u = dead ? [] : [it.id]; }
    all.set(it.id, a); usable.set(it.id, u);
    return [a, u];
  };
  for (const it of items) walk(it, false);
  return { all, usable, order };
}

/* TreeView: nested items that open and close, such as folders and files or a table of contents. Follows the
   WAI-ARIA tree pattern: a role="tree" list of role="treeitem"s with one Tab stop (the item used last, or else
   the first picked or first item). Up and Down move through the items in view, Right opens an item and then
   goes into it, Left closes it and then goes out to its parent (both mirrored right to left), Home and End go
   to the ends, * opens every sibling, and typing goes to the next item starting with what was typed. Enter,
   Space or a click picks; with selectionMode="multiple" they toggle, Shift with the arrows picks as it moves,
   Shift+Space or Shift+click picks a range, and Ctrl+A picks every item in view. Closed items' children aren't
   in the page. */
/** Nested items that open and close, such as folders and files, with one item or many picked. */
export const TreeView = /* @__PURE__ */ component<HTMLUListElement, TreeViewProps>('TreeView', function TreeView(props, ref) {
  const nameRef = useNameCheck('TreeView', NAME_HOW.label);   // warns when it has no accessible name
  const rest = omit(props, { cascade: 1, cascadeValue: 1, items: 1, selectionMode: 1, value: 1, defaultValue: 1, onValueChange: 1, expanded: 1, defaultExpanded: 1, onExpandedChange: 1, className: 1, onKeyDown: 1 });
  const mode = props.selectionMode || 'single';
  const multi = mode === 'multiple';
  const cascade = multi && !!props.cascade;
  const [value, setOwnValue, valueControlled] = useControllable<string[]>(props.value, props.defaultValue || [], 'TreeView', 'value');
  const [open, setOwnOpen, openControlled] = useControllable<string[]>(props.expanded, props.defaultExpanded || [], 'TreeView', 'expanded');
  const root = React.useRef<HTMLUListElement | null>(null);
  const styled = useServerStyles<HTMLUListElement>();   // each row's level, from server HTML under a strict CSP (GR11)
  const typed = React.useRef<Typed>({ text: '', at: 0 });
  const anchor = React.useRef<string | null>(null);   // where a Shift range starts
  const [focusId, setFocusId] = React.useState<string | null>(null);
  const moveFocus = React.useRef(false);

  // The items in view, in order: the top level, and the children of every open item.
  const rows = React.useMemo(() => {
    const out: Row[] = [];
    const isOpen = new Set(open);
    const walk = (list: TreeViewItem[], level: number, parent: string | null) => list.forEach((item) => {
      out.push({ item, level, parent });
      if (item.children && isOpen.has(item.id)) walk(item.children, level + 1, item.id);
    });
    walk(props.items, 1, null);
    return out;
  }, [props.items, open]);
  // Where each item in view sits, so a key press or click looks a row up at once rather than through every row.
  const at = React.useMemo(() => new Map(rows.map((r, n) => [r.item.id, n])), [rows]);
  const index = (id: string | null) => { const n = id == null ? undefined : at.get(id); return n === undefined ? -1 : n; };
  const openSet = React.useMemo(() => new Set(open), [open]);
  // With cascade, the checked leaves are what's kept; a folder is checked when all its leaves are, mixed when some
  // are, and what value lists follows cascadeValue.
  const leaves = React.useMemo(() => (cascade ? leavesOf(props.items) : null), [cascade, props.items]);
  const leafSet = React.useMemo(() => {
    const out = new Set<string>();
    if (leaves) for (const id of value) for (const l of leaves.all.get(id) || []) out.add(l);
    return out;
  }, [leaves, value]);
  const [valueSet, mixedSet] = React.useMemo((): [Set<string>, Set<string>] => {
    if (!leaves) return [new Set(value), NO_MIXED];
    const on = new Set<string>(), some = new Set<string>();
    leaves.all.forEach((ls, id) => {
      const n = ls.filter((l) => leafSet.has(l)).length;
      if (n && n === ls.length) on.add(id); else if (n) some.add(id);
    });
    return [on, some];
  }, [leaves, leafSet, value]);
  const report = (set: Set<string>) => {
    if (!leaves) return [];
    const kids = props.cascadeValue === 'leaves';
    return leaves.order.filter((it) => { const ls = leaves.all.get(it.id) || []; return (!kids || (ls.length === 1 && ls[0] === it.id)) && ls.every((l) => set.has(l)); }).map((it) => it.id);
  };
  // Checks every usable leaf of these items, or clears them when they're all checked already.
  const flip = (items: TreeViewItem[], on?: boolean) => {
    if (!leaves) return;
    const use = items.flatMap((it) => leaves.usable.get(it.id) || []);
    if (!use.length) return;
    const add = on ?? !use.every((l) => leafSet.has(l));
    const next = new Set(leafSet);
    for (const l of use) { if (add) next.add(l); else next.delete(l); }
    pick(report(next));
  };
  // The Tab stop: the item focused last while it's in view, else the first picked one in view, else the first.
  const tabStop = index(focusId) >= 0 ? focusId : ((value.length && rows.find((r) => valueSet.has(r.item.id))) || rows[0])?.item.id ?? null;

  useIsoLayoutEffect(function () {
    if (!moveFocus.current || !root.current) return;
    moveFocus.current = false;
    const el = focusId == null ? null : root.current.querySelector<HTMLElement>('[role=treeitem][data-id="' + CSS.escape(focusId) + '"]');
    if (el) el.focus();
  }, [focusId, rows]);
  const go = (id: string) => { moveFocus.current = true; setFocusId(id); };
  // The focused item leaving the page from outside (taken out of items, or its parent closed through a controlled
  // expanded) would drop focus to the page: it goes to the nearest parent still in view, else the item now in its
  // place (else the last), as Splitter's handle takes it (GN3). focusedIn notes focus was in the tree, for a
  // browser that has already moved it to the body; focus elsewhere on the page is left where it is.
  const focusedIn = React.useRef(false);
  const lastAt = React.useRef(-1);
  useIsoLayoutEffect(function () {
    const at = index(focusId);
    if (at >= 0) { lastAt.current = at; return; }
    const active = document.activeElement;
    // Focus still on the leaving item (a closed parent's rows go a render later) counts as lost too.
    const r = root.current;
    if (focusId == null || !rows.length || !r || !focusedIn.current || (active && active !== document.body && active.isConnected && !r.contains(active))) return;
    const up = (list: TreeViewItem[]): string[] | null => {
      for (const x of list) { if (x.id === focusId) return []; const p = x.children ? up(x.children) : null; if (p) return [x.id].concat(p); }
      return null;
    };
    const parents = up(props.items) || [];
    const parent = parents.reverse().find((p) => index(p) >= 0);
    const near = rows[Math.min(Math.max(lastAt.current, 0), rows.length - 1)];
    if (parent != null) go(parent); else if (near) go(near.item.id);
  }, [rows, focusId]);

  const pick = (next: string[]) => {
    // Ctrl+A or a Shift range over items all picked already changes nothing.
    if (next.length === value.length && next.every((v, n) => (cascade ? value[n] === v : valueSet.has(v)))) return;
    if (!valueControlled) setOwnValue(next);
    if (props.onValueChange) props.onValueChange(next);
  };
  // Opened or closed by a key, the chevron is turned in the same frame, as focus and selection move (KW1, KW15); a
  // click keeps the turn.
  const [keyed, setKeyed] = React.useState(false);
  useIsoLayoutEffect(listenForInput, []);
  const setOpen = (next: string[]) => {
    setKeyed(lastInputKeyboard());
    if (!openControlled) setOwnOpen(next);
    if (props.onExpandedChange) props.onExpandedChange(next);
  };
  const toggleOpen = (item: TreeViewItem) => {
    if (item.disabled || !opens(item)) return;
    const was = openSet.has(item.id);
    setOpen(was ? open.filter((x) => x !== item.id) : open.concat(item.id));
    // Closing an item that holds the focused one brings focus up to it.
    if (was && focusId && within(item, focusId)) go(item.id);
  };
  const choose = (item: TreeViewItem, range = false) => {
    if (item.disabled || mode === 'none') return;
    const id = item.id;
    if (!multi) { if (value.length !== 1 || value[0] !== id) pick([id]); anchor.current = id; return; }
    const a = index(anchor.current);
    if (cascade && range && a >= 0) {
      flip(rows.slice(Math.min(a, index(id)), Math.max(a, index(id)) + 1).map((x) => x.item), true);
      return;
    }
    if (cascade) { flip([item]); anchor.current = id; return; }
    if (range && a >= 0) {
      const b = index(id);
      const span = rows.slice(Math.min(a, b), Math.max(a, b) + 1).filter((x) => !x.item.disabled).map((x) => x.item.id);
      const inSpan = new Set(span);
      pick(value.filter((v) => !inSpan.has(v)).concat(span));
      return;
    }
    pick(valueSet.has(id) ? value.filter((v) => v !== id) : value.concat(id));
    anchor.current = id;
  };

  // Your onKeyDown runs first, so preventDefault() in it keeps the tree from acting on that key.
  const onKeyDown = function (e: React.KeyboardEvent<HTMLUListElement>) {
    if (props.onKeyDown) props.onKeyDown(e);
    const t = e.target instanceof HTMLElement ? e.target.closest<HTMLElement>('[role=treeitem]') : null;
    if (e.defaultPrevented || !t || !root.current || e.altKey || isComposing(e)) return;
    const i = index(t.dataset.id || null), r = rows[i];
    if (!r) return;
    const item = r.item;
    const rtl = (e.key === 'ArrowLeft' || e.key === 'ArrowRight') && getComputedStyle(root.current).direction === 'rtl';
    const isOpen = openSet.has(item.id);
    let to = -1;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      to = Math.min(rows.length - 1, Math.max(0, i + (e.key === 'ArrowDown' ? 1 : -1)));
      { const row = rows[to]; if (multi && e.shiftKey && to !== i && row) { if (cascade) flip([row.item], true); else choose(row.item); } }
    }
    else if (e.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) {
      if (opens(item) && !isOpen) toggleOpen(item);
      else if (isOpen && item.children && item.children.length) to = i + 1;
    }
    else if (e.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) {
      if (isOpen && !item.disabled) toggleOpen(item);
      else if (r.parent != null) to = index(r.parent);
    }
    else if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = rows.length - 1;
    // Space while a word is being typed is part of it ("my files"), so it goes to typeahead below.
    else if (e.key === 'Enter' || (e.key === ' ' && !typing(typed.current))) {
      if (mode === 'none') toggleOpen(item); else choose(item, multi && e.shiftKey);
    }
    else if (e.key === '*') {
      const shut = rows.filter((x) => x.parent === r.parent && opens(x.item) && !x.item.disabled && !openSet.has(x.item.id));
      if (shut.length) setOpen(open.concat(shut.map((x) => x.item.id)));
    }
    // Ctrl+A on a Russian, Greek or Arabic layout sends "ф", "α" or "ش", so a key that isn't Latin goes by its position.
    else if (multi && (e.ctrlKey || e.metaKey) && (/^[\x20-\x7e]$/.test(e.key) ? e.key.toLowerCase() === 'a' : e.code === 'KeyA')) { if (cascade) flip(props.items, true); else pick(rows.filter((x) => !x.item.disabled).map((x) => x.item.id)); }
    else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) to = typeahead(typed.current, e.key, rows.map((x) => textOf(x.item)), i);
    else return;
    e.preventDefault();
    const dest = rows[to];
    if (dest && to !== i) go(dest.item.id);
  };

  // The rows read this through context, so none of them redraws because the tree did; see TreeRow. A change
  // tells only the rows it touches (opened or closed, picked or not, the Tab stop before and after), so a key
  // press in a tree of thousands wakes two rows rather than all of them.
  const store = React.useRef<Store | null>(null);
  const shown = cascade ? 'cascade' : mode;
  if (!store.current) store.current = { open: openSet, value: valueSet, mixed: mixedSet, tab: tabStop, mode: shown, listeners: new Map() };
  const st = store.current;
  st.open = openSet; st.value = valueSet; st.mixed = mixedSet; st.tab = tabStop; st.mode = shown;
  const told = React.useRef({ open: openSet, value: valueSet, mixed: mixedSet, tab: tabStop, mode: shown });   // what the rows last heard
  useIsoLayoutEffect(function () {
    const before = told.current;
    told.current = { open: openSet, value: valueSet, mixed: mixedSet, tab: tabStop, mode: shown };
    const tell = (id: string | null) => { const l = id == null ? undefined : st.listeners.get(id); if (l) l(); };
    if (before.mode !== shown) { st.listeners.forEach((l) => l()); return; }
    const diff = (a: Set<string>, b: Set<string>) => { if (a !== b) { a.forEach((id) => { if (!b.has(id)) tell(id); }); b.forEach((id) => { if (!a.has(id)) tell(id); }); } };
    diff(before.open, openSet);
    diff(before.value, valueSet);
    diff(before.mixed, mixedSet);
    if (before.tab !== tabStop) { tell(before.tab); tell(tabStop); }
  }, [openSet, valueSet, mixedSet, tabStop, shown]);
  const api = React.useRef<Api>(null!);   // set just below, every render, before any row can call it
  api.current = {
    focus: (id) => { if (focusId !== id) setFocusId(id); },
    press: (item, e) => { setFocusId(item.id); if (mode === 'none') toggleOpen(item); else choose(item, multi && e.shiftKey); },
    toggle: (item) => { setFocusId(item.id); toggleOpen(item); },
  };
  const ctx = React.useMemo(() => ({ store: st, api: api }), [st]);

  const mergedRef = useMergedRef(ref, (n) => { root.current = n; nameRef(n); styled(n); });
  return (
    <ul {...rest} ref={mergedRef} role="tree"
      aria-multiselectable={(multi && !cascade) || undefined}
      className={cn('dk-tree-view', props.className)} data-component="tree-view" data-instant={keyed ? '' : undefined} onKeyDown={onKeyDown}
      onFocus={(e) => { focusedIn.current = true; if (rest.onFocus) rest.onFocus(e); }}
      onBlur={(e) => { if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget)) focusedIn.current = false; if (rest.onBlur) rest.onBlur(e); }}>
      <TreeContext.Provider value={ctx}><Rows list={props.items} level={1} /></TreeContext.Provider>
    </ul>
  );
});

const Rows = /* @__PURE__ */ React.memo(function Rows(props: { list: TreeViewItem[]; level: number }) {
  return <>{props.list.map((item, n) => <TreeRow key={item.id} item={item} level={props.level} pos={n + 1} size={props.list.length} />)}</>;
});

/* One treeitem and, while it's open, its children. Memoised on the item and its place, and subscribed to just its
   own open, picked and Tab-stop state, so a change elsewhere in the tree leaves it alone. */
const TreeRow = /* @__PURE__ */ React.memo(function TreeRow(props: { item: TreeViewItem; level: number; pos: number; size: number }) {
  const { store, api } = React.useContext(TreeContext)!;
  const { item, level } = props, id = item.id;
  const subscribe = React.useCallback((l: () => void) => {
    store.listeners.set(id, l);
    return () => { if (store.listeners.get(id) === l) store.listeners.delete(id); };
  }, [store, id]);
  // One string, so React compares a primitive: open, picked, Tab stop, mode.
  const snap = () => (store.open.has(id) ? 'o' : '-') + (store.value.has(id) ? 'p' : store.mixed.has(id) ? 'm' : '-') + (store.tab === id ? 't' : '-') + store.mode;
  const key = React.useSyncExternalStore(subscribe, snap, snap);
  const canOpen = opens(item), isOpen = canOpen && key[0] === 'o', picked = key[1] === 'p', mode = key.slice(3);
  // With cascade each row is checked, unchecked or mixed (a checkbox tree), not selected.
  const checks = mode === 'cascade', checked = picked ? true : key[1] === 'm' ? 'mixed' : false;
  const icon = item.icon != null ? asIcon(item.icon) : null;
  return (
    <li role="treeitem" data-id={id} tabIndex={key[2] === 't' ? 0 : -1}
      aria-level={level} aria-posinset={props.pos} aria-setsize={props.size}
      aria-expanded={canOpen ? isOpen : undefined} data-state={canOpen ? (isOpen ? 'open' : 'closed') : undefined}
      aria-selected={mode === 'none' || checks ? undefined : mode === 'multiple' ? picked : picked || undefined}
      aria-checked={checks ? checked : undefined}
      aria-disabled={item.disabled || undefined}
      className={cn('dk-tree-view__item', picked && !checks && 'dk-tree-view__item--selected', item.disabled && 'dk-tree-view__item--disabled')}
      onFocus={(e) => { if (e.target === e.currentTarget) api.current.focus(id); }}>
      <div className="dk-tree-view__row" style={{ '--dk-tree-level': level - 1 } as React.CSSProperties}
        onClick={(e) => api.current.press(item, e)}>
        <span className="dk-tree-view__toggle" aria-hidden="true"
          onClick={canOpen ? (e) => { e.stopPropagation(); api.current.toggle(item); } : undefined}>
          {canOpen ? <Icon icon={icons.ChevronRight} mirror={false} /> : null}
        </span>
        {checks ? <span className="dk-tree-view__check" aria-hidden="true" data-state={checked === true ? 'checked' : checked === 'mixed' ? 'mixed' : 'unchecked'}>{checked === true ? <Icon icon={icons.Check} /> : checked === 'mixed' ? <Icon icon={icons.Remove} /> : null}</span> : null}
        {icon != null ? <span className="dk-tree-view__icon" aria-hidden="true">{icon}</span> : null}
        <span className="dk-tree-view__label">{item.label}</span>
      </div>
      {isOpen && item.children && item.children.length ? <ul role="group" className="dk-tree-view__group"><Rows list={item.children} level={level + 1} /></ul> : null}
    </li>
  );
});
