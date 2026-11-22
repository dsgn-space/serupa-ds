'use client';
import * as React from 'react';
import { mediaList } from './mediaList';

/* Reading a design token from JavaScript, for code that draws without CSS: a canvas, a map, a chart library, the
   color of an email preview. Components never use it: they read tokens in CSS. */

/** The attributes that change what the tokens resolve to, on <html> or on any section. */
const THEME_ATTRS = ['data-theme', 'data-brand', 'data-mode', 'data-contrast', 'data-radius', 'data-density', 'data-shadow', 'data-type-scale'];
/** The system settings tokens follow by themselves. */
const THEME_MEDIA = ['(prefers-color-scheme: dark)', '(prefers-contrast: more)', '(forced-colors: active)'];

const cssName = (name: string) => (name.startsWith('--') ? name : '--' + name);

/** A token's value where `element` sits (default: the page), as CSS resolves it there now: `tokenValue('primary')` is
 *  the primary color of the theme in force (a color comes back as CSS computes it, such as `rgb(29, 78, 216)`, with
 *  light or dark already chosen), and inside a section with its own `data-theme`, that section's. Takes the
 *  token's name with or without `--`. '' on the server, or for a name no theme defines. For a one-off read in an
 *  event handler; to draw with it, use `useTokenValue`, which follows theme changes. */
export function tokenValue(name: string, element?: Element | null): string {
  if (typeof document === 'undefined') return '';
  const el = element || document.documentElement;
  const raw = getComputedStyle(el).getPropertyValue(cssName(name)).trim();
  // A color token is often light-dark(…, …) or color-mix(…), which a canvas can't take and which only the element's
  // color-scheme settles: paint it on a probe there and read back the color CSS chose, so every color comes back in
  // one form.
  if (!raw || typeof CSS === 'undefined' || !CSS.supports('color', raw)) return raw;
  const probe = document.createElement('span');
  probe.style.cssText = 'position:absolute;visibility:hidden;color:' + raw;
  el.appendChild(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

// module state: the hooks listening for theme changes, and the one observer and media lists that tell them. It holds
// only this page's listeners, never a request's data, and the server never fills it (no document there).
const listeners = new Set<() => void>();
let watch: (() => void) | null = null;
function onThemeChange(on: () => void): () => void {
  listeners.add(on);
  if (!watch && typeof document !== 'undefined') {
    const tell = () => listeners.forEach((fn) => fn());
    const observer = typeof MutationObserver === 'function' ? new MutationObserver(tell) : null;
    if (observer) observer.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: THEME_ATTRS });
    const lists = THEME_MEDIA.map(mediaList).filter((m): m is MediaQueryList => !!m);
    lists.forEach((m) => m.addEventListener('change', tell));
    watch = () => { if (observer) observer.disconnect(); lists.forEach((m) => m.removeEventListener('change', tell)); };
  }
  return () => {
    listeners.delete(on);
    if (!listeners.size && watch) { watch(); watch = null; }
  };
}

/** A token's value as CSS resolves it now, kept up to date when the theme, mode, contrast, roundness or density
 *  changes (on the page or on a section around `ref`), or the system switches to dark or more contrast. For code that
 *  draws without CSS: `const line = useTokenValue('primary')` for a canvas chart. With `ref`, the value where that
 *  element sits, so a section with its own theme gets its own. '' in server HTML and until hydrated. Prefer CSS
 *  (`var(--primary)`) wherever the thing drawn can take it: it follows the theme with no re-render. */
export function useTokenValue(name: string, ref?: React.RefObject<Element | null>  ): string {
  const get = () => tokenValue(name, ref ? ref.current : null);
  return React.useSyncExternalStore(onThemeChange, get, () => '');
}
