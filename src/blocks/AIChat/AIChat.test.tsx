import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { AIChat, type AIChatMessage } from './AIChat';

// Text read out by the shared polite announcer, wherever it lives on the page.
const said = () => [...document.querySelectorAll('[aria-live="polite"]')].map((e) => e.textContent || '').join(' ');
const log = () => page.getByRole('log').element() as HTMLElement;
const reply = () => [...log().querySelectorAll('[data-component="chat-message"]')].pop() as HTMLElement;

// A pretend assistant: each send adds the question and a reply that streams in a word at a time.
type Ctl = { step: () => void; finish: () => void; fail: () => void };
function Harness({ ctl, start = [], onRegenerate }: { ctl: Partial<Ctl>; start?: AIChatMessage[]; onRegenerate?: () => void }) {
  const [messages, setMessages] = React.useState<AIChatMessage[]>(start);
  const words = ['Linen', 'breathes', 'well', 'in', 'heat.'];
  const at = React.useRef(0);
  const patch = (p: Partial<AIChatMessage>) => setMessages((m) => [...m.slice(0, -1), { ...m[m.length - 1]!, ...p }]);
  ctl.step = () => { at.current += 1; patch({ text: words.slice(0, at.current).join(' ') }); };
  ctl.finish = () => patch({ text: words.join(' '), streaming: false });
  ctl.fail = () => patch({ streaming: false, error: 'The connection dropped.' });
  const ask = (text: string) => { at.current = 0; setMessages((m) => [...m, { id: 'q' + m.length, role: 'user', text }, { id: 'a' + m.length, role: 'assistant', text: '', streaming: true }]); };
  return <AIChat messages={messages} suggestions={['What fabric is coolest?', 'How do I wash linen?']} onSend={ask}
    onStop={() => patch({ streaming: false, stopped: true })}
    onRegenerate={onRegenerate ?? (() => { at.current = 0; setMessages((m) => [...m.slice(0, -1), { id: 'r' + m.length, role: 'assistant', text: '', streaming: true }]); })} />;
}

// AI chat (RU20): Chat with an assistant's needs around it: suggestions to start, a reply read once when whole,
// Stop, Copy and Regenerate, with focus kept in the message box.
describe('Blocks/AI chat', () => {
  test('a region named by its heading; with no messages, the suggestions are a named list of buttons, and one sends itself with focus moving to the box', async () => {
    const ctl: Partial<Ctl> = {};
    await render(<Harness ctl={ctl} />);
    await expect.element(page.getByRole('region', { name: 'Assistant' })).toBeInTheDocument();
    const list = page.getByRole('list', { name: 'Suggestions' });
    expect(list.getByRole('button').all()).toHaveLength(2);
    await userEvent.click(page.getByRole('button', { name: 'How do I wash linen?' }));
    await expect.element(page.getByRole('log', { name: 'Assistant' })).toBeInTheDocument();
    expect(log().textContent).toContain('How do I wash linen?');
    expect([list.query(), document.activeElement]).toEqual([null, page.getByRole('textbox', { name: 'Message' }).element()]);
  });

  test('a streaming reply is busy, so it is read once when whole; Copy and Regenerate are there from the start, off until then', async () => {
    const ctl: Partial<Ctl> = {};
    await render(<Harness ctl={ctl} />);
    await userEvent.click(page.getByRole('button', { name: 'What fabric is coolest?' }));
    expect([reply().getAttribute('aria-busy'), reply().textContent]).toEqual(['true', expect.stringContaining('Thinking')]);
    const copy = page.getByRole('button', { name: 'Copy reply' }), again = page.getByRole('button', { name: 'Regenerate' });
    await expect.element(copy).toBeDisabled();
    await expect.element(again).toBeDisabled();
    const before = [copy.element(), again.element()];
    React.act(() => ctl.step!()); React.act(() => ctl.step!());
    expect([reply().getAttribute('aria-busy'), reply().textContent]).toEqual(['true', expect.stringContaining('Linen breathes')]);
    expect(page.getByRole('button', { name: 'Stop' }).query()).not.toBeNull();
    React.act(() => ctl.finish!());
    expect(reply().hasAttribute('aria-busy')).toBe(false);
    await expect.element(copy).toBeEnabled();
    await expect.element(again).toBeEnabled();
    expect([copy.element(), again.element()]).toEqual(before);   // the same buttons, so the log reads nothing new
    expect(page.getByRole('button', { name: 'Send' }).query()).not.toBeNull();
  });

  test('Stop keeps what arrived, says "Stopped", and focus goes to the box rather than the page', async () => {
    const ctl: Partial<Ctl> = {};
    await render(<Harness ctl={ctl} />);
    await userEvent.click(page.getByRole('button', { name: 'What fabric is coolest?' }));
    React.act(() => ctl.step!());
    await userEvent.click(page.getByRole('button', { name: 'Stop' }));
    expect([reply().hasAttribute('aria-busy'), reply().textContent]).toEqual([false, expect.stringMatching(/Linen.*Stopped/)]);
    await expect.poll(said).toContain('Reply stopped');
    expect(document.activeElement).toBe(page.getByRole('textbox', { name: 'Message' }).element());
  });

  test('Regenerate asks again only for the newest reply, and focus goes to the box when its reply is replaced', async () => {
    const ctl: Partial<Ctl> = {};
    const start: AIChatMessage[] = [
      { id: '1', role: 'user', text: 'Hi' }, { id: '2', role: 'assistant', text: 'Hello.' },
      { id: '3', role: 'user', text: 'Linen?' }, { id: '4', role: 'assistant', text: 'Yes, linen.' },
    ];
    await render(<Harness ctl={ctl} start={start} />);
    expect([page.getByRole('button', { name: 'Copy reply' }).all().length, page.getByRole('button', { name: 'Regenerate' }).all().length]).toEqual([2, 1]);
    await userEvent.click(page.getByRole('button', { name: 'Regenerate' }));
    expect([reply().getAttribute('aria-busy'), log().textContent]).toEqual(['true', expect.not.stringContaining('Yes, linen.')]);
    expect(document.activeElement).toBe(page.getByRole('textbox', { name: 'Message' }).element());
  });

  test('a reply that fails says why in words, with Try again', async () => {
    const ctl: Partial<Ctl> = {}, again = vi.fn();
    await render(<Harness ctl={ctl} onRegenerate={again} />);
    await userEvent.click(page.getByRole('button', { name: 'What fabric is coolest?' }));
    React.act(() => ctl.fail!());
    await expect.element(page.getByText('The connection dropped.')).toBeVisible();
    await userEvent.click(page.getByRole('button', { name: 'Try again' }));
    expect(again).toHaveBeenCalledTimes(1);
  });

  test('every word is a label', async () => {
    await render(<AIChat messages={[{ id: '1', role: 'user', text: 'Halo' }, { id: '2', role: 'assistant', text: 'Hai.' }]} onSend={() => {}} onRegenerate={() => {}}
      labels={{ title: 'Asisten', assistant: 'Asisten', copy: 'Salin jawaban', regenerate: 'Buat ulang' }} />);
    await expect.element(page.getByRole('region', { name: 'Asisten' })).toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Salin jawaban' })).toBeEnabled();
    await expect.element(page.getByRole('button', { name: 'Buat ulang' })).toBeEnabled();
  });
});
