import { describe, expect, test } from 'vitest';
import { getPath, merge } from './formValues';

describe('form values', () => {
  test('merge keeps a Date or a File as it is, and a list from the draft keeps its own length (an item removed stays removed)', () => {
    const file = new File(['world'], 'b.txt'), when = new Date('2026-06-15T00:00:00Z');
    const m = merge({ when: new Date(0), file: new File(['hello'], 'a.txt'), tags: ['a', 'b', 'c'], none: ['a'], deep: { a: 1, b: 2 } },
      { when, file, tags: ['x'], none: [], deep: { b: 3 } }) as Record<string, unknown>;
    expect([m.when, m.file, m.tags, m.none, m.deep]).toEqual([when, file, ['x'], [], { a: 1, b: 3 }]);
    expect([m.when === when, m.file === file]).toEqual([true, true]);
  });

  test('getPath reads own values only: a field named "toString" or "constructor" has none', () => {
    expect([getPath({}, 'toString'), getPath({ a: {} }, 'a.constructor'), getPath({ toString: 'x' }, 'toString')]).toEqual([undefined, undefined, 'x']);
  });
});
