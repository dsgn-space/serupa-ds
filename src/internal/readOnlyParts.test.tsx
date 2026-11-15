import * as React from 'react';
import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { Combobox } from '../components/Combobox/Combobox';
import { DatePicker } from '../components/DatePicker/DatePicker';
import { DateRangePicker } from '../components/DateRangePicker/DateRangePicker';
import { NumberInput } from '../components/NumberInput/NumberInput';
import { TimePicker } from '../components/TimePicker/TimePicker';

// GR419: a read-only field's side button is switched off, but the field is not disabled. It showed the
// "not allowed" cursor inside a field whose text shows the text cursor; every other read-only control shows the arrow.
const cursors = (id: string) => [...document.getElementById(id)!.querySelectorAll('button')].map((b) => [b.disabled, getComputedStyle(b).cursor]);

test('the side buttons of a read-only field show the plain arrow; in a disabled field they show "not allowed"', async () => {
  await render(<>
    <span id="ro">
      <DatePicker aria-label="Date" readOnly defaultValue="2026-03-04" />
      <DateRangePicker aria-label="Dates" readOnly />
      <TimePicker aria-label="Time" readOnly />
      <Combobox aria-label="Fruit" readOnly options={[{ value: 'a', label: 'Apple' }]} />
      <NumberInput aria-label="Count" readOnly defaultValue={2} />
    </span>
    <span id="off">
      <DatePicker aria-label="Date off" disabled />
      <DateRangePicker aria-label="Dates off" disabled />
      <TimePicker aria-label="Time off" disabled />
      <Combobox aria-label="Fruit off" disabled options={[{ value: 'a', label: 'Apple' }]} />
      <NumberInput aria-label="Count off" disabled defaultValue={2} />
    </span>
  </>);
  const ro = cursors('ro'), off = cursors('off');
  expect(ro.length).toBeGreaterThanOrEqual(6);
  expect(off.length).toBe(ro.length);
  expect([...new Set(ro.map(String))]).toEqual(['true,default']);
  expect([...new Set(off.map(String))]).toEqual(['true,not-allowed']);
});

test('a NumberInput at its bound, not read-only, keeps "not allowed" on the stepper that is off', async () => {
  await render(<span id="bound"><NumberInput aria-label="Count" defaultValue={0} min={0} max={5} /></span>);
  expect(cursors('bound').filter(([d]) => d).map(([, c]) => c)).toEqual(['not-allowed']);
});
