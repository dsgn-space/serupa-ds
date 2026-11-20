import { describe, expect, test } from 'vitest';

// Content and voice (docs/foundations.md): American spelling, as the tokens, props and CSS spell it. The guides are
// checked by tools/test/voice.mjs; this checks what ships inside the package and reaches editors and the docs' tables:
// each component token's description, and each prop's description (its JSDoc).
const UK = /\b(?:colour(?:s|ed|ing|ful)?|organis(?:ation|ations|e|es|ed|ing)|centre(?:s|d)?|behaviour(?:s|al)?|neighbour(?:s|ing)?)\b/gi;

const tokens = import.meta.glob<{ default: unknown }>('../components/*/*.tokens.json', { eager: true });
const sources = import.meta.glob<string>(['../components/*/*.tsx', '!../components/*/*.test.tsx', '!../components/*/*.stories.tsx'], { eager: true, query: '?raw', import: 'default' });

const descriptions = (node: unknown, out: string[] = []): string[] => {
  if (node && typeof node === 'object') for (const [k, v] of Object.entries(node)) {
    if ((k === '$description' || k === 'description') && typeof v === 'string') out.push(v);
    else descriptions(v, out);
  }
  return out;
};
// Prop and export descriptions: a /** … */ comment right before a prop (`label?:`) or an export, and not @internal,
// less quoted examples ("Colour scheme") and code.
const jsdoc = (code: string) => [...code.matchAll(/\/\*\*[\s\S]*?\*\/(?=\s*(?:export\b|['\w-]+\??:))/g)]
  .map((m) => m[0]).filter((d) => !d.includes('@internal')).map((d) => d.replace(/"[^"\n]*"|`[^`\n]*`/g, ''));

describe('American spelling in what ships (Content and voice)', () => {
  test('component token descriptions', () => {
    const found = Object.entries(tokens).flatMap(([f, m]) => descriptions(m.default).flatMap((d) => (d.match(UK) ?? []).map((w) => `${f}: ${w}`)));
    expect(Object.keys(tokens).length).toBeGreaterThan(50);
    expect(found).toEqual([]);
  });
  test('prop descriptions', () => {
    const found = Object.entries(sources).flatMap(([f, code]) => jsdoc(code).flatMap((d) => (d.match(UK) ?? []).map((w) => `${f}: ${w}`)));
    expect(Object.keys(sources).length).toBeGreaterThan(100);
    expect(found).toEqual([]);
  });
  test('the pattern catches "colour" and "centred", and leaves "color" and "Colorado" alone', () => {
    expect(['its colour', 'centred'].every((s) => new RegExp(UK.source, 'i').test(s))).toBe(true);
    expect(['its color', 'Colorado', 'behavioral'].some((s) => new RegExp(UK.source, 'i').test(s))).toBe(false);
  });
});
