import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { calendar, combobox, datePicker, menu, table, tabs } from './testing.js';
import { Combobox } from './components/Combobox/Combobox';
import { Menu, MenuItem, MenuSub } from './components/Menu/Menu';
import { Button } from './components/Button/Button';
import { Tab, TabList, TabPanel, Tabs } from './components/Tabs/Tabs';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, TableSelectCell, type SortDirection } from './components/Table/Table';
import { DatePicker } from './components/DatePicker/DatePicker';
import { Calendar } from './components/Calendar/Calendar';

// serupa-ds/testing's testers, run against the real components: an app's test that uses them drives each widget as
// a person does (pointer or keyboard), so these tests are what keeps the testers and the components in step.
const user = userEvent;
const COUNTRIES = ['Argentina', 'Brazil', 'Canada', { value: 'ci', label: 'Côte d’Ivoire', description: 'Africa' }, { value: 'dk', label: 'Denmark', disabled: true }, 'Egypt', 'France'];

describe('testers need a user', () => {
  test('each says what to pass when it has none', () => {
    const div = document.createElement('div');
    for (const make of [combobox, menu, tabs, table, calendar, datePicker])
      expect(() => (make as (el: Element, o: object) => unknown)(div, {})).toThrow(/needs \{ user \}/);
  });
  test('each says what element it needs when given the wrong one', () => {
    const div = document.createElement('div');
    expect(() => combobox(div, { user })).toThrow(/role="combobox"/);
    expect(() => menu(div, { user })).toThrow(/aria-haspopup="menu"/);
    expect(() => tabs(div, { user })).toThrow(/role="tablist"/);
    expect(() => table(div, { user })).toThrow(/<table>/);
    expect(() => datePicker(div, { user })).toThrow(/DatePicker/);
  });
});

describe('combobox()', () => {
  test('chooses an option by pointer, by its label or by its description, and reads the value', async () => {
    const onValueChange = vi.fn();
    await render(<><label htmlFor="cb">Country</label><Combobox id="cb" options={COUNTRIES} onValueChange={onValueChange} /></>);
    const cb = combobox(document.getElementById('cb')!, { user });
    expect(cb.isOpen()).toBe(false);
    await cb.open();
    expect(cb.isOpen()).toBe(true);
    expect(cb.options().length).toBe(7);
    await cb.choose('Canada');
    expect(cb.value()).toBe('Canada');
    expect(onValueChange).toHaveBeenLastCalledWith('Canada');
    await cb.choose('Côte d’Ivoire');
    expect(cb.value()).toBe('Côte d’Ivoire');
  });

  test('chooses with the arrow keys and Enter', async () => {
    await render(<><label htmlFor="cb">Country</label><Combobox id="cb" options={COUNTRIES} /></>);
    const cb = combobox(document.getElementById('cb')!.parentElement!, { user });
    await cb.choose('Egypt', { by: 'keyboard' });
    expect(cb.value()).toBe('Egypt');
    expect(cb.isOpen()).toBe(false);
  });

  test('refuses a disabled option and names the options when one is missing', async () => {
    await render(<><label htmlFor="cb">Country</label><Combobox id="cb" options={COUNTRIES} /></>);
    const cb = combobox(document.getElementById('cb')!, { user });
    await expect(cb.choose('Denmark')).rejects.toThrow(/disabled/);
    await expect(cb.choose(42)).rejects.toThrow(/no option at 42.*"Argentina"/);
    await cb.close();
    expect(cb.isOpen()).toBe(false);
  });

  test('types to find an option a long list hasn\'t drawn yet', async () => {
    const many = Array.from({ length: 2000 }, (_, i) => `Item ${i + 1}`);
    await render(<><label htmlFor="cb">Item</label><Combobox id="cb" options={many} /></>);
    const cb = combobox(document.getElementById('cb')!, { user });
    await cb.open();
    expect(cb.options().some((o) => o.textContent === 'Item 1950')).toBe(false);
    await cb.choose('Item 1950');
    expect(cb.value()).toBe('Item 1950');
  });
});

