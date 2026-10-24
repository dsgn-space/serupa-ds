import { describe, expect, test } from 'vitest';
import { formatTime, parseTime } from './times';

const LOCALES = ['ko', 'ar-EG', 'fa', 'en-US', 'ja', 'zh-CN', 'zh-TW', 'hi-IN', 'bn', 'th', 'id', 'de', 'es', 'vi', 'el'];
const TIMES = [0, 5, 9 * 60 + 30, 12 * 60, 12 * 60 + 45, 14 * 60 + 5, 23 * 60 + 59];

describe('typed times', () => {
  test.each(LOCALES)('%s: parseTime(formatTime(n)) is n, in the locale\'s own hour cycle, 12-hour and 24-hour', (locale) => {
    for (const n of TIMES) for (const h12 of [undefined, true, false]) {
      const text = formatTime(n, locale, h12);
      expect(parseTime(text, locale), `${locale} ${h12} ${text}`).toBe(n);
    }
  });

  test('the locale\'s own forms: 오후 2:05, ٢:٠٥ م, ۱۴:۰۵, 午後2:05; plain forms keep working', () => {
    expect(parseTime('오후 2:05', 'ko')).toBe(845);
    expect(parseTime('오전 9:30', 'ko')).toBe(570);
    expect(parseTime('٢:٠٥ م', 'ar-EG')).toBe(845);
    expect(parseTime('۱۴:۰۵', 'fa')).toBe(845);
    expect(parseTime('午後2:05', 'ja')).toBe(845);
    for (const [t, n] of [['14:05', 845], ['2:05 pm', 845], ['2pm', 840], ['1405', 845], ['9', 540], ['9.30', 570], ['21h30', 1290], ['12am', 0]] as const) expect(parseTime(t, 'en-US'), t).toBe(n);
    for (const t of ['25:00', '9:75', '13pm', '오후 2pm', 'abc']) expect(parseTime(t, 'ko'), t).toBe(null);
  });
});
