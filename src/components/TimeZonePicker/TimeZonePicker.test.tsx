import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { TimeZonePicker, allTimeZones, timeZoneInfo } from './TimeZonePicker';

const AT = new Date('2025-01-15T12:00:00Z');   // winter in the north: New York is UTC−05:00
const input = () => document.querySelector<HTMLInputElement>('input[role="combobox"]')!;
// An option's city: the first line of its text (its offset and name are the second).
const shown = () => [...document.querySelectorAll('[role="option"]')].map((o) => o.firstElementChild!.firstElementChild!.textContent);

describe('TimeZonePicker', () => {
  test('timeZoneInfo: the city, the offset at the moment, and the name in the locale', () => {
    expect(timeZoneInfo('America/New_York', 'en-US', AT)).toEqual({ zone: 'America/New_York', city: 'New York', offset: -300, offsetText: 'UTC−05:00', name: 'Eastern Standard Time' });
    expect(timeZoneInfo('America/New_York', 'en-US', new Date('2025-07-15T12:00:00Z'))!.offsetText).toBe('UTC−04:00');
    expect(timeZoneInfo('Asia/Kolkata', 'en-US', AT)!.offset).toBe(330);
    expect(timeZoneInfo('Asia/Jakarta', 'id-ID', AT)!.name).toBe('Waktu Indonesia Barat');
    expect(timeZoneInfo('UTC', 'en-US', AT)!.offsetText).toBe('UTC+00:00');
    expect(timeZoneInfo('Not/AZone', 'en-US', AT)).toBe(null);
    expect(allTimeZones()).toContain('UTC');
  });

  test('a Combobox of cities, from the furthest behind UTC, each with its offset and name; the value is the IANA name', async () => {
    const onValueChange = vi.fn();
    await render(<TimeZonePicker aria-label="Time zone" at={AT} zones={['Asia/Tokyo', 'America/New_York', 'Europe/London', 'Asia/Kolkata']} onValueChange={onValueChange} />);
    await userEvent.click(input());
    await expect.poll(shown).toEqual(['New York', 'London', 'Kolkata', 'Tokyo']);
    const ny = document.querySelector('[role="option"]')!;
    expect(ny.getAttribute('aria-description')).toBe('UTC−05:00 · Eastern Standard Time');
    await userEvent.click(ny);
    expect(onValueChange).toHaveBeenLastCalledWith('America/New_York');
    expect(input().value).toBe('New York');
  });

  test('typing finds a city, a zone name, an IANA name or an offset', async () => {
    await render(<TimeZonePicker aria-label="Time zone" at={AT} zones={['Asia/Jakarta', 'Asia/Bangkok', 'Asia/Kolkata', 'America/Argentina/Buenos_Aires', 'Australia/Adelaide']} />);
    const typed = async (text: string) => { await userEvent.clear(input()); await userEvent.type(input(), text); return shown(); };
    expect(await typed('jakar')).toEqual(['Jakarta']);
    expect(await typed('+7')).toEqual(['Bangkok', 'Jakarta']);
    expect(await typed('utc+5:30')).toEqual(['Kolkata']);
    expect(await typed('10:30')).toEqual(['Adelaide']);
    expect(await typed('argentina')).toEqual(['Buenos Aires']);
    expect(await typed('india')).toEqual(['Kolkata']);   // "India Standard Time"
  });

  test("the reader's own zone comes first, marked as theirs", async () => {
    const own = new Intl.DateTimeFormat().resolvedOptions().timeZone;
    await render(<TimeZonePicker aria-label="Time zone" at={AT} zones={['Pacific/Kiritimati', own, 'Pacific/Pago_Pago']} />);
    await userEvent.click(input());
    await expect.poll(() => document.querySelector('[role="option"]')?.getAttribute('aria-description') ?? '').toMatch(/· Your time zone$/);
  });
});
