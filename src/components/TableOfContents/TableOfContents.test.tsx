import * as React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi, type MockInstance } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { color, css, lowContrast, settled, withMotion } from '../../../tools/test/vitest/helpers';
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
    const x = (i: number) => getComputedStyle(links()[i]!).paddingLeft;
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

  test('a shared link to a heading whose id it makes (#beta-part) scrolls there once the id exists, as the browser would have (GR303)', async () => {
    const before = window.location.href;
    window.history.replaceState(null, '', '#beta-part');
    try {
      await render(<Page />);
      await expect.poll(() => Math.round(document.getElementById('beta-part')?.getBoundingClientRect().top ?? -1)).toBe(0);
    } finally {
      window.history.replaceState(null, '', before);
      window.scrollTo(0, 0);
    }
  });

  test('headings added, renamed or removed later update the list (GR303)', async () => {
    await render(<Page />);
    await expect.poll(() => links().map((a) => a.textContent)).toEqual(['Alpha', 'Beta part', 'Gamma']);
    const art = document.getElementById('art')!, late = document.createElement('h2');
    late.textContent = 'Delta, loaded later';
    art.appendChild(late);
    await expect.poll(() => links().map((a) => a.textContent)).toEqual(['Alpha', 'Beta part', 'Gamma', 'Delta, loaded later']);
    expect(late.id).toBe('delta-loaded-later');
    document.getElementById('a')!.textContent = 'Alpha, renamed';
    await expect.poll(() => links()[0]!.textContent).toBe('Alpha, renamed');
    late.remove();
    await expect.poll(() => links().length).toBe(3);
  });

  test('headings in a pane that scrolls on its own: the current section follows the pane, and its foot marks the last (GR303)', async () => {
    await render(
      <div>
        <div id="pane" style={{ height: '300px', overflow: 'auto' }}>
          <h2 id="p1">One</h2><p style={{ height: '600px' }}>…</p>
          <h2 id="p2">Two</h2><p style={{ height: '600px' }}>…</p>
          <h2 id="p3">Three</h2><p style={{ height: '100px' }}>…</p>
        </div>
        <TableOfContents id="toc" container="#pane" offset={20} />
      </div>,
    );
    const pane = document.getElementById('pane')!;
    await expect.poll(current).toBe('One');
    pane.scrollTop = document.getElementById('p2')!.offsetTop - pane.offsetTop;
    await expect.poll(current).toBe('Two');
    pane.scrollTop = pane.scrollHeight;
    await expect.poll(current).toBe('Three');
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

  test('the current section keeps the weight of the others, so a long title wraps the same as it becomes current while the page scrolls; the line beside it marks it (GR269)', async () => {
    await render(<Page />);
    await expect.poll(current).toBe('Alpha');
    const [a, b] = links();
    expect(getComputedStyle(a!).fontWeight).toBe(getComputedStyle(b!).fontWeight);
    expect(getComputedStyle(a!).borderInlineStartColor).not.toBe(getComputedStyle(b!).borderInlineStartColor);
    expect([/inset/.test(getComputedStyle(a!).boxShadow), getComputedStyle(b!).boxShadow]).toEqual([true, 'none']);
  });
});

