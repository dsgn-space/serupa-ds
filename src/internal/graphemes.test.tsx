import { describe, expect, test } from 'vitest';
import { graphemeCount, graphemes, limitEdit } from './graphemes';

const FAMILY = '👨‍👩‍👧', FLAG = '🇮🇩', ACCENT = 'é';

describe('graphemes', () => {
  test('counts the characters people see: a family, a flag and e + combining accent are one each', () => {
    expect([(FAMILY + FLAG).length, graphemeCount(FAMILY + FLAG), graphemeCount(ACCENT + 'x'), graphemeCount('')]).toEqual([12, 2, 2, 0]);
    expect(graphemes('a' + FAMILY + 'b')).toEqual(['a', FAMILY, 'b']);
  });

  test('limitEdit cuts only what was added, keeps the text around it, and never splits a character', () => {
    // Typed at the end past the limit.
    expect(limitEdit('abc', 'abcdef', 5)).toEqual({ value: 'abcde', caret: 5 });
    // Pasted in the middle: the end of the paste goes, the tail stays, and the caret sits after what was kept.
    expect(limitEdit('ab|yz', 'ab' + '1234' + '|yz', 7)).toEqual({ value: 'ab12|yz', caret: 4 });
    // Emoji count as one, and a cut lands between them.
    expect(limitEdit('ab', 'ab' + FAMILY + FLAG + FAMILY, 4)).toEqual({ value: 'ab' + FAMILY + FLAG, caret: 2 + FAMILY.length + FLAG.length });
    // Fits, or got shorter (deleting from text already past the limit): left alone.
    expect([limitEdit('ab', 'abc', 3), limitEdit('abcdef', 'abcde', 3)]).toEqual([null, null]);
    // Already past the limit and something was typed: the new text goes.
    expect(limitEdit('abcd', 'abXcd', 3)).toEqual({ value: 'abcd', caret: 2 });
  });
});
