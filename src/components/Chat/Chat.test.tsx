import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { cdp, page, server, userEvent } from 'vitest/browser';
import { THEMES, contrast, css } from '../../../tools/test/vitest/helpers';
import { SerupaProvider } from '../../internal/provider';
import { idLabels } from '../../internal/labels';
import { Chat, ChatComposer, ChatDivider, ChatMessage, ChatSteps } from './Chat';

const log = () => document.querySelector('[role=log]') as HTMLElement;
const atBottom = (el: HTMLElement) => el.scrollHeight - el.scrollTop - el.clientHeight <= 4;
const msgs = (from: number, to: number) => Array.from({ length: to - from }, (_, i) => <ChatMessage key={'m' + (from + i)} author="Rina">Message {from + i}</ChatMessage>);

function Live({ api }: { api: { add?: (n: number) => void; older?: (n: number) => void } }) {
  const [range, setRange] = React.useState([10, 30]);
  api.add = (n) => setRange(([a, b]) => [a, b + n]);
  api.older = (n) => setRange(([a, b]) => [a - n, b]);
  return <div style={{ height: '300px', display: 'flex', flexDirection: 'column' }}><Chat aria-label="Support" style={{ flex: 'auto' }}>{msgs(range[0], range[1])}</Chat></div>;
}

// The innermost element whose text is (or matches) this: parts found by what they say, not by class.
function find(root: Element, text: string | RegExp): HTMLElement | null {
  const ok = (e: Element) => (typeof text === 'string' ? e.textContent === text : text.test(e.textContent));
  const all = [...root.querySelectorAll<HTMLElement>('*')].filter(ok);
  return all.find((e) => !all.some((x) => x !== e && e.contains(x))) || null;
}
const jumpButton = () => page.getByRole('button', { name: /new message/ }).query();

