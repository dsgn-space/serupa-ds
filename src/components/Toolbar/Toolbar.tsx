'use client';
import * as React from 'react';
import { cn, omit, useMergedRef, useIsoLayoutEffect } from '../../internal/cn';
import { named } from '../../internal/component';
import { ControlSize } from '../../internal/controlSize';
import { useSettings } from '../../internal/provider';
import { IconButton } from '../IconButton/IconButton';
import { Menu, MenuCheckboxItem, MenuItem } from '../Menu/Menu';
import * as icons from '../../material/builtin';
import { en as words } from './labels';

export interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 'horizontal' (a wrapping row, default; Left and Right move focus) or 'vertical' (a column; Up and Down). */
  orientation?: 'horizontal' | 'vertical' | undefined;
  /** The size of every Button, IconButton and ToggleButton in it (in its ButtonGroups too) that doesn't set its own:
      'sm', 'md' or 'lg'. Default: none, so each keeps its own. */
  size?: 'sm' | 'md' | 'lg' | undefined;
  /** What the controls are for ("Text formatting"); needed when a page has more than one toolbar. */
  'aria-label'?: string | undefined;
  /** In a row, moves the controls that don't fit into a More menu at the end, instead of wrapping: the lowest
      data-priority first (default 0), and among equals the last first. Only buttons move (a ButtonGroup moves
      whole); fields, Selects and Menus stay. Default: false. */
  overflow?: boolean | undefined;
  /** The More button's name. Default: "More" (labels.toolbarMore). */
  moreLabel?: string | undefined;
  /** Buttons, IconButtons, ToggleButtons, ButtonGroups, Menus, Selects and Dividers, at any depth. */
  children?: React.ReactNode | undefined;
}

// What counts as one of the toolbar's controls: anything focusable that isn't disabled, hidden, inside a popup of
// its own (a Menu's items, a Popover's content) or inside a toolbar nested in this one.
const ITEMS = 'button, a[href], input:not([type="hidden"]), select, textarea, [role="button"], [role="checkbox"], [role="radio"], [role="switch"], [contenteditable="true"]';
const POPUP = '[popover], [role="menu"], [role="listbox"], [role="dialog"], [role="tooltip"], [role="toolbar"], [hidden], [inert]';
const itemsOf = (root: HTMLElement, all?: boolean): HTMLElement[] => Array.from(root.querySelectorAll<HTMLElement>(ITEMS)).filter(function (it) {
  if (!all && it.matches(':disabled')) return false;
  const p = it.parentElement && it.parentElement.closest(POPUP);
  return !p || p === root || !root.contains(p);
});
// Laid out: a control hidden by CSS (display: none, often a responsive overflow) can't take focus, so the arrows
// skip it and it never holds the Tab stop, which left the toolbar out of the Tab order (L8E77).
const shown = (e: HTMLElement) => e.getClientRects().length > 0;
// A text field uses the arrows, Home and End itself, so there they edit the text rather than leave the field.
// overflow: a direct child that may move into the More menu holds only buttons, none opening a popup of its own
// (a Menu's trigger would open nothing while hidden). A separator goes with the controls around it.
const OUT = 'data-dk-overflow';
const isSep = (k: Element) => k.getAttribute('role') === 'separator' || k.tagName === 'HR';
const movable = (k: HTMLElement) => {
  if (isSep(k)) return false;
  const all = itemsOf(k, true).concat(k.matches(ITEMS) ? [k] : []);
  return all.length > 0 && all.every((c) => (c instanceof HTMLButtonElement || c.getAttribute('role') === 'button') && !c.hasAttribute('aria-haspopup'));
};
interface Entry { el: HTMLElement; label: string; disabled: boolean; checked: boolean | null }
const typing = (e: HTMLElement) => e.isContentEditable || e instanceof HTMLTextAreaElement || e instanceof HTMLSelectElement
  || (e instanceof HTMLInputElement && !/^(button|checkbox|radio|submit|reset|image|color|file|range)$/.test(e.type));

