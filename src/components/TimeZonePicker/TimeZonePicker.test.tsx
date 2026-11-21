import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render as draw } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { idLabels } from '../../internal/labels';
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

  test("an empty picker says what to type, in the app's language; a placeholder you pass wins", async () => {
    const { rerender } = await render(<TimeZonePicker aria-label="Time zone" at={AT} />);
    expect(input().placeholder).toBe('Search a city or time zone');
    await rerender(<TimeZonePicker aria-label="Time zone" at={AT} placeholder="Where are you?" />);
    expect(input().placeholder).toBe('Where are you?');
    await draw(<SerupaProvider locale="id-ID" labels={idLabels}><TimeZonePicker aria-label="Zona waktu" at={AT} /></SerupaProvider>);
    expect(document.querySelectorAll<HTMLInputElement>('input[role="combobox"]')[1]!.placeholder).toBe('Cari kota atau zona waktu');
  });

  test('the whole list is made only once the field is focused, pointed at or opened: a page of pickers nobody has opened formats a few zones, not 400 each', async () => {
    // The whole list starts from Intl.supportedValuesOf: not asked for until someone reaches for a picker.
    const asked = vi.spyOn(Intl, 'supportedValuesOf');
    await render(<><TimeZonePicker aria-label="Meeting" at={AT} defaultValue="Asia/Jakarta" /><TimeZonePicker aria-label="Office" at={AT} /></>);
    const [meeting, office] = [...document.querySelectorAll<HTMLInputElement>('input[role="combobox"]')];
    expect([meeting!.value, asked.mock.calls.length]).toEqual(['Jakarta', 0]);
    await userEvent.hover(office!);
    await expect.poll(() => asked.mock.calls.length).toBe(1);
    meeting!.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect.poll(() => Number(document.querySelector('[role="option"]')?.getAttribute('aria-setsize'))).toBeGreaterThan(100);
    expect(asked.mock.calls.length).toBe(2);
    asked.mockRestore();
  });

  test('open from the start (defaultOpen, or open from code), the list is whole at once', async () => {
    const opened: boolean[] = [];
    await render(<><TimeZonePicker aria-label="Time zone" at={AT} defaultOpen onOpenChange={(o) => opened.push(o)} /><TimeZonePicker aria-label="Shown" at={AT} open onOpenChange={() => {}} /></>);
    expect([...document.querySelectorAll('[role="listbox"]')].map((l) => Number(l.querySelector('[role="option"]')?.getAttribute('aria-setsize')) > 100)).toEqual([true, true]);
    await expect.poll(() => Number(document.querySelector('[role="option"]')?.getAttribute('aria-setsize'))).toBeGreaterThan(100);
    input().focus();
    await userEvent.keyboard('{Escape}');
    expect(opened.at(-1)).toBe(false);
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

  test("an option's offset and name read in its locale's direction: Egyptian Arabic right to left, even in a left-to-right page", async () => {
    await render(<TimeZonePicker aria-label="Time zone" at={AT} locale="ar-EG" zones={['Asia/Jakarta']} />);
    await userEvent.click(input());
    const words = await expect.poll(() => document.querySelector('[role="option"]')).toBeTruthy().then(() => {
      const o = document.querySelector('[role="option"]')!, w = document.createTreeWalker(o, NodeFilter.SHOW_TEXT);
      for (let n = w.nextNode(); n; n = w.nextNode()) if (n.textContent!.includes('UTC')) return n as Text;
      throw new Error('no offset');
    });
    const text = words.textContent, u = text.indexOf('U'), last = text.search(/.\u2069?$/);
    const left = (i: number) => { const r = document.createRange(); r.setStart(words, i); r.setEnd(words, i + 1); return r.getBoundingClientRect().left; };
    // "UTC+07:00 · توقيت غرب إندونيسيا": the offset comes first, so in Arabic it starts at the right.
    expect(left(u) > left(last)).toBe(true);
    // The description is still read out as one: the isolates are invisible, and a screen reader skips them.
    expect(document.querySelector('[role="option"]')!.getAttribute('aria-description')).toBe(text);
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
    expect([kyiv!.value, old!.value]).toEqual(['Kyiv', 'Kolkata']);
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
