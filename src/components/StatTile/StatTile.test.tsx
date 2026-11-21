import * as React from 'react';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { THEMES, contrast, css } from '../../../tools/test/vitest/helpers';
import { StatTile } from './StatTile';
import { SerupaProvider } from '../../internal/provider';
import { labels as idLabels } from '../../labels/id';

const el = (id: string) => document.getElementById(id) as HTMLElement;
const part = (root: Element, name: string) => root.querySelector('.dk-stat-tile__' + name) as HTMLElement;
const badge = (root: Element) => root.querySelector('[data-component="badge"]') as HTMLElement;

describe('StatTile', () => {
  test('renders a card <div>; ref, className and other props reach it', async () => {
    const ref = React.createRef<HTMLElement>();
    await render(<StatTile id="x" ref={ref} className="extra" data-x="y" label="Revenue" value="€48,200" />);
    const e = el('x');
    expect([e.tagName, ref.current === e, e.classList.contains('dk-stat-tile'), e.classList.contains('extra'), e.dataset.x, e.dataset.component]).toEqual(['DIV', true, true, true, 'y', 'stat-tile']);
  });

  test('as="li" and as="article" change the element', async () => {
    await render(<ul><StatTile id="l" as="li" label="A" value="1" /></ul>);
    expect(el('l').tagName).toBe('LI');
    await render(<StatTile id="a" as="article" label="B" value="2" />);
    expect(el('a').tagName).toBe('ARTICLE');
  });

  test('reads in order: the label, the value, the change in words and the period', async () => {
    await render(<StatTile id="s" label="Revenue" value="€48,200" change={{ amount: '12%', direction: 'up' }} period="vs last month" />);
    expect(el('s').innerText.replace(/\s+/g, ' ').trim()).toBe('Revenue €48,200 Up 12% vs last month');
  });

  test('a rise is good news and a fall bad by default; good turns either round', async () => {
    const tones: string[] = [];
    for (const [i, change] of ([
      { amount: '1%', direction: 'up' }, { amount: '1%', direction: 'down' },
      { amount: '1%', direction: 'up', good: false }, { amount: '1%', direction: 'down', good: true }, { amount: '0', direction: 'flat' },
    ] as const).entries()) {
      await render(<StatTile id={'t' + i} label="x" value="1" change={change} />);
      tones.push(badge(el('t' + i)).dataset.tone ?? badge(el('t' + i)).className);
    }
    expect(tones.map((t) => (/success/.test(t) ? 'success' : /danger/.test(t) ? 'danger' : 'neutral'))).toEqual(['success', 'danger', 'danger', 'success', 'neutral']);
  });

  test('no change says so in words, with no amount', async () => {
    await render(<StatTile id="f" label="Incidents" value="3" change={{ amount: '0', direction: 'flat' }} />);
    expect(badge(el('f')).textContent).toContain('No change');
    expect(badge(el('f')).textContent).not.toContain('0');
  });

  test('the trend is an image named by the label, its length and its numbers; one value draws none', async () => {
    await render(<SerupaProvider locale="en-US"><StatTile id="t" label="Orders" value="18" trend={[12, 9, 21, 18]} /></SerupaProvider>);
    await expect.element(page.getByRole('img', { name: 'Orders, last 4 periods: from 12 to 18, low 9, high 21' })).toBeInTheDocument();
    await render(<StatTile id="o" label="Orders" value="18" trend={[18]} trendLabel="Orders by week" />);
    expect(el('o').querySelector('svg')).toBeNull();
  });

  test('trendLabel and trendFormat name the trend', async () => {
    await render(<SerupaProvider locale="en-US"><StatTile label="Revenue" value="$18" trend={[12, 18]} trendLabel="Revenue by week" trendFormat={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }} /></SerupaProvider>);
    await expect.element(page.getByRole('img', { name: 'Revenue by week: from $12 to $18, low $12, high $18' })).toBeInTheDocument();
  });

  test('speaks the provider’s language', async () => {
    await render(<SerupaProvider locale="id" labels={idLabels}><StatTile id="i" label="Pendapatan" value="Rp 48.200" change={{ amount: '12%', direction: 'down' }} trend={[1, 2, 3]} /></SerupaProvider>);
    expect(badge(el('i')).textContent).toContain('Turun 12%');
    await expect.element(page.getByRole('img', { name: /^Pendapatan, 3 periode terakhir/ })).toBeInTheDocument();
  });

  test('loading shows a named placeholder in place of the number, and marks the tile busy', async () => {
    await render(<StatTile id="w" label="Revenue" value="€48,200" loading loadingLabel="Loading revenue" />);
    expect(el('w').getAttribute('aria-busy')).toBe('true');
    expect(el('w').textContent).not.toContain('€48,200');
    expect(part(el('w'), 'value')).toBeNull();
  });

  test('the label, the value and the period read 4.5:1 on the card in every theme', async () => {
    await render(<StatTile id="c" label="Revenue" value="€48,200" change={{ amount: '12%', direction: 'up' }} period="vs last month" />);
    const bg = css(el('c')).backgroundColor;
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      const now = css(el('c')).backgroundColor;
      for (const p of ['label', 'value', 'change']) expect(contrast(css(part(el('c'), p)).color, now || bg), th + ' ' + p).toBeGreaterThanOrEqual(4.5);
    }
  });
});
