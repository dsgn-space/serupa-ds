'use client';
import * as React from 'react';
import { cn, domId, omit, useMergedRef, useIsoLayoutEffect } from '../../internal/cn';
import { component } from '../../internal/component';
import { announce } from '../../internal/announce';
import { isComposing } from '../../internal/ime';
import { useLocale, useSettings } from '../../internal/provider';
import { displayNumber } from '../../internal/numbers';
import { Icon } from '../Icon/Icon';
import { IconButton } from '../IconButton/IconButton';
import { Menu, MenuItem } from '../Menu/Menu';
import * as icons from '../../material/builtin';
import { en as words } from './labels';

/** One column of a Kanban board. */
export interface KanbanColumn<T> {
  /** A stable id for the column. */
  id: string;
  /** The column's name: its heading, and in what's said as cards move ("Done"). */
  title: string;
  /** The cards in the column, top to bottom. */
  items: readonly T[];
  /** The most cards the column should hold (a work-in-progress limit). Over it, the count says "Over limit" in danger. Cards can still be moved in. */
  limit?: number | undefined;
}

/** Where a card went: its column and position (from 0) before and after. */
export interface KanbanMove<T> {
  item: T;
  from: { column: string; index: number };
  to: { column: string; index: number };
}

export interface KanbanProps<T> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  /** The columns and their cards, in order. Controlled: pass the new columns back from onMove. */
  columns: readonly KanbanColumn<T>[];
  /** A stable key for each card (its id), so focus follows it as it moves. */
  getKey: (item: T) => string | number;
  /** The card's name in words ("Fix login"): on its buttons and in what's said as it moves. */
  getLabel: (item: T) => string;
  /** What each card shows, beside its handle. */
  renderCard: (item: T, state: { column: string; index: number; dragging: boolean }) => React.ReactNode;
  /** Called with the new columns when a card is dropped somewhere new, and the move. */
  onMove: (columns: KanbanColumn<T>[], move: KanbanMove<T>) => void;
  /** The column headings' level. Default: 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6 | undefined;
  /** Shows the cards without handles or "Move to…" menus. Default: false. */
  disabled?: boolean | undefined;
}

type Place = { column: number; index: number };
type Drag = { key: string | number; from: Place; to: Place; pointer: boolean };

const EDGE = 48;      // px from a scrolling edge where a drag starts scrolling
const STEP = 16;      // px per frame at the very edge
const SLOP = 4;       // px a press moves before it counts as a drag

/** columns with the card at `from` moved to `to`. */
function moveCard<T>(columns: readonly KanbanColumn<T>[], from: Place, to: Place): KanbanColumn<T>[] {
  const out = columns.map((c) => ({ ...c, items: c.items.slice() }));
  const [it] = out[from.column].items.splice(from.index, 1);
  out[to.column].items.splice(Math.min(to.index, out[to.column].items.length), 0, it);
  return out;
}

/* Kanban: a board of columns of cards. A card moves by dragging its handle, by keyboard (Space or Enter on the handle
   picks it up, Up and Down move it within its column, Left and Right to the next column in reading order, Home and
   End to the top and bottom, Space or Enter drops it and Escape puts it back), or with its "Move to…" menu, the
   single-pointer way (WCAG 2.5.7). Each step is said ("Fix login, Done, position 2 of 5"). Nothing is reported until
   a drop (onMove), so a cancelled move changes nothing. The board scrolls sideways in its own box, and a drag near an
   edge scrolls the board or the column. */
