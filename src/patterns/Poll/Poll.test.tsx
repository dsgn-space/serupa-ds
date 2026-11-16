import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { Poll, pollResults, recount } from './Poll';

const active = () => document.activeElement as HTMLElement;
const alertText = () => [...document.querySelectorAll('[role="alert"]')].map((e) => e.textContent).join(' ');
const opts = [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C' }];
const meters = () => [...document.querySelectorAll('[role="meter"]')].map((m) => m.getAttribute('aria-valuetext'));

// Poll: the answers a group named by the question, results as a list of meters whose values are in words, yours
// marked, a summary when nothing's chosen, the results' heading taking focus, and changing a vote.
describe('Patterns/Poll', () => {
  test('shares add up to 100, and a change moves a vote', () => {
    expect(pollResults(opts, { a: 1, b: 1, c: 1 }).rows.map((r) => r.percent)).toEqual([34, 33, 33]);
    expect(pollResults(opts, { a: 2, c: 1 }).rows.map((r) => [r.votes, r.percent])).toEqual([[2, 67], [0, 0], [1, 33]]);
    expect(pollResults(opts, {})).toEqual({ total: 0, rows: opts.map((o) => ({ ...o, votes: 0, percent: 0 })) });
    expect(recount({ a: 1 }, 'b')).toEqual({ a: 1, b: 1 });
    expect(recount({ a: 1, b: 1 }, 'b', 'a')).toEqual({ a: 0, b: 2 });
    expect(recount({ a: 1 }, 'a', 'a')).toEqual({ a: 1 });
  });

  test('one main and h1, the skip link first, when it closes, and the answers a named group', async () => {
    const screen = await render(<Poll />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Where should the summer party be?']);
    expect(document.body.textContent).toContain('Others see the totals, not who voted for what.');
    expect(screen.getByRole('radio').elements()).toHaveLength(4);
    expect(screen.getByRole('group', { name: /^Your answer/ }).elements()).toHaveLength(1);
  });

  test('Vote with nothing chosen: a summary takes focus and its link lands on the first answer', async () => {
    const onVote = vi.fn();
    const screen = await render(<Poll onVote={onVote} />);
    await screen.getByRole('button', { name: 'Vote' }).click();
    await expect.poll(() => active().textContent).toMatch(/Choose an answer/);
    await screen.getByRole('link', { name: 'Choose an answer.' }).click();
    await expect.poll(() => active().getAttribute('value')).toBe('beach');
    expect(onVote).not.toHaveBeenCalled();
  });

  test('a vote that fails keeps the answer; sent, the results take focus with yours marked, and it can be changed', async () => {
    const onVote = vi.fn().mockRejectedValueOnce(new Error('offline')).mockImplementation((id: string, prev?: string) => recount({ beach: 9, boat: 14, garden: 5, escape: 2 }, id, prev));
    const screen = await render(<Poll onVote={onVote} />);
    await screen.getByRole('radio', { name: 'A boat trip on the river' }).click();
    await screen.getByRole('button', { name: 'Vote' }).click();
    await expect.poll(alertText).toContain('Couldn’t send your vote.');
    expect((screen.getByRole('radio', { name: 'A boat trip on the river' }).element() as HTMLInputElement).checked).toBe(true);
    await screen.getByRole('button', { name: 'Vote' }).click();
    await expect.poll(() => active().textContent).toBe('Results so far');
    expect(onVote).toHaveBeenLastCalledWith('boat', undefined);
    expect(document.body.textContent).toMatch(/You voted for “A boat trip on the river”/);
    expect(meters()).toHaveLength(4);
    expect(meters()[1]).toMatch(/^(15|١٥) votes, /);
    expect(screen.getByText('Your vote').element().closest('li')?.textContent).toContain('A boat trip on the river');
    await screen.getByRole('button', { name: 'Change your vote' }).click();
    expect((screen.getByRole('radio', { name: 'A boat trip on the river' }).element() as HTMLInputElement).checked).toBe(true);
    await screen.getByRole('radio', { name: 'A day at the beach' }).click();
    await screen.getByRole('button', { name: 'Change vote' }).click();
    await expect.poll(() => active().textContent).toBe('Results so far');
    expect(onVote).toHaveBeenLastCalledWith('beach', 'boat');
  });

  test('Keep my vote goes back without sending; counted here when there is no onVote', async () => {
    const screen = await render(<Poll defaultVote="garden" />);
    expect(screen.getByRole('heading', { name: 'Results so far' }).elements()).toHaveLength(1);
    await screen.getByRole('button', { name: 'Change your vote' }).click();
    await screen.getByRole('button', { name: 'Keep my vote' }).click();
    await expect.poll(() => active().textContent).toBe('Results so far');
    await screen.getByRole('button', { name: 'Change your vote' }).click();
    await screen.getByRole('radio', { name: 'A day at the beach' }).click();
    await screen.getByRole('button', { name: 'Change vote' }).click();
    await expect.poll(() => meters()[0]).toMatch(/^(10|١٠) votes, /);
    expect(meters()[2]).toMatch(/^(4|٤) votes, /);
  });

  test('closed: the results only, no way to vote', async () => {
    const screen = await render(<Poll closed />);
    expect(document.body.textContent).toContain('This poll has closed.');
    expect(screen.getByRole('heading', { name: 'Results' }).elements()).toHaveLength(1);
    expect(screen.getByRole('radio').elements()).toHaveLength(0);
    expect(screen.getByRole('button', { name: /vote/i }).elements()).toHaveLength(0);
  });
});
