import * as React from 'react';
import { useSettings } from './provider';
import { isComposing } from './ime';
import { warnOnce } from './warn';
import { topModal } from './layers';
import { isApple } from '../components/Kbd/Kbd';
import { en as words } from '../components/KeyboardShortcuts/labels';

/* The page's keyboard shortcuts: useShortcut sets one up, and <KeyboardShortcuts> lists them. Here rather than in
   KeyboardShortcuts' folder, so a component that only sets up a shortcut (CommandPalette) doesn't import the help
   dialog. */
export interface ShortcutOptions {
  /** What it does, listed in <KeyboardShortcuts>'s dialog. Without it, the shortcut works but isn't listed. */
  description?: string | undefined;
  /** The heading it's listed under. Default: "General". */
  group?: string | undefined;
  /** false turns it off for now (default true). */
  enabled?: boolean | undefined;
  /** Also fire while typing in a text field. Shortcuts with mod, ctrl or cmd always do; others don't by default,
   *  so "/" or "N" can still be typed. */
  inInputs?: boolean | undefined;
}

// A combination, parsed: the modifiers it needs and its key as KeyboardEvent.key reports it (letters in lower case).
export interface Combo { key: string; mod: boolean; ctrl: boolean; meta: boolean; alt: boolean; shift: boolean }
interface Registered extends Combo { keys: string[]; run: { current: (e: KeyboardEvent) => void }; description?: string; group?: string; inInputs: boolean; apple: boolean }

const NAMED: Record<string, string> = {
  esc: 'Escape', escape: 'Escape', enter: 'Enter', return: 'Enter', space: ' ', tab: 'Tab', backspace: 'Backspace',
  delete: 'Delete', up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', home: 'Home', end: 'End',
  pageup: 'PageUp', pgup: 'PageUp', pagedown: 'PageDown', pgdn: 'PageDown', insert: 'Insert', ins: 'Insert',
};
const MODIFIER: Record<string, keyof Omit<Combo, 'key'>> = {
  mod: 'mod', cmd: 'meta', meta: 'meta', ctrl: 'ctrl', control: 'ctrl', alt: 'alt', option: 'alt', shift: 'shift',
};
// null unless there's exactly one key besides the modifiers: ["G", "I"] can't be pressed together, and matching only
// its last key ran it on a lone "I" (GQ3).
export function parse(keys: string[]): Combo | null {
  const c: Combo = { key: '', mod: false, ctrl: false, meta: false, alt: false, shift: false };
  let n = 0;
  for (const k of keys) {
    const name = k.length > 1 ? k.toLowerCase().replace(/[\s_-]/g, '') : k.toLowerCase();
    const m = MODIFIER[name];
    if (m) c[m] = true;
    else { c.key = NAMED[name] || (k.length === 1 ? k.toLowerCase() : k); n++; }
  }
  return n === 1 ? c : null;
}
function matches(c: Combo, e: KeyboardEvent, apple: boolean): boolean {
  if (e.ctrlKey !== (c.ctrl || (c.mod && !apple)) || e.metaKey !== (c.meta || (c.mod && apple)) || e.altKey !== c.alt) return false;
  // "?" and other symbols need Shift on some layouts and not others, so Shift isn't checked for them.
  const symbol = c.key.length === 1 && !/[a-z0-9 ]/.test(c.key);
  if (!symbol && e.shiftKey !== c.shift) return false;
  if ((e.key.length === 1 ? e.key.toLowerCase() : e.key) === c.key) return true;
  // Option changes the character a letter types on a Mac (⌥K is "˚"), and a Cyrillic or Greek layout types "л" there,
  // so letters and digits also match by position. Not when the key typed another Latin character: on AZERTY the key
  // in Q's place types "a", and Ctrl+A was running a Ctrl+Q shortcut (L8E16).
  return /^[a-z]$/.test(c.key) ? !/^[\x20-\x7e]$/.test(e.key) && e.code === 'Key' + c.key.toUpperCase() : /^[0-9]$/.test(c.key) ? e.code === 'Digit' + c.key : false;
}
const NOT_TYPED = /^(checkbox|radio|button|submit|reset|range|color|file|image)$/;
const typing = (t: EventTarget | null): boolean =>
  t instanceof HTMLElement && (t.isContentEditable || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || (t.tagName === 'INPUT' && !NOT_TYPED.test((t as HTMLInputElement).type)));