describe('Chat', () => {
  test('a named log that Tab reaches; ref, className and other props reach the outer <div>', async () => {
    const ref = React.createRef<HTMLDivElement>();
    await render(<><button>before</button><Chat ref={ref} id="c" className="extra" data-x="y" aria-label="Support"><ChatMessage author="Rina">Hi</ChatMessage></Chat></>);
    const e = document.getElementById('c')!;
    expect([ref.current === e, e.className, e.dataset.x, e.dataset.component]).toEqual([true, 'dk-chat extra', 'y', 'chat']);
    await expect.element(page.getByRole('log', { name: 'Support' })).toBeVisible();
    await userEvent.click(page.getByRole('button', { name: 'before' }));
    await userEvent.tab();
    expect(document.activeElement).toBe(log());
    expect(css(log()).outlineStyle).toBe('solid');
  });

  test('opens at the newest message', async () => {
    await render(<Live api={{}} />);
    await expect.poll(() => atBottom(log())).toBe(true);
  });

  test('with focus on the log, the arrow keys, PageUp, PageDown, Home and End scroll it', async () => {
    await render(<Live api={{}} />);
    await expect.poll(() => atBottom(log())).toBe(true);
    log().focus();
    const top = () => log().scrollTop;
    // A key scrolls smoothly: wait until it stops before reading where it stopped.
    const settled = async () => { let last = -1; await expect.poll(async () => { const now = top(); const same = now === last; last = now; await new Promise((r) => setTimeout(r, 60)); return same; }).toBe(true); return top(); };
    let at = await settled();
    await userEvent.keyboard('{ArrowUp}');
    await expect.poll(top).toBeLessThan(at);
    at = await settled();
    await userEvent.keyboard('{PageUp}');
    await expect.poll(top).toBeLessThan(at);
    at = await settled();
    await userEvent.keyboard('{ArrowDown}');
    await expect.poll(top).toBeGreaterThan(at);
    await userEvent.keyboard('{Home}');
    await expect.poll(top).toBe(0);
    // Let Home's smooth scroll finish: a PageDown that arrives while it's still running can be dropped (GR202).
    await settled();
    await userEvent.keyboard('{PageDown}');
    await expect.poll(top).toBeGreaterThan(0);
    await userEvent.keyboard('{End}');
    await expect.poll(() => atBottom(log())).toBe(true);
  });

  test('at the bottom, a new message keeps it at the bottom, with no jump button', async () => {
    const api: { add?: (n: number) => void } = {};
    await render(<Live api={api} />);
    React.act(() => api.add!(2));
    await expect.poll(() => atBottom(log())).toBe(true);
    expect(jumpButton()).toBe(null);
  });

  test('scrolled up, new messages leave the reader where they are and show "2 new messages", which jumps down and focuses the log', async () => {
    const api: { add?: (n: number) => void } = {};
    await render(<Live api={api} />);
    log().scrollTop = 0;
    log().dispatchEvent(new Event('scroll'));
    React.act(() => api.add!(2));
    const jump = page.getByRole('button', { name: '2 new messages' });
    await expect.element(jump).toBeVisible();
    expect(log().scrollTop).toBe(0);
    await userEvent.click(jump);
    await expect.poll(() => atBottom(log())).toBe(true);
    expect([document.activeElement === log(), jumpButton()]).toEqual([true, null]);
  });

  test('earlier messages loaded at the top keep the message the reader was on in place', async () => {
    const api: { older?: (n: number) => void } = {};
    await render(<Live api={api} />);
    log().scrollTop = 100;
    log().dispatchEvent(new Event('scroll'));
    const on = [...log().children].find((c) => c.getBoundingClientRect().top >= log().getBoundingClientRect().top)!;
    const before = on.getBoundingClientRect().top;
    React.act(() => api.older!(5));
    await expect.poll(() => Math.abs(on.getBoundingClientRect().top - before)).toBeLessThanOrEqual(1);
    expect(jumpButton()).toBe(null);
  });

  test('hasOlder adds "Load earlier messages", which calls onLoadOlder; loadingOlder says it is loading and doesn\'t call again', async () => {
    let calls = 0;
    const { rerender } = await render(<Chat aria-label="S" hasOlder onLoadOlder={() => calls++}><ChatMessage>Hi</ChatMessage></Chat>);
    await userEvent.click(page.getByRole('button', { name: 'Load earlier messages' }));
    await rerender(<Chat aria-label="S" hasOlder loadingOlder onLoadOlder={() => calls++}><ChatMessage>Hi</ChatMessage></Chat>);
    await expect.element(page.getByRole('button', { name: /Loading earlier messages/ })).toBeVisible();
    expect(calls).toBe(1);
  });
  test('keyboard: when "Load earlier messages" brings the last of them, focus moves to the log, not the page; the outer <div> takes no name', async () => {
    function Older() {
      const [from, setFrom] = React.useState(20);
      return <div style={{ height: '300px', display: 'flex', flexDirection: 'column' }}><Chat id="c" aria-label="Support" style={{ flex: 'auto' }} hasOlder={from > 0} onLoadOlder={() => setFrom((f) => f - 10)}>{msgs(from, 30)}</Chat></div>;
    }
    await render(<Older />);
    expect(document.getElementById('c')!.hasAttribute('aria-label')).toBe(false);
    const button = page.getByRole('button', { name: 'Load earlier messages' });
    // An earlier batch with more behind it: focus goes to the log, which is in view (the button is now above it).
    (button.element() as HTMLElement).focus();
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => document.activeElement).toBe(log());
    expect(find(log(), 'Message 10')).not.toBe(null);
    // The last batch: the button goes away, and focus stays on the log.
    (button.element() as HTMLElement).focus();
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => button.query()).toBe(null);
    expect(document.activeElement).toBe(log());
    expect(find(log(), 'Message 0')).not.toBe(null);
  });
});

