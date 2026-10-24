import { describe, expect, test } from 'vitest';
import { datePattern, formatDate, parseDate } from './dates';
import { latinDigits } from './digits';

const LOCALES = ['th', 'th-TH-u-nu-thai', 'ja-u-ca-japanese', 'fa', 'ar-EG', 'ar-SA', 'bn', 'hi-IN-u-nu-deva', 'id', 'de', 'en-US', 'en-GB', 'ko', 'zh-CN'];
const DAYS = [new Date(2001, 10, 22), new Date(2025, 0, 5), new Date(2024, 1, 29), new Date(1999, 11, 31)];

describe('typed dates', () => {
  test.each(LOCALES)('%s: parseDate(formatDate(d)) is the same day, written in Gregorian years with Latin digits', (locale) => {
    for (const d of DAYS) {
      const text = formatDate(d, locale);
      expect(text, text).toMatch(/^[‎‏؜]?[0-9]/);
      expect(text).toContain(String(d.getFullYear()));
      expect(parseDate(text, locale)?.toDateString(), `${locale} ${text}`).toBe(d.toDateString());
    }
    expect(datePattern(locale)).toMatch(/dd/);
  });

  test('digits typed in other scripts are read: Arabic-Indic, Persian, Bengali, Thai, Devanagari, full-width', () => {
    expect(latinDigits('٢٢/١١/٢٠٠١ ۲۲ ২২ ๒๒ २२ ２２ 22')).toBe('22/11/2001 22 22 22 22 22 22');
    expect(parseDate('٢٢/١١/٢٠٠١', 'ar-EG')?.toDateString()).toBe(new Date(2001, 10, 22).toDateString());
    expect(parseDate('۲۰۰۱/۱۱/۲۲', 'fa')?.toDateString()).toBe(new Date(2001, 10, 22).toDateString());
    expect(parseDate('২২/১১/২০০১', 'bn')?.toDateString()).toBe(new Date(2001, 10, 22).toDateString());
  });
});
