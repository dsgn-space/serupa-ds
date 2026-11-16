import * as React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { CascadeSelect } from '../components/CascadeSelect/CascadeSelect';
import { DatePicker } from '../components/DatePicker/DatePicker';
import { DateRangePicker } from '../components/DateRangePicker/DateRangePicker';
import { Pagination } from '../components/Pagination/Pagination';
import { PeriodPicker } from '../components/PeriodPicker/PeriodPicker';
import { Tab, TabList, Tabs } from '../components/Tabs/Tabs';
import { TimePicker } from '../components/TimePicker/TimePicker';
import { Tooltip } from '../components/Tooltip/Tooltip';
import { TreeView } from '../components/TreeView/TreeView';

afterEach(() => { vi.restoreAllMocks(); });
const switches = (warn: { mock: { calls: unknown[][] } }) => warn.mock.calls.map((c) => String(c[0])).filter((m) => m.includes('controlled-switch'));

const places = [{ value: 'id', label: 'Indonesia', children: [{ value: 'jk', label: 'Jakarta' }] }];
const tree = [{ id: 'src', label: 'src', children: [{ id: 'app', label: 'app.ts' }] }];

// The pickers' and navigators' values, given a value and then undefined for one render (the app's state loading or
// reset), as a user's app would by mistake: the component warns once in development and keeps following the prop.
const CASES: Array<[string, unknown, (v: unknown) => React.ReactElement]> = [
  ['DatePicker value', '2026-11-16', (v) => <DatePicker aria-label="Due date" value={v as string | undefined} />],
  ['DateRangePicker value', { start: '2026-11-01', end: '2026-11-16' }, (v) => <DateRangePicker aria-label="Stay" value={v as { start: string; end: string } | undefined} />],
  ['PeriodPicker value', '2026-11', (v) => <PeriodPicker aria-label="Month" value={v as string | undefined} />],
  ['TimePicker value', '09:30', (v) => <TimePicker aria-label="Start time" value={v as string | undefined} />],
  ['Pagination page', 2, (v) => <Pagination aria-label="Results pages" count={5} page={v as number | undefined} />],
  ['Tooltip open', false, (v) => <Tooltip content="Copy link" open={v as boolean | undefined}><button type="button">Copy</button></Tooltip>],
  ['Tabs value', 'b', (v) => <Tabs value={v as string | undefined}><TabList aria-label="Sections"><Tab value="a">Overview</Tab><Tab value="b">Activity</Tab></TabList></Tabs>],
  ['CascadeSelect value', ['id'], (v) => <CascadeSelect aria-label="Region" options={places} value={v as string[] | undefined} />],
  ['CascadeSelect open', false, (v) => <CascadeSelect aria-label="Region" options={places} open={v as boolean | undefined} />],
  ['TreeView value', ['app'], (v) => <TreeView aria-label="Files" items={tree} value={v as string[] | undefined} />],
  ['TreeView expanded', ['src'], (v) => <TreeView aria-label="Files" items={tree} expanded={v as string[] | undefined} />],
];

describe('a picker or navigator whose controlled value turns undefined', () => {
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
