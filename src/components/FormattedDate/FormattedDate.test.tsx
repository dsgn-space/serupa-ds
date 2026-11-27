import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { render } from 'vitest-browser-react';
import { SerupaProvider } from '../../internal/provider';
import { FormattedDate, formatDate } from './FormattedDate';

const el = (id: string) => document.getElementById(id) as HTMLElement;
const plain = (s: string | null) => (s ?? '').replace(/[\u00a0\u202f\u2009]/g, ' ');

describe('FormattedDate', () => {
  test('a <time> with the day in datetime and the words as its text; ref, className and other props reach it', async () => {
    const ref = React.createRef<HTMLElement>();
    await render(<FormattedDate id="x" ref={ref} value="2026-11-20" locale="en" className="extra" data-x="y" />);
    const e = el('x');
    expect([e.tagName, e.getAttribute('datetime'), plain(e.textContent), ref.current === e, e.className, e.dataset.x, e.dataset.component])
      .toEqual(['TIME', '2026-11-20', 'Nov 20, 2026', true, 'srp-formatted-date extra', 'y', 'formatted-date']);
  });

  test('each dateStyle, a time with timeStyle, and a time on its own', () => {
    const at = '2026-11-20T09:30:00Z';
    expect([undefined, 'full', 'long', 'short'].map((s) => formatDate('2026-11-20', 'en', { dateStyle: s as 'long' })))
      .toEqual(['Nov 20, 2026', 'Friday, November 20, 2026', 'November 20, 2026', '11/20/26']);
    expect([formatDate(at, 'en', { dateStyle: 'long', timeStyle: 'short', timeZone: 'UTC' }), formatDate(at, 'en', { dateStyle: false, timeStyle: 'short', timeZone: 'Asia/Jakarta' })].map(plain))
      .toEqual(['November 20, 2026 at 9:30 AM', '4:30 PM']);
  });

  test('a "yyyy-mm-dd" day is that day in every time zone, and never gets a time', () => {
    expect([
      formatDate('2026-11-20', 'en', { timeZone: 'Pacific/Honolulu' }),
      formatDate('2026-11-20', 'en', { timeZone: 'Pacific/Kiritimati', timeStyle: 'short' }),
      formatDate('2026-11-20', 'en', { options: { weekday: 'long', hour: 'numeric' } }),
      formatDate('0099-01-02', 'en'),
    ]).toEqual(['Nov 20, 2026', 'Nov 20, 2026', 'Friday', 'Jan 2, 99']);
  });

  test('a moment in the time zone given: the same instant is the 20th in Jakarta and the 19th in Honolulu', () => {
    const at = Date.UTC(2026, 10, 20, 3, 0);
    expect([formatDate(at, 'en', { timeZone: 'Asia/Jakarta' }), formatDate(new Date(at), 'en', { timeZone: 'Pacific/Honolulu' })]).toEqual(['Nov 20, 2026', 'Nov 19, 2026']);
  });

  test('options with parts write it alone, without the styles', () => {
    expect([formatDate('2026-11-20', 'en', { options: { month: 'long', year: 'numeric' } }), formatDate('2026-11-20', 'en', { dateStyle: 'full', options: { day: 'numeric', month: 'short' } })])
      .toEqual(['November 2026', 'Nov 20']);
  });

  test('a range says what both share once; each end is its own <time>', async () => {
    expect(plain(formatDate('2026-11-20', 'en', { to: '2026-11-22' }))).toBe('Nov 20 – 22, 2026');
    await render(<FormattedDate id="r" value="2026-11-20" to={new Date(2026, 11, 2)} locale="en" />);
    const times = [...el('r').querySelectorAll('time')].map((t) => [t.getAttribute('datetime'), t.textContent]);
    expect([el('r').tagName, plain(el('r').textContent), times]).toEqual(['SPAN', 'Nov 20 – Dec 2, 2026', [['2026-11-20', 'Nov 20'], ['2026-12-02', 'Dec 2']]]);
  });

  test('in a right-to-left page, English words keep their own order; a range too', async () => {
    await render(<div dir="rtl"><FormattedDate id="d" value="2026-11-20" locale="en" /><FormattedDate id="e" value="2026-11-20" to="2026-11-22" locale="en" /></div>);
    expect([el('d').matches(':dir(ltr)'), el('e').matches(':dir(ltr)')]).toEqual([true, true]);
  });

  test('with a right-to-left locale of its own in a left-to-right page it runs right to left; with none it takes the page\'s', async () => {
    await render(<p><FormattedDate id="ar" value="2026-11-20" locale="ar-EG" /><FormattedDate id="none" value="2026-11-20" /><FormattedDate id="bad" value="2026-11-20" locale="not a locale" /></p>);
    expect([el('ar').getAttribute('dir'), el('ar').matches(':dir(rtl)'), el('none').hasAttribute('dir'), el('bad').hasAttribute('dir')]).toEqual(['rtl', true, false, false]);
  });

  test('a time and its AM or PM stay on one line, in English and Korean', () => {
    const at = '2026-11-20T15:45:00Z';
    const en = formatDate(at, 'en', { timeStyle: 'short', timeZone: 'UTC' }), ko = formatDate(at, 'ko', { dateStyle: false, timeStyle: 'short', timeZone: 'UTC' });
    expect([/\d[\u00a0\u202f]PM/.test(en), /오후[\u00a0\u202f]3:45/.test(ko)]).toEqual([true, true]);
  });

  test('the space before AM or PM is the same no-break one whichever space Intl writes, so a page from Node hydrates in Chrome before 119', () => {
    // Chrome before 119 (ICU 72) writes a narrow no-break space there; Node and later browsers a plain one.
    const real = Intl.DateTimeFormat.prototype.formatToParts;
    const narrow = vi.spyOn(Intl.DateTimeFormat.prototype, 'formatToParts').mockImplementation(function (this: Intl.DateTimeFormat, d) {
      const parts = real.call(this, d);
      return parts.map((p, i) => (p.type === 'literal' && parts[i + 1]?.type === 'dayPeriod' ? { ...p, value: '\u202f' } : p));
    });
    const at = '2026-11-20T15:45:00Z';
    try {
      const old = formatDate(at, 'en-US', { dateStyle: false, timeStyle: 'short', timeZone: 'UTC' });
      narrow.mockRestore();
      expect(old).toBe(formatDate(at, 'en-US', { dateStyle: false, timeStyle: 'short', timeZone: 'UTC' }));
      expect(old).toBe('3:45\u00a0PM');
    } finally { narrow.mockRestore(); }
  });

  test('a range that ends the same day is one <time>', async () => {
    await render(<FormattedDate id="s" value="2026-11-20" to="2026-11-20" locale="en" />);
    expect([el('s').tagName, el('s').getAttribute('datetime'), el('s').textContent]).toEqual(['TIME', '2026-11-20', 'Nov 20, 2026']);
  });

  test('a moment in the browser is in the reader\'s time zone, with the instant in datetime', async () => {
    const at = new Date(2026, 10, 20, 23, 30);
    await render(<FormattedDate id="m" value={at} timeStyle="short" locale="en" />);
    expect([el('m').getAttribute('datetime'), plain(el('m').textContent)]).toEqual([at.toISOString(), plain(new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(at))]);
  });

  test('in the provider\'s locale, with lang when its own differs: Indonesian words, Arabic digits', async () => {
    await render(<SerupaProvider locale="id"><FormattedDate id="i" value="2026-11-20" dateStyle="long" /><FormattedDate id="a" value="2026-11-20" dateStyle="long" locale="ar-EG" /></SerupaProvider>);
    expect([el('i').textContent, el('i').hasAttribute('lang'), el('a').getAttribute('lang'), el('a').textContent]).toEqual(['20 November 2026', false, 'ar-EG', '٢٠ نوفمبر ٢٠٢٦']);
  });

  test('a value it can\'t read renders an empty element and warns once; a day that isn\'t on the calendar too', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await render(<FormattedDate id="n" value="soon" />);
    expect([el('n').textContent, el('n').hasAttribute('datetime'), formatDate('2026-02-31', 'en'), formatDate(NaN, 'en')]).toEqual(['', false, '', '']);
    expect(warn.mock.calls.some(([m]) => String(m).includes('"soon" isn\'t a date'))).toBe(true);
    warn.mockRestore();
  });

  test('a time zone Intl doesn\'t know writes a medium date with a warning, rather than throwing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(formatDate('2026-11-20T09:30:00Z', 'en', { timeZone: 'Mars/Olympus', timeStyle: 'short' })).toMatch(/^Nov 2[01], 2026$/);
    expect(warn.mock.calls.some(([m]) => String(m).includes('FormattedDate:'))).toBe(true);
    warn.mockRestore();
  });

  test('on the server a moment with no time zone is written in UTC; it hydrates without a mismatch and then reads in the reader\'s zone', async () => {
    const at = '2026-11-20T23:30:00Z';
    const tree = <FormattedDate id="h" value={at} timeStyle="short" locale="en" />;
    const host = document.createElement('div');
    host.innerHTML = renderToString(tree);
    document.body.append(host);
    try {
      expect(plain(el('h').textContent)).toBe(plain(new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(new Date(at))));
      const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
      const root = hydrateRoot(host, tree);
      // Hydrated once React has taken the element over; the text may already match when the browser's zone is UTC.
      await expect.poll(() => Object.keys(el('h')).some((k) => k.startsWith('__reactFiber'))).toBe(true);
      await expect.poll(() => plain(el('h').textContent)).toBe(plain(new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(at))));
      expect([el('h').getAttribute('datetime'), errors.mock.calls.length]).toEqual(['2026-11-20T23:30:00.000Z', 0]);
      errors.mockRestore();
      root.unmount();
    } finally { host.remove(); }
  });

  test('a date with a time wraps between the two, never inside either, with the same words', async () => {
    await render(<div style={{ width: 90 }}><FormattedDate id="x" value="2026-11-12T08:00:00Z" timeZone="UTC" timeStyle="short" locale="en-US" /></div>);
    expect(plain(el('x').textContent)).toBe(plain(formatDate('2026-11-12T08:00:00Z', 'en-US', { timeStyle: 'short', timeZone: 'UTC' })));
    const lines = [...el('x').querySelectorAll('span')].map((s) => [plain(s.textContent), Math.round(s.getBoundingClientRect().top)] as const);
    expect(lines.map(([t]) => t)).toEqual(['Nov 12, 2026', '8:00 AM']);
    expect(lines[1]![1]).toBeGreaterThan(lines[0]![1]);
    // a long style wraps like a sentence (a half could be wider than the line); a day alone stays one run, as before
    await render(<FormattedDate id="l" value="2026-09-30T14:45:00Z" timeZone="UTC" dateStyle="full" timeStyle="full" locale="en-US" />);
    expect(el('l').querySelector('span')).toBeNull();
    await render(<FormattedDate id="d" value="2026-11-12" locale="en-US" />);
    expect(el('d').querySelector('span')).toBeNull();
  });
});