// What a mutation run on TableOfContents.tsx found no test for (44 of 80 mutants were caught, run 273): each test
// names the rule a changed operator would have broken without anything failing.
describe('TableOfContents: rules no test covered', () => {
  test('with no container it reads the page\'s <main>, and headings outside it are left out', async () => {
    await render(<div><h2>Outside</h2><main><h2>Inside</h2><h3>Under it</h3></main><TableOfContents id="toc" /></div>);
    await expect.poll(() => links().map((a) => a.textContent)).toEqual(['Inside', 'Under it']);
  });

  test('with no <main> it reads the whole page; an element as container works as a selector does', async () => {
    function Two() {
      const [box, setBox] = React.useState<HTMLElement | null>(null);
      return <div><h2>First</h2><section ref={setBox}><h2>Second</h2></section><TableOfContents id="toc" /><TableOfContents id="toc2" container={box} /></div>;
    }
    await render(<Two />);
    await expect.poll(() => links().map((a) => a.textContent)).toEqual(['First', 'Second']);
    await expect.poll(() => [...document.querySelectorAll('#toc2 a')].map((a) => a.textContent)).toEqual(['Second']);
  });

  test('headings with the same text get ids that differ, also from an id already on the page', async () => {
    await render(<div><span id="notes" /><main><h2>Notes</h2><h2>Notes</h2><h2>Notes</h2></main><TableOfContents id="toc" /></div>);
    await expect.poll(() => links().map((a) => a.getAttribute('href'))).toEqual(['#notes-2', '#notes-3', '#notes-4']);
    expect(new Set([...document.querySelectorAll('[id]')].map((n) => n.id)).size).toBe(document.querySelectorAll('[id]').length);
  });

  test('the default line is 96px from the top: a heading at 90px is the current section, one at 150px not yet', async () => {
    await render(<Page toc={<TableOfContents id="toc" container="#art" />} />);
    await expect.poll(current).toBe('Alpha');
    const beta = () => document.getElementById('beta-part')!;
    window.scrollTo(0, beta().getBoundingClientRect().top + window.scrollY - 150);
    await new Promise((r) => setTimeout(r, 100));
    expect(current()).toBe('Alpha');
    window.scrollTo(0, beta().getBoundingClientRect().top + window.scrollY - 90);
    await expect.poll(current).toBe('Beta part');
  });

  test('at the foot of the page the last section is current, though its heading can\'t reach the line', async () => {
    await render(
      <div>
        <main id="art"><h2 id="s1">One</h2><p style={{ height: '1500px' }}>…</p><h2 id="s2">Two</h2><p style={{ height: '40px' }}>…</p></main>
        <div style={{ position: 'fixed', top: 0, right: 0 }}><TableOfContents id="toc" container="#art" offset={20} /></div>
      </div>,
    );
    await expect.poll(current).toBe('One');
    window.scrollTo(0, document.documentElement.scrollHeight - window.innerHeight - 40);
    await new Promise((r) => setTimeout(r, 100));
    expect([current(), document.getElementById('s2')!.getBoundingClientRect().top > 20]).toEqual(['One', true]);
    window.scrollTo(0, document.documentElement.scrollHeight);
    await expect.poll(current).toBe('Two');
  });

  test('a pane with overflow: scroll counts as the headings\' scroller too', async () => {
    await render(
      <div>
        <div id="pane" style={{ height: '200px', overflowY: 'scroll' }}><h2 id="q1">One</h2><p style={{ height: '500px' }}>…</p><h2 id="q2">Two</h2><p style={{ height: '500px' }}>…</p></div>
        <p style={{ height: '2000px' }}>…</p>
        <TableOfContents id="toc" container="#pane" offset={20} />
      </div>,
    );
    const pane = document.getElementById('pane')!;
    await expect.poll(current).toBe('One');
    pane.scrollTop = document.getElementById('q2')!.offsetTop - pane.offsetTop;
    await expect.poll(current).toBe('Two');
  });

  test('a click with Ctrl, Meta, Shift or Alt, or another button, is left to the browser: nothing is scrolled, focused or marked', async () => {
    await render(<Page />);
    await expect.poll(current).toBe('Alpha');
    const gamma = page.getByRole('link', { name: 'Gamma' }).element() as HTMLAnchorElement;
    // The link's own default (going to #c) is stopped after the component has seen the click, so only its part shows.
    const seen: boolean[] = [];
    const stop = (e: Event) => { seen.push(e.defaultPrevented); e.preventDefault(); };
    document.addEventListener('click', stop);
    try {
      for (const init of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }]) gamma.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ...init }));
    } finally { document.removeEventListener('click', stop); }
    expect([seen, document.activeElement === document.getElementById('c'), location.hash, current()]).toEqual([[false, false, false, false, false], false, '', 'Alpha']);
  });

  test('while the page scrolls to a clicked section, that section stays the current one', async () => {
    await render(<Page />);
    await expect.poll(current).toBe('Alpha');
    await userEvent.click(page.getByRole('link', { name: 'Gamma' }));
    const seen = new Set<string | null>();
    for (let i = 0; i < 20; i++) { seen.add(current()); await new Promise((r) => requestAnimationFrame(() => r(null))); }
    expect([...seen]).toEqual(['Gamma']);
  });

  test('the indent counts from the shallowest level given, and an item with no level is level 2', async () => {
    await render(<TableOfContents id="toc" items={[{ id: 'x', label: 'One', level: 3 }, { id: 'y', label: 'Two', level: 5 }]} />);
    const depths = (id: string) => [...document.querySelectorAll<HTMLElement>(`#${id} li`)].map((li) => li.style.getPropertyValue('--dk-toc-depth'));
    expect(depths('toc')).toEqual(['0', '2']);
    await render(<TableOfContents id="toc3" items={[{ id: 'p', label: 'One' }, { id: 'q', label: 'Two', level: 4 }]} />);
    expect(depths('toc3')).toEqual(['0', '2']);
  });

  test('aria-label or aria-labelledby names the landmark in place of the title', async () => {
    await render(<div><span id="mine">Sections here</span>
      <TableOfContents id="toc" aria-label="Sections" items={[{ id: 'x', label: 'One' }]} />
      <TableOfContents id="toc2" aria-labelledby="mine" items={[{ id: 'x', label: 'One' }]} />
    </div>);
    expect([document.getElementById('toc')!.getAttribute('aria-labelledby'), document.getElementById('toc2')!.getAttribute('aria-labelledby')]).toEqual([null, 'mine']);
    await expect.element(page.getByRole('navigation', { name: 'Sections here' })).toBeVisible();
  });
});

