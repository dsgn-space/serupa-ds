import * as React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { Landing } from './Landing';

// Landing page: one h1 that says what it does, each section a named region, the call to action the same words and
// the same action everywhere, decorative icons, and the plans and questions from their blocks.
describe('Patterns/Landing page', () => {
  test('a skip link first, one main and h1, and each section a region named by its heading, in the order of the page', async () => {
    await render(<Landing headline="Plan the work" />);
    expect([document.querySelectorAll('main').length, document.querySelectorAll('h1').length, document.querySelector('h1')?.textContent]).toEqual([1, 1, 'Plan the work']);
    const regions = [...document.querySelectorAll('main section[aria-labelledby]')].filter((s) => !s.parentElement?.closest('section'))
      .map((s) => document.getElementById(s.getAttribute('aria-labelledby')!)?.textContent);
    expect(regions).toEqual(['Plan the work', 'What it does', 'Pricing', 'Questions', 'Try it with your team']);
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement?.getAttribute('href')).toBe('#main');
    expect(document.querySelector('footer')).not.toBeNull();
  });

  test('the call to action is the same words everywhere, and every one of them starts the same thing', async () => {
    const onStart = vi.fn();
    await render(<Landing action="Try it free" onStart={onStart} />);
    const buttons = page.getByRole('button', { name: 'Try it free', exact: true }).elements();
    expect(buttons.length).toBe(3);
    for (const b of buttons) await userEvent.click(b);
    expect(onStart).toHaveBeenCalledTimes(3);
    // The second button only moves down the page, so it's a link, not another call to action.
    expect(page.getByRole('link', { name: 'See what it does' }).element().getAttribute('href')).toBe('#features');
  });

  test('each feature is a heading with its sentence, and its icon isn\'t read out', async () => {
    await render(<Landing />);
    const features = page.getByRole('region', { name: 'What it does' });
    expect(features.getByRole('heading', { level: 3 }).elements().map((h) => h.textContent)).toEqual(['Fast on any connection', 'Works offline', 'Made for teams', 'Private by default']);
    for (const svg of features.element().querySelectorAll('svg')) expect(svg.closest('[aria-hidden="true"]') ?? svg.getAttribute('aria-hidden')).toBeTruthy();
  });

  test('choosing a plan says which plan and period', async () => {
    const onChoose = vi.fn();
    await render(<Landing onChoose={onChoose} />);
    await userEvent.click(page.getByRole('button', { name: 'Choose Team' }));
    expect(onChoose).toHaveBeenCalledWith('team', 'monthly');
  });

  test('the header\'s links lead to the sections, which are there to land on', async () => {
    await render(<Landing />);
    const nav = [...document.querySelectorAll('header nav a, [data-component="navbar"] nav a')].map((a) => a.getAttribute('href'));
    expect(nav).toEqual(expect.arrayContaining(['#features', '#pricing', '#questions']));
    for (const id of ['features', 'pricing', 'questions']) expect(document.getElementById(id)).not.toBeNull();
  });

  test('on a phone it is one column, with nothing wider than the screen', async () => {
    await page.viewport(320, 640);
    await render(<Landing />);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(320);
    const items = [...page.getByRole('region', { name: 'What it does' }).element().querySelectorAll('li')].map((li) => li.getBoundingClientRect().left);
    expect(new Set(items.map(Math.round)).size).toBe(1);
    await page.viewport(1280, 800);
  });

  test('the header brand is the Logo inside a link named for the product', async () => {
    const screen = await render(<Landing />);
    const home = screen.getByRole('link', { name: 'Acme' });
    expect([home.element().getAttribute('href'), home.element().querySelector('img')?.getAttribute('alt')]).toEqual(['#top', '']);
  });

  test('logo={null}: the header brand is the product’s name as text', async () => {
    const screen = await render(<Landing product="Orbit" logo={null} />);
    expect(screen.getByRole('link', { name: 'Orbit' }).element().querySelector('img')).toBeNull();
  });
});
