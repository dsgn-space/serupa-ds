import { describe, expect, test } from 'vitest';
import source from '../../tokens/serupa.tokens.json';

// Every numbered scale in the token source runs from small to large, so the generated tables (docs, README,
// tokens.json, design-tokens/) list it in order: delay-50 sat after delay-75.
type Node = { [key: string]: unknown };
const misordered = (node: Node, at: string, out: string[]) => {
  const scales: Record<string, number[]> = {};
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    const m = /^(.*?)-?(\d+(?:\.\d+)?)$/.exec(key);
    if (m) (scales[m[1]!] ??= []).push(Number(m[2]));
    if (value && typeof value === 'object' && !('$value' in value)) misordered(value as Node, `${at}.${key}`, out);
  }
  for (const [scale, steps] of Object.entries(scales)) {
    if (steps.some((n, i) => i > 0 && n < steps[i - 1]!)) out.push(`${at}.${scale}: ${steps.join(', ')}`);
  }
  return out;
};

describe('Token order', () => {
  test('every numbered scale in the token source runs small to large', () => {
    expect(misordered(source as Node, '', [])).toEqual([]);
  });

  test('the check finds a scale out of order', () => {
    expect(misordered({ delay: { 'delay-75': { $value: 1 }, 'delay-50': { $value: 1 } } }, '', [])).toEqual(['.delay.delay: 75, 50']);
  });
});