/** A board of columns of cards that people move by dragging, by keyboard or from a "Move to…" menu, with every move announced.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const Kanban = /* @__PURE__ */ component<HTMLDivElement, KanbanProps<unknown>>('Kanban', function Kanban(props, ref) {
  const rest = omit(props, { columns: 1, getKey: 1, getLabel: 1, renderCard: 1, onMove: 1, headingLevel: 1, disabled: 1, className: 1 } as const);
  const sds = useSettings(words), L = sds.labels, locale = useLocale();
  const { getKey, getLabel } = props;
  const columns = props.columns || [];
  const base = domId('dk-kb', React.useId());
  const [drag, setDrag] = React.useState<Drag | null>(null);
  const current = React.useRef(drag);
  current.current = drag;
  const board = React.useRef<HTMLDivElement | null>(null);
  const handles = React.useRef(new Map<string | number, HTMLButtonElement>());
  const level = [2, 3, 4, 5, 6].indexOf(props.headingLevel as number) < 0 ? 3 : (props.headingLevel as number);
  const H = ('h' + level) as 'h3';
  const rtl = () => !!board.current && getComputedStyle(board.current).direction === 'rtl';

  const find = (key: string | number): Place | null => {
    for (let c = 0; c < columns.length; c++) {
      const i = columns[c].items.findIndex((it) => getKey(it) === key);
      if (i >= 0) return { column: c, index: i };
    }
    return null;
  };
  const from = drag ? find(drag.key) : null;
  // While moving, the board shows the card at its new place; nothing is reported until it's dropped.
  const shown = drag && from ? moveCard(columns, from, drag.to) : columns;
  const sizeAt = (to: Place, moving: boolean) => columns[to.column].items.length + (moving && from && from.column !== to.column ? 1 : 0);

  const commit = (key: string | number, to: Place) => {
    const at = find(key);
    if (!at) return;
    const item = columns[at.column].items[at.index];
    const name = getLabel(item), col = columns[to.column];
    const total = col.items.length + (at.column === to.column ? 0 : 1);
    const index = Math.min(to.index, total - 1);
    announce(L.kanbanDropped(name, col.title, index + 1, total));
    if (at.column !== to.column || at.index !== index)
      props.onMove(moveCard(columns, at, { column: to.column, index }), { item, from: { column: columns[at.column].id, index: at.index }, to: { column: col.id, index } });
  };
  const finish = (d: Drag, drop: boolean) => {
    setDrag(null);
    const at = find(d.key);
    if (!at) return;
    if (drop) commit(d.key, d.to);
    else announce(L.kanbanCancelled(getLabel(columns[at.column].items[at.index]), columns[at.column].title, at.index + 1, columns[at.column].items.length));
  };

  // Keyboard, and a click that didn't drag (a screen reader's virtual click, a tap): pick up, then drop.
  const dragged = React.useRef(false);
  const onClick = (key: string | number) => () => {
    if (props.disabled) return;
    if (dragged.current) { dragged.current = false; return; }
    if (drag && !drag.pointer) { finish(drag, true); return; }
    const at = find(key);
    if (!at) return;
    setDrag({ key, from: at, to: at, pointer: false });
    announce(L.kanbanGrabbed(getLabel(columns[at.column].items[at.index]), columns[at.column].title, at.index + 1, columns[at.column].items.length));
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!drag || drag.pointer || !from || isComposing(e)) return;
    const k = e.key, back = rtl() ? 'ArrowRight' : 'ArrowLeft', on = rtl() ? 'ArrowLeft' : 'ArrowRight';
    let to = drag.to;
    const last = (c: number) => sizeAt({ column: c, index: 0 }, true) - 1;
    if (k === 'ArrowUp') to = { ...to, index: Math.max(0, to.index - 1) };
    else if (k === 'ArrowDown') to = { ...to, index: Math.min(last(to.column), to.index + 1) };
    else if (k === back && to.column > 0) to = { column: to.column - 1, index: Math.min(to.index, last(to.column - 1)) };
    else if (k === on && to.column < columns.length - 1) to = { column: to.column + 1, index: Math.min(to.index, last(to.column + 1)) };
    else if (k === 'Home') to = { ...to, index: 0 };
    else if (k === 'End') to = { ...to, index: last(to.column) };
    else if (k === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(drag, false); return; }
    else if (k === 'Tab') { finish(drag, false); return; }
    else if (k !== back && k !== on) return;
    e.preventDefault();
    if (to.column !== drag.to.column || to.index !== drag.to.index) {
      setDrag({ ...drag, to });
      announce(L.kanbanMoved(getLabel(columns[from.column].items[from.index]), columns[to.column].title, to.index + 1, sizeAt(to, true)));
    }
  };
  // Focus leaving a picked-up card (a click elsewhere) puts it back. Checked a frame later: a move refocuses it first.
  const onBlur = () => requestAnimationFrame(() => {
    const d = current.current;
    if (d && !d.pointer && handles.current.get(d.key) !== document.activeElement) finish(d, false);
  });
  // A card moved to another column is a new element there: focus goes back to its handle, and it's kept in view.
  const [refocus, setRefocus] = React.useState<string | number | null>(null);
  // every render: a keyboard move re-renders the cards; nothing is read unless a card is being moved by keyboard.
  useIsoLayoutEffect(() => {
    const key = drag && !drag.pointer ? drag.key : refocus;
    if (key == null) return;
    const h = handles.current.get(key);
    if (h && document.activeElement !== h) h.focus({ preventScroll: true });
    if (h && typeof h.scrollIntoView === 'function' && (drag ? drag.to !== drag.from : true)) h.closest('li')!.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    if (refocus != null && !drag) setRefocus(null);
  });

  // "Move to…": the card goes to the end of the chosen column.
  const moveTo = (key: string | number, column: number) => {
    commit(key, { column, index: columns[column].items.length });
    setRefocus(key);
  };

  // Pointer: press a handle and move a few pixels to drag; the card follows the pointer over the columns.
  const pointer = React.useRef<{ id: number; key: string | number; sx: number; sy: number; x: number; y: number; gx: number; gy: number; moved: boolean } | null>(null);
  const latest = React.useRef({ columns, find, finish });
  latest.current = { columns, find, finish };
  const stop = React.useRef<(() => void) | null>(null);
  React.useEffect(() => () => { if (stop.current) stop.current(); }, []);
  const onPointerDown = (key: string | number) => (e: React.PointerEvent<HTMLButtonElement>) => {
    dragged.current = false;
    if (props.disabled || e.button !== 0 || (drag && !drag.pointer)) return;
    const card = e.currentTarget.closest('li')!.getBoundingClientRect();
    pointer.current = { id: e.pointerId, key, sx: e.clientX, sy: e.clientY, x: e.clientX, y: e.clientY, gx: e.clientX - card.left, gy: e.clientY - card.top, moved: false };
    const lists = () => board.current ? [...board.current.querySelectorAll<HTMLElement>('.dk-kanban__cards')] : [];
    const placeAt = (p: NonNullable<typeof pointer.current>): Drag | undefined => {
      const at = latest.current.find(p.key);
      if (!at) return undefined;
      // The column: the one whose box the pointer is across from, or the nearest one.
      const ls = lists();
      let column = 0, best = Infinity;
      ls.forEach((l, c) => {
        const b = l.getBoundingClientRect(), d = p.x < b.left ? b.left - p.x : p.x > b.right ? p.x - b.right : 0;
        if (d < best) { best = d; column = c; }
      });
      // The place in it: how many of its other cards have their middle above the dragged card's middle.
      const self = board.current && board.current.querySelector<HTMLElement>(`li[data-key="${CSS.escape(String(p.key))}"]`);
      const middle = p.y - p.gy + (self ? self.getBoundingClientRect().height / 2 : 0);
      let index = 0;
      if (ls[column]) for (const li of ls[column].children as HTMLCollectionOf<HTMLElement>) {
        if (li === self || !li.dataset.key) continue;
        const b = li.getBoundingClientRect();
        if (b.top + b.height / 2 < middle) index++;
      }
      // Only a new place re-renders the board: most moves stay in the same one, and the card itself follows the
      // pointer through its transform, not through state (GR239: every move re-rendered every card).
      const d = current.current;
      if (d && d.pointer && d.key === p.key && d.to.column === column && d.to.index === index && d.from.column === at.column && d.from.index === at.index) return d;
      const next = { key: p.key, from: at, to: { column, index }, pointer: true };
      setDrag(next);
      return next;
    };
    // Near an edge of the board (sideways) or of the column under the pointer (up and down), it scrolls that way,
    // faster the closer the pointer is.
    let frame = 0;
    const tick = () => {
      frame = 0;
      const p = pointer.current, d = current.current;
      if (!p || !p.moved) return;
      let scrolled = false;
      const nudge = (box: HTMLElement | null, horizontal: boolean) => {
        if (!box) return;
        const b = box.getBoundingClientRect(), lo = horizontal ? b.left : b.top, hi = horizontal ? b.right : b.bottom, at = horizontal ? p.x : p.y;
        const edge = Math.min(EDGE, (hi - lo) / 4);
        const by = at < lo + edge ? -Math.ceil((lo + edge - at) / edge * STEP) : at > hi - edge ? Math.ceil((at - hi + edge) / edge * STEP) : 0;
        if (!by) return;
        const before = horizontal ? box.scrollLeft : box.scrollTop;
        if (horizontal) box.scrollLeft = before + by; else box.scrollTop = before + by;
        if ((horizontal ? box.scrollLeft : box.scrollTop) !== before) scrolled = true;
      };
      nudge(board.current, true);
      nudge(d ? lists()[d.to.column] || null : null, false);
      if (scrolled) { placeAt(p); followRef.current(); }
      frame = requestAnimationFrame(tick);
    };
    const move = (ev: PointerEvent) => {
      const p = pointer.current;
      if (!p || p.id !== ev.pointerId) return;
      p.x = ev.clientX; p.y = ev.clientY;
      if (!p.moved && Math.hypot(p.x - p.sx, p.y - p.sy) < SLOP) return;
      p.moved = true;
      dragged.current = true;
      ev.preventDefault();
      placeAt(p);
      followRef.current();
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const end = (cancel: boolean) => (ev: PointerEvent) => {
      const p = pointer.current;
      if (!p || p.id !== ev.pointerId) return;
      off();
      if (p.moved) setTimeout(() => { dragged.current = false; });
      let d = current.current;
      if (p.moved) { p.x = ev.clientX; p.y = ev.clientY; d = placeAt(p) || d; }
      if (p.moved && d && d.pointer) latest.current.finish(d, !cancel);
    };
    const up = end(false), cancel = end(true);
    const off = () => {
      pointer.current = null; stop.current = null;
      if (frame) { cancelAnimationFrame(frame); frame = 0; }
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', cancel);
    };
    if (stop.current) stop.current();
    stop.current = off;
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', cancel);
  };
  // The dragged card sits under the pointer, wherever the board has placed it: after each render that moves it, and
  // on each pointer move or scroll that doesn't (those leave the board's state alone).
  const follow = () => {
    const p = pointer.current, d = current.current, cards = board.current ? [...board.current.querySelectorAll<HTMLElement>('li[data-key]')] : [];
    for (const li of cards) {
      if (p && p.moved && d && d.pointer && li.dataset.key === String(d.key)) {
        li.style.transform = '';
        const b = li.getBoundingClientRect();
        li.style.transform = 'translate(' + Math.round(p.x - p.gx - b.left) + 'px, ' + Math.round(p.y - p.gy - b.top) + 'px)';
      } else if (li.style.transform) li.style.transform = '';
    }
  };
  const followRef = React.useRef(follow);
  followRef.current = follow;
  // every render: a render moves the cards; outside a drag it only clears a transform left behind.
  useIsoLayoutEffect(() => { follow(); });

  const mergedRef = useMergedRef(ref, (n) => { board.current = n; });
  return (<>
    {/* Disabled, nothing inside takes focus, so the board does: keyboard people can still scroll a wide one. */}
    <div tabIndex={props.disabled ? 0 : undefined} {...rest} ref={mergedRef} role={rest.role ?? 'group'}
      className={cn('dk-kanban', drag && 'dk-kanban--moving', props.disabled && 'dk-kanban--disabled', props.className)} data-component="kanban">
      {shown.map((col, c) => {
        const count = columns[c].items.length, over = col.limit != null && count > col.limit, titleId = base + '-col-' + c;
        return (
          <section key={col.id} className={cn('dk-kanban__column', drag && drag.to.column === c && 'dk-kanban__column--target', over && 'dk-kanban__column--over')} aria-labelledby={titleId} data-column={col.id}>
            <div className="dk-kanban__header">
              <H className="dk-kanban__title" id={titleId}>{col.title}</H>
              <span className={cn('dk-kanban__count', over && 'dk-kanban__count--over')}>
                {over ? <Icon icon={icons.Warning} /> : null}
                {col.limit == null ? displayNumber(count, locale) : L.kanbanCount(displayNumber(count, locale), displayNumber(col.limit, locale))}
                {over ? <span className="dk-kanban__over">{L.kanbanOverLimit}</span> : null}
              </span>
            </div>
            <ul role="list" className="dk-kanban__cards" aria-labelledby={titleId}>
              {col.items.map((it, index) => {
                const key = getKey(it), dragging = !!drag && drag.key === key, name = getLabel(it);
                return (
                  <li key={key} data-key={String(key)} className={cn('dk-kanban__card', dragging && 'dk-kanban__card--dragging')} data-state={dragging ? 'dragging' : undefined}>
                    {props.disabled ? null : (
                      <button type="button" className="dk-kanban__handle" aria-label={L.kanbanMove + ' ' + name} aria-describedby={base + '-hint'} aria-pressed={dragging && !drag.pointer}
                        ref={(n) => { if (n) handles.current.set(key, n); else handles.current.delete(key); }}
                        onClick={onClick(key)} onKeyDown={onKeyDown} onBlur={onBlur} onPointerDown={onPointerDown(key)}>
                        <Icon icon={icons.DragIndicator} />
                      </button>
                    )}
                    <div className="dk-kanban__content">{props.renderCard(it, { column: col.id, index, dragging })}</div>
                    {props.disabled || columns.length < 2 ? null : (
                      <Menu placement="bottom-end" trigger={<IconButton className="dk-kanban__menu" icon={icons.MoreVert} label={L.kanbanMoveTo(name)} size="sm" variant="ghost" />}>
                        {columns.map((target, t) => t === c ? null : <MenuItem key={target.id} onSelect={() => moveTo(key, t)}>{target.title}</MenuItem>)}
                      </Menu>
                    )}
                  </li>
                );
              })}
              {col.items.length ? null : <li className="dk-kanban__empty">{L.kanbanEmpty}</li>}
            </ul>
          </section>
        );
      })}
    </div>
    {props.disabled ? null : <span hidden id={base + '-hint'}>{L.kanbanInstructions}</span>}
  </>);
}) as <T>(props: KanbanProps<T> & { ref?: React.Ref<HTMLDivElement> | undefined }) => React.ReactElement;
