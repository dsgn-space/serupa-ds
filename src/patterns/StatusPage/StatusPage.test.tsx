import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { StatusPage, overallState, serviceDays } from './StatusPage';
import { SerupaProvider } from '../../internal/provider';

const active = () => document.activeElement as HTMLElement;
const subscribed = () => document.getElementById('status-subscribed')!.textContent;

// Status page: the overall state in words first, each service a heading with its state in a word and its days named,
// incidents as articles with their updates in order, and subscribing that says what's wrong or that it worked.
describe('Patterns/Status page', () => {
  test('days for a service, and the worst state', () => {
    const days = serviceDays('2026-03-12', 3, { 0: { state: 'down', note: 'Out' } });
    expect(days.map((d) => [(d.date as Date).getDate(), d.state])).toEqual([[10, 'up'], [11, 'up'], [12, 'down']]);
    expect(days[2]!.note).toBe('Out');
    const s = (state: 'up' | 'degraded' | 'down') => ({ id: state, name: state, state, days: [] });
    expect([overallState([s('up')]), overallState([s('up'), s('degraded')]), overallState([s('degraded'), s('down')])]).toEqual(['up', 'degraded', 'down']);
  });

  test('one main and h1, the skip link first, the state in words first, and each service named with its state', async () => {
    const screen = await render(<StatusPage />);
    await userEvent.tab();
    expect(active().getAttribute('href')).toBe('#main');
    expect([document.querySelectorAll('main').length, document.querySelector('h1')?.textContent]).toEqual([1, 'Acme status']);
    expect(document.querySelector('main [role="alert"], main [role="status"]')?.textContent).toMatch(/^Some things are slow or partly working/);
    expect(screen.getByRole('heading', { level: 3, name: 'Webhooks' }).element().closest('li')?.textContent).toContain('Slow or partly working');
    expect(screen.getByRole('article', { name: 'Webhooks delivered late' }).element().querySelectorAll('ol li')).toHaveLength(3);
    expect(screen.getByRole('article', { name: 'API down for 38 minutes' }).elements()).toHaveLength(1);
  });

  test('all working, with nothing open', async () => {
    await render(<StatusPage incidents={[]} services={[{ id: 'a', name: 'API', state: 'up', days: serviceDays('2026-03-12', 30) }]} />);
    expect(document.body.textContent).toContain('Everything is working');
    expect(document.body.textContent).toContain('No open incidents.');
    expect(document.body.textContent).not.toContain('Past incidents');
  });

  test('an outage says so, and two open incidents are counted', async () => {
    const inc = (id: string) => ({ id, title: id, services: ['a'], resolved: false, updates: [{ at: '2026-03-12T10:00', status: 'Investigating', text: 'x' }] });
    await render(<StatusPage incidents={[inc('one'), inc('two')]} services={[{ id: 'a', name: 'API', state: 'down', days: serviceDays('2026-03-12', 30) }]} />);
    expect(document.body.textContent).toContain('Some things aren’t working');
    expect(document.body.textContent).toContain('2 incidents are open');
  });

  test('subscribing: a wrong email says so and keeps focus there; a failure says so; then it says it worked', async () => {
    const onSubscribe = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined);
    const screen = await render(<StatusPage onSubscribe={onSubscribe} />);
    await screen.getByRole('button', { name: 'Subscribe' }).click();
    expect(document.body.textContent).toContain('Enter your email address.');
    expect(active().id).toBe('status-email');
    await screen.getByRole('textbox', { name: /^Email/ }).fill('ana@');
    await screen.getByRole('button', { name: 'Subscribe' }).click();
    expect(document.body.textContent).toContain('Enter an email address like name@example.com.');
    await screen.getByRole('textbox', { name: /^Email/ }).fill(' ana@example.com ');
    await screen.getByRole('button', { name: 'Subscribe' }).click();
    await expect.poll(() => document.body.textContent).toContain('Couldn’t subscribe you.');
    await screen.getByRole('button', { name: 'Subscribe' }).click();
    await expect.poll(subscribed).toBe('Subscribed. Updates go to ana@example.com.');
    expect(onSubscribe).toHaveBeenLastCalledWith('ana@example.com');
  });

  test('counts follow the locale’s digits', async () => {
    const open = (id: string) => ({ id, title: `Incident ${id}`, services: ['api'], resolved: false, updates: [{ at: '2026-11-16T03:00:00Z', status: 'Investigating', text: 'Looking into it.' }] });
    await render(<SerupaProvider locale="ar-EG"><StatusPage incidents={[open('a'), open('b')]} /></SerupaProvider>);
    expect(document.body.textContent).toContain('٢ incidents are open');
  });
});
