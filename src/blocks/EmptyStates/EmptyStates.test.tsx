import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
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

  test('failed to load: Try again runs, the reference is shown, and it is said once', async () => {
    const retry = vi.fn();
    await render(<EmptyLoadFailed onRetry={retry} reference="7F3A-91" />);
    await expect.poll(said).toContain("Couldn't load this");
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
