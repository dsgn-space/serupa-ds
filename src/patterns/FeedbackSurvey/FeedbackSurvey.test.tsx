import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { FeedbackSurvey, surveyProblems, type SurveyAnswers } from './FeedbackSurvey';

const active = () => document.activeElement as HTMLElement;
const alertText = () => [...document.querySelectorAll('[role="alert"]')].map((e) => e.textContent).join(' ');
const star = (n: number) => document.querySelectorAll<HTMLInputElement>('form input[type="radio"]')[n - 1]!;
const none: SurveyAnswers = { rating: null, reason: '', better: [], comments: '', contact: false, email: '' };

// Feedback survey: only the rating is needed, what's missing is said next to its question, the email is asked for
// only once writing back is allowed, and the thanks come once the server has the answers.
describe('Patterns/Feedback survey', () => {
  test('what\'s missing from the answers', () => {
    expect(surveyProblems(none)).toEqual({ rating: 'Choose a rating from 1 to 5 stars.' });
    expect(surveyProblems({ ...none, rating: 4 })).toEqual({});
    expect(surveyProblems({ ...none, rating: 4, contact: true })).toEqual({ email: 'Enter your email address, or untick “You may write back to me”.' });
    expect(surveyProblems({ ...none, rating: 4, contact: true, email: 'ana' })).toEqual({ email: 'Enter an email address like name@example.com.' });
    expect(surveyProblems({ ...none, rating: 4, contact: true, email: 'ana@example.com' })).toEqual({});
  });

  test('one main and h1, the skip link first, the rating a named group of named stars, and the choices named groups', async () => {
    const screen = await render(<FeedbackSurvey about="your order" />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'How was your order?']);
    await expect.element(screen.getByRole('radiogroup', { name: /How would you rate it/ })).toBeVisible();
    expect(star(1).getAttribute('aria-label')).toBeTruthy();
    expect(screen.getByRole('group', { name: /What did you come to do/ }).elements()).toHaveLength(1);
    expect(screen.getByRole('group', { name: /What could be better/ }).elements()).toHaveLength(1);
    expect(screen.getByRole('textbox', { name: /^Email/ }).elements()).toHaveLength(0);
  });

  test('Send with no rating says so next to it and puts focus on the stars; choosing one takes the message away', async () => {
    const onSend = vi.fn();
    const screen = await render(<FeedbackSurvey onSend={onSend} />);
    await screen.getByRole('button', { name: 'Send' }).click();
    await expect.poll(() => document.body.textContent).toContain('Choose a rating from 1 to 5 stars.');
    expect(active()).toBe(star(1));
    expect(onSend).not.toHaveBeenCalled();
    // Read from the stars' own description: the live region may still be saying it.
    const described = () => (screen.getByRole('radiogroup', { name: /How would you rate it/ }).element().getAttribute('aria-describedby') ?? '').split(' ').map((id) => document.getElementById(id)?.textContent ?? '').join(' ');
    expect(described()).toContain('Choose a rating from 1 to 5 stars.');
    await userEvent.click(star(4));
    await expect.poll(described).not.toContain('Choose a rating');
  });

  test('allowing a reply asks for the email, which is then needed; taking it back takes the field and the message away', async () => {
    const onSend = vi.fn();
    const screen = await render(<FeedbackSurvey onSend={onSend} />);
    await userEvent.click(star(3));
    await screen.getByRole('checkbox', { name: /You may write back to me/ }).click();
    const email = screen.getByRole('textbox', { name: /^Email/ });
    expect(email.element().getAttribute('autocomplete')).toBe('email');
    await screen.getByRole('button', { name: 'Send' }).click();
    await expect.poll(() => active().id).toBe('survey-email');
    expect(active().getAttribute('aria-invalid')).toBe('true');
    await screen.getByRole('checkbox', { name: /You may write back to me/ }).click();
    expect(screen.getByRole('textbox', { name: /^Email/ }).elements()).toHaveLength(0);
    expect(onSend).not.toHaveBeenCalled();
  });

  test('Send sends every answer and the thanks take focus', async () => {
    const onSend = vi.fn(() => Promise.resolve());
    const screen = await render(<FeedbackSurvey onSend={onSend} />);
    await userEvent.click(star(5));
    await screen.getByRole('radio', { name: 'To ask a question' }).click();
    await screen.getByRole('checkbox', { name: 'Prices' }).click();
    await screen.getByRole('checkbox', { name: 'Waiting time' }).click();
    await screen.getByRole('textbox', { name: /^Anything else/ }).fill(' Friendly staff. ');
    await screen.getByRole('checkbox', { name: /You may write back to me/ }).click();
    await screen.getByRole('textbox', { name: /^Email/ }).fill(' ana@example.com ');
    await screen.getByRole('button', { name: 'Send' }).click();
    await expect.poll(() => active().textContent).toBe('Thank you');
    expect(onSend).toHaveBeenCalledWith({ rating: 5, reason: 'ask', better: ['wait', 'price'], comments: 'Friendly staff.', contact: true, email: 'ana@example.com' });
    expect(document.body.textContent).toContain('it’ll be to the address you gave');
  });

  test('without a reply allowed, the thanks say you won\'t hear from us', async () => {
    const screen = await render(<FeedbackSurvey onSend={() => Promise.resolve()} />);
    await userEvent.click(star(2));
    await screen.getByRole('button', { name: 'Send' }).click();
    await expect.poll(() => document.body.textContent).toContain('You won’t hear from us about this.');
  });

  test('answers that can\'t be sent say so next to the button and stay; changing one takes the message away', async () => {
    const screen = await render(<FeedbackSurvey onSend={() => Promise.reject(new Error('offline'))} />);
    await userEvent.click(star(2));
    await screen.getByRole('button', { name: 'Send' }).click();
    await expect.poll(alertText).toBe('Couldn’t send your answers. Try again; they’re all still here.');
    expect(star(2).checked).toBe(true);
    await userEvent.click(star(3));
    await expect.poll(alertText).toBe('');
  });
});
