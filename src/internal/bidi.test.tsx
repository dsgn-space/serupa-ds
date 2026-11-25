import { describe, expect, test } from 'vitest';
import { bidi, isolate } from './bidi';
import { labels as arLabels } from '../labels/ar';

const FSI = '⁨', PDI = '⁩';

describe('bidi isolation of caller text', () => {
  test('an Arabic page isolates a Latin file name or column it reads out, so punctuation around it stays in place; Arabic text is left alone', () => {
    expect(arLabels.filterContains('Email', 'gmail.com')).toBe(`${FSI}Email${PDI} يحتوي على «${FSI}gmail.com${PDI}»`);
    expect(arLabels.filterContains('البريد', 'نص')).toBe('البريد يحتوي على «نص»');
  });
  test('a left-to-right page isolates Arabic or Hebrew text only; empty and already isolated text is unchanged', () => {
    expect([bidi('שלום'), bidi('مرحبا'), bidi('hello'), bidi(''), bidi(`${FSI}שלום${PDI}`)])
      .toEqual([`${FSI}שלום${PDI}`, `${FSI}مرحبا${PDI}`, 'hello', '', `${FSI}שלום${PDI}`]);
  });
  test('isolate gives text its own direction (LRI or RLI … PDI), and leaves it as it is without one', () => {
    expect([isolate('+62', 'ltr'), isolate('عربي', 'rtl'), isolate('x', undefined)]).toEqual(['⁦+62' + PDI, '⁧عربي' + PDI, 'x']);
  });
});
