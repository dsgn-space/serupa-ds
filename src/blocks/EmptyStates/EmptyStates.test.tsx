import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { THEMES, contrast } from '../../../tools/test/vitest/helpers';
import { EmptyFirstRun, EmptyLoadFailed, EmptyNoAccess, EmptyNoResults } from './EmptyStates';

// Text read out by the shared polite announcer, wherever it lives on the page.
const said = () => [...document.querySelectorAll('[aria-live="polite"]')].map((e) => e.textContent || '').join(' ');

// Empty states (BL5): each says what happened in words and offers its next step as a real control; only the ones
// that appear after an action are said.
describe('Blocks/Empty states', () => {
  test('first run: a heading, the first step as a button and the guide as a link, and nothing is announced', async () => {
    const onCreate = vi.fn();
    await render(<EmptyFirstRun title="No projects yet" createLabel="New project" onCreate={onCreate} learnHref="#guide" headingLevel={2} />);
    await expect.element(page.getByRole('heading', { level: 2, name: 'No projects yet' })).toBeVisible();
    await userEvent.click(page.getByRole('button', { name: 'New project' }));
    expect(onCreate).toHaveBeenCalledTimes(1);
    await expect.element(page.getByRole('link', { name: 'How it works' })).toHaveAttribute('href', '#guide');
    expect(said()).not.toContain('No projects yet');
  });

  test('no results: the query in the title, a suggestion and Clear filters that work, and it is said once', async () => {
    const pick = vi.fn(); const clear = vi.fn();
    await render(<EmptyNoResults query="websit" suggestions={['website']} onSuggestion={pick} onClearFilters={clear} />);
    await expect.element(page.getByRole('heading', { name: 'No results for “websit”' })).toBeVisible();
    await expect.poll(said).toContain('No results for “websit”');
    await userEvent.click(page.getByRole('button', { name: /website/ }));
    expect(pick).toHaveBeenCalledWith('website');
    await userEvent.click(page.getByRole('button', { name: 'Clear filters' }));
    expect(clear).toHaveBeenCalledTimes(1);
  });

  test('no access: Request access sends once, then says it was sent and keeps focus', async () => {
    const send = vi.fn(() => Promise.resolve());
    await render(<EmptyNoAccess description="Ana Putri owns this project." onRequest={send} backHref="/projects" />);
    const button = page.getByRole('button', { name: 'Request access' });
    await userEvent.click(button);
    await expect.poll(() => document.activeElement?.textContent || '').toContain('Request sent');
    await userEvent.keyboard('{Enter}');   // pressed again from the keyboard: it's aria-disabled, so nothing is sent
    expect(send).toHaveBeenCalledTimes(1);
    expect(document.activeElement!.getAttribute('aria-disabled')).toBe('true');
    await expect.element(page.getByRole('link', { name: 'Go back' })).toHaveAttribute('href', '/projects');
  });

  test('no access: a request that fails says so in words and once aloud, never "Request sent", and can be sent again (GR136)', async () => {
    const send = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined);
    const screen = await render(<EmptyNoAccess description="Ana Putri owns this project." onRequest={send} />);
    await userEvent.click(page.getByRole('button', { name: 'Request access' }));
    // In the block itself: the announcer outside it says the same words, and a page query finds both.
    await expect.element(page.elementLocator(screen.container).getByText('Couldn’t send the request. Try again.')).toBeVisible();
    await expect.poll(said).toContain('Couldn’t send the request');
    expect(document.body.textContent).not.toContain('Request sent');
    await userEvent.click(page.getByRole('button', { name: 'Request access' }));
    const shown = () => document.querySelector('[data-component="empty-state"]')!.textContent || '';   // not the announcer
    await expect.poll(shown).toContain('Request sent');
    expect(shown()).not.toContain('Couldn’t send the request');
    expect(send).toHaveBeenCalledTimes(2);
  });

  test('no access: the failure text is 4.5:1 on the page in all six themes (GR140)', async () => {
    const view = await render(<EmptyNoAccess description="Ana Putri owns this project." onRequest={() => Promise.reject(new Error('offline'))} />);
    await userEvent.click(page.getByRole('button', { name: 'Request access' }));
    const text = view.locator.getByText('Couldn’t send the request. Try again.');
    await expect.element(text).toBeVisible();
    const low: string[] = [];
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      const r = contrast(getComputedStyle(text.element()).color, 'var(--surface)');
      if (r < 4.5) low.push(`${th} ${r.toFixed(2)}`);
    }
    document.documentElement.setAttribute('data-theme', 'blue-light');
    expect(low).toEqual([]);
  });

  test('failed to load: Try again runs, the reference is shown, and it is said once', async () => {
    const retry = vi.fn();
    await render(<EmptyLoadFailed onRetry={retry} reference="7F3A-91" />);
    await expect.poll(said).toContain('Couldn’t load this');
    expect(document.body.textContent).toContain('Reference: 7F3A-91');
    await userEvent.click(page.getByRole('button', { name: 'Try again' }));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  test('every word can be given in the page language', async () => {
    await render(<>
      <EmptyNoResults query="mars" title={(q) => `Keine Treffer für „${q}“`} description="Prüfe die Schreibweise." />
      <EmptyNoAccess title="Kein Zugriff" description="Ana Putri ist die Eigentümerin." onRequest={() => Promise.resolve()} requestLabel="Zugriff anfragen" backHref="/" backLabel="Zurück" />
      <EmptyLoadFailed title="Konnte nicht laden" description="Prüfe die Verbindung." onRetry={() => {}} retryLabel="Erneut versuchen" reference="X1" referenceLabel="Referenz" />
    </>);
    await expect.element(page.getByRole('heading', { name: 'Keine Treffer für „mars“' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Zugriff anfragen' })).toBeVisible();
    await expect.element(page.getByRole('link', { name: 'Zurück' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Erneut versuchen' })).toBeVisible();
    expect(document.body.textContent).toContain('Referenz: X1');
  });
});