describe('ChatMessage', () => {
  test('author, time and text; text keeps its line breaks and wraps a long word', async () => {
    await render(<div style={{ width: '240px' }}><ChatMessage id="m" author="Rina" time={new Date()}>{'Line one\nDonaudampfschifffahrtsgesellschaftskapitän'}</ChatMessage></div>);
    const m = document.getElementById('m')!;
    expect([m.dataset.component, !!find(m, 'Rina'), m.querySelector('time') != null, css(find(m, /^Line one/)).whiteSpace]).toEqual(['chat-message', true, true, 'pre-wrap']);
    expect(m.getBoundingClientRect().width).toBeLessThanOrEqual(240);
  });

  test('own: at the end, in the primary tint, and authored "You" unless named', async () => {
    await render(<div style={{ display: 'flex', flexDirection: 'column', width: '400px' }}><ChatMessage id="o" own>Hi</ChatMessage><ChatMessage id="t">Hi</ChatMessage></div>);
    const o = document.getElementById('o')!, t = document.getElementById('t')!;
    expect(find(o, 'You')).not.toBe(null);
    expect(o.getBoundingClientRect().right).toBeGreaterThan(t.getBoundingClientRect().right);
    expect(css(find(o, 'Hi')).backgroundColor).not.toBe(css(find(t, 'Hi')).backgroundColor);
  });

  test('hideAuthor leaves out the author and avatar on screen but still says who wrote it', async () => {
    await render(<ChatMessage id="h" author="Rina" avatar={<span>R</span>} hideAuthor>Second</ChatMessage>);
    const h = document.getElementById('h')!;
    // The name is there for screen readers only: clipped to nothing on screen; the avatar's place is empty.
    const name = find(h, 'Rina')!;
    expect([name.getBoundingClientRect().width <= 1, h.querySelector('[aria-hidden]')!.textContent]).toEqual([true, '']);
  });

  test('the avatar is hidden from screen readers', async () => {
    await render(<ChatMessage id="a" author="Rina" avatar={<span>R</span>}>Hi</ChatMessage>);
    expect(find(document.getElementById('a')!, 'R')!.closest('[aria-hidden]')!.getAttribute('aria-hidden')).toBe('true');
  });

  test('status: "Sending…", and "Not sent" with a Retry button that calls onRetry', async () => {
    let tries = 0;
    await render(<><ChatMessage id="s" own status="sending">A</ChatMessage><ChatMessage id="f" own status="failed" onRetry={() => tries++}>B</ChatMessage></>);
    expect(find(document.getElementById('s')!, 'Sending…')).not.toBe(null);
    expect(document.getElementById('f')!.classList.contains('dk-chat-message--failed')).toBe(true);
    await userEvent.click(page.getByRole('button', { name: 'Retry' }));
    expect(tries).toBe(1);
  });

  test('streaming marks it aria-busy; attachments sit under the text', async () => {
    await render(<ChatMessage id="st" streaming attachments={<span id="file">a.pdf</span>}>Partial</ChatMessage>);
    const st = document.getElementById('st')!;
    expect([st.getAttribute('aria-busy'), !!(find(st, 'Partial')!.compareDocumentPosition(document.getElementById('file')!) & Node.DOCUMENT_POSITION_FOLLOWING)]).toEqual(['true', true]);
  });

  test('its words come from the labels', async () => {
    await render(<SerupaProvider labels={idLabels}><ChatMessage id="i" own status="failed" onRetry={() => {}}>A</ChatMessage></SerupaProvider>);
    expect(find(document.getElementById('i')!, 'Anda')).not.toBe(null);
    await expect.element(page.getByRole('button', { name: 'Coba lagi' })).toBeVisible();
  });

  test('text, authors, times and "Not sent" read 4.5:1 in all six themes, on both bubbles and the page', async () => {
    await render(<><ChatMessage id="x" author="Rina" time={new Date()}>Hi</ChatMessage><ChatMessage id="y" own status="failed">Me</ChatMessage><ChatDivider id="d">Today</ChatDivider></>);
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      const pg = css(document.body).backgroundColor, x = document.getElementById('x')!, y = document.getElementById('y')!;
      for (const [name, el] of [['others', x], ['own', y]] as const) {
        const b = find(el, name === 'own' ? 'Me' : 'Hi')!;
        expect(contrast(css(b).color, css(b).backgroundColor), th + ' ' + name).toBeGreaterThanOrEqual(4.5);
      }
      expect(contrast(css(x.querySelector('time')).color, pg), th + ' time').toBeGreaterThanOrEqual(4.5);
      expect(contrast(css(find(y, /Not sent/)).color, pg), th + ' not sent').toBeGreaterThanOrEqual(4.5);
      expect(contrast(css(find(y, 'Me')).borderTopColor, pg), th + ' failed outline').toBeGreaterThanOrEqual(3);
      expect(contrast(css(document.getElementById('d')).color, pg), th + ' divider').toBeGreaterThanOrEqual(4.5);
    }
    document.documentElement.removeAttribute('data-theme');
  });
});

