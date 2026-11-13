import * as React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { SerupaProvider } from '../../internal/provider';
import { Countdown, countdownClock, countdownWords } from './Countdown';

const el = (id: string) => document.getElementById(id) as HTMLTimeElement;
const said = () => document.querySelector('[data-dk-announcer]')?.textContent || '';
afterEach(() => { vi.useRealTimers(); });

describe('Countdown', () => {
  test('a <time role="timer"> named by its label and the time left in words; ref, className and other props reach it', async () => {
    const ref = React.createRef<HTMLTimeElement>();
    await render(<SerupaProvider locale="en-US"><Countdown id="c" seconds={299} label="Offer ends in" ref={ref} className="extra" data-x="y" /></SerupaProvider>);
    const t = el('c');
    expect([t.tagName, t.getAttribute('role'), t.textContent, t.getAttribute('aria-label'), t.dateTime, ref.current === t, t.className, t.dataset.x, t.dataset.component])
      .toEqual(['TIME', 'timer', '4:59', 'Offer ends in: 4 minutes, 59 seconds', 'PT299S', true, 'dk-countdown extra', 'y', 'countdown']);
    // Not a live region: it would speak every second.
    expect(t.getAttribute('aria-live')).toBeNull();
  });

  test('the clock and the words, in the locale: hours past a day keep counting; zero is "0 seconds"', () => {
    expect([59, 299, 3899, 50 * 3600, -5].map((n) => countdownClock(n, 'en-US')))
      .toEqual(['0:59', '4:59', '1:04:59', '50:00:00', '0:00']);
    expect([countdownWords(299, 'en-US'), countdownWords(2 * 86400 + 3 * 3600, 'en-US'), countdownWords(0, 'en-US'), countdownWords(61, 'id-ID')])
      .toEqual(['4 minutes, 59 seconds', '2 days, 3 hours', '0 seconds', '1 menit, 1 detik']);
    // Arabic writes its own digits.
    expect(countdownClock(299, 'ar-EG')).toBe(new Intl.NumberFormat('ar-EG').format(4) + ':' + new Intl.NumberFormat('ar-EG', { minimumIntegerDigits: 2 }).format(59));
  });

  test('format="words" shows the words; endText takes the time\'s place once it ends', async () => {
    await render(<SerupaProvider locale="en-US">
      <Countdown id="w" seconds={3600 + 120} label="Time left" format="words" />
      <Countdown id="e" seconds={0} label="Offer ends in" endText="The offer has ended" />
    </SerupaProvider>);
    expect([el('w').textContent, el('e').textContent, el('e').getAttribute('aria-label'), el('e').classList.contains('dk-countdown--ended')])
      .toEqual(['1 hour, 2 minutes', 'The offer has ended', 'Offer ends in: The offer has ended', true]);
  });

  test('it says the time aloud only at the steps it crosses, then says it has ended and calls onEnd once', async () => {
    const onEnd = vi.fn();
    const props = { label: 'Time left', endText: 'Time is up', onEnd, announceAt: [60, 30] };
    const screen = await render(<SerupaProvider locale="en-US"><Countdown id="s" seconds={62} {...props} /></SerupaProvider>);
    await screen.rerender(<SerupaProvider locale="en-US"><Countdown id="s" seconds={61} {...props} /></SerupaProvider>);
    await screen.rerender(<SerupaProvider locale="en-US"><Countdown id="s" seconds={60} {...props} /></SerupaProvider>);
    await expect.poll(said).toBe('Time left: 1 minute');
    // A clock that jumps past two steps says only the last one.
    await screen.rerender(<SerupaProvider locale="en-US"><Countdown id="s" seconds={20} {...props} /></SerupaProvider>);
    await expect.poll(said).toBe('Time left: 30 seconds');
    expect(onEnd).not.toHaveBeenCalled();
    await screen.rerender(<SerupaProvider locale="en-US"><Countdown id="s" seconds={0} {...props} /></SerupaProvider>);
    await expect.poll(said).toBe('Time is up');
    await screen.rerender(<SerupaProvider locale="en-US"><Countdown id="s" seconds={0} {...props} /></SerupaProvider>);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  test('with `to`, it keeps its own clock and ticks down to the end', async () => {
    const onEnd = vi.fn();
    await render(<SerupaProvider locale="en-US"><Countdown id="t" to={Date.now() + 2500} label="Time left" onEnd={onEnd} /></SerupaProvider>);
    expect(['0:03', '0:02']).toContain(el('t').textContent);
    await expect.poll(() => el('t').textContent, { timeout: 5000 }).toBe('0:00');
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  test('a `to` already past calls onEnd as it mounts, and says nothing; a bad `to` shows nothing and warns', async () => {
    const onEnd = vi.fn(), warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await render(<SerupaProvider locale="en-US">
      <Countdown id="p" to={Date.now() - 1000} label="Time left" onEnd={onEnd} />
      <Countdown id="b" to="nope" label="Time left" />
    </SerupaProvider>);
    expect([el('p').textContent, el('b').textContent, el('b').getAttribute('aria-label')]).toEqual(['0:00', '', 'Time left']);
    expect(onEnd).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls.flat().join(' ')).toContain('Countdown: to "nope"');
    warn.mockRestore();
  });

  test('a clock that moves between two reads of one render warns nothing (a slow browser reads it a millisecond apart)', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    let t = Date.now();
    const now = vi.spyOn(Date, 'now').mockImplementation(() => ++t);
    await render(<><Countdown id="s" seconds={0} label="Time left" /><Countdown id="o" to={t + 60_000} label="Time left" /></>);
    now.mockRestore();
    expect(error.mock.calls.flat().join(' ')).not.toContain('getSnapshot');
    expect(el('s').getAttribute('datetime')).toBe('PT0S');
    error.mockRestore();
  });

  test('a seconds that isn\'t a number shows nothing and warns', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await render(<Countdown id="n" seconds={Number.NaN} label="Time left" />);
    expect(el('n').textContent).toBe('');
    expect(warn.mock.calls.flat().join(' ')).toContain('Countdown: seconds');
    warn.mockRestore();
  });
});
