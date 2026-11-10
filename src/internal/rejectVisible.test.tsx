import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { DatePicker } from '../components/DatePicker/DatePicker';
import { DateRangePicker } from '../components/DateRangePicker/DateRangePicker';
import { NumberInput } from '../components/NumberInput/NumberInput';
import { TimePicker } from '../components/TimePicker/TimePicker';
import { SerupaProvider } from './provider';

// GR232: typed text a field puts back was explained only to screen readers; the value just jumped back on screen.
// Now the words are shown under the field, read with it (aria-describedby), until the text changes.
const CASES: Array<[string, React.ReactElement]> = [
  ['DatePicker', <DatePicker key="d" aria-label="Date" defaultValue={new Date(2026, 4, 10)} />],
  ['TimePicker', <TimePicker key="t" aria-label="Time" />],
  ['DateRangePicker', <DateRangePicker key="r" aria-label="Dates" />],
  ['NumberInput', <NumberInput key="n" aria-label="Count" defaultValue={5} />],
];

describe('a field that puts typed text back says why on screen (GR232)', () => {
  test.each(CASES)('%s', async (_name, ui) => {
    await render(<SerupaProvider locale="en-US"><button>Before</button>{ui}<button>After</button></SerupaProvider>);
    const field = document.querySelector<HTMLInputElement>('input:not([type=hidden])')!;
    await userEvent.fill(field, 'soon');
    await userEvent.keyboard('{Tab}');
    // The note is the last thing the field is described by.
    const note = () => { const ids = (field.getAttribute('aria-describedby') || '').split(' ').filter(Boolean); const n = ids.length ? document.getElementById(ids[ids.length - 1]) : null; return n && n.id.endsWith('-rejected') ? n : null; };
    await expect.poll(() => note()?.textContent).toBe('“soon” wasn’t accepted, so the previous value was kept.');
    const shown = note()!.getBoundingClientRect().height > 0, read = !!note();
    await userEvent.fill(field, '1');
    expect([shown, read, note()]).toEqual([true, true, null]);
  });
});
