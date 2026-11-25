import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { JobApplication, applicationProblems, linkProblems, type JobApplicationAnswers } from './JobApplication';

const active = () => document.activeElement as HTMLElement;
const alertText = () => [...document.querySelectorAll('[role="alert"]')].map((e) => e.textContent).join(' ');
const described = (el: Element) => (el.getAttribute('aria-describedby') ?? '').split(' ').map((id) => document.getElementById(id)?.textContent ?? '').join(' ');
const cv = () => new File(['%PDF-1.4'], 'ana-lima-cv.pdf', { type: 'application/pdf' });
const good: JobApplicationAnswers = { name: 'Ana Lima', email: 'ana@example.com', phone: '', cv: cv(), letter: '', rightToWork: 'yes', consent: true };

const fill = async (screen: Awaited<ReturnType<typeof render>>) => {
  await screen.getByRole('textbox', { name: /^Full name/ }).fill(' Ana Lima ');
  await screen.getByRole('textbox', { name: /^Email/ }).fill('ana@example.com');
  await userEvent.upload(document.getElementById('job-cv') as HTMLInputElement, [cv()]);
  await screen.getByRole('textbox', { name: /^Why this job/ }).fill(' I’ve built two payment flows. ');
  await screen.getByRole('radio', { name: 'Yes' }).click();
  await screen.getByRole('checkbox', { name: /^Keep my application/ }).click();
};

// Job application: the job's facts as a list, fields that say what they're for, a summary of what's missing that
// takes focus and links to each field, and an answer whose heading takes focus with what happens next.
describe('Patterns/Job application', () => {
  test('what\'s wrong with an application', () => {
    expect(applicationProblems(good)).toEqual({});
    expect(Object.keys(applicationProblems({ ...good, name: ' ', email: '', cv: null, rightToWork: '', consent: false }))).toEqual(['name', 'email', 'cv', 'rightToWork', 'consent']);
    expect(applicationProblems({ ...good, email: 'ana@' }).email).toBe('Enter an email address like name@example.com.');
    expect(applicationProblems({ ...good, phone: '12' }).phone).toBe('Enter a phone number with its area code, like +62 21 555 0142.');
    expect(applicationProblems({ ...good, phone: '+62 21 555 0142' })).toEqual({});
    expect(linkProblems(['https://ana.design', '', 'ana.design'])).toEqual([undefined, undefined, 'Enter link 3 as a full address, like https://example.com/work.']);
    expect(applicationProblems({ ...good, links: ['https://ana.design', 'portfolio'] }).links).toBe('Enter link 2 as a full address, like https://example.com/work.');
    expect(applicationProblems({ ...good, letter: 'x'.repeat(2001) }).letter).toBe('Shorten this to 2000 characters.');
  });

  test('one main and h1, the skip link first, the job\'s facts as a list, and fields for autofill', async () => {
    await render(<JobApplication />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Product designer']);
    expect([...document.querySelectorAll('dt')].map((d) => d.textContent)).toEqual(['Team', 'Where', 'Hours', 'Pay']);
    expect(['job-name', 'job-email', 'job-phone'].map((id) => document.getElementById(id)?.getAttribute('autocomplete'))).toEqual(['name', 'email', 'tel']);
    expect(document.body.textContent).toContain('PDF or Word, up to 5 MB');
  });

  test('Send with problems: a summary takes focus, its links reach each field, and each field says its own', async () => {
    const onApply = vi.fn();
    const screen = await render(<JobApplication onApply={onApply} />);
    await screen.getByRole('textbox', { name: /^Phone/ }).fill('12');
    await screen.getByRole('button', { name: 'Send application' }).click();
    await expect.poll(() => active().textContent).toMatch(/^There are \S+ problems/);
    expect(screen.getByRole('link', { name: /^Enter|^Choose|^Say|^Agree/ }).elements().map((e) => e.getAttribute('href')))
      .toEqual(['#job-name', '#job-email', '#job-phone', '#job-cv', '#job-rightToWork', '#job-consent']);
    expect(described(document.getElementById('job-phone')!)).toContain('area code');
    await screen.getByRole('link', { name: 'Say whether you can work where the job is.' }).click();
    await expect.poll(() => active().getAttribute('type')).toBe('radio');
    await screen.getByRole('link', { name: /^Agree/ }).click();
    await expect.poll(() => active().id).toBe('job-consent');
    expect(onApply).not.toHaveBeenCalled();
  });

  test('links to work: Add makes a row up to 3, a bad one is named in the summary and marked, and blank ones aren’t sent', async () => {
    const onApply = vi.fn(() => Promise.resolve());
    const screen = await render(<JobApplication onApply={onApply} />);
    await fill(screen);
    const add = screen.getByRole('button', { name: 'Add a link' });
    await add.click();
    await expect.poll(() => active().id).toBe('job-link-0');
    await userEvent.keyboard('ana.design');
    await add.click();
    await add.click();
    await screen.getByRole('button', { name: 'Send application' }).click();
    await expect.poll(() => active().textContent).toMatch(/^There is \S+ problem/);
    await screen.getByRole('link', { name: 'Enter link 1 as a full address, like https://example.com/work.' }).click();
    await expect.poll(() => active().id).toBe('job-link-0');
    expect(active().getAttribute('aria-invalid')).toBe('true');
    await userEvent.fill(active(), ' https://ana.design ');
    await screen.getByRole('button', { name: 'Send application' }).click();
    await expect.poll(() => active().textContent).toBe('Application sent');
    expect((onApply.mock.calls[0] as unknown as [JobApplicationAnswers])[0].links).toEqual(['https://ana.design']);
  });

  test('Send sends the application trimmed, and the answer\'s heading takes focus with what happens next', async () => {
    const onApply = vi.fn(() => Promise.resolve());
    const screen = await render(<JobApplication onApply={onApply} />);
    await fill(screen);
    await screen.getByRole('button', { name: 'Send application' }).click();
    await expect.poll(() => active().textContent).toBe('Application sent');
    expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ name: 'Ana Lima', email: 'ana@example.com', letter: 'I’ve built two payment flows.', rightToWork: 'yes', consent: true }));
    expect((onApply.mock.calls[0] as unknown as [JobApplicationAnswers])[0].cv?.name).toBe('ana-lima-cv.pdf');
    expect(document.querySelectorAll('section[aria-labelledby="applied"] li')).toHaveLength(3);
  });

  test('an application that can\'t be sent says so next to the button and keeps every field and the CV', async () => {
    const screen = await render(<JobApplication onApply={() => Promise.reject(new Error('offline'))} />);
    await fill(screen);
    await screen.getByRole('button', { name: 'Send application' }).click();
    await expect.poll(alertText).toContain('Couldn’t send your application.');
    expect((document.getElementById('job-name') as HTMLInputElement).value).toBe(' Ana Lima ');
    expect(document.body.textContent).toContain('ana-lima-cv.pdf');
  });
});