// module state: browser only: the shortcuts set up now, newest last; replaced (not changed) so it's a stable snapshot.
let entries: Registered[] = [];
const watchers = new Set<() => void>();
const NONE: Registered[] = [];
const changed = () => watchers.forEach((w) => w());
function onKey(e: KeyboardEvent): void {
  // A modal makes the page behind it inert, so the page's shortcuts wait until it closes.
  if (e.defaultPrevented || isComposing(e) || topModal()) return;
  // The newest wins, so a panel's shortcut overrides the page's while the panel is open.
  for (const x of [...entries].reverse()) {
    if (!matches(x, e, x.apple)) continue;
    if (characterKey(x) && !singleKeysOn()) continue;   // turned off in the help dialog
    // The field itself, not its web component's host: a keydown from a shadow root's <input> reaches the document
    // retargeted to the host element, and a lone "g" typed there ran the page's "g" (L8E43).
    if (typing(e.composedPath()[0] || e.target) && !x.inInputs && !x.mod && !x.ctrl && !x.meta) continue;
    e.preventDefault();
    x.run.current(e);
    return;
  }
}
function add(x: Registered): () => void {
  if (!entries.length) document.addEventListener('keydown', onKey);
  entries = entries.concat(x);
  changed();
  return () => {
    entries = entries.filter((y) => y !== x);
    if (!entries.length) document.removeEventListener('keydown', onKey);
    changed();
  };
}
export const watch = (w: () => void) => { watchers.add(w); return () => { watchers.delete(w); }; };
export const current = () => entries;
export const none = () => NONE;

/* Single-key shortcuts (a character key with no mod, ctrl, cmd or alt, such as "?" or "N") can be turned off by the
   person using the page, from the switch in the help dialog (WCAG 2.1.4): speech input, or a stray key, sets them off
   by accident. The choice is kept in localStorage for every page of the app; where storage is blocked it lasts until
   the page reloads. Keys such as Escape or the arrows aren't character keys, so they keep working. */
const SINGLE_KEYS_KEY = 'serupa-single-key-shortcuts';
// module state: a cache of the browser's own localStorage choice; a server only ever reads it as on, and only a click sets it.
let single: boolean | undefined;
export function singleKeysOn(): boolean {
  if (single === undefined) { try { single = localStorage.getItem(SINGLE_KEYS_KEY) !== 'off'; } catch { single = true; } }
  return single;
}
export function setSingleKeys(on: boolean): void {
  single = on;
  try { if (on) localStorage.removeItem(SINGLE_KEYS_KEY); else localStorage.setItem(SINGLE_KEYS_KEY, 'off'); } catch { /* blocked: this page only */ }
  changed();
}
// Keys the browser keeps: with mod (or Ctrl or ⌘ alone), N, T, W and Q open, close and quit, and Tab switches tabs,
// with or without Shift. A page can't prevent them, so a shortcut on them never runs.
const kept = (c: Combo): boolean => (c.mod || c.ctrl || c.meta) && !c.alt && /^([ntwq]|Tab)$/.test(c.key);
export const characterKey = (c: Combo): boolean => c.key.length === 1 && !c.mod && !c.ctrl && !c.meta && !c.alt;
export const on = () => true;

/* useShortcut: runs handler when the keys are pressed anywhere on the page, while the component is mounted. Keys are
   as Kbd takes them ("mod" is ⌘ on Apple devices and Ctrl elsewhere). It doesn't fire while typing in a text field
   unless it has mod, ctrl or cmd (or inInputs), while an IME is composing, while a modal is open, or when something
   else already handled the key. When two set up the same keys, the newest wins. With a description, it's listed in
   <KeyboardShortcuts>. */
/** Runs handler when the keys are pressed (["mod", "K"]: one key and its modifiers), and lists it in <KeyboardShortcuts> when it has a description. */
export function useShortcut(keys: string | string[], handler: (event: KeyboardEvent) => void, options?: ShortcutOptions): void {
  const sds = useSettings(words);
  const run = React.useRef(handler);
  // every render: the newest handler runs, without setting the shortcut up again.
  React.useEffect(() => { run.current = handler; });
  const list = typeof keys === 'string' ? [keys] : keys;
  const id = JSON.stringify(list);
  const { description, group, enabled = true, inInputs = false } = options || {};
  const apple = sds.platform ? sds.platform === 'apple' : null;
  React.useEffect(() => {
    if (!enabled) return;
    const k = JSON.parse(id) as string[], combo = parse(k);
    if (!combo) {
      if (process.env.NODE_ENV !== 'production') warnOnce('shortcut-keys', `useShortcut: ${id} isn't one key with its modifiers, so it's not set up. Give one key, plus mod, ctrl, cmd, alt or shift if it needs them, such as ["mod", "K"].`, 'shortcut-keys' + id);
      return;
    }
    if (process.env.NODE_ENV !== 'production' && kept(combo)) warnOnce('browser-shortcut', `useShortcut: ${id} is a key the browser keeps for itself (a new window or tab, closing it, quitting, switching tabs), so the page never hears it. Choose other keys, such as ["mod", "shift", "K"], or ["alt", "N"] for "new".`, 'browser-shortcut' + id);
    return add(Object.assign(combo, { keys: k, run, description, group, inInputs, apple: apple != null ? apple : isApple() }));
  }, [id, description, group, enabled, inInputs, apple]);
}
