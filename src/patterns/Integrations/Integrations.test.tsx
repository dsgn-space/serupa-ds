import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { Integrations, matchIntegrations, type Integration } from './Integrations';

const active = () => document.activeElement as HTMLElement;
const count = () => document.querySelector('p[role="status"]')?.textContent;
const toasted = (text: string) => [...document.querySelectorAll('li')].some((e) => e.textContent?.includes(text) && e.querySelector('button[aria-label="Dismiss"]'));
const h2s = () => [...document.querySelectorAll('section > h2')].map((h) => h.textContent);

// Integrations: two lists under their own headings, each button named with its app, a search said as a count, a
// connect that moves the app and its focus, and a disconnect that asks first and survives a failure.
describe('Patterns/Integrations', () => {
  test('search matches every word against the name and what it does', () => {
    const apps: Integration[] = [
      { id: 'a', name: 'Google Drive', icon: 'folder', description: 'Attaches files to projects.' },
      { id: 'b', name: 'Slack', icon: 'forum', description: 'Posts messages.' },
    ];
    expect(matchIntegrations(apps, 'FILES').map((a) => a.id)).toEqual(['a']);
    expect(matchIntegrations(apps, 'google slack')).toEqual([]);
    expect(matchIntegrations(apps, ' ').length).toBe(2);
  });

  test('one main and h1, two lists with counts, each button named with its app, connected said in words', async () => {
    const screen = await render(<Integrations />);
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Integrations']);
    expect(h2s()).toEqual(['Connected (2)', 'Available (4)']);
    expect(screen.getByRole('button', { name: /^(Connect|Disconnect) / }).elements().map((e) => e.getAttribute('aria-label')))
      .toEqual(['Disconnect Slack', 'Disconnect GitHub', 'Connect Google Calendar', 'Connect Google Drive', 'Connect Zapier', 'Connect Stripe']);
    expect(screen.getByText('Connected', { exact: true }).elements()).toHaveLength(2);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
  });

  test('the search count is a status; no matches says so and Clear filters brings them back', async () => {
    const screen = await render(<Integrations />);
    await screen.getByRole('searchbox', { name: 'Search integrations' }).fill('files');
    await expect.poll(count).toBe('1 app');
    expect(h2s()).toEqual(['Connected (0)', 'Available (1)']);
    await expect.element(screen.getByText('None of these are connected.')).toBeVisible();
    await screen.getByRole('searchbox', { name: 'Search integrations' }).fill('fax');
    await expect.element(screen.getByText('No apps match “fax”')).toBeVisible();
    await screen.getByRole('button', { name: /^Clear filters/ }).click();
    await expect.poll(count).toBe('6 apps');
    await screen.getByRole('searchbox', { name: 'Search integrations' }).fill('slack');
    await screen.getByRole('button', { name: 'Clear the search' }).click();
    await expect.poll(count).toBe('6 apps');
  });

  test('a connect that fails says so on its card; one that works moves the app, says so and focuses its Disconnect', async () => {
    let fail = true;
    const onConnect = vi.fn(() => (fail ? Promise.reject(new Error('denied')) : Promise.resolve()));
    const screen = await render(<Integrations onConnect={onConnect} />);
    await screen.getByRole('button', { name: 'Connect Zapier' }).click();
    await expect.element(screen.getByText('Couldn’t connect Zapier. Check that you allowed it on Zapier’s page, then try again.')).toBeVisible();
    fail = false;
    await screen.getByRole('button', { name: 'Connect Zapier' }).click();
    expect(onConnect).toHaveBeenLastCalledWith('zapier');
    await expect.poll(() => active().getAttribute('aria-label')).toBe('Disconnect Zapier');
    expect(h2s()).toEqual(['Connected (3)', 'Available (3)']);
    await expect.poll(() => toasted('Connected Zapier')).toBe(true);
  });

  test('disconnect asks first and says what stops; Keep it and Escape keep it; a failure says it\'s still connected; then it moves', async () => {
    let fail = true;
    const onDisconnect = vi.fn(() => (fail ? Promise.reject(new Error('down')) : Promise.resolve()));
    const screen = await render(<Integrations onDisconnect={onDisconnect} />);
    await screen.getByRole('button', { name: 'Disconnect Slack' }).click();
    await expect.element(screen.getByRole('alertdialog', { name: 'Disconnect Slack?' })).toBeVisible();
    await expect.element(screen.getByText('Messages stop going to your Slack channels. You can connect it again at any time.')).toBeVisible();
    await screen.getByRole('button', { name: 'Keep it' }).click();
    await screen.getByRole('button', { name: 'Disconnect Slack' }).click();
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => document.querySelector('dialog[open]')).toBeNull();
    expect(onDisconnect).not.toHaveBeenCalled();
    await screen.getByRole('button', { name: 'Disconnect Slack' }).click();
    await screen.getByRole('button', { name: 'Disconnect', exact: true }).click();
    await expect.element(screen.getByText('Couldn’t disconnect Slack. It’s still connected. Try again.')).toBeVisible();
    fail = false;
    await screen.getByRole('button', { name: 'Disconnect', exact: true }).click();
    expect(onDisconnect).toHaveBeenLastCalledWith('slack');
    await expect.poll(() => active().getAttribute('aria-label')).toBe('Connect Slack');
    expect(h2s()).toEqual(['Connected (1)', 'Available (5)']);
    await expect.poll(() => toasted('Disconnected Slack')).toBe(true);
  });

  test('an app without its own words says what stops in general', async () => {
    const screen = await render(<Integrations apps={[{ id: 'x', name: 'Xero', icon: 'receipt', description: 'Sends invoices.', connected: true }]} />);
    await screen.getByRole('button', { name: 'Disconnect Xero' }).click();
    await expect.element(screen.getByText('It stops working with this workspace. You can connect it again at any time.')).toBeVisible();
    expect(h2s()).toEqual(['Connected (1)', 'Available (0)']);
    await expect.element(screen.getByText('Every one of these is connected.')).toBeInTheDocument();
  });

  test('while the apps load, the list is busy and named once', async () => {
    await render(<Integrations loading />);
    expect(document.querySelector('ul[aria-busy="true"]')).not.toBeNull();
    expect(document.querySelector('p[role="status"]')).toBeNull();
  });

  test('a failed load says so, and Try again calls onRetry', async () => {
    const onRetry = vi.fn();
    const screen = await render(<Integrations loadFailed onRetry={onRetry} />);
    await expect.element(screen.getByText('Couldn’t load your integrations')).toBeVisible();
    await screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalled();
  });
});
