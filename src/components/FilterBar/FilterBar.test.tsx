import * as React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi, type MockInstance } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { lowContrast } from '../../../tools/test/vitest/helpers';
import { SerupaProvider } from '../../internal/provider';
import { idLabels } from '../../internal/labels';
import { FilterBar, type FilterField, type FilterValues } from './FilterBar';

const fields: FilterField[] = [
  { id: 'status', label: 'Status', type: 'select', multiple: true, options: [{ value: 'open', label: 'Open' }, { value: 'closed', label: 'Closed' }] },
  { id: 'owner', label: 'Owner', type: 'select', options: ['Ana', 'Budi'] },
  { id: 'due', label: 'Due', type: 'date-range' },
  { id: 'archived', label: 'Archived', type: 'boolean' },
  { id: 'q', label: 'Title', type: 'text' },
];
function Bar({ start = {}, log = [], count }: { start?: FilterValues; log?: FilterValues[]; count?: number }) {
  const [v, setV] = React.useState<FilterValues>(start);
  return <SerupaProvider locale="en-US"><FilterBar fields={fields} value={v} onValueChange={(x) => { log.push(x); setV(x); }} resultsCount={count} /></SerupaProvider>;
}
const chip = (name: string | RegExp) => page.getByRole('button', { name });
const focused = () => document.activeElement?.textContent;

let errors: MockInstance<typeof console.error>;
beforeEach(async () => { errors = vi.spyOn(console, 'error'); await page.viewport(900, 700); });
afterEach(() => { expect(errors).not.toHaveBeenCalled(); errors.mockRestore(); });

