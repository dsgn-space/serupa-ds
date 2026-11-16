import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { WriteReview, reviewProblems, type ReviewDraft } from './WriteReview';

const active = () => document.activeElement as HTMLElement;
const alertText = () => [...document.querySelectorAll('[role="alert"]')].map((e) => e.textContent).join(' ');
const good: ReviewDraft = { stars: 4, title: '', body: 'Soft linen, fits true to size, a little long.', recommend: '', name: 'Ana L.', photos: [] };
const star = (n: number) => document.querySelector<HTMLInputElement>(`#review-stars input[value="${n}"]`)!;

// Write a review: what's reviewed named first, the stars a named group, a summary of what's missing that takes focus
// and links to each field, and a thank-you whose heading takes focus.
describe('Patterns/Write a review', () => {
  test('what\'s wrong with a review', () => {
    expect(reviewProblems(good)).toEqual({});
    expect(Object.keys(reviewProblems({ ...good, stars: null, body: '', name: ' ' }))).toEqual(['stars', 'body', 'name']);
    expect(reviewProblems({ ...good, body: 'Nice.' }).body).toBe('Say a little more: at least 30 characters, so it helps others.');
    expect(reviewProblems({ ...good, body: 'x'.repeat(2001) }).body).toBe('Shorten your review to 2000 characters.');
  });

  test('one main and h1, the skip link first, what\'s reviewed named, and the stars a group named by the question', async () => {
    const screen = await render(<WriteReview />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Write a review']);
    expect(document.body.textContent).toContain('Linen shirt, sand, size M');
    expect(screen.getByRole('radiogroup', { name: /^How many stars/ }).elements()).toHaveLength(1);
    expect((document.getElementById('review-name') as HTMLInputElement).value).toBe('Ana L.');
  });

  test('Send with problems: a summary takes focus, and the stars\' link lands on a star', async () => {
    const onSend = vi.fn();
    const screen = await render(<WriteReview onSend={onSend} />);
    await screen.getByRole('button', { name: 'Send review' }).click();
    await expect.poll(() => active().textContent).toMatch(/^There are \S+ problems/);
    expect(screen.getByRole('link', { name: /^Choose|^Write/ }).elements().map((e) => e.getAttribute('href'))).toEqual(['#review-stars', '#review-body']);
    await screen.getByRole('link', { name: 'Choose how many stars.' }).click();
    await expect.poll(() => active().getAttribute('type')).toBe('radio');
    expect(onSend).not.toHaveBeenCalled();
  });

  test('a send that fails keeps everything; sent, the thank-you\'s heading takes focus', async () => {
    const onSend = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined);
    const screen = await render(<WriteReview onSend={onSend} />);
    await userEvent.click(star(4));
    await screen.getByRole('textbox', { name: /^Title/ }).fill(' Lovely shirt ');
    await screen.getByRole('textbox', { name: /^Your review/ }).fill(' Soft linen, fits true to size, a little long. ');
    await screen.getByRole('radio', { name: 'Yes' }).click();
    await userEvent.upload(document.getElementById('review-photos') as HTMLInputElement, [new File(['x'], 'me.jpg', { type: 'image/jpeg' })]);
    await screen.getByRole('textbox', { name: /^Show it as/ }).fill('Ana');
    await screen.getByRole('button', { name: 'Send review' }).click();
    await expect.poll(alertText).toContain('Couldn’t send your review.');
    expect(star(4).checked).toBe(true);
    await screen.getByRole('button', { name: 'Send review' }).click();
    await expect.poll(() => active().textContent).toBe('Thank you for your review');
    expect(onSend).toHaveBeenLastCalledWith({ stars: 4, title: 'Lovely shirt', body: 'Soft linen, fits true to size, a little long.', recommend: 'yes', name: 'Ana', photos: [expect.objectContaining({ name: 'me.jpg' })] });
    expect(document.body.textContent).toContain('It will show as Ana;');
  });
});