function ToolbarRender({ ref, ...props }: ToolbarProps & React.RefAttributes<HTMLDivElement>) {
  const L = useSettings(words).labels;
  const rest = omit(props, { orientation: 1, size: 1, className: 1, children: 1, overflow: 1, moreLabel: 1 });
  const size = props.size === 'sm' || props.size === 'md' || props.size === 'lg' ? props.size : undefined;
  const vertical = props.orientation === 'vertical';
  const root = React.useRef<HTMLDivElement | null>(null);
  const active = React.useRef<HTMLElement | null>(null);
  // One control has tabIndex 0 (the one used last, or else the first) and the rest -1, disabled ones too, so one
  // that turns enabled doesn't add a second Tab stop.
  const sync = React.useCallback(function () {
    const r = root.current;
    if (!r) return;
    const items = itemsOf(r), seen = items.filter(shown);
    // While the whole toolbar is hidden nothing is laid out: keep to the order, so it has a Tab stop when it shows.
    const pick = seen.length ? seen : items;
    if (!active.current || pick.indexOf(active.current) < 0) active.current = pick[0] || null;
    for (const it of itemsOf(r, true)) it.tabIndex = it === active.current ? 0 : -1;
  }, []);
  const more = React.useRef<HTMLSpanElement | null>(null);
  const fold = !vertical && !!props.overflow;
  // overflow: show every child, and while the row is wider than the toolbar, hide the next one in line (lowest
  // data-priority, then last), keeping room for More. Done on the DOM, before paint, so nothing renders twice.
  const layout = React.useCallback(function () {
    const r = root.current, m = more.current;
    if (!r || !m) return;
    const kids = Array.from(r.children).filter((k): k is HTMLElement => k !== m && k instanceof HTMLElement && !k.matches(POPUP));
    for (const k of kids) k.removeAttribute(OUT);
    m.removeAttribute(OUT);
    const cs = getComputedStyle(r), gap = parseFloat(cs.columnGap) || 0;
    const room = r.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
    const width = (k: HTMLElement) => k.getBoundingClientRect().width;
    const used = (list: HTMLElement[]) => list.reduce((a, k) => a + width(k), 0) + gap * Math.max(list.length - 1, 0);
    const shownKids = () => kids.filter((k) => !k.hasAttribute(OUT));
    if (used(kids) > room + 0.5) {
      const moreW = width(m) + gap;
      const order = kids.map((k, i) => ({ k, i, p: Number(k.getAttribute('data-priority')) || 0 })).filter((x) => movable(x.k))
        .sort((a, b) => a.p - b.p || b.i - a.i);
      for (const x of order) {
        if (used(shownKids()) + moreW <= room + 0.5) break;
        x.k.setAttribute(OUT, '');
      }
      // A separator with nothing shown on one side of it, or right after another, goes too.
      let prev: HTMLElement | null = null;
      for (const k of kids) {
        if (k.hasAttribute(OUT)) continue;
        if (isSep(k) && (!prev || isSep(prev))) { k.setAttribute(OUT, ''); continue; }
        prev = k;
      }
      if (prev && isSep(prev)) prev.setAttribute(OUT, '');
    }
    if (!kids.some((k) => k.hasAttribute(OUT) && !isSep(k))) m.setAttribute(OUT, '');
    sync();
  }, [sync]);
  const [entries, setEntries] = React.useState<Entry[]>([]);
  // The menu lists the hidden controls as they are when it opens; choosing one presses the control itself.
  const collect = function (): Entry[] {
    const r = root.current;
    if (!r) return [];
    const out: Entry[] = [];
    for (const k of Array.from(r.children)) {
      if (!(k instanceof HTMLElement) || k === more.current || !k.hasAttribute(OUT) || k.matches(POPUP)) continue;
      for (const el of itemsOf(k, true).concat(k.matches(ITEMS) ? [k] : [])) {
        const state = el.getAttribute('aria-pressed') || el.getAttribute('aria-checked');
        const label = (el.getAttribute('aria-label') || el.textContent || '').trim();
        if (label) out.push({ el, label, disabled: el.matches(':disabled') || el.getAttribute('aria-disabled') === 'true', checked: state == null ? null : state === 'true' });
      }
    }
    return out;
  };
  useIsoLayoutEffect(function () { sync(); if (fold) layout(); });   // every render: new children may bring new controls, which need their tabIndex
  // Controls added, removed, disabled or hidden later (a Menu's trigger rendering, a button turning disabled). And
  // hidden or shown by CSS later, which renders nothing: a breakpoint that hides the control holding the Tab stop
  // as the window narrows (display: none) left no Tab stop at all (GR66). Each control's box is watched, since one
  // that goes display: none reports a zero box, and one that comes back reports its size.
  React.useEffect(function () {
    const r = root.current;
    if (!r) return;
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(sync);
    const watch = function () { if (ro) { ro.disconnect(); for (const it of itemsOf(r, true)) ro.observe(it); } };
    watch();
    const mo = typeof MutationObserver === 'undefined' ? null : new MutationObserver(function (records) {
      watch();
      // The layout's own marks change attributes too: only a real change lays the row out again.
      if (fold && records.some((x) => x.type === 'childList')) layout(); else sync();
    });
    const rr = fold && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(function () { layout(); }) : null;
    if (rr) rr.observe(r);
    if (mo) mo.observe(r, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'hidden', 'inert'] });
    return function () { if (mo) mo.disconnect(); if (ro) ro.disconnect(); if (rr) rr.disconnect(); };
  }, [sync, fold, layout]);

  const onFocus = function (e: React.FocusEvent<HTMLDivElement>) {
    if (rest.onFocus) rest.onFocus(e);
    const r = root.current;
    if (r && e.target instanceof HTMLElement && e.target !== active.current && itemsOf(r).indexOf(e.target) >= 0) { active.current = e.target; sync(); }
  };
  // Your onKeyDown runs first, so preventDefault() in it keeps the toolbar from moving focus on that key.
  const onKeyDown = function (e: React.KeyboardEvent<HTMLDivElement>) {
    if (rest.onKeyDown) rest.onKeyDown(e);
    const r = root.current, t = e.target;
    if (e.defaultPrevented || !r || !(t instanceof HTMLElement) || e.altKey || e.ctrlKey || e.metaKey) return;
    const items = itemsOf(r).filter(shown), i = items.indexOf(t);
    if (i < 0 || typing(t)) return;
    const rtl = getComputedStyle(r).direction === 'rtl';
    let n: number;
    switch (e.key) {
      case 'ArrowRight': if (vertical) return; n = i + (rtl ? -1 : 1); break;
      case 'ArrowLeft': if (vertical) return; n = i + (rtl ? 1 : -1); break;
      case 'ArrowDown': if (!vertical) return; n = i + 1; break;
      case 'ArrowUp': if (!vertical) return; n = i - 1; break;
      case 'Home': n = 0; break;
      case 'End': n = items.length - 1; break;
      default: return;
    }
    e.preventDefault();
    const next = items[(n + items.length) % items.length];
    if (!next) return;
    active.current = next;
    sync();
    next.focus();
  };
  const mergedRef = useMergedRef(ref, (n) => { root.current = n; });
  return (
    <div {...rest} ref={mergedRef} role="toolbar" aria-orientation={vertical ? 'vertical' : 'horizontal'}
      className={cn('dk-toolbar', vertical && 'dk-toolbar--vertical', fold && 'dk-toolbar--overflow', props.className)} data-component="toolbar" data-orientation={vertical ? 'vertical' : 'horizontal'}
      onFocus={onFocus} onKeyDown={onKeyDown}>
      {size ? <ControlSize.Provider value={size}>{props.children}</ControlSize.Provider> : props.children}
      {fold ? (
        <span ref={more} className="dk-toolbar__more" {...{ [OUT]: '' }}>
          <Menu placement="bottom-end" onOpenChange={(open) => { if (open) setEntries(collect()); }}
            trigger={<IconButton icon={icons.MoreHoriz} label={props.moreLabel || L.toolbarMore} variant="ghost" size={size} />}>
            {entries.map((e, i) => e.checked != null
              ? <MenuCheckboxItem key={i} checked={e.checked} disabled={e.disabled} onCheckedChange={() => e.el.click()}>{e.label}</MenuCheckboxItem>
              : <MenuItem key={i} disabled={e.disabled} onSelect={() => e.el.click()}>{e.label}</MenuItem>)}
          </Menu>
        </span>
      ) : null}
    </div>
  );
}

/* Toolbar: a role="toolbar" around a set of controls, with one Tab stop for all of them (the WAI-ARIA toolbar
   pattern). The arrow keys move focus between the controls (Left and Right in a row, mirrored right to left; Up
   and Down in a column), Home and End go to the first and last, and they wrap. Tab leaves it, and coming back
   lands on the control used last. Disabled controls are skipped. In a text field the keys stay the field's. */
/** A set of controls with one Tab stop, where the arrow keys move between them. */
export const Toolbar = /* @__PURE__ */ named('Toolbar', ToolbarRender);
