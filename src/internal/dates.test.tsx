import { describe, expect, test } from 'vitest';
import { addDays, addMonths, compare, datePattern, formatDate, isoDate, parseDate, sameDay, sameMonth, startOfMonth, startOfWeek, toDay } from './dates';
import { latinDigits } from './digits';
import { WORLD_LOCALES } from '../../tools/test/vitest/locales';

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

  test(`every date reads back in ${WORLD_LOCALES.length} locales; a locale that writes its year first keeps its own order (ky)`, () => {
    const bad: string[] = [];
    for (const locale of WORLD_LOCALES) for (const d of [...DAYS, new Date(2026, 0, 5)]) {
      const text = formatDate(d, locale);
      if (parseDate(text, locale)?.toDateString() !== d.toDateString()) bad.push(`${locale} "${text}" → ${parseDate(text, locale)?.toDateString()}`);
    }
    expect(bad).toEqual([]);
    expect(parseDate('2001-11-22', 'de')?.toDateString()).toBe(new Date(2001, 10, 22).toDateString());   // ISO still reads
  });

  test('digits typed in other scripts are read: Arabic-Indic, Persian, Bengali, Thai, Devanagari, full-width', () => {
    expect(latinDigits('٢٢/١١/٢٠٠١ ۲۲ ২২ ๒๒ २२ ２２ 22')).toBe('22/11/2001 22 22 22 22 22 22');
    expect(parseDate('٢٢/١١/٢٠٠١', 'ar-EG')?.toDateString()).toBe(new Date(2001, 10, 22).toDateString());
    expect(parseDate('۲۰۰۱/۱۱/۲۲', 'fa')?.toDateString()).toBe(new Date(2001, 10, 22).toDateString());
    expect(parseDate('২২/১১/২০০১', 'bn')?.toDateString()).toBe(new Date(2001, 10, 22).toDateString());
  });

  test('L8E8: a month written as a word, as dates are pasted from an email: in the locale or in English, in full or cut short', () => {
    const iso = (t: string, locale: string) => { const d = parseDate(t, locale); return d && `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
    expect([
      iso('12 Mei 2025', 'id'), iso('12 Des 2025', 'id'), iso('May 12, 2025', 'en-US'), iso('12 May 2025', 'en-GB'), iso('Sept 3, 2025', 'en-US'),
      iso('12. März 2025', 'de'), iso('12 мая 2025 г.', 'ru'), iso('3 de septiembre de 2025', 'es'), iso('Monday, May 12, 2025', 'en-US'), iso('12 May 2025', 'id'),
    ]).toEqual(['2025-5-12', '2025-12-12', '2025-5-12', '2025-5-12', '2025-9-3', '2025-3-12', '2025-5-12', '2025-9-3', '2025-5-12', '2025-5-12']);
    expect([parseDate('May 2025', 'en-US'), parseDate('31 Feb 2025', 'en-US'), parseDate('Ma 12 2025', 'en-US')]).toEqual([null, null, null]);
  });
  test('a two-digit year is the one within 50 years of now: birth dates go back, deadlines go forward; four digits are kept', () => {
    const y = (text: string, now: Date) => parseDate(text, 'en-US', now)?.getFullYear();
    const in2026 = new Date(2026, 9, 25), in2081 = new Date(2081, 0, 1);
    expect(['1/2/85', '1/2/30', '1/2/26', '1/2/75', '1/2/76', '1/2/77', '1/2/0', '1/2/5'].map((t) => y(t, in2026))).toEqual([1985, 2030, 2026, 2075, 1976, 1977, 2000, 2005]);
    expect(['1/2/85', '1/2/30', '1/2/31', '1/2/32'].map((t) => y(t, in2081))).toEqual([2085, 2130, 2031, 2032]);
    expect(parseDate('22.11.85', 'de-DE', in2026)?.toDateString()).toBe(new Date(1985, 10, 22).toDateString());
    expect([y('1/2/2085', in2026), y('1/2/1930', in2026), y('1/2/0085', in2026)]).toEqual([2085, 1930, 85]);
    expect(parseDate('2/29/00', 'en-US', in2026)?.toDateString()).toBe(new Date(2000, 1, 29).toDateString());   // 2000 is a leap year
    expect(parseDate('2/29/01', 'en-US', in2026)).toBeNull();
  });

  test('digits alone, as typed on a keypad: 8 or 6 split in the locale\'s order, or ISO yyyymmdd when that order makes no date; other lengths aren\'t read', () => {
    const now = new Date(2026, 9, 25), day = (text: string, locale: string) => parseDate(text, locale, now)?.toDateString() ?? null;
    const nov22 = new Date(2001, 10, 22).toDateString();
    expect([day('11222001', 'en-US'), day('112201', 'en-US'), day('22112001', 'de-DE'), day('221101', 'de-DE'), day('20011122', 'en-US'), day('20011122', 'de-DE')]).toEqual([nov22, nov22, nov22, nov22, nov22, nov22]);
    expect([day('20011122', 'ja-JP'), day('٢٢١١٢٠٠١', 'ar-EG')]).toEqual([nov22, nov22]);
    expect([day('13452001', 'en-US'), day('1122001', 'en-US'), day('2211', 'de-DE'), day('112220011', 'en-US')]).toEqual([null, null, null, null]);
  });

  test('native calendar dates (Buddhist, Persian, Japanese era, ROC) convert to Gregorian; unknown era letters are rejected', () => {
    const iso = (t: string, locale: string) => { const d = parseDate(t, locale); return d ? isoDate(d) : null; };
    expect([
      iso('24/10/2569', 'th'),
      iso('1405/08/02', 'fa-IR'),
      iso('۱۴۰۵/۰۸/۰۲', 'fa-IR'),
      iso('R8/10/24', 'ja-JP-u-ca-japanese'),
      iso('115/10/24', 'zh-TW-u-ca-roc'),
      iso('R8/10/24', 'en-US'),
    ]).toEqual(['2026-10-24', '2026-10-24', '2026-10-24', '2026-10-24', '2026-10-24', null]);
  });
});

describe('day arithmetic', () => {
  const D = (y: number, m: number, d: number) => new Date(y, m - 1, d);
  test('addDays and addMonths step across months and years; a month that\'s too short gives its last day', () => {
    expect([addDays(D(2026, 12, 31), 1), addDays(D(2026, 3, 1), -1), addDays(D(2026, 5, 10), 0)].map(isoDate)).toEqual(['2027-01-01', '2026-02-28', '2026-05-10']);
    expect([addMonths(D(2026, 1, 31), 1), addMonths(D(2024, 1, 31), 1), addMonths(D(2026, 12, 15), 1), addMonths(D(2026, 1, 15), -1), addMonths(D(2026, 3, 31), -1), addMonths(D(2026, 5, 30), 12)].map(isoDate))
      .toEqual(['2026-02-28', '2024-02-29', '2027-01-15', '2025-12-15', '2026-02-28', '2027-05-30']);
  });
  test('sameDay and sameMonth: every field has to match; a missing day matches nothing', () => {
    const a = D(2026, 5, 10);
    expect([sameDay(a, new Date(2026, 4, 10, 15, 30)), sameDay(a, D(2025, 5, 10)), sameDay(a, D(2026, 6, 10)), sameDay(a, D(2026, 5, 11)), sameDay(a, null), sameDay(undefined, a), sameDay(null, null)])
      .toEqual([true, false, false, false, false, false, false]);
    expect([sameMonth(a, D(2026, 5, 31)), sameMonth(a, D(2025, 5, 10)), sameMonth(a, D(2026, 6, 10))]).toEqual([true, false, false]);
  });
  test('startOfMonth, startOfWeek for each first weekday, and compare by day, ignoring the time', () => {
    expect(isoDate(startOfMonth(new Date(2026, 4, 31, 23)))).toBe('2026-05-01');
    // Wednesday 13 May 2026.
    const wed = D(2026, 5, 13);
    expect([0, 1, 3, 4, 6].map((w) => isoDate(startOfWeek(wed, w)))).toEqual(['2026-05-10', '2026-05-11', '2026-05-13', '2026-05-07', '2026-05-09']);
    expect([compare(new Date(2026, 4, 13, 23), new Date(2026, 4, 13, 1)), Math.sign(compare(D(2026, 5, 12), wed)), Math.sign(compare(D(2026, 5, 14), wed)), compare(D(2026, 5, 14), wed) / 864e5]).toEqual([0, -1, 1, 1]);
  });
  test('toDay: a yyyy-mm-dd string as that local day, a date and time as the day it writes, a day not on the calendar or other text as null, a Date as its day', () => {
    expect([toDay('2026-05-10'), toDay(' 2026-05-10T23:30:00Z '), toDay('2026-05-10 09:30'), toDay('0099-01-02'), toDay(new Date(2026, 4, 10, 18))].map((d) => d && isoDate(d))).toEqual(['2026-05-10', '2026-05-10', '2026-05-10', '0099-01-02', '2026-05-10']);
    expect([toDay('2026-02-31'), toDay('2026-13-01'), toDay('10/05/2026'), toDay(''), toDay(new Date(NaN)), toDay(42)]).toEqual([null, null, null, null, null, null]);
  });
});
