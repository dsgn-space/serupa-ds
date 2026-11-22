import * as React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { Carousel } from '../components/Carousel/Carousel';
import { ChatComposer } from '../components/Chat/Chat';
import { Combobox } from '../components/Combobox/Combobox';
import { FilterBar, type FilterField } from '../components/FilterBar/FilterBar';
import { MaskedValue } from '../components/MaskedValue/MaskedValue';
import { RangeCalendar } from '../components/RangeCalendar/RangeCalendar';
import { Sidebar, SidebarItem } from '../components/Sidebar/Sidebar';

afterEach(() => { vi.restoreAllMocks(); });
const switches = (warn: { mock: { calls: unknown[][] } }) => warn.mock.calls.map((c) => String(c[0])).filter((m) => m.includes('controlled-switch'));

const fields: FilterField[] = [{ id: 'archived', label: 'Archived', type: 'boolean' }];
const slides = [<div key="a">One</div>, <div key="b">Two</div>];

// The rest of the controlled props, given a value and then undefined for one render (the app's state loading or
// reset), as a user's app would by mistake: the component warns once in development and keeps following the prop.
const CASES: Array<[string, unknown, (v: unknown) => React.ReactElement]> = [
  ['Combobox value', 'Brazil', (v) => <Combobox aria-label="Country" options={['Argentina', 'Brazil']} value={v as string | undefined} />],
  ['Combobox inputValue', 'Bra', (v) => <Combobox aria-label="Country" options={['Argentina', 'Brazil']} inputValue={v as string | undefined} />],
  ['Combobox open', false, (v) => <Combobox aria-label="Country" options={['Argentina', 'Brazil']} open={v as boolean | undefined} />],
  ['FilterBar value', {}, (v) => <FilterBar fields={fields} value={v as Record<string, never> | undefined} />],
  ['RangeCalendar value', { start: '2026-11-01', end: '2026-11-16' }, (v) => <RangeCalendar defaultMonth={new Date(2026, 10, 1)} value={v as { start: string; end: string } | undefined} />],
  ['Carousel index', 1, (v) => <Carousel aria-label="Photos" index={v as number | undefined}>{slides}</Carousel>],
  ['ChatComposer value', 'Hello', (v) => <ChatComposer value={v as string | undefined} />],
  ['MaskedValue revealed', false, (v) => <MaskedValue value="4111111111111208" label="Card number" revealable revealed={v as boolean | undefined} />],
  ['SidebarItem open', true, (v) => <Sidebar aria-label="Docs"><SidebarItem label="Guides" open={v as boolean | undefined}><SidebarItem href="#a" label="Start" /></SidebarItem></Sidebar>],
];

describe('a component whose controlled prop turns undefined', () => {
  for (const [name, v, ui] of CASES) {
    test(`${name}: controlled, then undefined, warns once naming the component and the prop; staying controlled warns nothing`, async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const r = await render(ui(v));
      await r.rerender(ui(v));
      expect(switches(warn)).toEqual([]);
      await r.rerender(ui(undefined));
      await r.rerender(ui(v));
      const [component, prop] = name.split(' ');
      expect(switches(warn)).toHaveLength(1);
      expect(switches(warn)[0]).toContain(`${component}: \`${prop}\` changed from controlled to uncontrolled`);
      await r.unmount();
    });
  }
});