describe('ChatMessage: an agent at work', () => {
  test('thinking says "Thinking…" until its words arrive, which take its place', async () => {
    const r = await render(<ChatMessage id="t" author="Assistant" thinking />);
    await expect.element(page.getByRole('progressbar', { name: 'Thinking…' })).toBeInTheDocument();
    await r.rerender(<ChatMessage id="t" author="Assistant" thinking>Here it is</ChatMessage>);
    expect([page.getByRole('progressbar', { name: 'Thinking…' }).query(), find(document.getElementById('t')!, 'Here it is') != null]).toEqual([null, true]);
  });

  test('reasoning sits closed under "Thought for 12 seconds", and opens from the keyboard', async () => {
    await render(<ChatMessage id="r" author="Assistant" reasoning="First I checked the order." reasoningTime={12.2}>Done</ChatMessage>);
    const d = document.querySelector<HTMLDetailsElement>('#r details')!;
    const sum = d.querySelector('summary')!;
    expect([d.open, sum.textContent]).toEqual([false, 'Thought for 12 seconds']);
    sum.focus();
    await userEvent.keyboard('{Enter}');
    expect(d.open).toBe(true);
    await expect.element(page.getByText('First I checked the order.')).toBeVisible();
  });

  test('without a time, or with a time that is not a number, it says "Reasoning"; one second is singular', async () => {
    await render(<><ChatMessage id="a" reasoning="x">A</ChatMessage><ChatMessage id="b" reasoning="x" reasoningTime={NaN}>B</ChatMessage><ChatMessage id="c" reasoning="x" reasoningTime={1}>C</ChatMessage></>);
    expect(['a', 'b', 'c'].map((id) => document.querySelector('#' + id + ' summary')!.textContent)).toEqual(['Reasoning', 'Reasoning', 'Thought for 1 second']);
  });

  test('steps sit above its words, in order', async () => {
    await render(<ChatMessage id="s" steps={[{ id: '1', label: 'Read the order', status: 'done' }]}>Answer</ChatMessage>);
    const m = document.getElementById('s')!;
    expect(!!(find(m, /^Read the order/)!.compareDocumentPosition(find(m, 'Answer')!) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
  });

  test('its new words come from the labels', async () => {
    await render(<SerupaProvider labels={idLabels}><ChatMessage id="i" thinking reasoning="x" reasoningTime={3} steps={[{ id: '1', label: 'Cari', status: 'running' }]} /></SerupaProvider>);
    await expect.element(page.getByRole('progressbar', { name: 'Berpikir…' })).toBeInTheDocument();
    const m = document.getElementById('i')!;
    expect([m.querySelector('summary')!.textContent, m.querySelector('li')!.textContent]).toEqual(['Berpikir selama 3 detik', 'Cari, Berjalan']);
  });

  test('reasoning and a done step read 4.5:1 in all six themes', async () => {
    await render(<ChatMessage id="c" reasoning="Why" reasoningTime={2} steps={[{ id: '1', label: 'Step', status: 'done' }]}>A</ChatMessage>);
    const m = document.getElementById('c')!;
    m.querySelector('details')!.open = true;
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      const pg = css(document.body).backgroundColor;
      for (const el of [m.querySelector('summary')!, find(m, 'Why')!, find(m, /^Step/)!]) expect(contrast(css(el).color, pg), th + ' ' + el.textContent).toBeGreaterThanOrEqual(4.5);
      expect(contrast(css(m.querySelector('li svg')).color, pg), th + ' done icon').toBeGreaterThanOrEqual(3);
    }
    document.documentElement.removeAttribute('data-theme');
  });
});

describe('ChatSteps', () => {
  test('a list of steps, each saying its state in words, with its detail', async () => {
    await render(<ChatSteps steps={[{ id: 'a', label: 'Search', status: 'done', detail: '3 results' }, { id: 'b', label: 'Read', status: 'running' }, { id: 'c', label: 'Write', status: 'failed' }]} />);
    const items = [...document.querySelectorAll('ol li')];
    expect(items.map((li) => li.textContent)).toEqual(['Search, Done3 results', 'Read, In progress', 'Write, Failed']);
    expect(items.map((li) => li.querySelector('svg, [role=status], .dk-loader') != null)).toEqual([true, true, true]);
  });

  test('no steps draws nothing', async () => {
    const { container } = await render(<ChatSteps steps={[]} />);
    expect(container.querySelector('ol')?.children.length ?? 0).toBe(0);
  });
});

describe('ChatDivider', () => {
  test('a date reads "Today", "Yesterday" or the date in the locale\'s words; children replace it', async () => {
    const day = 86_400_000;
    await render(<SerupaProvider locale="en-US"><ChatDivider id="a" date={new Date()} /><ChatDivider id="b" date={Date.now() - day} /><ChatDivider id="c" date={new Date(2026, 0, 5)} /><ChatDivider id="d">New messages</ChatDivider></SerupaProvider>);
    expect(['a', 'b', 'c', 'd'].map((i) => document.getElementById(i)!.textContent)).toEqual(['Today', 'Yesterday', 'Jan 5, 2026', 'New messages']);
  });

  test('server-rendered on another day than the visitor\'s: no mismatch, and "Today" is the visitor\'s today', async () => {
    const { renderToString } = await import('react-dom/server');
    const { hydrateRoot } = await import('react-dom/client');
    const { flushSync } = await import('react-dom');
    const sent = new Date(2026, 10, 8, 4, 30);   // this morning, for the visitor
    const ui = <SerupaProvider locale="en-US"><ChatDivider id="srv" date={sent} /></SerupaProvider>;
    vi.useFakeTimers({ toFake: ['Date'] });
    const host = document.createElement('div');
    const errors: string[] = [], logError = console.error;
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      vi.setSystemTime(new Date(2026, 10, 9, 1, 0));   // the server is a day on: it would have said "Yesterday"
      host.innerHTML = renderToString(ui);
      document.body.appendChild(host);
      vi.setSystemTime(new Date(2026, 10, 8, 5, 0));
      console.error = (...a: unknown[]) => { errors.push(a.map(String).join(' ')); };
      flushSync(() => { root = hydrateRoot(host, ui, { onRecoverableError: (e) => errors.push(String(e)) }); });
      await new Promise((r) => setTimeout(r, 30));
    } finally { console.error = logError; vi.useRealTimers(); }
    try {
      expect([errors, document.getElementById('srv')!.textContent]).toEqual([[], 'Today']);
    } finally { root?.unmount(); host.remove(); }
  });

  // The clock runs on from a second before midnight (only Date is faked, so the component's own timer is real).
  async function atMidnight(day: Date, id: string) {
    vi.useFakeTimers({ toFake: ['Date'], shouldAdvanceTime: true });
    vi.setSystemTime(new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59));
    const r = await render(<SerupaProvider locale="en-US"><ChatDivider id={id} date={new Date(day.getFullYear(), day.getMonth(), day.getDate(), 9, 0)} /></SerupaProvider>);
    return r;
  }
  test('"Today" becomes "Yesterday" at midnight, with no other render', async () => {
    try {
      await atMidnight(new Date(2026, 10, 8), 'mid');
      expect(document.getElementById('mid')!.textContent).toBe('Today');
      await expect.poll(() => document.getElementById('mid')!.textContent, { timeout: 4000 }).toBe('Yesterday');
    } finally { vi.useRealTimers(); }
  });

  test('across a clock change (Europe/London), "Today" turns at midnight, not an hour late', async () => {
    const session = server.browser === 'chromium' ? (cdp() as unknown as { send: (m: string, p?: object) => Promise<unknown> }) : null;
    if (!session) return;
    await session.send('Emulation.setTimezoneOverride', { timezoneId: 'Europe/London' });
    try {
      // 29 March 2026 has 23 hours (clocks forward at 1am): today's start plus 24 hours is 1am on the 30th.
      const { unmount } = await atMidnight(new Date(2026, 2, 29), 'dst');
      expect(document.getElementById('dst')!.textContent).toBe('Today');
      await expect.poll(() => document.getElementById('dst')!.textContent, { timeout: 4000 }).toBe('Yesterday');
      await unmount();
    } finally {
      vi.useRealTimers();
      await session.send('Emulation.setTimezoneOverride', { timezoneId: '' });
    }
  });
});

