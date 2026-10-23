import { afterEach, describe, expect, test } from 'vitest';
import tokens from '../../tokens.json';
import { THEMES } from '../../tools/test/vitest/helpers';

// Theme axes (ADR-0011): data-brand and data-mode on an element without data-theme give the same colors as the
// flat data-theme="<brand>-<mode>" themes, through light-dark() pairs that the element's color-scheme resolves.
const root = document.documentElement;
type Tok = { name: string; value: unknown };
const varying = (tokens.color.tokens as Tok[]).filter((t) => t.value && typeof t.value === 'object' && new Set(Object.values(t.value as object)).size > 1).map((t) => t.name);

// The resolved color of every varying token on a probe inside `host`.
function read(host: HTMLElement): Record<string, string> {
  const probe = document.createElement('span');
  host.appendChild(probe);
  const out: Record<string, string> = {};
  for (const n of varying) { probe.style.color = `var(--${n})`; out[n] = getComputedStyle(probe).color; }
  probe.remove();
  return out;
}
const badge = (host: HTMLElement) => {
  const b = document.createElement('span');
  b.className = 'dk-badge dk-badge--subtle';
  b.setAttribute('data-tone', 'red');
  b.style.background = 'var(--dk-bdg-red-sbg)';
  host.appendChild(b);
  const c = getComputedStyle(b).backgroundColor;
  b.remove();
  return c;
};
const axes = (brand?: string, mode?: string) => {
  root.removeAttribute('data-theme');
  if (brand) root.setAttribute('data-brand', brand); else root.removeAttribute('data-brand');
  if (mode) root.setAttribute('data-mode', mode); else root.removeAttribute('data-mode');
};

afterEach(() => { root.removeAttribute('data-brand'); root.removeAttribute('data-mode'); root.setAttribute('data-theme', 'blue-light'); });

describe('Theme axes', () => {
  test('data-brand + data-mode give exactly the colors of each data-theme', () => {
    for (const th of THEMES) {
      const [brand, mode] = th.split('-');
      root.setAttribute('data-theme', th);
      const flat = read(document.body), flatBadge = badge(document.body);
      axes(brand, mode);
      expect(read(document.body), th).toEqual(flat);
      expect(badge(document.body), th + ' badge').toBe(flatBadge);
      expect(getComputedStyle(root).colorScheme, th).toBe(mode);
    }
  });

  test('auto follows the color-scheme; a data-mode section switches inside the page', () => {
    root.setAttribute('data-theme', 'violet-dark');
    const dark = read(document.body);
    root.setAttribute('data-theme', 'violet-light');
    const light = read(document.body);
    axes('violet', 'auto');
    expect(getComputedStyle(root).colorScheme).toBe('light dark');
    const section = document.createElement('section');
    section.setAttribute('data-mode', 'dark');
    document.body.appendChild(section);
    expect(read(section)).toEqual(dark);
    section.setAttribute('data-mode', 'light');
    expect(read(section)).toEqual(light);
    section.remove();
  });

  test('a data-brand section takes its brand inside another', () => {
    root.setAttribute('data-theme', 'emerald-dark');
    const emeraldDark = read(document.body);
    axes('blue', 'dark');
    const section = document.createElement('section');
    section.setAttribute('data-brand', 'emerald');
    document.body.appendChild(section);
    expect(read(section)).toEqual(emeraldDark);
    section.remove();
  });

  test('a root with neither attribute stays light, as before', () => {
    root.setAttribute('data-theme', 'blue-light');
    const flat = read(document.body);
    axes();
    expect(read(document.body)).toEqual(flat);
    expect(getComputedStyle(root).colorScheme).toBe('light');
  });
});
