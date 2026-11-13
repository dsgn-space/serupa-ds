import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { CascadeSelect } from '../components/CascadeSelect/CascadeSelect';
import { DatePicker } from '../components/DatePicker/DatePicker';
import { PhoneInput } from '../components/PhoneInput/PhoneInput';
import { TimePicker } from '../components/TimePicker/TimePicker';
import { THEMES, contrast } from '../../tools/test/vitest/helpers';

// The colour behind an element: its nearest ancestor with a background that isn't transparent.
const behind = (el: Element): string => {
  for (let e: Element | null = el.parentElement; e; e = e.parentElement) {
    const bg = getComputedStyle(e).backgroundColor;
    if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg;
  }
  return getComputedStyle(document.body).backgroundColor;
};
const settle = (ms = 30) => new Promise((r) => setTimeout(r, ms));

// The hover fill (at least 1.05:1 against what is under it, as `secondary` on `surface` in light) of a button in a field (the date, clock and country parts) or an item in a popup (a day in
// DatePicker's calendar, a CascadeSelect option) has to show against what it sits on. It used to be surface-muted,
// which in every dark theme is the same zinc-800 as the field and the popup, so the pointer left no mark.
describe('hover fills in fields and popups show in all six themes', () => {
  test('the date, clock and country buttons, a day in the calendar (one of another month too) and a cascade option: the fill differs from what is under it, and the text on it keeps 4.5:1', { timeout: 60000 }, async () => {
    const still = document.createElement('style'); still.textContent = '*, *::before, *::after { transition: none !important; animation: none !important; }'; document.head.appendChild(still);
    await render(<div style={{ padding: 40 }}>
      <DatePicker aria-label="Due" defaultValue={new Date(2026, 9, 14)} />
      <TimePicker aria-label="At" />
      <PhoneInput aria-label="Phone" />
      <CascadeSelect aria-label="Place" options={[{ value: 'a', label: 'Asia', children: [{ value: 'b', label: 'Bali' }] }, { value: 'e', label: 'Europe' }]} />
    </div>);
    // Found by their markup, not their words, so the test reads the same in every locale.
    const dateButton = () => document.querySelector<HTMLElement>('button[aria-haspopup="dialog"]')!;
    const place = () => document.querySelector<HTMLElement>('button[aria-label="Place"]')!;
    const flat: string[] = [];
    const check = async (name: string, el: HTMLElement, text = false) => {
      await userEvent.hover(el);
      await settle();
      for (const th of THEMES) {
        document.documentElement.setAttribute('data-theme', th);
        const s = getComputedStyle(el), under = behind(el);
        if (contrast(s.backgroundColor, under) < 1.05) flat.push(`${th} ${name}: ${s.backgroundColor} on ${under}`);
        if (text && contrast(s.color, s.backgroundColor) < 4.5) flat.push(`${th} ${name} text ${contrast(s.color, s.backgroundColor).toFixed(2)}`);
      }
      document.documentElement.setAttribute('data-theme', 'blue-light');
    };
    await check('date button', dateButton());
    await check('clock button', document.querySelector<HTMLElement>('button[aria-controls][tabindex="-1"]')!);
    await check('country', document.querySelector<HTMLElement>('select')!.parentElement!);
    await userEvent.click(dateButton());
    await expect.poll(() => document.querySelector('[role="grid"]')).not.toBeNull();
    const days = [...document.querySelectorAll<HTMLElement>('[role="grid"] button')];
    // October 2026 starts on a Thursday, so the first day shown belongs to September in every week layout.
    await check('day', days[15]!, true);
    await check('day of another month', days[0]!, true);
    await userEvent.keyboard('{Escape}');
    await userEvent.click(place());
    await expect.poll(() => document.querySelectorAll('[role="option"]').length).toBeGreaterThan(1);
    await check('cascade option', document.querySelectorAll<HTMLElement>('[role="option"]')[1]!, true);
    still.remove();
    expect(flat).toEqual([]);
  });
});