describe('ChatComposer', () => {
  test('a field named "Message"; Enter sends the text and empties it, keeping focus there', async () => {
    const sent: string[] = [];
    await render(<ChatComposer onSend={(t) => sent.push(t)} />);
    const field = page.getByRole('textbox', { name: 'Message' });
    await userEvent.click(field);
    await userEvent.keyboard('Hello{Enter}');
    expect(sent).toEqual(['Hello']);
    await expect.element(field).toHaveValue('');
    expect(document.activeElement).toBe(field.element());
  });

  test('Shift+Enter starts a new line; the send button sends it all', async () => {
    const sent: string[] = [];
    await render(<ChatComposer onSend={(t) => sent.push(t)} />);
    await userEvent.click(page.getByRole('textbox', { name: 'Message' }));
    await userEvent.keyboard('One{Shift>}{Enter}{/Shift}Two');
    await userEvent.click(page.getByRole('button', { name: 'Send' }));
    expect(sent).toEqual(['One\nTwo']);
  });

  test('an empty or blank field sends nothing, and the send button says it is unavailable', async () => {
    const sent: string[] = [];
    await render(<ChatComposer onSend={(t) => sent.push(t)} />);
    await expect.element(page.getByRole('button', { name: 'Send' })).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(page.getByRole('textbox', { name: 'Message' }));
    await userEvent.keyboard('   {Enter}');
    expect(sent).toEqual([]);
  });

  test('Enter while an input method composes doesn\'t send', async () => {
    const sent: string[] = [];
    await render(<ChatComposer defaultValue="にほん" onSend={(t) => sent.push(t)} />);
    const field = page.getByRole('textbox', { name: 'Message' }).element();
    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true, cancelable: true }));
    expect(sent).toEqual([]);
  });

  test('controlled: value and onValueChange; the app empties it', async () => {
    const changes: string[] = [];
    function C() { const [v, setV] = React.useState('Hi'); return <ChatComposer value={v} onValueChange={(x) => { changes.push(x); setV(x); }} onSend={() => setV('')} />; }
    await render(<C />);
    await userEvent.click(page.getByRole('textbox', { name: 'Message' }));
    await userEvent.keyboard('!');
    expect(changes).toEqual(['Hi!']);
    await userEvent.keyboard('{Enter}');
    await expect.element(page.getByRole('textbox', { name: 'Message' })).toHaveValue('');
  });

  test('streaming: a Stop button in place of Send calls onStop, and Enter doesn\'t send', async () => {
    let stops = 0; const sent: string[] = [];
    await render(<ChatComposer streaming defaultValue="Next" onStop={() => stops++} onSend={(t) => sent.push(t)} />);
    expect(document.querySelector('button[type=submit]')).toBe(null);
    await userEvent.click(page.getByRole('button', { name: 'Stop' }));
    await userEvent.click(page.getByRole('textbox', { name: 'Message' }));
    await userEvent.keyboard('{Enter}');
    expect([stops, sent]).toEqual([1, []]);
  });

  test('disabled turns the field and button off; aria-label renames the field', async () => {
    await render(<ChatComposer disabled aria-label="Reply to Rina" />);
    await expect.element(page.getByRole('textbox', { name: 'Reply to Rina' })).toBeDisabled();
    await expect.element(page.getByRole('button', { name: 'Send' })).toBeDisabled();
  });

  test('attachments sit above the field, actions before the send button', async () => {
    await render(<ChatComposer attachments={<span id="att">a.pdf</span>} actions={<button id="act">Attach</button>} />);
    const att = document.getElementById('att')!, act = document.getElementById('act')!, send = page.getByRole('button', { name: 'Send' }).element();
    expect(att.getBoundingClientRect().bottom).toBeLessThanOrEqual(page.getByRole('textbox').element().getBoundingClientRect().top);
    expect(act.compareDocumentPosition(send) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

describe('Chat: watching messages grow (GR240)', () => {
  function Stream({ api }: { api: { set?: (n: number, last: string) => void } }) {
    const [state, setState] = React.useState({ n: 30, last: 'Thinking' });
    api.set = (n, last) => setState({ n, last });
    return <div style={{ height: '300px', display: 'flex', flexDirection: 'column' }}><Chat aria-label="Support" style={{ flex: 'auto' }}>
      {msgs(0, state.n)}<ChatMessage key={'reply' + state.n} author="Assistant" streaming>{state.last}</ChatMessage>
    </Chat></div>;
  }

  test('one ResizeObserver for the log: a streamed token observes nothing again, and a message added later is watched', async () => {
    const proto = ResizeObserver.prototype, realObserve = proto.observe;
    let observed = 0;
    proto.observe = function (this: ResizeObserver, ...a: Parameters<ResizeObserver['observe']>) { observed++; return realObserve.apply(this, a); };
    try {
      const api: { set?: (n: number, last: string) => void } = {};
      await render(<Stream api={api} />);
      await expect.poll(() => atBottom(log())).toBe(true);
      const atMount = observed;
      for (let i = 1; i <= 20; i++) { api.set!(30, 'Token '.repeat(i)); await new Promise((r) => requestAnimationFrame(r)); }
      expect(observed - atMount).toBe(0);
      // A message that arrives later is watched too: when it grows, the reader stays at the bottom.
      api.set!(31, 'Thinking');
      await expect.poll(() => observed - atMount).toBeGreaterThan(0);
      await expect.poll(() => atBottom(log())).toBe(true);
      api.set!(31, 'A long answer that wraps over several lines in this narrow log. '.repeat(8));
      await expect.poll(() => atBottom(log())).toBe(true);
    } finally { proto.observe = realObserve; }
  });
});
