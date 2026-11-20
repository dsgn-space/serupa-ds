import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { Heading } from '../../components/Heading/Heading';
import { PermissionRequest, type PermissionAnswer } from './PermissionRequest';
import { SerupaProvider } from '../../internal/provider';

const said = () => [...document.querySelectorAll('[aria-live="polite"]')].map((e) => e.textContent || '').join(' ');
const card = () => document.querySelector('section[aria-labelledby="camera-title"]') as HTMLElement;

// Permission request (HIG5): asked at the moment of use, why first, one button, a no that isn't a dead end.
describe('Patterns/Permission request', () => {
  test('each section heading is the size every pattern gives one (an h2 at lg), set by Heading, not a text class', async () => {
    await render(<PermissionRequest />);
    await render(<div id="probe-lg"><Heading level={2} size="lg">Probe</Heading></div>);
    const look = (h: Element) => { const c = getComputedStyle(h); return [c.fontSize, c.lineHeight, c.letterSpacing].join(' '); };
    const want = look(document.querySelector('#probe-lg h2')!);
    const h2s = [...document.querySelectorAll('h2')].filter((h) => !h.closest('#probe-lg'));
    expect(h2s.length).toBeGreaterThan(0);
    expect(h2s.map(look)).toEqual(h2s.map(() => want));
  });

  test('the call\u2019s time is in the reader\u2019s clock: 3:00 – 3:30 PM in en-US, 15:00–15:30 in en-GB', async () => {
    await render(<><div id="us"><SerupaProvider locale="en-US"><PermissionRequest /></SerupaProvider></div><div id="gb"><SerupaProvider locale="en-GB"><PermissionRequest /></SerupaProvider></div></>);
    expect([document.getElementById('us')!.textContent, document.getElementById('gb')!.textContent]).toEqual([
      expect.stringContaining('Today, 3:00 – 3:30 PM · 6 people invited'), expect.stringContaining('Today, 15:00–15:30 · 6 people invited')]);
  });

  test('nothing is asked on load, the card says why, and the page works without the camera', async () => {
    const request = vi.fn(() => Promise.resolve<PermissionAnswer>('granted'));
    const screen = await render(<PermissionRequest request={request} />);
    expect([document.querySelectorAll('main').length, document.querySelectorAll('h1').length]).toEqual([1, 1]);
    expect(request).not.toHaveBeenCalled();
    expect(card().textContent).toContain('so others in the call can see you');
    expect(card().querySelectorAll('button').length).toBe(1);
    await screen.getByRole('button', { name: 'Join with audio only' }).click();
    await expect.poll(said).toContain('You joined the call.');
    expect(request).not.toHaveBeenCalled();
  });

  test('the one button asks, says it is waiting, then says the answer, and focus goes on to Join, not lost with the button', async () => {
    let answer!: (a: PermissionAnswer) => void;
    const onAnswer = vi.fn();
    const screen = await render(<PermissionRequest request={() => new Promise((r) => { answer = r; })} onAnswer={onAnswer} />);
    const button = screen.getByRole('button', { name: 'Turn on camera' });
    await button.click();
    await expect.poll(said).toContain('Waiting for your browser…');
    answer('granted');
    await expect.element(screen.getByText('Your camera is on. Others see you when you join.')).toBeInTheDocument();
    await expect.poll(said).toContain('Camera on.');
    expect(onAnswer).toHaveBeenCalledWith('granted');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Join call' }).element());
  });

  test('a no says where to change it, offers Try again, and the call still goes ahead', async () => {
    const request = vi.fn(() => Promise.resolve<PermissionAnswer>('denied'));
    const screen = await render(<PermissionRequest request={request} />);
    await screen.getByRole('button', { name: 'Turn on camera' }).click();
    await expect.element(screen.getByText('Your browser is blocking the camera')).toBeInTheDocument();
    await expect.poll(said).toContain('Camera blocked by the browser.');
    expect(card().textContent).toContain('site settings');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Join with audio only' }).element());
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(request).toHaveBeenCalledTimes(2);
    await screen.getByRole('button', { name: 'Join with audio only' }).click();
    await expect.poll(said).toContain('You joined the call.');
  });

  test('a request that throws counts as a no, and Enter on the button asks too', async () => {
    const screen = await render(<PermissionRequest request={() => Promise.reject(new Error('NotAllowedError'))} />);
    (screen.getByRole('button', { name: 'Turn on camera' }).element() as HTMLElement).focus();
    await userEvent.keyboard('{Enter}');
    await expect.element(screen.getByText('Your browser is blocking the camera')).toBeInTheDocument();
  });

  test('no camera in this browser is information, not an error, and there is nothing to press for it', async () => {
    const screen = await render(<PermissionRequest initial="unsupported" />);
    await expect.element(screen.getByText('No camera in this browser')).toBeInTheDocument();
    expect(card().querySelector('[role="alert"]')).toBeNull();
    expect(card().querySelectorAll('button').length).toBe(0);
    expect(screen.getByRole('button', { name: 'Join with audio only' }).element()).toBeTruthy();
  });

  test('the default stand-in says yes after a moment', async () => {
    const screen = await render(<PermissionRequest />);
    await screen.getByRole('button', { name: 'Turn on camera' }).click();
    await expect.element(screen.getByText('Your camera is on. Others see you when you join.')).toBeInTheDocument();
  });
});
