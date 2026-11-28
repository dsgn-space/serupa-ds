// How the label table shows a label (docs/blocks.tsx LabelTable): a string as it is, a function with a letter for each
// of its arguments ("Step n of m"), and one that can't be shown that way said in words. Plain TS, so a Node test reads it.

const LETTERS = ['n', 'm', 'k', 'j', 'i', 'h'];
export const BUILT = '(built from its arguments)';

export function labelWord(v: unknown): string {
  if (typeof v !== 'function') return typeof v === 'string' ? v : '';
  let out: unknown;
  try { out = (v as (...a: string[]) => unknown)(...LETTERS.slice(0, Math.max(1, v.length))); } catch { return BUILT; }
  return typeof out === 'string' && out.trim() && !/\b(?:undefined|null|NaN)\b|\[object /i.test(out) ? out : BUILT;
}
