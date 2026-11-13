import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { ActivityLog, matchEvents, type ActivityEvent } from './ActivityLog';
import { SerupaProvider } from '../../internal/provider';

const active = () => document.activeElement as HTMLElement;
const rows = () => page.getByRole('table', { name: 'Events' }).getByRole('row').elements().slice(1);
const status = () => document.querySelector('main [role="status"]')?.textContent;
const ev = (id: string, actor: string, action: string, kind: ActivityEvent['kind']): ActivityEvent => ({ id, actor, action, kind, time: '2026-11-12T08:00:00Z' });
const few = [ev('a', 'Ana Lima', 'changed Chen Wei’s role to Admin', 'members'), ev('b', 'Budi Santoso', 'changed the plan', 'billing'), ev('c', 'Ana Lima', 'changed her password', 'security')];

// Activity log: a captioned table of sentences, a search and filter whose count is a status, Load more, Export of what
// matches, and the empty, no-match, loading and failed states.
describe('Patterns/Activity log', () => {
  test('a search needs every word in the person or the action; the type narrows it', () => {
    expect(matchEvents(few, 'ana role', 'all').map((e) => e.id)).toEqual(['a']);
    expect(matchEvents(few, 'CHANGED', 'all').map((e) => e.id)).toEqual(['a', 'b', 'c']);
    expect(matchEvents(few, '', 'security').map((e) => e.id)).toEqual(['c']);
    expect(matchEvents(few, 'budi', 'security')).toEqual([]);
  });

  test('one main and h1, a captioned table with When, Who and What, times in the reader\'s locale, the first page only', async () => {
    const screen = await render(<SerupaProvider locale="en-GB"><ActivityLog /></SerupaProvider>);
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Activity log']);
    expect(screen.getByRole('columnheader').elements().map((e) => e.textContent)).toEqual(['When', 'Who', 'What']);
    expect(rows()).toHaveLength(8);
    const first = rows()[0]!;
    expect(first.querySelector('time')?.getAttribute('dateTime')).toBe('2026-11-12T08:00:00.000Z');
    expect(first.textContent).toContain('Ana Lima');
    expect(first.textContent).toContain('changed Chen Wei’s role to AdminMembers');
    expect(status()).toBe('11 events');
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
  });

  test('Load more adds the next page under the last row and keeps focus there, ending on "That’s every event"', async () => {
    const screen = await render(<ActivityLog pageSize={4} />);
    await screen.getByRole('button', { name: /^Load more/ }).click();
    expect(rows()).toHaveLength(8);
    await expect.poll(() => active().textContent).toMatch(/^Load more/);
    await screen.getByRole('button', { name: /^Load more/ }).click();
    expect(rows()).toHaveLength(11);
    await expect.poll(() => active().textContent).toContain('That’s every event');
  });

  test('a search or filter changes the count, which is a status, and starts from the first page; Export gets what matches', async () => {
    const onExport = vi.fn();
    const screen = await render(<ActivityLog onExport={onExport} pageSize={2} />);
    await screen.getByRole('searchbox', { name: 'Search the log' }).fill('ana');
    await expect.poll(status).toBe('5 events');
    expect(rows()).toHaveLength(2);
    await screen.getByRole('combobox', { name: 'Type' }).selectOptions('members');
    await expect.poll(status).toBe('3 events');
    await screen.getByRole('button', { name: 'Export' }).click();
    expect((onExport.mock.calls[0] as [ActivityEvent[]])[0].map((e) => e.id)).toEqual(['e1', 'e3', 'e8']);
    await screen.getByRole('button', { name: 'Clear the search' }).click();
    await expect.element(screen.getByRole('searchbox')).toHaveValue('');
    await screen.getByRole('combobox', { name: 'Type' }).selectOptions('all');
    await expect.poll(status).toBe('11 events');
  });

  test('no matches says so, and Clear filters brings everything back', async () => {
    const screen = await render(<ActivityLog />);
    await screen.getByRole('searchbox', { name: 'Search the log' }).fill('zebra');
    await expect.element(screen.getByRole('heading', { level: 2, name: 'No events match “zebra”' })).toBeVisible();
    expect(status()).toBe('0 events');
    await screen.getByRole('button', { name: /Clear filters/ }).click();
    await expect.poll(status).toBe('11 events');
    await expect.element(screen.getByRole('searchbox')).toHaveValue('');
  });

  test('a type with no events says so by its name; one event is "1 event"', async () => {
    const screen = await render(<ActivityLog events={few.slice(0, 1)} />);
    expect(status()).toBe('1 event');
    await screen.getByRole('combobox', { name: 'Type' }).selectOptions('billing');
    await expect.element(screen.getByRole('heading', { level: 2, name: 'No billing events' })).toBeVisible();
  });

  test('empty, loading and failed: each says so, and Try again calls onRetry', async () => {
    const onRetry = vi.fn();
    const screen = await render(<ActivityLog events={[]} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Nothing has happened yet' })).toBeVisible();
    await screen.rerender(<ActivityLog loading />);
    expect(status()).toBe('Loading activity');
    expect(screen.getByRole('table').element().getAttribute('aria-busy')).toBe('true');
    await screen.rerender(<ActivityLog loadFailed onRetry={onRetry} onExport={() => {}} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Couldn’t load the activity log' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Export' }).elements()).toHaveLength(0);
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
