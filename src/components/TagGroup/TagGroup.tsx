'use client';
import * as React from 'react';
import { cn, omit } from '../../internal/cn';
import { component } from '../../internal/component';
import { announce } from '../../internal/announce';
import { useSettings } from '../../internal/provider';
import { Icon } from '../Icon/Icon';
import * as icons from '../../material/builtin';
import { en as words } from './labels';
import { en as comboWords } from '../Combobox/labels';
import { en as moreWords } from '../ShowMore/labels';

const allWords = { ...words, ...comboWords, ...moreWords };

/** One tag: its id, the words it shows, and whether it can be acted on. */
export interface TagItem {
  id: string;
  /** The tag's words, which name it and its × button. */
  label: string;
  /** Shown but not removable or selectable. */
  disabled?: boolean | undefined;
}

export interface TagGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onSelect'> {
  /** The tags, in order. */
  items: readonly TagItem[];
  /** The group's visible label, above the tags. Without it, give aria-label or aria-labelledby. */
  label?: React.ReactNode;
  /** Called with a tag's id when its × is pressed, or Delete or Backspace on it. Each tag shows a × while this is set.
   *  Take the tag out of items: focus moves to the next one, and "Design removed" is said. */
  onRemove?: ((id: string) => void) | undefined;
  /** 'single' or 'multiple': a press or Space picks tags, shown with a tick and said as selected. Default: 'none'. */
  selectionMode?: 'none' | 'single' | 'multiple' | undefined;
  /** The ids picked (controlled). Use with onSelectedChange. */
  selected?: readonly string[] | undefined;
  /** The ids picked at first (uncontrolled). */
  defaultSelected?: readonly string[] | undefined;
  /** Called with the ids picked, as they now are. */
  onSelectedChange?: ((ids: string[]) => void) | undefined;
  /** Shows the first this many, and a "Show more" button for the rest. Default: all of them. */
  max?: number | undefined;
  /** Shown in place of the tags when there are none, such as "No labels yet". Default: nothing. */
  empty?: React.ReactNode;
}

/* TagGroup: short labels people remove or pick, as one grid (role="grid", a row per tag) with a single Tab stop. The
   arrow keys move between tags (Home and End to the ends), Delete or Backspace removes the focused one with focus
   moving to the next, and Space or a press picks it when selectionMode allows. The × is the tag's second cell, a
   button kept out of the Tab order. Past max, the rest wait behind "Show more". */
