import { describe, expect, test } from 'vitest';
import { typeahead, type Typed } from './typeahead';

const LABELS = ['Edit', 'Duplicate', 'Archive', 'Share link', 'Delete', 'Éditer', 'Łódź'];
// Each key 100 ms after the last, or after `gap` ms; the index it lands on from `from`.
function typing(keys: string, from = 0, gap = 100) {
  const typed: Typed = { text: '', at: 0 };
  let at = 1000, i = from;
  return [...keys].map((k) => { at += gap; const n = typeahead(typed, k, LABELS, i, at); if (n >= 0) i = n; return LABELS[i]; });
}

describe('typeahead', () => {
  test('letters typed together build a word; the item that already matches keeps focus', () => {
    expect(typing('de')).toEqual(['Duplicate', 'Delete']);
    expect(typing('dup')).toEqual(['Duplicate', 'Duplicate', 'Duplicate']);
    expect(typing('share')).toEqual(['Share link', 'Share link', 'Share link', 'Share link', 'Share link']);
  });

  test('the same letter again steps through the items starting with it, wrapping', () => {
    expect(typing('dddd')).toEqual(['Duplicate', 'Delete', 'Duplicate', 'Delete']);
    expect(typing('eee')).toEqual(['Éditer', 'Edit', 'Éditer']);
  });

  test('a word nothing starts with starts again from the last letter; no match keeps the focus', () => {
    expect(typing('sd')).toEqual(['Share link', 'Delete']);
    expect(typing('x', 2)).toEqual(['Archive']);
  });

  test('after half a second a letter starts a new word', () => {
    expect(typing('de', 0, 600)).toEqual(['Duplicate', 'Éditer']);
  });

  test('accents, case and letters like ł are folded, on both sides', () => {
    expect(typing('lo')).toEqual(['Łódź', 'Łódź']);
    expect(typing('É', 0)).toEqual(['Éditer']);
  });
});
