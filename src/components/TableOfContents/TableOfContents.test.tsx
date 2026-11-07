import * as React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi, type MockInstance } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { lowContrast } from '../../../tools/test/vitest/helpers';
import { SerupaProvider } from '../../internal/provider';
import { idLabels } from '../../internal/labels';
import { TableOfContents } from './TableOfContents';

function Page({ toc }: { toc?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: '16px' }}>
      <main id="art" style={{ flex: 1 }}>
        <h2 id="a">Alpha</h2><p style={{ height: '900px' }}>…</p>
        <h3>Beta part</h3><p style={{ height: '900px' }}>…</p>
        <h2 id="c">Gamma</h2><p style={{ height: '900px' }}>…</p>
        <h4 id="d">Not listed</h4>
      </main>
      <div style={{ position: 'fixed', top: 0, right: 0, width: '200px' }}>{toc ?? <TableOfContents id="toc" container="#art" offset={20} />}</div>
    </div>
  );
}
const links = () => [...document.querySelectorAll<HTMLAnchorElement>('#toc a')];
const current = () => document.querySelector('#toc a[aria-current="location"]')?.textContent ?? null;

let errors: MockInstance<typeof console.error>;
beforeEach(() => { errors = vi.spyOn(console, 'error'); window.scrollTo(0, 0); });
afterEach(() => { expect(errors).not.toHaveBeenCalled(); errors.mockRestore(); window.scrollTo(0, 0); history.replaceState(null, '', location.pathname + location.search); });

describe('TableOfContents', () => {
  test('a navigation landmark named by its title, "On this page", listing the h2 and h3 headings of its container; props reach the <nav>', async () => {
    const ref = React.createRef<HTMLElement>();
    await render(<Page toc={<TableOfContents id="toc" ref={ref} className="extra" data-x="y" container="#art" />} />);
    await expect.element(page.getByRole('navigation', { name: 'On this page' })).toBeVisible();
    const nav = document.getElementById('toc')!;
    expect([nav.tagName, nav.className, nav.dataset.x, nav.dataset.component, ref.current === nav]).toEqual(['NAV', 'dk-toc extra', 'y', 'table-of-contents', true]);
    await expect.poll(() => links().map((a) => [a.textContent, a.getAttribute('href')])).toEqual([['Alpha', '#a'], ['Beta part', '#beta-part'], ['Gamma', '#c']]);
    expect(document.querySelector('h3')!.id).toBe('beta-part');
  });

  test('an h3 steps in from the h2s', async () => {
    await render(<Page />);
    await expect.poll(() => links().length).toBe(3);
    const x = (i: number) => getComputedStyle(links()[i]).paddingLeft;
    expect(parseFloat(x(1))).toBeGreaterThan(parseFloat(x(0)));
    expect(x(2)).toBe(x(0));
  });

  test('the section being read is marked aria-current="location" as the page scrolls', async () => {
    await render(<Page />);
    await expect.poll(current).toBe('Alpha');
    window.scrollTo(0, document.getElementById('beta-part')!.getBoundingClientRect().top + window.scrollY - 10);
    await expect.poll(current).toBe('Beta part');
    window.scrollTo(0, document.documentElement.scrollHeight);
    await expect.poll(current).toBe('Gamma');
  });

  test('a click scrolls to the heading, focuses it, puts its id in the address and marks it current', async () => {
    await render(<Page />);
    await expect.poll(() => links().length).toBe(3);
    await userEvent.click(page.getByRole('link', { name: 'Gamma' }));
    const g = document.getElementById('c')!;
    expect([document.activeElement === g, g.getAttribute('tabindex'), location.hash, current()]).toEqual([true, '-1', '#c', 'Gamma']);
    await expect.poll(() => Math.abs(g.getBoundingClientRect().top) < 40).toBe(true);
  });

  test('items instead of headings; title null leaves out the title', async () => {
    await render(<TableOfContents id="toc" title={null} aria-label="Sections" items={[{ id: 'x', label: 'One' }, { id: 'y', label: 'Two', level: 3 }]} />);
    await expect.element(page.getByRole('navigation', { name: 'Sections' })).toBeVisible();
    expect([links().map((a) => a.textContent), document.querySelector('#toc p')]).toEqual([['One', 'Two'], null]);
  });

  test('its words come from the labels', async () => {
    await render(<SerupaProvider labels={idLabels}><TableOfContents items={[{ id: 'x', label: 'Satu' }]} /></SerupaProvider>);
    await expect.element(page.getByRole('navigation', { name: 'Di halaman ini' })).toBeVisible();
  });

  test('links 4.5:1 on the page, the current one\'s line 3:1, in all six themes', () => {
    expect(lowContrast([
      ['link', 'var(--text-muted)', 'var(--surface)', 4.5],
      ['current', 'var(--text)', 'var(--surface)', 4.5],
      ['current line', 'var(--primary)', 'var(--surface)', 3],
      ['focus', 'var(--focus-ring)', 'var(--surface)', 3],
    ])).toEqual([]);
  });
});
