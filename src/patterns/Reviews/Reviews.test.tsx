import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { Reviews, pickReviews, starSplit, type Review } from './Reviews';

const active = () => document.activeElement as HTMLElement;
const norm = (t: string | null | undefined) => (t ?? '').replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x660)).replace(/٫/g, '.');
const count = () => norm(document.getElementById('reviews-count')!.textContent);
const titles = () => [...document.querySelectorAll('article h3')].map((h) => h.textContent);
const r = (id: string, stars: number, date: string, helpful = 0): Review => ({ id, stars, title: id, body: '', author: 'A', date, bought: true, helpful });

// Reviews: the average as stars named in words, the split as named meters with values in words, each review a named
// article, the count said on a change, Helpful a toggle named by its review, and Show more moving focus.
describe('Patterns/Reviews', () => {
  test('the average and the split, and picking and ordering reviews', () => {
    const list = [r('a', 5, '2026-01-01', 1), r('b', 4, '2026-01-03', 9), r('c', 4, '2026-01-02', 3)];
    expect(starSplit(list)).toEqual({ average: 4.3, counts: [{ stars: 5, count: 1 }, { stars: 4, count: 2 }, { stars: 3, count: 0 }, { stars: 2, count: 0 }, { stars: 1, count: 0 }] });
    expect(starSplit([]).average).toBe(0);
    expect(pickReviews(list, 0, 'recent').map((x) => x.id)).toEqual(['b', 'c', 'a']);
    expect(pickReviews(list, 0, 'helpful').map((x) => x.id)).toEqual(['b', 'c', 'a']);
    expect(pickReviews(list, 0, 'high').map((x) => x.id)).toEqual(['a', 'b', 'c']);
    expect(pickReviews(list, 0, 'low').map((x) => x.id)).toEqual(['b', 'c', 'a']);
    expect(pickReviews(list, 4, 'recent').map((x) => x.id)).toEqual(['b', 'c']);
  });

  test('one main and h1, the skip link first, the average in words, the split as named meters, reviews as named articles', async () => {
    const screen = await render(<Reviews />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Reviews of the Featherlight jacket']);
    expect(norm(screen.getByRole('img').first().element().getAttribute('aria-label'))).toMatch(/3[.,]8/);
    expect(screen.getByRole('meter').elements()).toHaveLength(5);
    expect(norm(screen.getByRole('meter').first().element().getAttribute('aria-valuetext'))).toMatch(/^2 reviews, 40/);
    expect(screen.getByRole('article', { name: 'Great, but runs small' }).elements()).toHaveLength(1);
    expect(count()).toBe('Showing 3 of 5 reviews');
  });

  test('the filter and the order say how many they show', async () => {
    const screen = await render(<Reviews />);
    await screen.getByRole('combobox', { name: 'Show' }).selectOptions('5');
    await expect.poll(count).toBe('Showing 2 of 2 reviews');
    await screen.getByRole('combobox', { name: 'Show' }).selectOptions('1');
    await expect.poll(count).toBe('No reviews with these stars yet.');
    await screen.getByRole('combobox', { name: 'Show' }).selectOptions('0');
    await screen.getByRole('combobox', { name: 'Sort by' }).selectOptions('helpful');
    await expect.poll(titles).toEqual(['Great, but runs small', 'Warm without the bulk', 'Zip broke in a month']);
    await screen.getByRole('combobox', { name: 'Sort by' }).selectOptions('low');
    await expect.poll(() => titles()[0]).toBe('Zip broke in a month');
  });

  test('Helpful is a toggle named by its review, and Show more moves focus to the first one it adds', async () => {
    const onHelpful = vi.fn();
    const screen = await render(<Reviews onHelpful={onHelpful} />);
    const helpful = screen.getByRole('button', { name: 'Helpful: Warm without the bulk' });
    await helpful.click();
    expect(helpful.element().getAttribute('aria-pressed')).toBe('true');
    expect(norm(helpful.element().closest('article')?.textContent)).toContain('15 people found this helpful');
    expect(onHelpful).toHaveBeenLastCalledWith('r1', true);
    await helpful.click();
    expect(onHelpful).toHaveBeenLastCalledWith('r1', false);
    await screen.getByRole('button', { name: 'Show more reviews' }).click();
    await expect.poll(() => active().textContent).toBe('Light and warm');
    expect(screen.getByRole('button', { name: 'Show more reviews' }).elements()).toHaveLength(0);
  });

  test('one person, one star and no reviews at all', async () => {
    await render(<Reviews reviews={[{ ...r('only', 1, '2026-01-01', 0), title: 'Only one' }]} />);
    expect(document.body.textContent).toContain('No one has marked this helpful yet');
    expect(norm(document.body.textContent)).toContain('Showing 1 of 1 review');
    await userEvent.click(document.querySelector<HTMLElement>('article button')!);
    expect(document.body.textContent).toContain('1 person found this helpful');
  });

  test('while loading, one placeholder; a failed load says so, with Try again', async () => {
    const onRetry = vi.fn();
    const screen = await render(<Reviews loading />);
    await expect.poll(() => screen.getByRole('progressbar').elements().map((e) => e.getAttribute('aria-label'))).toEqual(['Loading reviews']);
    expect(document.querySelectorAll('main h1')).toHaveLength(1);
    await screen.rerender(<Reviews loadFailed onRetry={onRetry} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Couldn’t load the reviews' })).toBeVisible();
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