// The rail (variant="rail"): dashes in a narrow column, the full list in a panel shown by the pointer, focus or a tap.
describe('TableOfContents rail', () => {
  const Rail = (p: { dir?: 'rtl' }) => <Page toc={<div dir={p.dir} style={{ display: 'flex', justifyContent: 'flex-end' }}><TableOfContents id="toc" variant="rail" container="#art" offset={20} /></div>} />;
  const nav = () => document.getElementById('toc')!;
  const rail = () => nav().firstElementChild as HTMLElement;   // the dashes, then the panel
  const panel = () => nav().lastElementChild as HTMLElement;
  const dashes = () => [...rail().children] as HTMLElement[];
  const shown = () => css(panel()).opacity === '1' && css(panel()).pointerEvents === 'auto';
  const runs = () => panel().getAnimations().map((a) => (a as CSSTransition).transitionProperty).sort();

  test('a navigation landmark of real links, named "On this page"; one dash per heading, hidden from screen readers, each level shorter, the current one in the accent; the panel hidden and taking no presses', async () => {
    await render(<Rail />);
    await expect.element(page.getByRole('navigation', { name: 'On this page' })).toBeInTheDocument();
    await expect.poll(() => links().map((a) => a.textContent)).toEqual(['Alpha', 'Beta part', 'Gamma']);
    await expect.poll(() => dashes().map((d) => 'current' in d.dataset)).toEqual([true, false, false]);
    const w = dashes().map((d) => d.getBoundingClientRect().width);
    expect([nav().dataset.variant, rail().getAttribute('aria-hidden'), w[0], w[1]! < w[0]!, w[2]]).toEqual(['rail', 'true', 12, true, 12]);
    expect([css(dashes()[0]!).backgroundColor, css(dashes()[1]!).backgroundColor, nav().getBoundingClientRect().width]).toEqual([color('var(--primary)'), color('var(--border-strong)'), 24]);
    expect(shown()).toBe(false);
  });

  test('the pointer over it shows the panel, fading and growing in, and it stays while the pointer moves onto it; leaving hides it', async () => {
    await withMotion(async () => {
      await render(<Rail />);
      await expect.poll(() => dashes().length).toBe(3);
      await userEvent.hover(nav());
      await expect.poll(runs).toEqual(['opacity', 'scale']);
      await settled(panel());
      expect(shown()).toBe(true);
      await userEvent.hover(links()[2]!);
      expect(shown()).toBe(true);
      await userEvent.unhover(nav());
      await userEvent.hover(document.querySelector('h2')!);
      await settled(panel());
      expect(shown()).toBe(false);
    });
  });

  test('Tab to its first link shows the panel at once, with no motion (KW1); Escape hides it with focus kept, until focus leaves (WCAG 1.4.13); a link goes to its heading', async () => {
    await withMotion(async () => {
      await render(<><button id="before">Before</button><Rail /></>);
      await expect.poll(() => links().length).toBe(3);
      document.getElementById('before')!.focus();
      await userEvent.keyboard('{Tab}');
      expect([document.activeElement, shown(), runs()]).toEqual([links()[0], true, []]);
      await userEvent.keyboard('{Escape}');
      expect([document.activeElement, shown(), 'dismissed' in nav().dataset]).toEqual([links()[0], false, true]);
      await userEvent.keyboard('{Shift>}{Tab}{/Shift}{Tab}');
      expect([document.activeElement, shown()]).toEqual([links()[0], true]);
      await userEvent.keyboard('{Tab}{Tab}{Enter}');
      await expect.poll(() => location.hash).toBe('#c');
      expect(document.activeElement).toBe(document.getElementById('c'));
    });
  });

  test('a tap shows the panel and a tap elsewhere hides it; a tapped link closes it', async () => {
    await render(<Rail />);
    await expect.poll(() => dashes().length).toBe(3);
    const tap = (el: Element) => el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', isPrimary: true }));
    tap(rail());
    await expect.poll(() => 'open' in nav().dataset).toBe(true);
    expect(shown()).toBe(true);
    tap(document.querySelector('h2')!);
    await expect.poll(() => 'open' in nav().dataset).toBe(false);
    tap(rail());
    await expect.poll(() => 'open' in nav().dataset).toBe(true);
    links()[1]!.click();
    await expect.poll(() => 'open' in nav().dataset).toBe(false);
    expect(location.hash).toBe('#beta-part');
  });

  test('with more headings than the window holds, the panel stops short of the window\'s bottom and scrolls, so the last links can be reached', async () => {
    const items = Array.from({ length: 60 }, (_, i) => ({ id: 'h' + i, label: 'Heading ' + (i + 1) }));
    // Pinned near the top of the window, as a sticky side column is.
    await render(<div style={{ position: 'fixed', insetBlockStart: 16, insetInlineEnd: 16 }}><TableOfContents id="toc" variant="rail" items={items} /></div>);
    const all = [...panel().querySelectorAll('a')];
    all.at(-1)!.focus();
    await expect.poll(shown).toBe(true);
    const box = panel().getBoundingClientRect();
    expect([box.bottom <= window.innerHeight, panel().scrollHeight > panel().clientHeight, css(panel()).overflowY]).toEqual([true, true, 'auto']);
    const last = all.at(-1)!.getBoundingClientRect();
    expect(last.bottom <= box.bottom && last.top >= box.top).toBe(true);
  });

  test('right to left: the panel opens over the page from the rail\'s top left corner', async () => {
    await render(<Rail dir="rtl" />);
    await expect.poll(() => dashes().length).toBe(3);
    const r = nav().getBoundingClientRect(), p = panel().getBoundingClientRect();
    expect([Math.round(p.left - r.left), Math.round(p.top - r.top), p.width > r.width]).toEqual([0, 0, true]);
  });

  test('the panel\'s links 4.5:1 on it, its edge and the dashes 3:1 against the page where they stand for something (the current one), in all six themes', () => {
    expect(lowContrast([
      ['panel link', 'var(--text-muted)', 'var(--surface-overlay)', 4.5],
      ['panel current', 'var(--text)', 'var(--surface-overlay)', 4.5],
      ['current dash', 'var(--primary)', 'var(--surface)', 3],
    ])).toEqual([]);
  });
});
