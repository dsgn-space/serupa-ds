'use client';
import * as React from 'react';
import { REDUCED_MOTION, mediaList } from './mediaList';

/** The screen widths of the `screen-*` tokens and the `sm:` … `2xl:` utility prefixes, in px (min-width, mobile first). */
export const BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 } as const;
/** A breakpoint's name: `'sm'` (640px), `'md'` (768px), `'lg'` (1024px), `'xl'` (1280px) or `'2xl'` (1536px). */
export type Breakpoint = keyof typeof BREAKPOINTS;

/** Whether a CSS media query matches now, kept up to date as it changes (the window resized, the phone turned, a
 *  setting switched). `useMediaQuery('(hover: hover)')`. Server HTML and hydration use `serverValue` (default
 *  false), and the browser's answer follows right after, so the first render never mismatches. For the widths of
 *  the tokens use `useBreakpoint`, and for motion `useReducedMotion`. Prefer CSS (`md:` utilities, container
 *  queries) where it can do the job: a hook is for when the markup itself has to change. */
export function useMediaQuery(query: string, options?: { serverValue?: boolean | undefined }): boolean {
  const server = !!(options && options.serverValue);
  const subscribe = React.useCallback((on: () => void) => {
    const m = mediaList(query);
    if (!m) return () => {};
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, [query]);
  const get = () => { const m = mediaList(query); return m ? m.matches : server; };
  return React.useSyncExternalStore(subscribe, get, () => server);
}

/** Whether the screen is at least a breakpoint wide (`useBreakpoint('md')` is true from 768px up), at the same
 *  widths as the `screen-*` tokens and the `md:` utilities, so a layout the hook picks switches at the same width
 *  as the CSS around it. Server HTML and hydration use `serverValue` (default false: mobile first). */
export function useBreakpoint(name: Breakpoint, options?: { serverValue?: boolean | undefined }): boolean {
  return useMediaQuery('(min-width: ' + BREAKPOINTS[name] + 'px)', options);
}

/** Whether the visitor asked for less motion (`prefers-reduced-motion: reduce`). Use it to skip a JavaScript
 *  animation (scrolling smoothly, a count going up, a confetti burst): CSS transitions already follow the setting
 *  through the motion tokens and base.css. False in server HTML and until hydrated. */
export function useReducedMotion(): boolean {
  return useMediaQuery(REDUCED_MOTION);
}
