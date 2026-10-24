import { describe, expect, test } from 'vitest';
import { fold } from './fold';

describe('fold', () => {
  test.each([
    ['lodz', 'Łódź'], ['da nang', 'Đà Nẵng'], ['orsted', 'Ørsted'], ['aeon', 'Æon'], ['strasse', 'Straße'], ['hal far', 'Ħal Far'],
    ['oeuvre', 'Œuvre'], ['thorsmork', 'Þórsmörk'], ['sao paulo', 'São Paulo'], ['angstrom', 'Ångström'], ['istanbul', 'İstanbul'],
    ['diyarbakir', 'Diyarbakır'], ['tokyo', 'ｔｏｋｙｏ'], ['トウキョウ', 'ﾄｳｷｮｳ'],
  ])('"%s" matches "%s"', (typed, label) => {
    expect(fold(label)).toContain(fold(typed));
  });

  test('typed with the accents, or in capitals, it still matches; different letters still differ', () => {
    expect(fold('ŁÓDŹ')).toBe(fold('lodz'));
    expect(fold('Straße')).toBe('strasse');
    expect(fold('ｔｏｋｙｏ')).toBe('tokyo');
    expect(fold('Paris')).not.toContain(fold('lodz'));
  });
});
