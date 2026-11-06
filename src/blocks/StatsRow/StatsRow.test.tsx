import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { StatsRow, type Stat } from './StatsRow';

const STATS: Stat[] = [
  { label: 'Revenue', value: '€48,200', change: { amount: '12%', direction: 'up' }, trend: [1, 2, 3] },
  { label: 'Refunds', value: '€1,140', change: { amount: '8%', direction: 'up', good: false } },
  { label: 'Customers', value: '312', change: { amount: '4%', direction: 'down' } },
  { label: 'Average order', value: '€64', change: { amount: '0%', direction: 'flat' } },
];
const cards = () => [...document.querySelectorAll('section > ul > li')] as HTMLElement[];

// Stats row (BL2): each number's change is said in words, not by color alone, a list under a heading holds them, and
// loading is said once.
describe('Blocks/Stats row', () => {
  test('a list under its heading, each card reading label, value, then the change in words with the period', async () => {
    await render(<StatsRow title="This month" period="vs last month" stats={STATS} />);
    const section = document.querySelector('section')!;
    expect(section.getAttribute('aria-labelledby')).toBe(section.querySelector('h2')!.id);
    const want = [
      'Revenue€48,200Up 12%vs last month',
      'Refunds€1,140Up 8%vs last month',
      'Customers312Down 4%vs last month',
      'Average order€64No changevs last month',
    ];
    // Any card whose words don't read in that order (an icon's own text may sit before "Up").
    const texts = cards().map((li) => (li.textContent || '').replace(/arrow_upward|arrow_downward|remove/g, ''));
    expect(want.filter((w, i) => !texts[i].includes(w))).toEqual([]);
  });

  test('the tone follows whether the change is good: up is good unless the app says otherwise, flat is neutral', async () => {
    await render(<StatsRow title="This month" stats={STATS} />);
    const tones = cards().map((li) => li.querySelector('[data-tone]')?.getAttribute('data-tone'));
    expect(tones).toEqual(['success', 'danger', 'danger', 'neutral']);
  });

  test('a trend line is an image named by what it measures', async () => {
    await render(<StatsRow title="This month" stats={STATS} />);
    const img = cards()[0].querySelector('svg[role="img"]')!;
    expect(img.getAttribute('aria-label') ?? '').toContain('Revenue, last 3 periods');
  });

  test('loading: the list is busy, and only one skeleton is named, so "Loading" is said once', async () => {
    await render(<StatsRow title="This month" stats={[]} loading loadingCount={3} />);
    expect(document.querySelector('ul')!.getAttribute('aria-busy')).toBe('true');
    expect(cards().length).toBe(3);
    await expect.poll(() => [...document.querySelectorAll('ul [aria-label]')].map((e) => e.getAttribute('aria-label'))).toEqual(['Loading: This month']);
  });

  test('on a phone the cards stack in one column and nothing scrolls sideways', async () => {
    await page.viewport(360, 720);
    await render(<StatsRow title="This month" period="vs last month" stats={STATS} />);
    const lefts = new Set(cards().map((li) => Math.round(li.getBoundingClientRect().left)));
    expect([lefts.size, document.documentElement.scrollWidth <= 360]).toEqual([1, true]);
  });

  test('in another language every word comes from labels, and the title keeps its case (GR133)', async () => {
    const de = { up: (a: string) => `Gestiegen um ${a}`, down: (a: string) => `Gesunken um ${a}`, flat: 'Unverändert', loading: (t: string) => `${t} wird geladen`, trend: (l: string, n: number) => `${l}, letzte ${n} Zeiträume` };
    const screen = await render(<StatsRow title="Dieser Monat" stats={STATS} labels={de} />);
    const badges = [...document.querySelectorAll('[data-tone]')].map((b) => (b.textContent || '').replace(/arrow_upward|arrow_downward|remove/g, ''));
    expect(badges).toEqual(['Gestiegen um 12%', 'Gestiegen um 8%', 'Gesunken um 4%', 'Unverändert']);
    expect(document.querySelector('svg[role="img"]')!.getAttribute('aria-label') ?? '').toContain('Revenue, letzte 3 Zeiträume');
    await screen.rerender(<StatsRow title="Dieser Monat" stats={[]} labels={de} loading loadingCount={2} />);
    await expect.poll(() => [...document.querySelectorAll('ul [aria-label]')].map((e) => e.getAttribute('aria-label'))).toEqual(['Dieser Monat wird geladen']);
  });
});
