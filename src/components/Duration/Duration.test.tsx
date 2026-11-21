import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { css } from '../../../tools/test/vitest/helpers';
import { SerupaProvider } from '../../internal/provider';
import { Duration, formatDuration, isoDuration } from './Duration';

const el = (id: string) => document.getElementById(id) as HTMLElement;
const plain = (s: string) => s.replace(/[\u00a0\u202f]/g, ' ');

describe('Duration', () => {
  test('a <time> with the ISO duration in datetime and the words as its text; ref, className and other props reach it', async () => {
    const ref = React.createRef<HTMLTimeElement>();
    await render(<Duration id="x" ref={ref} value={5400} locale="en" className="extra" data-x="y" />);
    const e = el('x');
    expect([e.tagName, e.getAttribute('datetime'), plain(e.textContent), ref.current === e, e.className, e.dataset.x, e.dataset.component])
      .toEqual(['TIME', 'PT1H30M', '1 hr, 30 min', true, 'srp-duration extra', 'y', 'duration']);
  });

  test('each display: short, long, narrow and digital', () => {
    expect([undefined, 'long', 'narrow', 'digital'].map((display) => plain(formatDuration(75, 'en', { unit: 'minute', display: display as 'long' }))))
      .toEqual(['1 hr, 15 min', '1 hour, 15 minutes', '1h 15m', '1:15']);
    expect(plain(formatDuration(3725, 'en', { display: 'digital' }))).toBe('1:02:05');
  });

  test('units: given in any, rounded to smallest (the unit given by default), 0 units left out, 0 as the smallest unit', () => {
    expect([
      formatDuration(93_500, 'en', { unit: 'millisecond' }),
      formatDuration(90, 'en', { unit: 'minute' }),
      formatDuration(7200, 'en'),
      formatDuration(0, 'en', { unit: 'minute' }),
      formatDuration(3599, 'en', { smallest: 'minute' }),
      formatDuration(1.5, 'en', { unit: 'hour' }),
      formatDuration(2, 'en', { unit: 'day', display: 'long' }),
    ].map(plain)).toEqual(['1 min, 34 sec', '1 hr, 30 min', '2 hr', '0 min', '1 hr', '1 hr, 30 min', '2 days']);
  });

  test('the defaults said outright give the same words; largest="second" counts seconds only', () => {
    expect([
      formatDuration(5400, 'en', { unit: 'second', display: 'short', smallest: 'second' }),
      formatDuration(150, 'en', { largest: 'second' }),
    ].map(plain)).toEqual(['1 hr, 30 min', '150 sec']);
  });

  test('largest stops the units there and keeps counting; a clock counts hours past a day', () => {
    expect([
      formatDuration(2310, 'en', { unit: 'minute', largest: 'hour', display: 'long' }),
      formatDuration(2310, 'en', { unit: 'minute', display: 'long' }),
      formatDuration(90000, 'en', { display: 'digital' }),
      formatDuration(150, 'en', { largest: 'minute', display: 'digital' }),
    ].map(plain)).toEqual(['38 hours, 30 minutes', '1 day, 14 hours, 30 minutes', '25:00:00', '2:30']);
  });

  test('a clock under an hour starts at the minutes, as a media player writes it, unless largest asks for hours', () => {
    expect([45, 724, 3725].map((s) => formatDuration(s, 'en', { display: 'digital' })).concat(formatDuration(45, 'en', { display: 'digital', largest: 'hour' }), formatDuration(30, 'en', { unit: 'minute', display: 'digital' })))
      .toEqual(['0:45', '12:04', '1:02:05', '0:00:45', '0:30']);
  });

  test('in a right-to-left page, English words keep their own order', async () => {
    await render(<div dir="rtl"><Duration id="d" value={75} unit="minute" locale="en" /></div>);
    expect(el('d').matches(':dir(ltr)')).toBe(true);
  });

  test('a negative value is written as its size; NaN is empty', async () => {
    expect([plain(formatDuration(-90, 'en', { unit: 'minute' })), formatDuration(NaN, 'en'), isoDuration(NaN)]).toEqual(['1 hr, 30 min', '', '']);
    await render(<Duration id="n" value={NaN} />);
    expect([el('n').textContent, el('n').hasAttribute('datetime')]).toEqual(['', false]);
  });

  test('isoDuration: days, then a T and the time; 0 is PT0S', () => {
    expect([isoDuration(5400), isoDuration(2 * 86400 + 3 * 3600), isoDuration(86400), isoDuration(0), isoDuration(93_500, { unit: 'millisecond' }), isoDuration(90, { unit: 'minute' })])
      .toEqual(['PT1H30M', 'P2DT3H', 'P1D', 'PT0S', 'PT1M34S', 'PT1H30M']);
  });

  test('in the provider\'s locale, with lang when its own differs: Indonesian words, Arabic digits', async () => {
    await render(<SerupaProvider locale="id"><Duration id="i" value={75} unit="minute" /><Duration id="a" value={75} unit="minute" locale="ar-EG" display="digital" /></SerupaProvider>);
    expect([plain(el('i').textContent), el('i').hasAttribute('lang'), el('a').getAttribute('lang'), el('a').querySelector('[aria-hidden]')!.textContent])
      .toEqual(['1 j, 15 mnt', false, 'ar-EG', '١:١٥']);
  });

  test('a clock is hidden from screen readers and says the long words in its place; tabular digits, on one line', async () => {
    await render(<Duration id="c" value={5400} locale="en" display="digital" />);
    await expect.element(page.getByText('1 hour, 30 minutes')).toBeInTheDocument();
    const e = el('c');
    expect([e.querySelector('[aria-hidden="true"]')!.textContent, css(e).fontVariantNumeric, css(e).whiteSpace, e.className]).toEqual(['1:30:00', 'tabular-nums', 'nowrap', 'srp-duration srp-duration--digital']);
  });

  test('each unit\'s number and word stay together, so it wraps only between units', async () => {
    await render(<p style={{ inlineSize: 90 }}><Duration id="w" value={2 * 86400 + 3 * 3600 + 4 * 60} locale="en" display="long" /></p>);
    const text = el('w').textContent;
    expect([text.includes('2 days'), text.includes('3 hours'), text.includes('4 minutes')]).toEqual([true, true, true]);
    // one line per unit, never a number on its own line
    const p = el('w').parentElement!;
    expect(Math.round(p.getBoundingClientRect().height / parseFloat(css(p).lineHeight))).toBe(3);
  });
});
