import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { Agenda, byStart, clashes, type Session } from './Agenda';

const active = () => document.activeElement as HTMLElement;
const norm = (t: string | null | undefined) => (t ?? '').replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x660));
const panel = () => document.querySelector<HTMLElement>('[role="tabpanel"]:not([hidden])')!;
const count = () => norm(document.getElementById('agenda-count')!.textContent);
const s = (id: string, day: string, start: string, end: string): Session => ({ id, day, start, end, title: id.toUpperCase(), speakers: '', room: '', track: 't' });

// Conference agenda: days as tabs, start times as headings, sessions as named articles, Save a toggle named by its
// session that says how many are saved, clashes said on both, and the filter's count said.
describe('Patterns/Conference agenda', () => {
  test('clashes and start times', () => {
    const list = [s('a', 'd1', '10:00', '11:00'), s('b', 'd1', '10:30', '11:30'), s('c', 'd1', '11:00', '12:00'), s('d', 'd2', '10:00', '11:00')];
    expect(clashes(list, ['a', 'b', 'c', 'd'])).toEqual({ a: ['B'], b: ['A', 'C'], c: ['B'], d: [] });
    expect(clashes(list, ['a', 'c'])).toEqual({ a: [], c: [] });
    expect(byStart(list).map((g) => [g.start, g.sessions.length])).toEqual([['10:00', 2], ['10:30', 1], ['11:00', 1]]);
  });

  test('one main and h1, the skip link first, days as tabs, and sessions as named articles', async () => {
    const screen = await render(<Agenda />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Agenda']);
    expect(screen.getByRole('tab').elements().map((t) => norm(t.textContent))).toEqual(['Day 1', 'Day 2', 'Your agenda (0)']);
    expect(screen.getByRole('article', { name: 'Forms that forgive' }).elements()).toHaveLength(1);
    expect(panel().querySelectorAll('h3')).toHaveLength(4);
    expect(count()).toBe('8 sessions in all');
  });

  test('Save is a toggle named by its session, says how many are saved, and a clash is said on both', async () => {
    const onSavedChange = vi.fn();
    const screen = await render(<Agenda onSavedChange={onSavedChange} />);
    await screen.getByRole('button', { name: 'Save: Tokens across five brands' }).click();
    expect(screen.getByRole('button', { name: 'Save: Tokens across five brands' }).element().getAttribute('aria-pressed')).toBe('true');
    await expect.poll(() => norm(document.body.textContent)).toContain('Saved. 1 session in your agenda.');
    await screen.getByRole('button', { name: 'Save: Forms that forgive' }).click();
    expect(onSavedChange).toHaveBeenLastCalledWith(['b1', 'a1']);
    expect(screen.getByRole('article', { name: 'Tokens across five brands' }).first().element().textContent).toContain('Clashes with Forms that forgive.');
    expect(screen.getByRole('article', { name: 'Forms that forgive' }).first().element().textContent).toContain('Clashes with Tokens across five brands.');
    await screen.getByRole('button', { name: 'Save: Tokens across five brands' }).click();
    await expect.poll(() => norm(document.body.textContent)).toContain('Removed. 1 session in your agenda.');
    expect(document.body.textContent).not.toContain('Clashes with');
  });

  test('the track filter says how many it shows, and Your agenda lists what\'s saved', async () => {
    const screen = await render(<Agenda defaultSaved={['k2']} />);
    await screen.getByRole('combobox', { name: 'Track' }).selectOptions('Keynote');
    await expect.poll(count).toBe('2 sessions in Keynote');
    expect(panel().querySelectorAll('article')).toHaveLength(1);
    await screen.getByRole('tab').nth(1).click();
    expect(panel().textContent).toContain('Keynote: What we got wrong');
    await screen.getByRole('combobox', { name: 'Track' }).selectOptions('');
    await screen.getByRole('tab').last().click();
    expect(panel().querySelectorAll('article')).toHaveLength(1);
  });

  test('a saved session in its day and in your agenda keeps every id unique', async () => {
    await render(<Agenda defaultSaved={['k1', 'a1', 'b1']} />);
    const ids = [...document.querySelectorAll('[id]')].map((e) => e.id);
    expect(ids.length).toBe(new Set(ids).size);
  });

  test('nothing saved, and a track with nothing on a day', async () => {
    const screen = await render(<Agenda sessions={[s('a', '2026-05-14', '10:00', '11:00'), { ...s('b', '2026-05-15', '10:00', '11:00'), track: 'x' }]} />);
    await screen.getByRole('combobox', { name: 'Track' }).selectOptions('x');
    expect(document.body.textContent).toContain('No sessions in this track today.');
    expect(count()).toBe('1 session in x');
    await screen.getByRole('tab').last().click();
    expect(document.body.textContent).toContain('Nothing saved yet.');
  });

  test('while loading, one placeholder; a failed load says so, with Try again', async () => {
    const onRetry = vi.fn();
    const screen = await render(<Agenda loading />);
    await expect.poll(() => screen.getByRole('progressbar').elements().map((e) => e.getAttribute('aria-label'))).toEqual(['Loading the agenda']);
    expect(document.querySelectorAll('main h1')).toHaveLength(1);
    await screen.rerender(<Agenda loadFailed onRetry={onRetry} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Couldn’t load the agenda' })).toBeVisible();
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('before the sessions are out: it says so once, without a track filter, "0 sessions" or empty days', async () => {
    const screen = await render(<Agenda sessions={[]} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'The agenda isn’t out yet' })).toBeVisible();
    expect(document.querySelector('main select, main [role="tablist"]')).toBeNull();
    expect(document.querySelector('main')!.textContent).not.toMatch(/\b0 sessions/);
  });
});
