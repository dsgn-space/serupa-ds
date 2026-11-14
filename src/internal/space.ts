// Spacing steps a layout prop can take (gap={4} → var(--spacing-4)), the same scale as the gap-* utilities.
export const SPACE = ['0', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '5', '6', '7', '8', '9', '10', '11', '12', '14', '16', '20', '24'] as const;
export type Space = 0 | 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 14 | 16 | 20 | 24;

/** var(--spacing-<step>) for a step on the scale, or undefined (then the component's default applies). */
export function space(step: unknown): string | undefined {
  const s = typeof step === 'number' || typeof step === 'string' ? String(step) : '';
  return (SPACE as readonly string[]).indexOf(s) < 0 ? undefined : 'var(--spacing-' + s.replace(/[\\.]/g, '\\$&') + ')';
}

/** A layout prop's value, or one per screen width: { base, sm, md, lg } (from 640, 768 and 1024px up; each holds
 *  until the next one set), as Carousel's perView takes. Drawn by CSS media queries, so server HTML lays out right. */
export type Responsive<T> = T | { base?: T | undefined; sm?: T | undefined; md?: T | undefined; lg?: T | undefined };
/** The widths a Responsive value can change at, narrowest first. */
export const WIDTHS = ['sm', 'md', 'lg'] as const;
/** A Responsive object's value at each width, each width taking the one before when it's left out; null for a plain
 *  value (then the prop works as it always has). */
export function atWidths<T>(value: Responsive<T> | undefined): { base: T | undefined; sm: T | undefined; md: T | undefined; lg: T | undefined } | null {
  if (value == null || typeof value !== 'object') return null;
  const map = value as { base?: T; sm?: T; md?: T; lg?: T };
  const out = { base: map.base, sm: map.base, md: map.base, lg: map.base };
  let at = map.base;
  for (const w of WIDTHS) { if (map[w] != null) at = map[w]; out[w] = at; }
  return out;
}
