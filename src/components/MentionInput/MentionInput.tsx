'use client';
import * as React from 'react';
import { cn, domId, useIsoLayoutEffect, useMergedRef } from '../../internal/cn';
import { component } from '../../internal/component';
import { announce } from '../../internal/announce';
import { FieldContext } from '../../internal/field';
import { isComposing } from '../../internal/ime';
import { displayNumber } from '../../internal/numbers';
import { useLocale, useSettings } from '../../internal/provider';
import { announcePause } from '../../internal/timing';
import { useAnchoredLayer } from '../../internal/useAnchoredLayer';
import { useFormReset } from '../../internal/useFormReset';
import { Avatar } from '../Avatar/Avatar';
import { highlightRanges } from '../Highlight/Highlight';
import { Textarea, type TextareaProps } from '../Textarea/Textarea';
import { en as words } from '../Combobox/labels';

/** Someone (or something) that can be mentioned. */
export interface MentionOption {
  /** A stable id: what mentionsIn gives back, for the app to notify. */
  id: string;
  /** The name as it's written into the text after the trigger: "Ayu Lestari" becomes "@Ayu Lestari". */
  label: string;
  /** A second line in the list, such as a role or an email address. */
  description?: React.ReactNode;
  /** A picture for the Avatar beside the name. Without it, the Avatar shows initials. */
  avatar?: string | undefined;
  /** Shown but can't be picked, such as someone who can't see this page. */
  disabled?: boolean | undefined;
}

export interface MentionInputProps extends Omit<TextareaProps, 'value' | 'defaultValue'> {
  /** The people (or things) that can be mentioned. Pass all of them, or, for a large directory, the ones that match
      the query onSearch last gave (with filter={false}). */
  options: readonly MentionOption[];
  /** The text (controlled). Use with onValueChange, which picking a mention also calls. */
  value?: string | undefined;
  /** The text at first. Default: ''. */
  defaultValue?: string | undefined;
  /** Called with the new text on every change, typing or a mention put in. */
  onValueChange?: ((value: string) => void) | undefined;
  /** Called with what's typed after the trigger while the list is open, and with null when it closes: for loading
      matches from a server. */
  onSearch?: ((query: string | null) => void) | undefined;
  /** Called when a mention is put in. */
  onMention?: ((option: MentionOption) => void) | undefined;
  /** The character that starts a mention. Default: "@". */
  trigger?: string | undefined;
  /** Narrows options to those whose label holds the query, ignoring case and accents. Turn it off when the app
      filters (onSearch). Default: true. */
  filter?: boolean | undefined;
  /** The most options the list shows. Default: 8. */
  maxOptions?: number | undefined;
}

type Query = { start: number; text: string };
const MAX_QUERY = 40;

/** Where the open mention starts and what's typed after its trigger, or null. The trigger counts only at the start
    or after a space or an opening bracket, so an email address ("ayu@example.com") doesn't open the list, and a
    space at the caret ends the mention (one inside, "@Ayu L", doesn't). */
