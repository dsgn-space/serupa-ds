import * as React from 'react';
import { afterEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { THEMES, contrast, css } from '../../../tools/test/vitest/helpers';
import { AppShell } from './AppShell';

const el = (id: string) => document.getElementById(id) as HTMLElement;
const q = (s: string) => document.querySelector(s) as HTMLElement;
afterEach(async () => { await page.viewport(900, 700); document.documentElement.removeAttribute('data-theme'); });

const shell = (props: Partial<React.ComponentProps<typeof AppShell>> = {}) => (
  <AppShell id="shell" header={<header id="hdr" style={{ height: '50px' }}>Bar</header>} sidebar={<nav id="nav" aria-label="Workspace" style={{ width: '200px' }}>Links</nav>} footer="© Acme" {...props}>
    <h1 id="title">Projects</h1>
  </AppShell>
);

describe('AppShell', () => {
  test('defaults: a skip link first, the header, the sidebar beside main, main, the footer; ref, className and props reach the root', async () => {
    const r = React.createRef<HTMLDivElement>();
    await render(shell({ ref: r, className: 'extra', 'data-x': 'y' } as never));
    const root = el('shell');
    expect([root.tagName, root.className, root.dataset.component, r.current === root, root.dataset.x]).toEqual(['DIV', 'srp-app-shell extra', 'app-shell', true, 'y']);
    const kids = [...root.children].map((k) => k.tagName + (k.className ? '.' + k.className.split(' ')[0] : ''));
    expect(kids).toEqual(['A.srp-skip-link', 'HEADER', 'DIV.srp-app-shell__side', 'MAIN.srp-app-shell__main', 'FOOTER.srp-app-shell__footer']);
    const main = q('main');
    expect([main.id, main.tabIndex, main.contains(el('title')), q('.srp-app-shell__side').contains(el('nav')), q('footer').textContent]).toEqual(['main', -1, true, true, '© Acme']);
    expect([Math.round(main.getBoundingClientRect().left - root.getBoundingClientRect().left), css(main).paddingLeft]).toEqual([200, '24px']);
  });

  test('at least the screen tall: the footer at the bottom of a short page, which doesn\'t scroll, sticky bar or not', async () => {
    await page.viewport(900, 600);
    await expect.poll(() => window.innerHeight).toBe(600);
    await render(shell());
    const measure = () => { const root = el('shell').getBoundingClientRect(); return [Math.round(root.height), Math.round(q('footer').getBoundingClientRect().bottom - root.top), Math.round(q('.srp-app-shell__side').getBoundingClientRect().height)]; };
    const plain = measure();
    document.documentElement.style.setProperty('--srp-navbar-offset', '50px');
    try { expect([plain, measure()]).toEqual([[600, 600, 550], [600, 600, 550]]); } finally { document.documentElement.style.removeProperty('--srp-navbar-offset'); }
  });

  test('the skip link moves focus into main', async () => {
    await render(shell());
    await userEvent.tab();
    expect(document.activeElement?.className).toContain('srp-skip-link');
    await userEvent.keyboard('{Enter}');
    expect(document.activeElement).toBe(q('main'));
  });

  test('skipLink={false}, mainId, no sidebar or footer', async () => {
    await render(shell({ skipLink: false, mainId: 'content', sidebar: undefined, footer: undefined }));
    expect([q('.srp-skip-link'), q('.srp-app-shell__side'), q('footer'), q('main').id]).toEqual([null, null, null, 'content']);
  });

  test('the sidebar is gone below sidebarFrom: 640px by default, or md and lg', async () => {
    await render(<>{shell()}{shell({ id: 'md', sidebarFrom: 'md', mainId: 'm2' })}{shell({ id: 'lg', sidebarFrom: 'lg', mainId: 'm3' })}</>);
    const shown = () => [...document.querySelectorAll('nav[aria-label="Workspace"]')].map((n) => (n as HTMLElement).offsetParent !== null);
    const at = async (w: number) => { await page.viewport(w, 700); await expect.poll(() => window.innerWidth).toBe(w); return shown(); };
    expect([await at(600), await at(700), await at(900), await at(1100)]).toEqual([[false, false, false], [true, false, false], [true, true, false], [true, true, true]]);
  });

  test('the sidebar sticks below a sticky bar, as tall as the screen less the bar on a long page', async () => {
    await page.viewport(900, 600);
    await expect.poll(() => window.innerHeight).toBe(600);
    document.documentElement.style.setProperty('--srp-navbar-offset', '50px');
    try {
      await render(shell({ children: <div style={{ height: '2000px' }}>Long</div> }));
      const s = css(q('.srp-app-shell__side'));
      expect([s.position, s.top, s.height]).toEqual(['sticky', '50px', '550px']);
    } finally { document.documentElement.style.removeProperty('--srp-navbar-offset'); }
  });

  test('padding grows with the screen (16, 24, 32px); padded={false} has none', async () => {
    await render(<>{shell()}{shell({ id: 'bare', padded: false, mainId: 'm2' })}</>);
    const pad = async (w: number) => { await page.viewport(w, 700); await expect.poll(() => window.innerWidth).toBe(w); return css(q('main')).paddingLeft; };
    expect([await pad(400), await pad(800), await pad(1100), css(el('m2')).paddingLeft]).toEqual(['16px', '24px', '32px', '0px']);
  });

  test('background="muted": main on surface-muted, the rest on surface; text 4.5:1 on both, the footer\'s too, in every theme', async () => {
    await render(<>{shell({ background: 'muted' })}</>);
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      const root = css(el('shell')), main = css(q('main')), foot = css(q('footer'));
      expect([main.backgroundColor !== root.backgroundColor, contrast(root.color, root.backgroundColor) >= 4.5, contrast(root.color, main.backgroundColor) >= 4.5, contrast(foot.color, root.backgroundColor) >= 4.5], th).toEqual([true, true, true, true]);
    }
  });

  test('a bottomNav comes last', async () => {
    await render(shell({ bottomNav: <nav id="bn" aria-label="Phone">x</nav> }));
    expect([el('shell').lastElementChild?.className, el('shell').lastElementChild?.firstElementChild?.id]).toEqual(['srp-app-shell__bottom', 'bn']);
  });
});
