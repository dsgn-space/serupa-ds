import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';
import { THEMES, contrast, css, withMotion } from '../../../tools/test/vitest/helpers';
import { Tab, TabList, Tabs } from '../Tabs/Tabs';
import { TabNav, TabNavLink } from './TabNav';

const el = (id: string) => document.getElementById(id) as HTMLElement;
const current = (id: string) => el(id).querySelector<HTMLElement>('[aria-current="page"]')!;

function Nav(p: { id: string; at?: string; variant?: 'line' | 'pill'; size?: 'sm' | 'md' | 'lg' }) {
  const at = p.at ?? 'overview';
  return <TabNav id={p.id} aria-label="Project" variant={p.variant} size={p.size}>
    <TabNavLink href="#overview" current={at === 'overview'}>Overview</TabNavLink>
    <TabNavLink href="#activity" icon="history" current={at === 'activity'}>Activity</TabNavLink>
    <TabNavLink href="#settings" current={at === 'settings'}>Settings</TabNavLink>
  </TabNav>;
}

describe('TabNav', () => {
  test('a named nav holding a list of links; only the current one has aria-current="page"; ref, className and props reach the nav and the links', async () => {
    const ref = React.createRef<HTMLElement>(), link = React.createRef<HTMLAnchorElement>();
    await render(<TabNav id="n" ref={ref} className="extra" data-x="y" aria-label="Project">
      <TabNavLink ref={link} id="l1" href="#a" className="mine" current>A</TabNavLink>
      <TabNavLink href="#b">B</TabNavLink>
    </TabNav>);
    const n = el('n');
    expect([n.tagName, n.getAttribute('aria-label'), ref.current === n, n.className, n.dataset.x, n.dataset.component, n.dataset.variant]).toEqual(['NAV', 'Project', true, 'dk-tabs dk-tabs--line dk-tab-nav extra', 'y', 'tab-nav', 'line']);
    const links = [...n.querySelectorAll('a')];
    expect(links.map((a) => [a.parentElement!.tagName, a.getAttribute('href'), a.getAttribute('aria-current'), a.dataset.state, a.textContent])).toEqual([['LI', '#a', 'page', 'active', 'A'], ['LI', '#b', null, 'inactive', 'B']]);
    expect([link.current === el('l1'), el('l1').className, n.querySelector('ul')!.parentElement === n]).toEqual([true, 'dk-tabs__tab mine', true]);
    // Links, not tabs: no tablist roles, and the list is still read as a list.
    expect([n.querySelector('[role="tab"], [role="tablist"]'), css(n.querySelector('ul')).listStyleType, css(n.querySelector('ul')).margin]).toEqual([null, 'none', '0px']);
  });

  test('looks like Tabs: the same height, label color and current line as the selected tab, in each size, and the same pill; links are not underlined', async () => {
    await render(<div>
      {(['sm', 'md', 'lg'] as const).map((s) => <React.Fragment key={s}>
        <Nav id={'n-' + s} size={s} />
        <Tabs id={'t-' + s} size={s}><TabList aria-label="T"><Tab value="overview">Overview</Tab><Tab value="activity">Activity</Tab></TabList></Tabs>
      </React.Fragment>)}
      <Nav id="np" variant="pill" /><Tabs id="tp" variant="pill"><TabList aria-label="P"><Tab value="overview">Overview</Tab></TabList></Tabs>
    </div>);
    const still = document.createElement('style'); still.textContent = '* { transition: none !important; }'; document.head.appendChild(still);
    const sel = (id: string) => el(id).querySelector<HTMLElement>('[aria-selected="true"]')!;
    const other = (id: string) => el(id).querySelector<HTMLElement>('.dk-tabs__tab:not([aria-current="page"], [aria-selected="true"])')!;
    for (const s of ['sm', 'md', 'lg']) {
      const a = current('n-' + s), b = sel('t-' + s);
      expect([a.offsetHeight, css(a).fontSize, css(a).color, getComputedStyle(a, '::after').backgroundColor, getComputedStyle(a, '::after').height, css(other('n-' + s)).color, css(a).textDecorationLine], s)
        .toEqual([b.offsetHeight, css(b).fontSize, css(b).color, getComputedStyle(b, '::after').backgroundColor, getComputedStyle(b, '::after').height, css(other('t-' + s)).color, 'none']);
    }
    expect([css(current('np')).color, getComputedStyle(current('np'), '::before').backgroundColor]).toEqual([css(sel('tp')).color, getComputedStyle(sel('tp'), '::before').backgroundColor]);
    expect([el('n-lg').className.includes('dk-tabs--lg'), current('n-lg').offsetHeight]).toEqual([true, 44]);
    still.remove();
  });

  test('contrast: labels 4.5:1, the current line and pill 3:1 against surface, in all six themes', async () => {
    await render(<div><Nav id="c" /><Nav id="cp" variant="pill" /></div>);
    const still = document.createElement('style'); still.textContent = '* { transition: none !important; }'; document.head.appendChild(still);
    const low: string[] = []; let n = 0;
    for (const th of THEMES) {
      document.documentElement.setAttribute('data-theme', th);
      const un = el('c').querySelector<HTMLElement>('a:not([aria-current])')!, on = current('c'), pill = current('cp');
      const checks: Array<[string, string, string, number]> = [['link', css(un).color, 'var(--surface)', 4.5], ['current', css(on).color, 'var(--surface)', 4.5], ['line', getComputedStyle(on, '::after').backgroundColor, 'var(--surface)', 3], ['pill', css(pill).color, getComputedStyle(pill, '::before').backgroundColor, 4.5], ['pill fill', getComputedStyle(pill, '::before').backgroundColor, 'var(--surface)', 3]];
      for (const [k, a, c, min] of checks) { const r = contrast(a, c); n++; if (r < min) low.push(`${th} ${k}: ${r.toFixed(2)}`); }
    }
    still.remove();
    expect([low, n]).toEqual([[], 30]);
  });

  test('keyboard: each link is a Tab stop with the focus ring inside it; arrow keys do nothing; Enter follows the link', async () => {
    await render(<div><button id="before">before</button><Nav id="k" /></div>);
    el('before').focus();
    await userEvent.tab();
    const links = [...el('k').querySelectorAll<HTMLElement>('a')];
    expect(document.activeElement).toBe(links[0]);
    expect(css(links[0]).boxShadow).toMatch(/0px 0px 0px 2px inset|inset 0px 0px 0px 2px/);
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(links[0]);
    await userEvent.tab();
    expect(document.activeElement).toBe(links[1]);
    const before = location.hash;
    await userEvent.keyboard('{Enter}');
    expect(location.hash).toBe('#activity');
    history.replaceState(null, '', before || location.pathname + location.search);
  });

  test('as renders your router\'s link with its own props; unknown variant and size fall back to line and md', async () => {
    // As a router's link does: its own to, and the rest (aria-current, className) on the <a>.
    const Router = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }>(function Router({ to, ...p }, r) { return <a {...p} ref={r} href={to} data-router="" />; });
    await render(<TabNav id="r" aria-label="R" variant={'boxed' as never} size={'xl' as never}><TabNavLink as={Router} to="/x" current>X</TabNavLink></TabNav>);
    const a = current('r');
    expect([a.dataset.router, a.getAttribute('href'), a.className, el('r').dataset.variant, el('r').className]).toEqual(['', '/x', 'dk-tabs__tab', 'line', 'dk-tabs dk-tabs--line dk-tab-nav']);
  });

  test('overflow: in 300px the current link is scrolled into view and the edge with more links fades; when the current page changes, the new one is scrolled into view', async () => {
    const names = ['Code', 'Issues', 'Merge requests', 'Pipelines', 'Wiki', 'Settings'];
    function App() {
      const [at, set] = React.useState('Settings');
      return <div style={{ width: '300px' }}>
        <TabNav id="ov" aria-label="Repo">{names.map((n) => <TabNavLink key={n} href={'#' + n} current={at === n}>{n}</TabNavLink>)}</TabNav>
        <button id="go" onClick={() => set('Code')}>go</button>
      </div>;
    }
    await render(<App />);
    const list = el('ov').querySelector<HTMLElement>('ul')!;
    await expect.poll(() => { const box = list.getBoundingClientRect(), t = current('ov').getBoundingClientRect(); return [list.scrollLeft > 0, t.right <= box.right + 0.5]; }).toEqual([true, true]);
    await expect.poll(() => [list.hasAttribute('data-fade-before'), list.hasAttribute('data-fade-after')]).toEqual([true, false]);
    await userEvent.click(el('go'));
    await expect.poll(() => [list.scrollLeft, list.hasAttribute('data-fade-before'), list.hasAttribute('data-fade-after')]).toEqual([0, false, true]);
  });

  test('the current line slides from the page before when the current link changes in place, as Tabs\' does', async () => {
    await withMotion(async () => {
      function App() { const [at, set] = React.useState('overview'); return <><Nav id="s" at={at} /><button id="to" onClick={() => set('settings')}>to</button></>; }
      await render(<App />);
      const links = [...el('s').querySelectorAll<HTMLElement>('a')];
      await userEvent.click(el('to'));
      const move = links[2].getAnimations({ subtree: true }).find((a): a is CSSTransition => a instanceof CSSTransition && a.transitionProperty === 'translate');
      expect(!!move).toBe(true);
      const from = links[2].offsetLeft + parseFloat(String((move!.effect as KeyframeEffect).getKeyframes()[0].translate));
      expect(Math.abs(from - links[0].offsetLeft)).toBeLessThan(1);
    });
  });

  test('renders on the server with the current link marked', () => {
    const html = renderToString(<Nav id="ssr" at="activity" />);
    expect([/<nav[^>]*aria-label="Project"/.test(html), /<a[^>]*aria-current="page"[^>]*>.*Activity/.test(html), (html.match(/aria-current/g) || []).length]).toEqual([true, true, 1]);
  });
});
