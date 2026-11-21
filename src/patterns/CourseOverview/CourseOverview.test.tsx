import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { CourseOverview, courseProgress } from './CourseOverview';
import { SerupaProvider } from '../../internal/provider';
import { formatDuration } from '../../components/Duration/Duration';

const active = () => document.activeElement as HTMLElement;
const bar = () => document.querySelector('[role="progressbar"]')!;
const mods = [{ id: 'a', title: 'A', lessons: [{ id: '1', title: 'One', minutes: 5 }, { id: '2', title: 'Two', minutes: 5 }] }, { id: 'b', title: 'B', lessons: [{ id: '3', title: 'Three', minutes: 70 }] }];

// Course overview: modules as headings that open ordered lists of lessons, progress as a named bar with words,
// Continue naming the next lesson, Done boxes named by their lesson, and a change in progress said.
describe('Patterns/Course overview', () => {
  test('progress and the next lesson', () => {
    expect(courseProgress(mods, ['1'])).toMatchObject({ done: 1, total: 3, next: { id: '2' }, nextModule: 'a' });
    expect(courseProgress(mods, ['1', '2'])).toMatchObject({ next: { id: '3' }, nextModule: 'b' });
    expect(courseProgress(mods, ['1', '2', '3'])).toMatchObject({ done: 3, next: null, nextModule: null });
  });

  test('the lessons\' times and the course\'s total read in the page\'s language: Indonesian "1 j, 30 mnt", not "1 h 30 min"', async () => {
    await render(<SerupaProvider locale="id"><CourseOverview /></SerupaProvider>);
    const words = (n: number) => formatDuration(n, 'id', { unit: 'minute' });
    // Shown, a number and its unit are held together with a no-break space.
    const text = (t: string | null | undefined) => (t ?? '').replace(/\u00a0/g, ' ');
    expect([text(document.body.textContent).includes(`${words(237)} in all`), text(document.querySelector('time[datetime="PT1H30M"]')?.textContent)]).toEqual([true, words(90)]);
  });

  test('one main and h1, the skip link first, modules as headings, and the next one\'s lessons open', async () => {
    const screen = await render(<CourseOverview />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Typography for the screen']);
    expect(document.querySelectorAll('h2')).toHaveLength(3);
    expect(screen.getByRole('button', { name: /Setting text/ }).element().getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('button', { name: /Seeing type/ }).element().getAttribute('aria-expanded')).toBe('false');
    expect(bar().getAttribute('aria-valuetext')).toMatch(/^(4|٤) of (10|١٠) lessons$/);
    expect(screen.getByRole('link', { name: 'Continue: Leading' }).element().getAttribute('href')).toBe('#lesson-l5');
    expect(screen.getByRole('checkbox', { name: 'Done: Kerning and tracking' }).elements()).toHaveLength(1);
  });

  test('marking a lesson done moves progress and Continue on, and says so', async () => {
    const onDoneChange = vi.fn();
    const screen = await render(<CourseOverview onDoneChange={onDoneChange} />);
    await screen.getByRole('checkbox', { name: 'Done: Leading' }).click();
    expect(onDoneChange).toHaveBeenLastCalledWith('l5', true);
    await expect.poll(() => bar().getAttribute('aria-valuetext')).toMatch(/^(5|٥) of /);
    expect(screen.getByRole('link', { name: 'Continue: Kerning and tracking' }).elements()).toHaveLength(1);
    await expect.poll(() => document.body.textContent).toMatch(/(5|٥) of (10|١٠) lessons done\./);
    await screen.getByRole('checkbox', { name: 'Done: Leading' }).click();
    expect(onDoneChange).toHaveBeenLastCalledWith('l5', false);
    expect(screen.getByRole('link', { name: 'Continue: Leading' }).elements()).toHaveLength(1);
  });

  test('the last lesson done: the certificate, and it\'s said', async () => {
    const screen = await render(<CourseOverview modules={mods} defaultDone={['1', '2']} />);
    await screen.getByRole('checkbox', { name: 'Done: Three' }).click();
    expect(screen.getByRole('link', { name: 'Get your certificate' }).elements()).toHaveLength(1);
    await expect.poll(() => document.body.textContent).toContain('Every lesson done. Your certificate is ready.');
    expect(screen.getByRole('button', { name: /B/ }).element().textContent).toContain('Done');
  });

  test('while loading, one placeholder; a failed load says so, with Try again', async () => {
    const onRetry = vi.fn();
    const screen = await render(<CourseOverview loading />);
    await expect.poll(() => screen.getByRole('progressbar').elements().map((e) => e.getAttribute('aria-label'))).toEqual(['Loading the course']);
    expect(document.querySelectorAll('main h1')).toHaveLength(1);
    await screen.rerender(<CourseOverview loadFailed onRetry={onRetry} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Couldn’t load the course' })).toBeVisible();
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
