import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render as draw } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { SerupaProvider } from '../../internal/provider';
import { TimeZonePicker, allTimeZones, timeZoneInfo } from './TimeZonePicker';

// The tests read the names and offsets as English writes them; the second-language runs would write them otherwise.
const EnUS = ({ children }: { children: React.ReactNode }) => <SerupaProvider locale="en-US">{children}</SerupaProvider>;
const render = (ui: React.ReactNode) => draw(ui, { wrapper: EnUS });

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

  test('readOnly, from Combobox: focusable and aria-readonly, shows its zone, and neither typing nor a press opens the list or changes it', async () => {
    const changes: unknown[] = [];
    await render(<form id="tz-form" onSubmit={(e) => e.preventDefault()}><TimeZonePicker aria-label="Time zone" name="tz" readOnly defaultValue="Asia/Jakarta" at={AT} onValueChange={(v) => changes.push(v)} /></form>);
    await userEvent.click(input());
    await userEvent.keyboard('{ArrowDown}New{Enter}');
    expect([document.activeElement === input(), input().getAttribute('aria-readonly') ?? String(input().readOnly), input().value, document.querySelectorAll('[role="option"]').length, changes,
      new FormData(document.getElementById('tz-form') as HTMLFormElement).get('tz')]).toEqual([true, 'true', 'Jakarta', 0, [], 'Asia/Jakarta']);
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

describe('TimeZonePicker: current names (GR174)', () => {
  test('a value under its current name shows, whatever spelling the browser lists; the list and timeZoneInfo use the current names', async () => {
    expect(allTimeZones()).toEqual(expect.arrayContaining(['Europe/Kyiv', 'Asia/Kolkata', 'Asia/Ho_Chi_Minh']));
    expect(allTimeZones()).not.toContain('Europe/Kiev');
    expect(timeZoneInfo('Europe/Kiev', 'en-US', AT)!.city).toBe('Kyiv');
    const onValueChange = vi.fn();
    await render(<><TimeZonePicker aria-label="Kyiv" at={AT} defaultValue="Europe/Kyiv" onValueChange={onValueChange} /><TimeZonePicker aria-label="Old" at={AT} defaultValue="Asia/Calcutta" /></>);
    const [kyiv, old] = [...document.querySelectorAll<HTMLInputElement>('input[role="combobox"]')];
    expect([kyiv.value, old.value]).toEqual(['Kyiv', 'Kolkata']);
  });

  test('typing finds a city by its current name, its old name, or a common abbreviation or big city', async () => {
    await render(<TimeZonePicker aria-label="Time zone" at={AT} />);
    const find = async (text: string) => { await userEvent.clear(input()); await userEvent.type(input(), text); return shown(); };
    expect(await find('kyiv')).toContain('Kyiv');
    expect(await find('kiev')).toContain('Kyiv');
    expect(await find('ho chi minh')).toContain('Ho Chi Minh');
    expect(await find('mumbai')).toEqual(['Kolkata']);
    expect(await find('pst')).toContain('Los Angeles');
    expect(await find('wib')).toContain('Jakarta');
  });
});
