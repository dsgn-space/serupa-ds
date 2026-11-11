import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { ErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary';
import { ErrorPage, type ErrorPageKind } from './ErrorPages';

const active = () => document.activeElement as HTMLElement;
const KINDS: ErrorPageKind[] = ['not-found', 'offline', 'server', 'no-access'];

// Error pages (PT7): each says what happened in its title and its h1, says what to do in words that don't blame,
// and leaves a way back, so no one is left at a dead end.
describe('Patterns/Error pages', () => {
  test('each page says what happened in the tab title and the h1, and puts the old title back when it goes', async () => {
    document.title = 'Before';
    const seen: string[][] = [];
    for (const kind of KINDS) {
      const r = await render(<ErrorPage kind={kind} onRetry={() => {}} />);
      seen.push([document.title, document.querySelector('h1')!.textContent]);
      await r.unmount();
      expect(document.title).toBe('Before');
    }
    expect(seen).toEqual([
      ['Page not found – Acme', 'Page not found'],
      ['You’re offline – Acme', 'You’re offline'],
      ['Something went wrong on our side – Acme', 'Something went wrong on our side'],
      ['You don’t have access to this page – Acme', 'You don’t have access to this page'],
    ]);
  });

  test('one main and one h1, then an h2 for what to do, and a way back on every page', async () => {
    for (const kind of KINDS) {
      const r = await render(<ErrorPage kind={kind} home="/start" onRetry={() => {}} />);
      const main = document.querySelector('main')!;
      expect([document.querySelectorAll('main').length, document.querySelectorAll('h1').length, main.querySelectorAll('h2').length]).toEqual([1, 1, 1]);
      const home = [...main.querySelectorAll('a')].find((a) => a.textContent === 'Go to the home page');
      expect(home?.getAttribute('href')).toBe('/start');
      await r.unmount();
    }
  });

  test('from the keyboard: the skip link first, then the header link home, then into main and its way back', async () => {
    await render(<ErrorPage kind="not-found" home="/start" />);
    await userEvent.tab();
    expect(active().textContent).toMatch(/skip/i);
    await userEvent.tab();
    expect([active().textContent, active().getAttribute('href')]).toEqual(['Acme', '/start']);
    await userEvent.tab();
    expect(active().textContent).toBe('Go to the home page');
    await userEvent.tab();
    expect(active().textContent).toBe('Go back');
  });

  test('offline: "Try again" calls onRetry, and the connection coming back is said in a status line without reloading', async () => {
    let tries = 0;
    const screen = await render(<ErrorPage kind="offline" onRetry={() => { tries++; }} />);
    const status = document.querySelector('main [role="status"]')!;
    expect(status.textContent).toBe('');
    window.dispatchEvent(new Event('online'));
    await expect.poll(() => status.textContent).toBe('You’re back online. Try again to load the page.');
    expect(tries).toBe(0);
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(tries).toBe(1);
    window.dispatchEvent(new Event('offline'));
    await expect.poll(() => status.textContent).toBe('');
  });

  test('server: it says it is not the person\'s fault, gives the reference, and as an ErrorBoundary fallback "Try again" resets it', async () => {
    let broken = true;
    function Page() { if (broken) throw new Error('boom'); return <main><h1>Dashboard</h1></main>; }
    const screen = await render(
      <ErrorBoundary fallback={({ reset }) => <ErrorPage kind="server" reference="ERR-1" onRetry={reset} />} onError={() => {}}>
        <Page />
      </ErrorBoundary>,
    );
    expect(document.querySelector('main')!.textContent).toContain('It isn’t something you did. If it keeps happening, contact support and give them this reference: ERR-1.');
    broken = false;
    await screen.getByRole('button', { name: 'Try again' }).click();
    await expect.poll(() => document.querySelector('h1')?.textContent).toBe('Dashboard');
  });
});
