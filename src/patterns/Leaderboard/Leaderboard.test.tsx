import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { Leaderboard, ordinal, rank, type Player } from './Leaderboard';

const active = () => document.activeElement as HTMLElement;
const norm = (t: string | null | undefined) => (t ?? '').replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x660)).replace(/٬/g, ',');
const said = (e: Element) => { const c = e.cloneNode(true) as Element; c.querySelectorAll('[aria-hidden="true"]').forEach((x) => x.remove()); return norm(c.textContent); };
const rows = () => [...document.querySelectorAll('tbody tr')].map((r) => [...r.children].map(said));
const p = (id: string, week: number): Player => ({ id, name: id, points: { week, month: 0, all: 0 } });

// Leaderboard: a table whose names are row headers, ties as "Joint", your row saying "You", moves in words, the period
// said, and your row after the top places with how many are between.
describe('Patterns/Leaderboard', () => {
  test('places, ties and ordinals', () => {
    expect(rank([p('a', 5), p('b', 9), p('c', 5), p('d', 1)], 'week').map((r) => [r.id, r.place, r.joint])).toEqual([['b', 1, false], ['a', 2, true], ['c', 2, true], ['d', 4, false]]);
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 23, 101].map(ordinal)).toEqual(['1st', '2nd', '3rd', '4th', '11th', '12th', '13th', '21st', '22nd', '23rd', '101st']);
  });

  test('one main and h1, the skip link first, names as row headers, ties joint, moves in words, and you after the top', async () => {
    const screen = await render(<Leaderboard />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Leaderboard']);
    expect(screen.getByRole('rowheader', { name: /Dewi Lestari/ }).elements()).toHaveLength(1);
    expect(rows().slice(0, 5).map((r) => [r[0], r[1], r[3]])).toEqual([
      ['1st', 'Dewi Lestari', 'Up 1'], ['2nd', 'Chen Wei', 'Down 1'], ['Joint 3rd', 'Kofi Mensah', 'No change'], ['Joint 3rd', 'Sara Haddad', 'Up 3'], ['5th', 'Lena Vogel', 'Down 2'],
    ]);
    expect(rows()[5]![0]).toBe('3 more people between');
    expect(rows()[6]!.slice(0, 2)).toEqual(['9th', 'Ana LimaYou']);
    expect(norm(document.body.textContent)).toContain('You’re 9th of 9 this week, with 150 points.');
  });

  test('switching the period says so, and all time has no change column', async () => {
    const screen = await render(<Leaderboard />);
    await screen.getByRole('radio', { name: 'This month' }).click();
    await expect.poll(() => document.getElementById('board-period')!.textContent).toBe('Showing points this month');
    expect(rows()[0]!.slice(0, 2)).toEqual(['1st', 'Chen Wei']);
    expect(rows()[2]!.slice(0, 2)).toEqual(['Joint 3rd', 'Lena Vogel']);
    await screen.getByRole('radio', { name: 'All time' }).click();
    expect(rows()[0]![3]).toBe('');
    expect(norm(document.querySelector('thead')?.textContent)).toContain('Change');
  });

  test('you in the top, right after it, and not taking part', async () => {
    await render(<Leaderboard me="sara" />);
    expect(rows()).toHaveLength(5);
    expect(rows()[3]![1]).toBe('Sara HaddadYou');
    document.body.innerHTML = '';
    await render(<Leaderboard me="tomas" />);
    expect(rows()[5]!.slice(0, 2)).toEqual(['6th', 'Tomás RuizYou']);
    document.body.innerHTML = '';
    await render(<Leaderboard me="nobody" />);
    expect(norm(document.body.textContent)).toContain('9 people taking part.');
  });

  test('while loading, one placeholder; a failed load says so, with Try again', async () => {
    const onRetry = vi.fn();
    const screen = await render(<Leaderboard loading />);
    await expect.poll(() => screen.getByRole('progressbar').elements().map((e) => e.getAttribute('aria-label'))).toEqual(['Loading the leaderboard']);
    expect(document.querySelectorAll('main h1')).toHaveLength(1);
    await screen.rerender(<Leaderboard loadFailed onRetry={onRetry} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Couldn’t load the leaderboard' })).toBeVisible();
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('nobody has scored yet: it says so once, without an empty table or "0 people"', async () => {
    const screen = await render(<Leaderboard players={[]} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'No scores yet' })).toBeVisible();
    expect(document.querySelector('main table')).toBeNull();
    expect(document.querySelector('main')!.textContent).not.toMatch(/\b0 people/);
  });
});