describe('menu()', () => {
  function File({ onSelect }: { onSelect: (what: string) => void }) {
    return (
      <Menu trigger={<Button>File</Button>}>
        <MenuItem onSelect={() => onSelect('new')}>New</MenuItem>
        <MenuItem disabled>Print</MenuItem>
        <MenuSub label="Share">
          <MenuItem onSelect={() => onSelect('email')}>Email</MenuItem>
          <MenuSub label="More apps"><MenuItem onSelect={() => onSelect('chat')}>Chat</MenuItem></MenuSub>
        </MenuSub>
      </Menu>
    );
  }
  const trigger = () => document.querySelector<HTMLElement>('[aria-haspopup="menu"]')!;

  test('opens, lists its own items and chooses one', async () => {
    const onSelect = vi.fn();
    await render(<File onSelect={onSelect} />);
    const m = menu(trigger(), { user });
    await m.open();
    expect(m.items().map((i) => i.textContent?.trim())).toEqual(['New', 'Print', 'Share']);
    await m.choose('New');
    expect(onSelect).toHaveBeenCalledWith('new');
    expect(m.isOpen()).toBe(false);
  });

  test('chooses an item two submenus deep by its path', async () => {
    const onSelect = vi.fn();
    await render(<File onSelect={onSelect} />);
    await menu(trigger(), { user }).choose(['Share', 'More apps', 'Chat']);
    expect(onSelect).toHaveBeenCalledWith('chat');
  });

  test('refuses a disabled item, and an item that has no submenu in a path', async () => {
    await render(<File onSelect={() => {}} />);
    const m = menu(trigger(), { user });
    await expect(m.choose('Print')).rejects.toThrow(/disabled/);
    await expect(m.choose(['New', 'Email'])).rejects.toThrow(/doesn't open a submenu/);
    await m.close();
    expect(m.isOpen()).toBe(false);
    expect(document.activeElement).toBe(trigger());
  });
});

describe('tabs()', () => {
  test('selects a tab and finds its panel; refuses a disabled one', async () => {
    await render(
      <Tabs defaultValue="overview">
        <TabList aria-label="Project">
          <Tab value="overview">Overview</Tab>
          <Tab value="members">Members</Tab>
          <Tab value="settings" disabled>Settings</Tab>
        </TabList>
        <TabPanel value="overview">Overview panel</TabPanel>
        <TabPanel value="members">Members panel</TabPanel>
        <TabPanel value="settings">Settings panel</TabPanel>
      </Tabs>,
    );
    const t = tabs(document.body, { user });
    expect(t.tabs().length).toBe(3);
    expect(t.selected()?.textContent).toBe('Overview');
    await t.select('Members');
    expect(t.selected()?.textContent).toBe('Members');
    expect(t.panel()?.textContent).toBe('Members panel');
    await expect(t.select('Settings')).rejects.toThrow(/disabled/);
  });
});

describe('table()', () => {
  const PEOPLE = [{ name: 'Ada', calls: 12 }, { name: 'Grace', calls: 30 }, { name: 'Linus', calls: 7 }];
  function People() {
    const [sort, setSort] = React.useState<SortDirection>('none');
    const [picked, setPicked] = React.useState<string[]>([]);
    const rows = sort === 'none' ? PEOPLE : [...PEOPLE].sort((a, b) => (sort === 'ascending' ? a.calls - b.calls : b.calls - a.calls));
    const all = picked.length === PEOPLE.length;
    return (
      <Table>
        <TableHead><TableRow>
          <TableSelectCell inHeader label="Select all rows" checked={all} indeterminate={!all && picked.length > 0} onChange={() => setPicked(all ? [] : PEOPLE.map((p) => p.name))} />
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell align="end" sort={sort} onSort={() => setSort(sort === 'ascending' ? 'descending' : 'ascending')}>Calls</TableHeaderCell>
        </TableRow></TableHead>
        <TableBody>{rows.map((p) => (
          <TableRow key={p.name}>
            <TableSelectCell label={'Select ' + p.name} checked={picked.includes(p.name)} onChange={() => setPicked((x) => (x.includes(p.name) ? x.filter((n) => n !== p.name) : [...x, p.name]))} />
            <TableCell>{p.name}</TableCell><TableCell align="end">{p.calls}</TableCell>
          </TableRow>
        ))}</TableBody>
      </Table>
    );
  }
  const names = (t: ReturnType<typeof table>) => t.rows().map((r) => t.cell(r, 'Name')?.textContent);

  test('sorts a column either way and reads cells by row and column', async () => {
    await render(<People />);
    const t = table(document.body, { user });
    expect(t.columns().length).toBe(3);
    expect(t.sortDirection('Calls')).toBe('none');
    await t.sort('Calls', 'descending');
    expect(t.sortDirection('Calls')).toBe('descending');
    expect(names(t)).toEqual(['Grace', 'Ada', 'Linus']);
    await t.sort('Calls');
    expect(names(t)).toEqual(['Linus', 'Ada', 'Grace']);
    // The cell where Grace's row meets the Calls column (its digits follow the page's locale, so compare cells).
    expect(t.cell('Grace', 'Calls')).toBe(t.row('Grace').cells[2]);
    await expect(t.sort('Name')).rejects.toThrow(/can't be sorted/);
  });

  test('selects rows, and all rows from "some selected"', async () => {
    await render(<People />);
    const t = table(document.body, { user });
    await t.selectRow('Ada');
    expect(t.selectedRows().map((r) => t.cell(r, 1)?.textContent)).toEqual(['Ada']);
    await t.selectAll();
    expect(t.selectedRows().length).toBe(3);
    await t.selectAll(false);
    expect(t.selectedRows().length).toBe(0);
    await t.selectRow(2);
    await t.selectRow('Linus', false);
    expect(t.selectedRows().length).toBe(0);
    expect(() => t.row('Nobody')).toThrow(/no row/);
  });
});

describe('calendar() and datePicker()', () => {
  test('picks a day months ahead and a year back, from the keyboard', async () => {
    const onValueChange = vi.fn();
    await render(<Calendar aria-label="Due" defaultValue="2026-11-15" onValueChange={onValueChange} />);
    const c = calendar(document.body, { user });
    expect(c.selected()).toEqual(['2026-11-15']);
    await c.pick('2027-02-03');
    expect(c.selected()).toEqual(['2027-02-03']);
    await c.pick(new Date(2025, 9, 31));
    expect(c.selected()).toEqual(['2025-10-31']);
    expect(onValueChange).toHaveBeenLastCalledWith(expect.any(Date), { iso: '2025-10-31' });
  });

  test('opens a DatePicker, picks a date, and the field shows it', async () => {
    await render(<><label htmlFor="due">Due date</label><DatePicker id="due" locale="en-US" defaultValue="2026-11-15" /></>);
    const d = datePicker(document.getElementById('due')!, { user });
    await d.pick('2026-12-24');
    expect(d.value()).toBe('12/24/2026');
    expect(d.isOpen()).toBe(false);
    await d.open();
    expect(d.isOpen()).toBe(true);
    await d.close();
    expect(d.isOpen()).toBe(false);
  });
});
