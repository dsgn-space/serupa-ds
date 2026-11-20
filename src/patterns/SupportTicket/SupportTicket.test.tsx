import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { SupportTicket, replyProblem, type Ticket } from './SupportTicket';

const active = () => document.activeElement as HTMLElement;
const alertText = () => [...document.querySelectorAll('[role="alert"]')].map((e) => e.textContent).join(' ');
const described = (el: Element) => (el.getAttribute('aria-describedby') ?? '').split(' ').map((id) => document.getElementById(id)?.textContent ?? '').join(' ');
const ticket: Ticket = {
  reference: 'SR-1', subject: 'Refund missing', state: 'waiting', opened: '2026-02-10T09:12:00Z', priority: 'Normal',
  messages: [
    { id: 'a', from: 'you', body: 'Where is my refund?', at: '2026-02-10T09:12:00Z' },
    { id: 'b', from: 'Rina Wijaya', body: 'Send a photo, please.', at: '2026-02-10T13:40:00Z' },
  ],
};

// Support ticket: where it's got to in words, the conversation as a list of articles named by who wrote them, a reply
// that's checked and sent, and Mark as solved and Reopen moving focus to what replaced them.
describe('Patterns/Support ticket', () => {
  test('what\'s wrong with a reply', () => {
    expect(replyProblem('Here it is', [])).toBeNull();
    expect(replyProblem('  ', [new File(['x'], 'a.png')])).toBeNull();
    expect(replyProblem(' ', [])).toBe('Write a reply, or add a file.');
    expect(replyProblem('x'.repeat(4001), [])).toBe('Shorten your reply to 4000 characters.');
  });

  test('one main and h1, the skip link first, where it\'s got to in words, and the conversation as named articles', async () => {
    const screen = await render(<SupportTicket ticket={ticket} />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Refund missing']);
    expect(document.body.textContent).toContain('Waiting on you');
    expect(document.body.textContent).toContain('We’ve asked you something.');
    expect(screen.getByRole('article').elements()).toHaveLength(2);
    expect(screen.getByRole('article').elements()[1]!.getAttribute('aria-labelledby')).toBe('msg-b');
    expect(document.getElementById('msg-b')?.textContent).toMatch(/^Rina WijayaSupport, /);
    // Yours says "You" once (the name), then the time in the locale's own form: not "You You, …" or "You Support, …".
    expect(document.getElementById('msg-a')?.textContent).toMatch(/^You(?!\s|,|You|Support)\S/);
  });

  test('an empty reply is named next to the box, which takes focus', async () => {
    const onReply = vi.fn();
    const screen = await render(<SupportTicket ticket={ticket} onReply={onReply} />);
    await screen.getByRole('button', { name: 'Send reply' }).click();
    await expect.poll(() => active().id).toBe('ticket-reply');
    expect(described(active())).toContain('Write a reply, or add a file.');
    expect(onReply).not.toHaveBeenCalled();
  });

  test('a reply that fails says so and keeps the words; sent, it joins the list and the state goes back to Open', async () => {
    const onReply = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined);
    const screen = await render(<SupportTicket ticket={ticket} onReply={onReply} />);
    await screen.getByRole('textbox', { name: /^Your reply/ }).fill(' Photo attached. ');
    await userEvent.upload(document.getElementById('ticket-files') as HTMLInputElement, [new File(['x'], 'statement.png', { type: 'image/png' })]);
    await screen.getByRole('button', { name: 'Send reply' }).click();
    await expect.poll(alertText).toContain('Couldn’t send your reply.');
    expect((document.getElementById('ticket-reply') as HTMLTextAreaElement).value).toBe(' Photo attached. ');
    await screen.getByRole('button', { name: 'Send reply' }).click();
    await expect.poll(() => screen.getByRole('article').elements()).toHaveLength(3);
    expect(onReply).toHaveBeenLastCalledWith({ body: 'Photo attached.', files: [expect.objectContaining({ name: 'statement.png' })] });
    expect(document.body.textContent).toContain('Attached: statement.png');
    expect(document.body.textContent).toContain('We’re looking into it');
    expect((document.getElementById('ticket-reply') as HTMLTextAreaElement).value).toBe('');
  });

  test('Mark as solved focuses the heading that says so; Reopen brings the reply box back and focuses it', async () => {
    const onSolve = vi.fn(), onReopen = vi.fn();
    const screen = await render(<SupportTicket ticket={ticket} onSolve={onSolve} onReopen={onReopen} />);
    await screen.getByRole('button', { name: 'Mark as solved' }).click();
    await expect.poll(() => active().textContent).toBe('This request is solved');
    expect(onSolve).toHaveBeenCalledOnce();
    await screen.getByRole('button', { name: 'Reopen' }).click();
    await expect.poll(() => active().id).toBe('ticket-reply');
    expect(onReopen).toHaveBeenCalledOnce();
  });
});
