import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { Quiz, scoreQuiz, type QuizQuestion } from './Quiz';

const active = () => document.activeElement as HTMLElement;
const questions: QuizQuestion[] = [
  { id: 'a', question: 'Pick one', options: [{ value: 'x', label: 'Ex' }, { value: 'y', label: 'Why' }], answer: ['x'], why: 'Because x.' },
  { id: 'b', question: 'Pick two', options: [{ value: 'p', label: 'Pea' }, { value: 'q', label: 'Queue' }, { value: 'r', label: 'Are' }], answer: ['p', 'q'], why: 'Because p and q.' },
];

// Quiz: each question a fieldset named by its question, how many are answered said as they're chosen, a summary of
// the questions left that takes focus, and once checked the score's heading takes focus, with right or not in words.
describe('Patterns/Quiz', () => {
  test('the score: every right option chosen and no other', () => {
    expect(scoreQuiz(questions, { a: ['x'], b: ['q', 'p'] })).toBe(2);
    expect(scoreQuiz(questions, { a: ['y'], b: ['p'] })).toBe(0);
    expect(scoreQuiz(questions, { a: ['x'], b: ['p', 'q', 'r'] })).toBe(1);
    expect(scoreQuiz(questions, {})).toBe(0);
  });

  test('one main and h1, the skip link first, each question a fieldset, and "Choose all that apply" with checkboxes', async () => {
    const screen = await render(<Quiz />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelectorAll('h1').length]).toEqual([1, 1]);
    expect(document.querySelectorAll('main fieldset')).toHaveLength(5);
    expect(screen.getByRole('group', { name: /Choose all that apply/ }).element().querySelectorAll('input[type="checkbox"]')).toHaveLength(3);
    expect(document.body.textContent).toContain('no time limit');
  });

  test('how many are answered is said; Check with questions left: a summary takes focus and its links reach each question', async () => {
    const onCheck = vi.fn();
    const screen = await render(<Quiz questions={questions} onCheck={onCheck} />);
    await screen.getByRole('radio', { name: 'Ex' }).click();
    await expect.poll(() => document.getElementById('quiz-progress')?.textContent).toMatch(/^\S+ of \S+ answered$/);
    expect(document.getElementById('quiz-progress')?.getAttribute('role')).toBe('status');
    await screen.getByRole('button', { name: 'Check answers' }).click();
    await expect.poll(() => active().textContent).toMatch(/^There is a problem|^There are/);
    await screen.getByRole('link', { name: /^Answer question/ }).click();
    await expect.poll(() => active().getAttribute('type')).toBe('checkbox');
    expect(document.body.textContent).toContain('Choose an answer.');
    await screen.getByRole('checkbox', { name: 'Pea' }).click();
    await expect.poll(() => document.body.textContent).not.toContain('Choose an answer.');
    expect(onCheck).not.toHaveBeenCalled();
  });

  test('Check: the score takes focus, each question says right or not in words, and Try again starts over', async () => {
    const onCheck = vi.fn();
    const screen = await render(<Quiz questions={questions} pass={2} onCheck={onCheck} />);
    await screen.getByRole('radio', { name: 'Ex' }).click();
    await screen.getByRole('checkbox', { name: 'Pea' }).click();
    await screen.getByRole('button', { name: 'Check answers' }).click();
    await expect.poll(() => active().id).toBe('quiz-score');
    expect(active().textContent).toMatch(/^Not passed yet: /);
    expect(onCheck).toHaveBeenCalledWith({ a: ['x'], b: ['p'] }, 1);
    expect(document.body.textContent).toContain('RightBecause x.');
    expect(document.body.textContent).toContain('Not quiteThe answer: Pea, and Queue. Because p and q.');
    expect(document.querySelector('input[value="y"]')?.matches(':disabled')).toBe(true);
    await screen.getByRole('button', { name: 'Try again' }).click();
    await expect.poll(() => (active() as HTMLInputElement).value).toBe('x');
    expect([...document.querySelectorAll('input')].some((i) => i.checked)).toBe(false);
    await screen.getByRole('radio', { name: 'Ex' }).click();
    await screen.getByRole('checkbox', { name: 'Pea' }).click();
    await screen.getByRole('checkbox', { name: 'Queue' }).click();
    await screen.getByRole('button', { name: 'Check answers' }).click();
    await expect.poll(() => active().textContent).toMatch(/^You passed: /);
    expect(screen.getByRole('link', { name: 'Go to the next lesson' }).elements()).toHaveLength(1);
  });

  test('while loading, one placeholder; a failed load says so, with Try again', async () => {
    const onRetry = vi.fn();
    const screen = await render(<Quiz loading />);
    await expect.poll(() => screen.getByRole('progressbar').elements().map((e) => e.getAttribute('aria-label'))).toEqual(['Loading the quiz']);
    expect(document.querySelectorAll('main h1')).toHaveLength(1);
    await screen.rerender(<Quiz loadFailed onRetry={onRetry} />);
    await expect.element(screen.getByRole('heading', { level: 2, name: 'Couldn’t load the quiz' })).toBeVisible();
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