export function mentionQuery(text: string, caret: number, trigger = '@'): Query | null {
  const start = text.lastIndexOf(trigger, caret - 1);
  if (start < 0 || caret - start - trigger.length > MAX_QUERY) return null;
  const before = start ? text.charAt(start - 1) : ' ';
  if (!/[\s([{"'“‘]/.test(before)) return null;
  const q = text.slice(start + trigger.length, caret);
  if (/[\n\r]/.test(q) || /^\s|\s$/.test(q)) return null;   // a space ends it: "@Ayu L" goes on, "@Ayu " stops
  return { start, text: q };
}

/** The options mentioned in a text: each one whose trigger and label ("@Ayu Lestari") appear in it, in the order
    they first appear. For the app to notify them when the text is sent. */
export function mentionsIn(text: string, options: readonly MentionOption[], trigger = '@'): MentionOption[] {
  // At each trigger, the longest name written there whole: "@Ayu Lestari" is Ayu Lestari, not Ayu as well, and
  // "@Ayub" is nobody, while an "@Ayu" further on still counts.
  const longest = options.slice().sort((a, b) => b.label.length - a.label.length);
  const found: MentionOption[] = [];
  for (let at = text.indexOf(trigger); at >= 0; at = text.indexOf(trigger, at + trigger.length)) {
    const o = longest.find((x) => x.label && text.startsWith(x.label, at + trigger.length) && !/[\p{L}\p{N}]/u.test(text.charAt(at + trigger.length + x.label.length)));
    if (o && !found.includes(o)) found.push(o);
  }
  return found;
}

// The textarea's caret, in pixels from its padding box's corner: a copy of the field with the text up to the caret
// and a marker where the caret is, laid out the same way (font, padding, width, wrapping) and read back.
const COPIED = ['boxSizing', 'width', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'paddingTop', 'paddingRight',
  'paddingBottom', 'paddingLeft', 'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'letterSpacing', 'lineHeight', 'textTransform', 'wordSpacing',
  'textIndent', 'tabSize', 'direction'] as const;
function caretAt(el: HTMLTextAreaElement, index: number): { left: number; top: number; height: number } {
  const cs = getComputedStyle(el), copy = document.createElement('div'), mark = document.createElement('span');
  for (const k of COPIED) copy.style[k] = cs[k];
  Object.assign(copy.style, { position: 'absolute', visibility: 'hidden', top: '0', left: '-9999px', whiteSpace: 'pre-wrap', overflowWrap: 'break-word', overflow: 'hidden' });
  copy.textContent = el.value.slice(0, index);
  mark.textContent = '​';
  copy.appendChild(mark);
  document.body.appendChild(copy);
  const line = parseFloat(cs.lineHeight) || mark.offsetHeight;
  const out = { left: mark.offsetLeft - el.scrollLeft, top: mark.offsetTop - el.scrollTop, height: line };
  copy.remove();
  return out;
}

/* MentionInput: a Textarea where typing the trigger ("@") opens a list of people to mention, at the caret.
   - The textarea stays a textbox (role=combobox isn't allowed on <textarea>): aria-autocomplete="list", aria-controls
     and aria-activedescendant point to the listbox while it's open, and how many match is said politely, after a
     pause, as Combobox does (4.1.3).
   - Keys while the list is open: Down and Up move through it, Enter or Tab puts the active one in, Escape closes it
     until the next mention. Everything else is typing. Nothing is taken while an IME is composing.
   - Picking writes "@Label " into the text and leaves the caret after it, so typing goes on.
   - The list is a layer anchored to the caret, in the top layer, so a dialog or a scrolling box doesn't clip it. */
/** A multi-line text field where typing "@" suggests people to mention, at the caret; picking one writes "@Name" into the text.
 *  @beta New: its API may still change in a minor release. Take this tag off once it has shipped with its bug bash done (CONTRIBUTING.md). */
export const MentionInput = /* @__PURE__ */ component<HTMLTextAreaElement, MentionInputProps>('MentionInput', function MentionInput(props, ref) {
  const { options, value, defaultValue, onValueChange, onSearch, onMention, trigger = '@', filter = true, maxOptions = 8, className, style, ...rest } = props;
  const L = useSettings(words).labels, locale = useLocale();
  const field = React.useRef<HTMLTextAreaElement | null>(null);
  const [own, setOwn] = React.useState(defaultValue || '');
  const text = value !== undefined ? value : own;
  const [query, setQuery] = React.useState<Query | null>(null);
  const [dismissed, setDismissed] = React.useState(-1);   // the mention Escape closed: stays closed until another
  const [active, setActive] = React.useState(0);
  const caret = React.useRef<number | null>(null);
  // The textarea's value comes from state, so a form reset puts the text back to defaultValue here.
  useFormReset(field, () => { if (value === undefined) setOwn(defaultValue || ''); setQuery(null); }, rest.form);   // where to put the caret after a pick, once the text is rendered
  const base = domId('dk-mention', React.useId()), listId = base + '-list';
  const fieldLabel = React.useContext(FieldContext)?.labelId;

  const q = query && query.start !== dismissed ? query : null;
  const max = Math.max(1, Math.floor(maxOptions) || 8);
  const qText = q ? q.text : null;
  // Searched once per mention typed, not on every render (a key that moves the highlight, a caret move): each name
  // is matched once, and the ones starting with the text come first, in their order.
  const shown = React.useMemo(() => {
    if (qText == null) return [];
    if (!filter || !qText) return options.slice(0, max);
    const starts: MentionOption[] = [], inside: MentionOption[] = [];
    for (const o of options) {
      const at = highlightRanges(o.label, qText)[0];
      if (at) (at[0] === 0 ? starts : inside).push(o);
    }
    return starts.concat(inside).slice(0, max);
  }, [options, qText, filter, max]);
  const open = !!q && !rest.disabled && !rest.readOnly;
  const pickable = shown.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);
  const current = pickable.indexOf(active) >= 0 ? active : (pickable[0] ?? -1);

  const onQuery = React.useRef(onSearch);
  // every render: keeps the latest onSearch without making the query effect run again.
  useIsoLayoutEffect(() => { onQuery.current = onSearch; });
  const lastQuery = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (qText === lastQuery.current) return;   // not on mount, while nothing is open
    lastQuery.current = qText;
    if (onQuery.current) onQuery.current(qText);
  }, [qText]);

  // How many match, said after a pause in typing, as Combobox says it.
  const said = !open ? '' : shown.length ? L.resultsCount(shown.length, displayNumber(shown.length, locale)) : L.noResults;
  React.useEffect(() => {
    if (!said) return;
    const t = setTimeout(() => announce(said), announcePause);
    return () => clearTimeout(t);
  }, [said]);

  const read = (el: HTMLTextAreaElement) => {
    const at = el.selectionStart === el.selectionEnd ? el.selectionStart : -1;
    const next = at < 0 ? null : mentionQuery(el.value, at, trigger);
    setQuery((was) => (was && next && was.start === next.start && was.text === next.text ? was : next));
    if (!next || (query && next.start !== query.start)) setActive(0);
    if (!next) setDismissed(-1);   // that mention is gone (its @ deleted, or the caret left it): a new @ there opens the list
  };
  const change = (next: string) => { if (value === undefined) setOwn(next); if (onValueChange) onValueChange(next); };

  const pick = (o: MentionOption) => {
    const el = field.current;
    if (!q || !el || o.disabled) return;
    const end = q.start + trigger.length + q.text.length;
    const after = text.slice(end).replace(/^[^\s]*/, '');   // the rest of a half-typed word goes too
    const put = trigger + o.label + (after.startsWith(' ') ? '' : ' ');
    const next = text.slice(0, q.start) + put + after;
    caret.current = q.start + put.length + (after.startsWith(' ') ? 1 : 0);
    setQuery(null);
    change(next);
    if (onMention) onMention(o);
  };
  // every render: a pick sets caret.current; the caret goes after the mention once the new text has rendered.
  useIsoLayoutEffect(() => {
    const el = field.current;
    if (caret.current == null || !el) return;
    el.setSelectionRange(caret.current, caret.current);
    caret.current = null;
  });

  // The anchor: an empty box at the caret, inside the field's wrapper, that the list is placed against.
  const wrap = React.useRef<HTMLSpanElement | null>(null), anchor = React.useRef<HTMLSpanElement | null>(null), pop = React.useRef<HTMLDivElement | null>(null);
  useIsoLayoutEffect(() => {
    const el = field.current, a = anchor.current;
    if (!open || !el || !a || !q) return;
    const c = caretAt(el, q.start);
    a.style.insetInlineStart = '';
    a.style.left = el.offsetLeft + el.clientLeft + Math.max(0, Math.min(c.left, el.clientWidth)) + 'px';
    a.style.top = el.offsetTop + el.clientTop + Math.max(0, Math.min(c.top, el.clientHeight - c.height)) + 'px';
    a.style.height = c.height + 'px';
  }, [open, q && q.start, text]);
  useAnchoredLayer(open, pop, anchor, { placement: 'bottom-start', offsetVar: '--dk-mention-input-offset', watch: shown.length,
    onOutside: () => setQuery(null), onFocusOutside: () => setQuery(null) });

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (rest.onKeyDown) rest.onKeyDown(e);
    if (e.defaultPrevented || !open || isComposing(e)) return;
    const at = pickable.indexOf(current);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!pickable.length) return;
      const step = e.key === 'ArrowDown' ? 1 : -1;
      setActive(pickable[(at + step + pickable.length) % pickable.length] ?? -1);
    } else if ((e.key === 'Enter' || e.key === 'Tab') && !e.shiftKey && shown[current]) {
      e.preventDefault();
      pick(shown[current]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();   // a dialog the field is in stays open
      setDismissed(q ? q.start : -1);
    }
  };

  const setRefs = useMergedRef(ref, (n: HTMLTextAreaElement | null) => { field.current = n; });
  const keep = (e: React.MouseEvent) => e.preventDefault();   // a press in the list leaves focus in the field
  return (
    <span ref={wrap} className={cn('dk-mention-input', className)} style={style} data-component="mention-input" data-state={open ? 'open' : 'closed'}>
      <Textarea {...rest} ref={setRefs} value={text}
        aria-autocomplete="list" aria-controls={open ? listId : undefined}
        aria-activedescendant={open && current >= 0 ? base + '-opt-' + current : undefined}
        onChange={(e) => { if (rest.onChange) rest.onChange(e); change(e.target.value); read(e.target); }}
        onSelect={(e) => { if (rest.onSelect) rest.onSelect(e); read(e.currentTarget); }}
        onKeyDown={onKeyDown}
        onBlur={(e) => { if (rest.onBlur) rest.onBlur(e); setQuery(null); }} />
      <span ref={anchor} className="dk-mention-input__anchor" aria-hidden />
      <div ref={pop} className="dk-mention-input__popup" {...{ popover: 'manual' }} hidden={!open || undefined} onMouseDown={keep}>
        <div id={listId} role="listbox" className="dk-mention-input__listbox"
          aria-labelledby={rest['aria-labelledby'] || (rest['aria-label'] ? undefined : fieldLabel)} aria-label={rest['aria-labelledby'] ? undefined : rest['aria-label']}>
          {open ? shown.map((o, i) => (
            <div key={o.id} id={base + '-opt-' + i} role="option" aria-selected={i === current} aria-disabled={o.disabled || undefined}
              className={cn('dk-mention-input__option', i === current && 'dk-mention-input__option--active')}
              onMouseMove={() => { if (!o.disabled && i !== current) setActive(i); }} onClick={() => pick(o)}>
              <Avatar size="xs" name={o.label} src={o.avatar} alt="" />
              <span className="dk-mention-input__text">
                <span>{o.label}</span>
                {o.description != null ? <span className="dk-mention-input__description">{o.description}</span> : null}
              </span>
            </div>
          )) : null}
        </div>
        {open && !shown.length ? <div className="dk-mention-input__message">{L.noResults}</div> : null}
      </div>
    </span>
  );
});