/** Short labels people remove or pick, such as the labels on a ticket or the skills on a profile, with one Tab stop and the arrow keys between them.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const TagGroup = /* @__PURE__ */ component<HTMLDivElement, TagGroupProps>('TagGroup', function TagGroup(props, ref) {
  const L = useSettings(allWords).labels;
  const rest = omit(props, { items: 1, label: 1, onRemove: 1, selectionMode: 1, selected: 1, defaultSelected: 1, onSelectedChange: 1, max: 1, empty: 1, className: 1, 'aria-label': 1, 'aria-labelledby': 1 } as const);
  const id = React.useId(), labelId = `${id}-label`;
  const mode = props.selectionMode || 'none';
  const [own, setOwn] = React.useState<readonly string[]>(props.defaultSelected || []);
  const picked = props.selected !== undefined ? props.selected : own;
  const [all, setAll] = React.useState(false);
  const max = props.max != null && props.max >= 0 ? Math.floor(props.max) : Infinity;
  const shown = all ? props.items : props.items.slice(0, max);
  const hidden = props.items.length - shown.length;
  // The tag that holds the Tab stop, by id: the first one until the reader moves.
  const [active, setActive] = React.useState<string | null>(null);
  const current = shown.some((t) => t.id === active) ? active : shown[0] ? shown[0].id : null;
  const grid = React.useRef<HTMLDivElement | null>(null);
  // After a removal, the tag to focus once the list has re-rendered without it (or the grid, when none is left).
  const after = React.useRef<string | null | false>(false);
  const rowOf = (tid: string) => grid.current && grid.current.querySelector<HTMLElement>(`[data-tag-id="${CSS.escape(tid)}"]`);

  React.useLayoutEffect(() => {
    if (after.current === false) return;
    const to = after.current;
    after.current = false;
    const row = to != null ? rowOf(to) : null;
    // None left: the empty text when there is one, so the reader hears "No labels yet", else the (empty) grid.
    const none = !row && grid.current && grid.current.parentElement && grid.current.parentElement.querySelector<HTMLElement>('.dk-tag-group__empty');
    (row || none || grid.current)?.focus();
  });

  const select = (t: TagItem) => {
    if (mode === 'none' || t.disabled) return;
    const on = picked.includes(t.id);
    const next = mode === 'single' ? (on ? [] : [t.id]) : on ? picked.filter((x) => x !== t.id) : [...picked, t.id];
    if (props.selected === undefined) setOwn(next);
    if (props.onSelectedChange) props.onSelectedChange(next);
  };
  const remove = (t: TagItem) => {
    if (!props.onRemove || t.disabled) return;
    const i = shown.findIndex((x) => x.id === t.id);
    const next = shown[i + 1] || shown[i - 1];
    after.current = next ? next.id : null;
    if (next) setActive(next.id);
    props.onRemove(t.id);
    announce(L.valueRemoved(t.label));
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, t: TagItem, i: number) => {
    const rtl = grid.current ? getComputedStyle(grid.current).direction === 'rtl' : false;
    const step = (d: number) => { const n = shown[Math.min(Math.max(i + d, 0), shown.length - 1)]; if (n) { setActive(n.id); const r = rowOf(n.id); if (r) r.focus(); } };
    switch (e.key) {
      case 'ArrowRight': step(rtl ? -1 : 1); break;
      case 'ArrowLeft': step(rtl ? 1 : -1); break;
      case 'ArrowDown': step(1); break;
      case 'ArrowUp': step(-1); break;
      case 'Home': step(-shown.length); break;
      case 'End': step(shown.length); break;
      case 'Delete': case 'Backspace': remove(t); break;
      case ' ': case 'Enter': select(t); break;
      default: return;
    }
    e.preventDefault();
  };

  const named = props.label != null ? labelId : props['aria-labelledby'];
  return (
    <div {...rest} ref={ref} className={cn('dk-tag-group', props.className)} data-component="tag-group">
      {props.label != null ? <div className="dk-tag-group__label" id={labelId}>{props.label}</div> : null}
      {props.items.length === 0 && props.empty != null ? <div className="dk-tag-group__empty" tabIndex={-1}>{props.empty}</div> : null}
      <div ref={grid} role="grid" className="dk-tag-group__tags" tabIndex={shown.length ? undefined : -1}
        aria-labelledby={named} aria-label={named ? undefined : props['aria-label']}
        aria-multiselectable={mode === 'multiple' || undefined}>
        {shown.map((t, i) => {
          const on = picked.includes(t.id);
          return (
            <div key={t.id} role="row" data-tag-id={t.id} tabIndex={t.id === current ? 0 : -1}
              className={cn('dk-tag-group__tag', on && 'dk-tag-group__tag--selected')}
              aria-selected={mode !== 'none' ? on : undefined} aria-disabled={t.disabled || undefined}
              onFocus={() => setActive(t.id)} onKeyDown={(e) => onKeyDown(e, t, i)} onClick={() => select(t)}>
              <span role="gridcell" className="dk-tag-group__text">
                {mode !== 'none' && on ? <Icon icon={icons.Check} className="dk-tag-group__check" /> : null}
                {t.label}
              </span>
              {props.onRemove && !t.disabled ? (
                <span role="gridcell" className="dk-tag-group__cell">
                  <button type="button" tabIndex={-1} className="dk-tag-group__remove" aria-label={L.tagRemove(t.label)}
                    onClick={(e) => { e.stopPropagation(); remove(t); }}>
                    <Icon icon={icons.Close} />
                  </button>
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
      {hidden > 0 || (all && props.items.length > max) ? (
        <button type="button" className="dk-tag-group__more" aria-expanded={all}
          onClick={() => setAll(!all)}>
          {all ? L.showLess : L.showMore}
        </button>
      ) : null}
    </div>
  );
});
