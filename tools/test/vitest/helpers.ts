import { afterAll, beforeAll } from 'vitest';
import { commands } from 'vitest/browser';

declare module 'vitest/browser' {
  interface BrowserCommands {
    pointerDrag: (selector: string, from: { x: number; y: number }, to: { x: number; y: number }, steps?: number) => Promise<void>;
  }
}

// Helpers for the component tests: resolved colors, WCAG contrast, and the six themes.
export const THEMES = ['blue-light', 'blue-dark', 'violet-light', 'violet-dark', 'emerald-light', 'emerald-dark'] as const;

/** A CSS color (or var()) as the browser resolves it, "rgb(r, g, b)", in the page's current theme. */
export function color(value: string): string {
  const d = document.createElement('div');
  d.style.color = value;
  document.body.appendChild(d);
  const c = getComputedStyle(d).color;
  d.remove();
  return c;
}

const channels = (c: string) => (c.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
const luminance = (c: string) => {
  const [r, g, b] = channels(c).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** The WCAG 2.1 contrast ratio of two colors (CSS values or var()), in the current theme. */
export function contrast(fg: string, bg: string): number {
  const [x, y] = [luminance(color(fg)), luminance(color(bg))].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

/**
 * Every pair below its minimum, in every theme, as "theme name ratio". Empty when all pass.
 * Each pair is [name, foreground, background, minimum].
 */
export function lowContrast(pairs: Array<[string, string, string, number]>): string[] {
  const low: string[] = [];
  for (const th of THEMES) {
    document.documentElement.setAttribute('data-theme', th);
    for (const [name, fg, bg, need] of pairs) {
      const r = contrast(fg, bg);
      if (r < need) low.push(`${th} ${name} ${r.toFixed(2)}`);
    }
  }
  document.documentElement.setAttribute('data-theme', 'blue-light');
  return low;
}

/** The computed style of the element a selector finds (fails loudly when nothing matches). */
export function css(el: Element | null): CSSStyleDeclaration {
  if (!el) throw new Error('No element to measure');
  return getComputedStyle(el);
}

/** Waits for transitions to settle (the components animate colors for 150ms). */
export const settle = (ms = 200) => new Promise((ok) => setTimeout(ok, ms));

/**
 * Runs fn with the page's motion back on (setup.ts turns transitions and animations off), for a test that reads
 * which animation a part runs or watches it move. fn may be async; motion goes off again once it settles.
 */
export function withMotion<T>(fn: () => T): T {
  const still = document.getElementById('serupa-still') as HTMLStyleElement | null;
  const off = (on: boolean) => { if (still) still.disabled = on; };
  off(true);
  let r: T;
  try { r = fn(); } catch (e) { off(false); throw e; }
  if (r instanceof Promise) return r.finally(() => off(false)) as T;
  off(false);
  return r;
}

/** For a whole test file about motion (ripples, spinners, slides): keeps transitions and animations on throughout. */
export function keepMotion(): void {
  const still = () => document.getElementById('serupa-still') as HTMLStyleElement | null;
  beforeAll(() => { const s = still(); if (s) s.disabled = true; });
  afterAll(() => { const s = still(); if (s) s.disabled = false; });
}

/** Drags with the real mouse from one point to another, each relative to the element's top-left corner, in `steps`
 *  moves (commands.ts says why not userEvent.dragAndDrop). The element needs an id. */
export function drag(el: Element, from: { x: number; y: number }, to: { x: number; y: number }, steps = 5): Promise<void> {
  return commands.pointerDrag(`#${CSS.escape(el.id)}`, from, to, steps);
}
