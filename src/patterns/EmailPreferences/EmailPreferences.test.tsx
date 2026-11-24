import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { EmailPreferences, changeWords, emailChanges, type EmailTopic } from './EmailPreferences';

const active = () => document.activeElement as HTMLElement;
const alertText = () => [...document.querySelectorAll('[role="alert"]')].map((e) => e.textContent).join(' ');
const topics: EmailTopic[] = [
  { id: 'news', label: 'News', about: 'Weekly.', on: true },
  { id: 'survey', label: 'Surveys', about: 'Now and then.', on: false },
];

// Email preferences: the address said first, each kind of email a switch named by what it is with how often as its
// description, Save saying what changed, and one button that stops them all and can be undone.
describe('Patterns/Email preferences', () => {
  test('what changed, in words', () => {
    expect(emailChanges(topics, { news: true, survey: false }, { news: false, survey: true })).toEqual({ on: ['Surveys'], off: ['News'] });
    expect(changeWords({ on: ['Surveys'], off: ['News'] })).toBe('Turned on Surveys. Turned off News.');
    expect(changeWords({ on: [], off: [] })).toBe('Nothing changed.');
  });

  test('one main and h1, the skip link first, the address said, and each kind a switch with how often as its description', async () => {
    const screen = await render(<EmailPreferences email="ana@example.com" />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Emails from Acme']);
    expect(document.body.textContent).toContain('Choose what comes to ana@example.com.');
    const news = screen.getByRole('switch', { name: 'News and offers' }).element();
    expect(document.getElementById(news.getAttribute('aria-describedby')!.split(' ')[0]!)?.textContent).toMatch(/^Weekly/);
    expect(screen.getByRole('switch').elements()).toHaveLength(4);
  });

  test('Save sends every choice and says what changed; one that fails says so and keeps the switches', async () => {
    const onSave = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined);
    const screen = await render(<EmailPreferences topics={topics} onSave={onSave} />);
    await screen.getByRole('switch', { name: 'News' }).click();
    await screen.getByRole('switch', { name: 'Surveys' }).click();
    await screen.getByRole('button', { name: 'Save choices' }).click();
    await expect.poll(alertText).toContain('Couldn’t save your choices.');
    expect((screen.getByRole('switch', { name: 'Surveys' }).element() as HTMLInputElement).checked).toBe(true);
    await screen.getByRole('button', { name: 'Save choices' }).click();
    await expect.poll(() => document.getElementById('email-saved')?.textContent).toBe('Saved. Turned on Surveys. Turned off News.');
    expect(document.getElementById('email-saved')?.getAttribute('role')).toBe('status');
    expect(onSave).toHaveBeenLastCalledWith({ news: false, survey: true });
  });

  test('Stop all emails turns every one off at once, its heading takes focus, and "Turn them back on" restores them', async () => {
    const onSave = vi.fn(() => Promise.resolve());
    const screen = await render(<EmailPreferences topics={topics} onSave={onSave} />);
    await screen.getByRole('button', { name: 'Stop all emails' }).click();
    await expect.poll(() => active().textContent).toBe('You won’t get these emails any more');
    expect(onSave).toHaveBeenLastCalledWith({ news: false, survey: false });
    await screen.getByRole('button', { name: 'Turn them back on' }).click();
    await expect.poll(() => active().getAttribute('role')).toBe('switch');
    expect(onSave).toHaveBeenLastCalledWith({ news: true, survey: false });
    expect((screen.getByRole('switch', { name: 'News' }).element() as HTMLInputElement).checked).toBe(true);
  });

  test('two on one page: "Turn them back on" focuses a switch on its own page', async () => {
    const onSave = vi.fn(() => Promise.resolve());
    const screen = await render(<><EmailPreferences topics={topics} onSave={onSave} /><EmailPreferences topics={topics} onSave={onSave} /></>);
    const second = document.querySelectorAll('main')[1]!;
    await screen.getByRole('button', { name: 'Stop all emails' }).nth(1).click();
    await screen.getByRole('button', { name: 'Turn them back on' }).click();
    await expect.poll(() => active().getAttribute('role')).toBe('switch');
    expect(second.contains(active())).toBe(true);
  });

  test('a stop or a turn back on that fails says so', async () => {
    const onSave = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined);
    const screen = await render(<EmailPreferences topics={topics} onSave={onSave} />);
    await screen.getByRole('button', { name: 'Stop all emails' }).click();
    await expect.poll(alertText).toContain('Couldn’t save your choices.');
    await screen.getByRole('button', { name: 'Stop all emails' }).click();
    await expect.poll(() => active().textContent).toBe('You won’t get these emails any more');
    await screen.getByRole('button', { name: 'Turn them back on' }).click();
    await expect.poll(alertText).toContain('Couldn’t turn them back on.');
    // Trying again works: the switches are back, without the old failure above them.
    await screen.getByRole('button', { name: 'Turn them back on' }).click();
    await expect.poll(() => active().getAttribute('role')).toBe('switch');
    expect(alertText()).not.toContain('Couldn’t');
  });
});
