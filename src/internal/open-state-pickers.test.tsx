import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { DatePicker } from '../components/DatePicker/DatePicker';
import { DateRangePicker } from '../components/DateRangePicker/DateRangePicker';
import { PeriodPicker } from '../components/PeriodPicker/PeriodPicker';
import { TimePicker } from '../components/TimePicker/TimePicker';
import type { OpenChangeDetails } from './openChange';

type Picker = (p: { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean, d: OpenChangeDetails) => void }) => React.ReactElement;
// Each popup field, and the button a person presses to open it.
const PICKERS: Array<[string, Picker, string]> = [
  ['DatePicker', (p) => <DatePicker aria-label="Due date" {...p} />, 'button'],
  ['DateRangePicker', (p) => <DateRangePicker aria-label="Stay" {...p} />, 'button'],
  ['TimePicker', (p) => <TimePicker aria-label="Start time" {...p} />, 'button'],
  ['PeriodPicker', (p) => <PeriodPicker aria-label="Month" {...p} />, 'button[aria-haspopup]'],
];
const box = (id: string) => document.getElementById(id)!;
const expanded = (id: string) => box(id).querySelector('[aria-expanded]')!.getAttribute('aria-expanded');

// Every overlay takes open, defaultOpen and onOpenChange(open, { reason }) (CONTRIBUTING.md, API conventions), the
// popup fields as Combobox, CascadeSelect, Menu and Popover do.
describe('a popup field takes open, defaultOpen and onOpenChange, as every overlay does', () => {
  for (const [name, ui, trigger] of PICKERS) {
    test(`${name}: defaultOpen shows it at first without taking focus`, async () => {
      await render(<span id={name}>{ui({ defaultOpen: true })}</span>);
      await new Promise((r) => setTimeout(r, 50));
      expect(expanded(name)).toBe('true');
      expect(box(name).contains(document.activeElement)).toBe(false);
    });
    test(`${name}: controlled, a press asks to open with reason 'trigger', and it shows only once the app says so`, async () => {
      const heard: Array<[boolean, string]> = [];
      function App() {
        const [open, setOpen] = React.useState(false);
        return <><span id={name}>{ui({ open, onOpenChange: (o, d) => heard.push([o, d.reason]) })}</span><button id={'yes-' + name} onClick={() => setOpen(true)}>Open</button></>;
      }
      await render(<App />);
      await userEvent.click(box(name).querySelector<HTMLElement>(trigger)!);
      expect(heard).toEqual([[true, 'trigger']]);
      expect(expanded(name)).toBe('false');
      await userEvent.click(box('yes-' + name));
      expect(expanded(name)).toBe('true');
    });
    test(`${name}: open, a press outside asks to close with reason 'outside'`, async () => {
      const heard: Array<[boolean, string]> = [];
      await render(<><p id={'away-' + name}>Elsewhere</p><span id={name}>{ui({ open: true, onOpenChange: (o, d) => heard.push([o, d.reason]) })}</span></>);
      await new Promise((r) => setTimeout(r, 50));
      await userEvent.click(box('away-' + name));
      expect(heard).toContainEqual([false, 'outside']);
    });
  }
});