describe('FilterBar', () => {
  test('a group named "Filters" holding a list of chips that say each filter in words, "Add filter" and "Clear all"; props reach the root', async () => {
    const ref = React.createRef<HTMLDivElement>();
    await render(<SerupaProvider locale="en-US"><FilterBar ref={ref} id="fb" className="extra" data-x="y" fields={fields} defaultValue={{ status: ['open', 'closed'], owner: 'Ana', due: { start: '2026-11-02', end: '2026-11-08' }, archived: true, q: 'login' }} /></SerupaProvider>);
    const e = document.getElementById('fb')!;
    expect([e.getAttribute('role'), e.getAttribute('aria-label'), e.dataset.component, e.dataset.x, e.className, ref.current === e]).toEqual(['group', 'Filters', 'filter-bar', 'y', 'dk-filter-bar extra', true]);
    const chips = [...e.querySelectorAll('li')].map((li) => li.querySelector('button')!.textContent);
    expect(chips).toEqual(['Status is Open or Closed', 'Owner is Ana', 'Due is Nov 2 – 8, 2026', 'Archived', 'Title contains “login”', 'Add filter']);
    await expect.element(page.getByRole('button', { name: 'Remove filter: Status' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Clear all' })).toBeVisible();
  });

  test('a date range with one end says "from" or "until" in words, not a bare dash, in the chip and its name (GR295)', async () => {
    const { rerender } = await render(<Bar start={{ due: { start: '2026-11-02', end: null } }} />);
    await expect.element(chip('Due from Nov 2, 2026')).toBeVisible();
    await rerender(<Bar key="b" start={{ due: { start: null, end: '2026-11-08' } }} />);
    await expect.element(chip('Due until Nov 8, 2026')).toBeVisible();
    await rerender(<SerupaProvider locale="id-ID" labels={idLabels}><FilterBar fields={fields} defaultValue={{ due: { start: '2026-11-02', end: null } }} /></SerupaProvider>);
    await expect.element(chip(/^Due sejak 2 Nov 2026$/)).toBeVisible();
  });

  test('keyboard: Tab goes through each chip and its ×, then "Add filter" and "Clear all"; Space on a chip opens its editor; ArrowDown and ArrowUp move in the menu', async () => {
    await render(<Bar start={{ owner: 'Ana', archived: true }} />);
    const names = () => document.activeElement?.getAttribute('aria-label') || focused();
    (chip('Owner is Ana').element() as HTMLElement).focus();
    const order = [names()];
    for (let i = 0; i < 4; i++) { await userEvent.keyboard('{Tab}'); order.push(names()); }
    expect(order).toEqual(['Owner is Ana', 'Remove filter: Owner', 'Archived', 'Remove filter: Archived', 'Add filter']);
    await userEvent.keyboard('{Tab}');
    expect(names()).toBe('Clear all');
    (chip('Owner is Ana').element() as HTMLElement).focus();
    await userEvent.keyboard('{Space}');
    await expect.element(page.getByRole('dialog', { name: 'Owner' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => chip('Owner is Ana').element().getAttribute('aria-expanded')).toBe('false');
    (page.getByRole('button', { name: 'Add filter' }).element() as HTMLElement).focus();
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => focused()).toBe('Status');
    await userEvent.keyboard('{ArrowDown}');
    expect(focused()).toBe('Due');
    await userEvent.keyboard('{ArrowUp}');
    expect(focused()).toBe('Status');
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => page.getByRole('button', { name: 'Add filter' }).element().getAttribute('aria-expanded')).toBe('false');
  });

  test('"Add filter" lists the fields not in use; picking one adds its chip and opens its editor, named by the field', async () => {
    const log: FilterValues[] = [];
    await render(<Bar start={{ owner: 'Ana' }} log={log} />);
    await userEvent.click(page.getByRole('button', { name: 'Add filter' }));
    expect([...document.querySelectorAll('[role=menuitem]')].map((m) => m.textContent)).toEqual(['Status', 'Due', 'Archived', 'Title']);
    await userEvent.click(page.getByRole('menuitem', { name: 'Status' }));
    await expect.element(page.getByRole('dialog', { name: 'Status' })).toBeVisible();
    await userEvent.click(page.getByRole('checkbox', { name: 'Closed' }));
    expect(log.at(-1)).toEqual({ owner: 'Ana', status: ['closed'] });
    await expect.element(chip('Status is Closed')).toBeVisible();
    await userEvent.click(page.getByRole('button', { name: 'Done' }));
    expect(focused()).toBe('Status is Closed');
  });

  test('an editor closed with nothing chosen takes its filter away, and focus goes to "Add filter"', async () => {
    const log: FilterValues[] = [];
    await render(<Bar log={log} />);
    await userEvent.click(page.getByRole('button', { name: 'Add filter' }));
    await userEvent.click(page.getByRole('menuitem', { name: 'Owner' }));
    await expect.element(chip('Owner: any')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    expect(log.at(-1)).toEqual({});
    await expect.poll(focused).toBe('Add filter');
  });

  test('a single choice is a radio group; a switch filter is on as soon as it is added; a text filter closes on Enter', async () => {
    const log: FilterValues[] = [];
    await render(<Bar log={log} />);
    await userEvent.click(page.getByRole('button', { name: 'Add filter' }));
    await userEvent.click(page.getByRole('menuitem', { name: 'Archived' }));
    expect(log.at(-1)).toEqual({ archived: true });
    await expect.poll(focused).toBe('Archived');
    await userEvent.click(page.getByRole('button', { name: 'Add filter' }));
    await userEvent.click(page.getByRole('menuitem', { name: 'Owner' }));
    await userEvent.click(page.getByRole('radio', { name: 'Budi' }));
    await userEvent.click(page.getByRole('button', { name: 'Done' }));
    await userEvent.click(page.getByRole('button', { name: 'Add filter' }));
    await userEvent.click(page.getByRole('menuitem', { name: 'Title' }));
    await userEvent.keyboard('bug{Enter}');
    expect(log.at(-1)).toEqual({ archived: true, owner: 'Budi', q: 'bug' });
    await expect.poll(focused).toBe('Title contains “bug”');
  });

  test('the Enter that confirms an input method\'s composition doesn\'t close a text filter (GR299)', async () => {
    const log: FilterValues[] = [];
    await render(<Bar log={log} />);
    await userEvent.click(page.getByRole('button', { name: 'Add filter' }));
    await userEvent.click(page.getByRole('menuitem', { name: 'Title' }));
    await userEvent.keyboard('bu');
    const box = document.activeElement as HTMLElement;
    box.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true, cancelable: true }));
    expect(box.isConnected && document.activeElement === box).toBe(true);
    await userEvent.keyboard('g{Enter}');
    expect(log.at(-1)).toEqual({ q: 'bug' });
  });

  test('the × removes one filter and focus moves to the next chip (or the one before, or "Add filter"); "Clear all" removes every one', async () => {
    const log: FilterValues[] = [];
    await render(<Bar start={{ owner: 'Ana', archived: true }} log={log} />);
    await userEvent.click(page.getByRole('button', { name: 'Remove filter: Owner' }));
    expect(log.at(-1)).toEqual({ archived: true });
    expect(focused()).toBe('Archived');
    await userEvent.click(page.getByRole('button', { name: 'Remove filter: Archived' }));
    expect(focused()).toBe('Add filter');
    expect(page.getByRole('button', { name: 'Clear all' }).query()).toBe(null);
  });

  test('"Clear all" empties the value and focuses "Add filter"; with every field in use, "Add filter" is disabled', async () => {
    const log: FilterValues[] = [];
    await render(<Bar start={{ status: ['open'], owner: 'Ana', due: { start: '2026-01-01', end: null }, archived: true, q: 'x' }} log={log} />);
    expect((page.getByRole('button', { name: 'Add filter' }).element() as HTMLButtonElement).disabled).toBe(true);
    await userEvent.click(page.getByRole('button', { name: 'Clear all' }));
    expect(log.at(-1)).toEqual({});
    expect(focused()).toBe('Add filter');
  });

  test('resultsCount is a status after the chips, so it is announced when it changes', async () => {
    const { rerender } = await render(<Bar count={24} />);
    const s = page.getByRole('status').filter({ hasText: /result/ });
    await expect.element(s).toHaveTextContent('24 results');
    await rerender(<Bar count={1} />);
    await expect.element(s).toHaveTextContent('1 result');
  });

  test('its words come from the labels', async () => {
    await render(<SerupaProvider labels={idLabels}><FilterBar fields={fields} defaultValue={{ owner: 'Ana' }} resultsCount={3} /></SerupaProvider>);
    await expect.element(page.getByRole('button', { name: 'Owner: Ana' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Tambah filter' })).toBeVisible();
    await expect.element(page.getByRole('status').filter({ hasText: /hasil/ })).toHaveTextContent('3 hasil');
  });

  test('chip text 4.5:1 on the chip, its outline 3:1, the count 4.5:1 on the page, in all six themes', () => {
    expect(lowContrast([
      ['chip text', 'var(--text)', 'var(--surface)', 4.5],
      ['open chip', 'var(--link)', 'var(--surface)', 4.5],
      ['outline', 'var(--field-border)', 'var(--surface)', 3],
      ['count', 'var(--text-muted)', 'var(--surface)', 4.5],
      ['focus', 'var(--focus-ring)', 'var(--surface)', 3],
    ])).toEqual([]);
  });

  test('a malformed value, as from an edited URL, leaves those filters out and keeps the rest, with a warning naming each (GR283)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const bad = { status: 'open', owner: ['Ana', 3], due: { start: 'abc', end: null }, archived: 'yes', q: '   ', ghost: 'x' } as unknown as FilterValues;
    await render(<SerupaProvider locale="en-US"><FilterBar id="bad" fields={fields} defaultValue={bad} /></SerupaProvider>);
    const chips = [...document.getElementById('bad')!.querySelectorAll('li')].map((li) => li.querySelector('button')!.textContent);
    // A lone string for a multiple select is read as one choice; blank text counts as no filter yet.
    expect(chips).toEqual(['Status is Open', 'Title: any', 'Add filter']);
    const said = warn.mock.calls.map((c) => String(c[0]).match(/"(\w+)"/)![1]).sort();
    expect(said).toEqual(['archived', 'due', 'ghost', 'owner']);
    await render(<SerupaProvider locale="en-US"><FilterBar id="day" fields={fields} defaultValue={{ due: { start: '2026-02-30', end: '2026-03-01' } }} /></SerupaProvider>);
    expect(document.getElementById('day')!.querySelector('li button')!.textContent).toBe('Add filter');
    warn.mockRestore();
  });
});
