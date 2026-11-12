'use client';
// Keys by name, as Kbd and Menu's shortcuts show them on Apple devices and elsewhere, and whether this is one.
// Shared, so a Menu with shortcuts doesn't bring Kbd's keycaps with it.
import * as React from 'react';
import { useSettings } from './provider';

/** Whether this is an Apple device (⌘ rather than Ctrl); false on the server. */
export const isApple = () => typeof navigator !== 'undefined' && [(navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform, navigator.platform, navigator.userAgent].some((s) => /Mac|iPhone|iPad|iPod/.test(s || ''));

const still = () => () => {};
const never = () => false;
/** Whether to show Apple's keys: a SerupaProvider's platform from the first render (the server's too); without one,
 *  false on the server and the device decides after mount. Kbd and Menu's shortcuts share it. */
export function useApple(): boolean {
  const platform = useSettings().platform;
  // The device never changes platform: no subscription. Hydration renders the server's answer (false) first.
  const found = React.useSyncExternalStore(still, isApple, never);
  return platform ? platform === 'apple' : found;
}

// What Menu's shortcuts show for the keys a shortcut uses: [on Apple devices, elsewhere]. Kbd has the full table,
// with each key's spoken name; this short one keeps a Menu with shortcuts small.
const SHOWN: Record<string, [string, string]> = {
  mod: ['⌘', 'Ctrl'], cmd: ['⌘', 'Win'], meta: ['⌘', 'Win'], ctrl: ['⌃', 'Ctrl'], control: ['⌃', 'Ctrl'], alt: ['⌥', 'Alt'], option: ['⌥', 'Alt'],
  shift: ['⇧', 'Shift'], enter: ['↵', 'Enter'], return: ['↵', 'Enter'], backspace: ['⌫', 'Backspace'], delete: ['⌦', 'Del'], esc: ['Esc', 'Esc'],
  escape: ['Esc', 'Esc'], tab: ['⇥', 'Tab'], space: ['Space', 'Space'], up: ['↑', '↑'], down: ['↓', '↓'], left: ['←', '←'], right: ['→', '→'],
};
/** One key as the platform shows it: "mod" is ⌘ on Apple devices and Ctrl elsewhere, "shift" ⇧ or Shift; other keys as
 *  given, a letter in capitals. */
export function keyShown(k: string, apple: boolean): string {
  const n = SHOWN[k === ' ' ? 'space' : k.toLowerCase().replace(/^arrow/, '')];
  return n ? n[apple ? 0 : 1] : k.length === 1 ? k.toUpperCase() : k;
}

// Modifiers in the order each platform writes them: ⌃⌥⇧⌘K on Apple devices, Ctrl+Alt+Shift+K elsewhere.
const ORDER: Record<string, [number, number]> = { ctrl: [0, 0], control: [0, 0], mod: [3, 0], alt: [1, 1], option: [1, 1], shift: [2, 2], cmd: [3, 3], meta: [3, 3] };
/** A shortcut's keys as the platform writes them: modifiers in its order, then the rest; Apple's run together ("⇧⌘K"),
 *  elsewhere joined with + ("Ctrl+Shift+K"). */
export function shortcutShown(keys: readonly string[], apple: boolean): string {
  const at = (k: string) => { const o = ORDER[k.toLowerCase()]; return o ? o[apple ? 0 : 1] : 9; };
  return keys.map((k, i) => [at(k), i, k] as const).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map((x) => keyShown(x[2], apple)).join(apple ? '' : '+');
}
