import { describe, expect, test } from 'vitest';
import { decimals, gridPlaces, snap } from './step';

describe('steps', () => {
  test('decimals: plain and exponent forms', () => {
    expect([0.25, 1e-7, 1.5e-3, 100, 1e21, 0.5, 3].map(decimals)).toEqual([2, 7, 4, 0, 0, 1, 0]);
    expect([gridPlaces(0.5, 1), gridPlaces(undefined, 0.25), gridPlaces(0, 1e-7)]).toEqual([1, 2, 7]);
  });

  test('snap: every result is on the grid of min and step, within min..max, and the nearest such point', () => {
    let seed = 7;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const grids: Array<[number, number, number]> = [[0.5, 5.5, 1], [0, 1, 0.1], [-3.25, 10, 0.5], [0.001, 2, 0.25], [0, 1e-6, 1e-7], [10, 100, 7], [1.5, 3, 0.75]];
    for (const [min, max, step] of grids) {
      const places = gridPlaces(min, step);
      for (let k = 0; k < 300; k++) {
        const v = min - step + rand() * (max - min + 2 * step);
        const n = snap(v, min, max, step);
        const i = (n - min) / step;
        expect(n >= min && n <= max, `${n} in ${min}..${max}`).toBe(true);
        expect(n === max || Math.abs(i - Math.round(i)) < 1e-9, `${n} on ${min}+${step}k`).toBe(true);
        expect(decimals(n)).toBeLessThanOrEqual(places);
        if (v >= min && v <= max && n !== max) expect(Math.abs(n - v)).toBeLessThanOrEqual(step / 2 + 1e-9);
      }
    }
    expect([snap(2.5, 0.5, 5.5, 1), snap(3, 0.5, 5.5, 1), snap(0.30000000000000004, 0, 1, 0.1), snap(5e-7, 0, 1e-6, 1e-7)]).toEqual([2.5, 3.5, 0.3, 5e-7]);
  });
});
